from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from analytics.services import AnalyticsService
from analytics.models import EquipmentDataset
import os


class Command(BaseCommand):
    help = "Seed permanent demo datasets (5 CSVs)"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding permanent demo datasets...")

        BASE_DIR = os.path.dirname(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(__file__)
                )
            )
        )

        SAMPLE_DIR = os.path.join(BASE_DIR, "analytics", "sample_csv")

        if not os.path.exists(SAMPLE_DIR):
            self.stderr.write(f"❌ sample_csv folder not found: {SAMPLE_DIR}")
            return

        User = get_user_model()

        user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "demo@chemviz.app",
                "first_name": "Demo",
                "last_name": "User",
            },
        )

        for file in sorted(os.listdir(SAMPLE_DIR)):
            if not file.endswith(".csv"):
                continue

            if EquipmentDataset.objects.filter(
                user=user,
                filename=file
            ).exists():
                self.stdout.write(f"⚠️ Skipped (already exists): {file}")
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

        self.stdout.write(self.style.SUCCESS("🎉 Permanent demo data ready"))
