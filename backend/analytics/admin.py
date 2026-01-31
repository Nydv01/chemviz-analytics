"""
Django Admin configuration for analytics models.

Provides admin interface for managing datasets and equipment records.
"""

from django.contrib import admin
from .models import EquipmentDataset, EquipmentRecord


class EquipmentRecordInline(admin.TabularInline):
    """Inline display of equipment records within dataset admin."""
    model = EquipmentRecord
    extra = 0
    readonly_fields = ['name', 'equipment_type', 'flowrate', 'pressure', 'temperature']
    can_delete = False
    max_num = 20  # Limit displayed records
    
    def has_add_permission(self, request, obj=None):
        return False


@admin.register(EquipmentDataset)
class EquipmentDatasetAdmin(admin.ModelAdmin):
    """Admin configuration for equipment datasets."""
    
    list_display = [
        'filename',
        'user',
        'uploaded_at',
        'total_records',
        'avg_flowrate',
        'avg_pressure',
        'avg_temperature',
    ]
    list_filter = ['uploaded_at', 'user']
    search_fields = ['filename', 'user__username']
    readonly_fields = [
        'uploaded_at',
        'total_records',
        'avg_flowrate',
        'avg_pressure',
        'avg_temperature',
    ]
    date_hierarchy = 'uploaded_at'
    inlines = [EquipmentRecordInline]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(EquipmentRecord)
class EquipmentRecordAdmin(admin.ModelAdmin):
    """Admin configuration for individual equipment records."""
    
    list_display = [
        'name',
        'equipment_type',
        'flowrate',
        'pressure',
        'temperature',
        'get_dataset_filename',
    ]
    list_filter = ['equipment_type', 'dataset']
    search_fields = ['name', 'equipment_type', 'dataset__filename']
    readonly_fields = ['dataset']
    
    def get_dataset_filename(self, obj):
        return obj.dataset.filename
    get_dataset_filename.short_description = 'Dataset'
    get_dataset_filename.admin_order_field = 'dataset__filename'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('dataset')
