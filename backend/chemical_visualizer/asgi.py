"""
ASGI config for chemical_visualizer project.

Exposes the ASGI callable for async-capable servers.
Supports WebSockets if needed in future iterations.
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chemical_visualizer.settings')

application = get_asgi_application()
