from rest_framework import serializers
from .models import EquipmentDataset, EquipmentRecord


# ================================
# Equipment Record Serializer
# ================================
class EquipmentRecordSerializer(serializers.ModelSerializer):
    """
    Serializer for individual equipment records.

    Normalizes field names for frontend compatibility.
    """

    equipment_name = serializers.CharField(source="name")

    class Meta:
        model = EquipmentRecord
        fields = [
            "id",
            "equipment_name",   # ✅ frontend-safe
            "equipment_type",
            "flowrate",
            "pressure",
            "temperature",
        ]
        read_only_fields = ["id"]


# ================================
# Dataset List / History Serializer
# ================================
class EquipmentDatasetSerializer(serializers.ModelSerializer):
    """
    Lightweight dataset serializer (no records).
    Used for history & dashboard overview.
    """

    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = EquipmentDataset
        fields = [
            "id",
            "filename",
            "uploaded_at",
            "total_records",
            "avg_flowrate",
            "avg_pressure",
            "avg_temperature",
            "username",
        ]
        read_only_fields = fields


# ================================
# Dataset Detail Serializer
# ================================
class EquipmentDatasetDetailSerializer(serializers.ModelSerializer):
    """
    Full dataset serializer including all equipment records.
    """

    records = EquipmentRecordSerializer(many=True, read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = EquipmentDataset
        fields = [
            "id",
            "filename",
            "uploaded_at",
            "total_records",
            "avg_flowrate",
            "avg_pressure",
            "avg_temperature",
            "username",
            "records",
        ]


# ================================
# Dataset Summary Serializer
# ================================
class DatasetSummarySerializer(serializers.Serializer):
    """
    Statistical analytics only (NO raw records).
    """

    dataset_id = serializers.IntegerField()
    filename = serializers.CharField()
    uploaded_at = serializers.DateTimeField()

    total_equipment = serializers.IntegerField()

    avg_flowrate = serializers.FloatField()
    avg_pressure = serializers.FloatField()
    avg_temperature = serializers.FloatField()

    min_flowrate = serializers.FloatField()
    max_flowrate = serializers.FloatField()
    min_pressure = serializers.FloatField()
    max_pressure = serializers.FloatField()
    min_temperature = serializers.FloatField()
    max_temperature = serializers.FloatField()

    std_flowrate = serializers.FloatField()
    std_pressure = serializers.FloatField()
    std_temperature = serializers.FloatField()

    type_distribution = serializers.DictField(
        child=serializers.IntegerField()
    )


# ================================
# CSV Upload Serializer
# ================================
class CSVUploadSerializer(serializers.Serializer):
    """
    CSV upload validation.
    """

    file = serializers.FileField()

    def validate_file(self, value):
        if not value.name.lower().endswith(".csv"):
            raise serializers.ValidationError("Only CSV files are allowed.")

        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("CSV file must be under 10MB.")

        return value


# ================================
# Upload Response Serializer
# ================================
class UploadResponseSerializer(serializers.Serializer):
    """
    Standardized upload response.
    """

    message = serializers.CharField()
    dataset = EquipmentDatasetSerializer()
    records_processed = serializers.IntegerField()
    warnings = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )
