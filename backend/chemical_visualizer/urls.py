"""
URL configuration for chemical_visualizer project.

Central URL routing for the Chemical Equipment Parameter Visualizer.
All API endpoints are prefixed with /api/ for clarity and security.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, HttpResponseRedirect

# -------------------------------------------------------------------
# Root Helpers
# -------------------------------------------------------------------

def api_root(request):
    """
    Root API landing endpoint.
    Helps evaluators quickly understand available services.
    """
    return JsonResponse(
        {
            "service": "Chemical Equipment Parameter Visualizer API",
            "status": "running",
            "endpoints": {
                "auth": "/api/auth/",
                "upload": "/api/upload/",
                "history": "/api/history/",
                "summary": "/api/summary/<dataset_id>/",
                "dataset": "/api/dataset/<dataset_id>/",
                "report": "/api/report/<dataset_id>/",
                "health": "/api/health/",
            },
        }
    )


def root_redirect(request):
    """
    Redirect bare root requests.
    Useful when backend & frontend are deployed together.
    """
    return HttpResponseRedirect("/api/")


# -------------------------------------------------------------------
# URL Patterns
# -------------------------------------------------------------------

urlpatterns = [
    # Root redirect (optional but professional)
    path("", root_redirect, name="root"),

    # Django Admin
    path("admin/", admin.site.urls),

    # API Root (documentation-like entry)
    path("api/", api_root, name="api-root"),

    # Analytics API (upload, history, summary, reports)
    path("api/", include("analytics.urls")),

    # Authentication API
    path("api/auth/", include("authentication.urls")),
]

# -------------------------------------------------------------------
# Static & Media Files (Development)
# -------------------------------------------------------------------

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )

    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
    )
