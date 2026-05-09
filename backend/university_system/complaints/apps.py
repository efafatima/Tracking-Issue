from django.apps import AppConfig


class ComplaintsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'complaints'

    def ready(self):
        import threading
        import time
        import os

        # Only run scheduler in the main process (not in Django's reloader child)
        if os.environ.get("RUN_MAIN") != "true":
            return

        def escalation_loop():
            # Wait 30s after startup before first check
            time.sleep(30)
            while True:
                try:
                    from django.core.management import call_command
                    call_command("check_escalations", verbosity=0)
                except Exception:
                    pass
                # Check every hour (3600 seconds)
                time.sleep(3600)

        t = threading.Thread(target=escalation_loop, daemon=True)
        t.start()
