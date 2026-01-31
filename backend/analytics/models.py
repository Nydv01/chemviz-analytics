"""
Data models for chemical equipment analytics.

This module defines the database schema for storing equipment datasets
and individual equipment records with their operational parameters.
"""

from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class EquipmentDataset(models.Model):
    """
    Represents a single CSV upload containing equipment data.
    
    Stores metadata about the upload and pre-computed aggregate statistics
    for efficient retrieval. Only the last N datasets are retained per
    the MAX_DATASETS_RETAINED setting.
    
    Attributes:
        user: The authenticated user who uploaded the dataset
        filename: Original name of the uploaded CSV file
        uploaded_at: Timestamp of when the file was uploaded
        total_records: Count of equipment entries in this dataset
        avg_flowrate: Mean flowrate across all equipment
        avg_pressure: Mean pressure across all equipment  
        avg_temperature: Mean temperature across all equipment
        file_path: Storage path for the original CSV (optional)
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='datasets',
        help_text='User who uploaded this dataset'
    )
    filename = models.CharField(
        max_length=255,
        help_text='Original filename of the uploaded CSV'
    )
    uploaded_at = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text='Timestamp of upload'
    )
    total_records = models.PositiveIntegerField(
        default=0,
        help_text='Number of equipment records in this dataset'
    )
    avg_flowrate = models.FloatField(
        null=True,
        blank=True,
        help_text='Average flowrate (computed during upload)'
    )
    avg_pressure = models.FloatField(
        null=True,
        blank=True,
        help_text='Average pressure (computed during upload)'
    )
    avg_temperature = models.FloatField(
        null=True,
        blank=True,
        help_text='Average temperature (computed during upload)'
    )
    file_path = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text='Path to stored CSV file'
    )
    
    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Equipment Dataset'
        verbose_name_plural = 'Equipment Datasets'
        indexes = [
            models.Index(fields=['user', '-uploaded_at']),
        ]
    
    def __str__(self):
        return f"{self.filename} ({self.uploaded_at.strftime('%Y-%m-%d %H:%M')})"
    
    def save(self, *args, **kwargs):
        """
        Override save to enforce maximum dataset retention policy.
        Automatically deletes oldest datasets when limit is exceeded.
        """
        super().save(*args, **kwargs)
        self._enforce_retention_limit()
    
    def _enforce_retention_limit(self):
        """Delete oldest datasets beyond the retention limit."""
        from django.conf import settings
        
        max_datasets = getattr(settings, 'MAX_DATASETS_RETAINED', 5)
        user_datasets = EquipmentDataset.objects.filter(
            user=self.user
        ).order_by('-uploaded_at')
        
        # Get IDs of datasets to delete (beyond the limit)
        datasets_to_delete = user_datasets[max_datasets:]
        if datasets_to_delete.exists():
            # Delete associated records first (cascades, but explicit for clarity)
            EquipmentRecord.objects.filter(
                dataset__in=datasets_to_delete
            ).delete()
            datasets_to_delete.delete()


class EquipmentRecord(models.Model):
    """
    Individual equipment entry from a dataset.
    
    Represents a single row from the uploaded CSV file with
    equipment specifications and operational parameters.
    
    Attributes:
        dataset: Foreign key to the parent EquipmentDataset
        name: Equipment identifier/name
        equipment_type: Category/type of equipment
        flowrate: Operational flowrate (units as per source data)
        pressure: Operational pressure (units as per source data)
        temperature: Operational temperature (units as per source data)
    """
    
    EQUIPMENT_TYPES = [
        ('pump', 'Pump'),
        ('valve', 'Valve'),
        ('reactor', 'Reactor'),
        ('exchanger', 'Heat Exchanger'),
        ('compressor', 'Compressor'),
        ('separator', 'Separator'),
        ('tank', 'Storage Tank'),
        ('column', 'Distillation Column'),
        ('mixer', 'Mixer'),
        ('filter', 'Filter'),
        ('other', 'Other'),
    ]
    
    dataset = models.ForeignKey(
        EquipmentDataset,
        on_delete=models.CASCADE,
        related_name='records',
        help_text='Parent dataset this record belongs to'
    )
    name = models.CharField(
        max_length=255,
        help_text='Equipment name or identifier'
    )
    equipment_type = models.CharField(
        max_length=100,
        help_text='Type/category of equipment'
    )
    flowrate = models.FloatField(
        help_text='Equipment flowrate parameter'
    )
    pressure = models.FloatField(
        help_text='Equipment pressure parameter'
    )
    temperature = models.FloatField(
        help_text='Equipment temperature parameter'
    )
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Equipment Record'
        verbose_name_plural = 'Equipment Records'
        indexes = [
            models.Index(fields=['dataset', 'equipment_type']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.equipment_type})"
