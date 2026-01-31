"""
WSGI config for chemical_visualizer project.

Exposes the WSGI callable as a module-level variable named ``application``.
For deployment with Gunicorn, uWSGI, or similar WSGI servers.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chemical_visualizer.settings')

application = get_wsgi_application()
