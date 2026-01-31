"""
URL configuration for chemical_visualizer project.

Central URL routing for the Chemical Equipment Parameter Visualizer.
All API endpoints are prefixed with /api/ for clarity.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django admin interface
    path('admin/', admin.site.urls),
    
    # Analytics API endpoints (upload, summary, history, reports)
    path('api/', include('analytics.urls')),
    
    # Authentication endpoints
    path('api/auth/', include('authentication.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
