"""
Data models for chemical equipment analytics.

Defines database schema for uploaded datasets and individual
equipment records with safe retention enforcement.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings

User = get_user_model()


class EquipmentDataset(models.Model):
    """
    Represents a single CSV upload containing equipment data.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="equipment_datasets",
        help_text="User who uploaded this dataset",
    )

    filename = models.CharField(
        max_length=255,
        help_text="Original CSV filename",
    )

    uploaded_at = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        help_text="Upload timestamp",
    )

    total_records = models.PositiveIntegerField(
        default=0,
        help_text="Total number of equipment records",
    )

    avg_flowrate = models.FloatField(
        null=True,
        blank=True,
        help_text="Average flowrate across dataset",
    )

    avg_pressure = models.FloatField(
        null=True,
        blank=True,
        help_text="Average pressure across dataset",
    )

    avg_temperature = models.FloatField(
        null=True,
        blank=True,
        help_text="Average temperature across dataset",
    )

    file_path = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Optional stored CSV path",
    )

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Equipment Dataset"
        verbose_name_plural = "Equipment Datasets"
        indexes = [
            models.Index(fields=["user", "-uploaded_at"]),
        ]

    def __str__(self):
        return f"{self.filename} ({self.uploaded_at:%Y-%m-%d %H:%M})"

    def save(self, *args, **kwargs):
        """
        Save dataset and enforce retention policy AFTER saving.
        """
        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Only enforce retention when inserting a new dataset
        if is_new:
            self._enforce_retention_limit()

    def _enforce_retention_limit(self):
        """
        Keep only the latest N datasets per user.
        Deletes older datasets safely (no sliced deletes).
        """
        limit = getattr(settings, "MAX_DATASETS_RETAINED", 5)

        qs = (
            EquipmentDataset.objects
            .filter(user=self.user)
            .order_by("-uploaded_at")
        )

        ids_to_delete = list(
            qs.values_list("id", flat=True)[limit:]
        )

        if ids_to_delete:
            EquipmentDataset.objects.filter(id__in=ids_to_delete).delete()


class EquipmentRecord(models.Model):
    """
    Individual equipment entry belonging to a dataset.
    """

    dataset = models.ForeignKey(
        EquipmentDataset,
        on_delete=models.CASCADE,
        related_name="records",
        help_text="Parent dataset",
    )

    name = models.CharField(
        max_length=255,
        help_text="Equipment name or identifier",
    )

    equipment_type = models.CharField(
        max_length=100,
        help_text="Equipment category/type",
    )

    flowrate = models.FloatField(
        help_text="Operational flowrate",
    )

    pressure = models.FloatField(
        help_text="Operational pressure",
    )

    temperature = models.FloatField(
        help_text="Operational temperature",
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Equipment Record"
        verbose_name_plural = "Equipment Records"
        indexes = [
            models.Index(fields=["dataset", "equipment_type"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.equipment_type})"
