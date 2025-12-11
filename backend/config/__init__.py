# config/__init__.py
# Celery app import qilish
from .celery import app as celery_app

__all__ = ('celery_app',)
