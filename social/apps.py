# social/app.py
from django.apps import AppConfig

class SocialConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'social'

    def ready(self):
        import social.signals  # ✅ Make sure signals.py exists in `social/`
