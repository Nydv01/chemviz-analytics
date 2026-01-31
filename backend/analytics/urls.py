"""
Analytics API URL Configuration

All endpoints are prefixed with: /api/

Design goals:
✔ Zero breaking changes
✔ Clear semantic grouping
✔ Backward compatibility
✔ Easy extension for future versions
✔ Submission / production ready
"""

from django.urls import path

from .views import (
    # Core upload & analytics
    CSVUploadView,
    DatasetSummaryView,
    DatasetDetailView,
    UploadHistoryView,

    # Reporting
    PDFReportView,

    # System
    HealthCheckView,
)

# =====================================================================
# API VERSIONING (Future-proof)
# =====================================================================
# If you ever add v2, you can do:
# /api/v2/...
# without breaking existing clients

APP_NAME = "analytics"

# =====================================================================
# ROUTES
# =====================================================================

urlpatterns = [

    # -----------------------------------------------------------------
    # SYSTEM & HEALTH
    # -----------------------------------------------------------------

    path(
        "health/",
        HealthCheckView.as_view(),
        name="health-check",
    ),

    # -----------------------------------------------------------------
    # DATA INGESTION
    # -----------------------------------------------------------------

    path(
        "upload/",
        CSVUploadView.as_view(),
        name="csv-upload",
    ),

    # -----------------------------------------------------------------
    # HISTORY & DATASETS
    # -----------------------------------------------------------------

    path(
        "history/",
        UploadHistoryView.as_view(),
        name="upload-history",
    ),

    path(
        "dataset/<int:dataset_id>/",
        DatasetDetailView.as_view(),
        name="dataset-detail",
    ),

    path(
        "summary/<int:dataset_id>/",
        DatasetSummaryView.as_view(),
        name="dataset-summary",
    ),

    # -----------------------------------------------------------------
    # REPORTING (🔥 SINGLE SOURCE OF TRUTH 🔥)
    # -----------------------------------------------------------------
    # This endpoint guarantees:
    # - Real PDF if dataset exists
    # - Demo PDF if dataset does NOT exist
    # - Always downloadable (no frontend errors)

    path(
        "report/<int:dataset_id>/",
        PDFReportView.as_view(),
        name="pdf-report",
    ),

    # -----------------------------------------------------------------
    # BACKWARD-COMPATIBILITY / ALIASES (OPTIONAL BUT POWERFUL)
    # -----------------------------------------------------------------
    # These allow future frontend changes without breaking old links.
    # You can safely remove them later if not needed.

    path(
        "reports/<int:dataset_id>/",
        PDFReportView.as_view(),
        name="pdf-report-alias",
    ),

    path(
        "download/report/<int:dataset_id>/",
        PDFReportView.as_view(),
        name="pdf-report-download",
    ),
]

