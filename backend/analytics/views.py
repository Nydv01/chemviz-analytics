"""
API Views for the analytics module.

Provides REST endpoints for CSV upload, analytics retrieval,
upload history, and PDF report generation.
"""

import logging

logger = logging.getLogger(__name__)

from django.http import HttpResponse
from django.utils.encoding import iri_to_uri
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


from .models import EquipmentDataset
from .serializers import (
    EquipmentDatasetSerializer,
    EquipmentDatasetDetailSerializer,
    DatasetSummarySerializer,
    CSVUploadSerializer,
    UploadResponseSerializer,
)
from .services import AnalyticsService, CSVValidationError
from .pdf import PDFReportGenerator

logger = logging.getLogger(__name__)


class CSVUploadView(APIView):
    """
    Handle CSV file uploads for equipment data.
    
    POST /api/upload/
    
    Accepts a CSV file, validates its structure, parses the data
    using Pandas, computes analytics, and stores in the database.
    """
    
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        """
        Process a CSV upload.
        
        Request:
            - file: CSV file (multipart/form-data)
        
        Response:
            - 201: Upload successful with dataset info and statistics
            - 400: Validation error (missing file, invalid format, schema issues)
            - 500: Server error during processing
        """
        serializer = CSVUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Validation failed', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_file = serializer.validated_data['file']
        
        try:
            # Read file content
            file_content = uploaded_file.read().decode('utf-8')
        except UnicodeDecodeError:
            return Response(
                {'error': 'File encoding error. Please upload a UTF-8 encoded CSV.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Process the upload
            dataset, stats, warnings = AnalyticsService.process_upload(
                user=request.user,
                filename=uploaded_file.name,
                file_content=file_content
            )
            
            response_data = {
                'message': 'Upload successful',
                'dataset': EquipmentDatasetSerializer(dataset).data,
                'records_processed': stats['total_equipment'],
                'summary': stats,
            }
            
            if warnings:
                response_data['warnings'] = warnings
            
            logger.info(f"Upload successful: {dataset.filename} by {request.user.username}")
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except CSVValidationError as e:
            logger.warning(f"CSV validation failed: {str(e)}")
            return Response(
                {'error': 'CSV validation failed', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.exception(f"Upload processing error: {str(e)}")
            return Response(
                {'error': 'An error occurred while processing the file.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DatasetSummaryView(APIView):
    """
    Retrieve summary analytics for a specific dataset.
    
    GET /api/summary/<dataset_id>/
    
    Returns comprehensive statistics including averages, ranges,
    standard deviations, and equipment type distribution.
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, dataset_id):
        """
        Get summary statistics for a dataset.
        
        Path Parameters:
            - dataset_id: ID of the dataset to summarize
        
        Response:
            - 200: Summary statistics
            - 404: Dataset not found or access denied
        """
        try:
            dataset = EquipmentDataset.objects.get(
                id=dataset_id,
                user=request.user
            )
        except EquipmentDataset.DoesNotExist:
            return Response(
                {'error': 'Dataset not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        summary = AnalyticsService.get_dataset_summary(dataset)
        serializer = DatasetSummarySerializer(summary)
        
        return Response(serializer.data)


class DatasetDetailView(APIView):
    """
    Retrieve detailed dataset information including all records.
    
    GET /api/dataset/<dataset_id>/
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, dataset_id):
        """Get full dataset with all equipment records."""
        try:
            dataset = EquipmentDataset.objects.get(
                id=dataset_id,
                user=request.user
            )
        except EquipmentDataset.DoesNotExist:
            return Response(
                {'error': 'Dataset not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = EquipmentDatasetDetailSerializer(dataset)
        return Response(serializer.data)
    
    def delete(self, request, dataset_id):
        """Delete a specific dataset."""
        try:
            dataset = EquipmentDataset.objects.get(
                id=dataset_id,
                user=request.user
            )
        except EquipmentDataset.DoesNotExist:
            return Response(
                {'error': 'Dataset not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        dataset.delete()
        logger.info(f"Dataset {dataset_id} deleted by {request.user.username}")
        
        return Response(
            {'message': 'Dataset deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


class UploadHistoryView(APIView):
    """
    Retrieve upload history for the authenticated user.
    
    GET /api/history/
    
    Returns metadata for the last 5 uploaded datasets (per retention policy).
    """
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get upload history.
        
        Response:
            - 200: List of dataset metadata (limited to MAX_DATASETS_RETAINED)
        """
        datasets = EquipmentDataset.objects.filter(
            user=request.user
        ).order_by('-uploaded_at')[:5]
        
        serializer = EquipmentDatasetSerializer(datasets, many=True)
        
        return Response({
            'count': len(serializer.data),
            'datasets': serializer.data
        })


class PDFReportView(APIView):
    """
    Generate and download PDF report for a dataset.

    GET /api/report/<dataset_id>/

    Generates a professional PDF report with summary statistics,
    charts, and tabular data.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, dataset_id):
        try:
            dataset = EquipmentDataset.objects.get(
                id=dataset_id,
                user=request.user
            )
        except EquipmentDataset.DoesNotExist:
            logger.warning(
                f"PDF access denied or dataset not found: {dataset_id} user={request.user}"
            )
            return Response(
                {"error": "Dataset not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Generate analytics summary
            summary = AnalyticsService.get_dataset_summary(dataset)

            # Generate PDF
            generator = PDFReportGenerator(dataset, summary)
            pdf_bytes = generator.generate()

            # 🔐 Safe filename handling
            safe_name = (
                dataset.filename
                .replace(" ", "_")
                .replace(".csv", "")
                .replace("/", "_")
            )
            filename = f"equipment_report_{safe_name}_{dataset.id}.pdf"

            # 📄 Proper PDF response
            response = HttpResponse(
                pdf_bytes,
                content_type="application/pdf",
            )

            # ✅ Download-safe headers
            response["Content-Disposition"] = (
                f'attachment; filename="{filename}"; '
                f"filename*=UTF-8''{iri_to_uri(filename)}"
            )
            response["Content-Length"] = len(pdf_bytes)
            response["Cache-Control"] = "no-store, no-cache, must-revalidate"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"

            logger.info(
                f"PDF generated | dataset={dataset.id} | user={request.user.username}"
            )

            return response

        except Exception as e:
            logger.exception(
                f"PDF generation failed | dataset={dataset_id} | error={str(e)}"
            )
            return Response(
                {"error": "Failed to generate PDF report"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
class HealthCheckView(APIView):
    """
    Simple health check endpoint.
    
    GET /api/health/
    
    No authentication required. Used for monitoring.
    """
    
    permission_classes = []
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'Chemical Equipment Parameter Visualizer API'
        })
