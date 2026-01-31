"""
URL routing for the analytics API.

All endpoints are prefixed with /api/ from the main URL configuration.
"""

from django.urls import path
from .views import (
    CSVUploadView,
    DatasetSummaryView,
    DatasetDetailView,
    UploadHistoryView,
    PDFReportView,
    HealthCheckView,
)

urlpatterns = [
    # Health check (no auth required)
    path('health/', HealthCheckView.as_view(), name='health-check'),
    
    # CSV Upload
    path('upload/', CSVUploadView.as_view(), name='csv-upload'),
    
    # Upload history
    path('history/', UploadHistoryView.as_view(), name='upload-history'),
    
    # Dataset operations
    path('dataset/<int:dataset_id>/', DatasetDetailView.as_view(), name='dataset-detail'),
    path('summary/<int:dataset_id>/', DatasetSummaryView.as_view(), name='dataset-summary'),
    
    # PDF Report generation
    path('report/<int:dataset_id>/', PDFReportView.as_view(), name='pdf-report'),
]
