import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from analytics.services import AnalyticsService
from analytics.models import EquipmentDataset

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
SAMPLE_DIR = os.path.join(BASE_DIR, "analytics", "sample_csv")

User = get_user_model()


class Command(BaseCommand):
    help = "Seed permanent demo datasets"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding permanent demo datasets...")

        user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "demo@chemviz.app",
                "first_name": "Demo",
                "last_name": "User",
                "is_staff": True,
                "is_superuser": True,
            },
        )

        for file in sorted(os.listdir(SAMPLE_DIR)):
            if not file.endswith(".csv"):
                continue

            if EquipmentDataset.objects.filter(
                user=user, filename=file
            ).exists():
                self.stdout.write(f"⚠️ Skipped (exists): {file}")
                continue

            path = os.path.join(SAMPLE_DIR, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            AnalyticsService.process_upload(
                user=user,
                filename=file,
                file_content=content,
            )

            self.stdout.write(f"✅ Loaded {file}")

        self.stdout.write("🎉 Permanent demo data ready")
