from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from datetime import timedelta

# Set the default Django settings module for the 'celery' program
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sis_exercise.settings")

# Create a Celery instance
app = Celery("sis_exercise")

# Load configuration from the Django settings file.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Update the broker connection retry behavior for future compatibility
app.conf.broker_connection_retry_on_startup = True

# Define the periodic tasks schedule
schedule_minutes = int(os.environ.get("CELERY_SCHEDULE_MINUTES", 1440)) # Get the number of minutes from the .env, default to 1440 (1 day)

app.conf.beat_schedule = {
    "scheduler": {
        "task": "api.tasks.harvest_literature",
        "schedule": timedelta(minutes=schedule_minutes), 
    },
}

# Automatically discover tasks from all registered Django app configs
app.autodiscover_tasks()
