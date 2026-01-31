"""
Business logic and data processing services.

This module contains the core analytics logic using Pandas for
CSV parsing, data validation, and statistical computations.
Separating this from views follows clean architecture principles.
"""

import logging
from typing import Tuple, Dict, List, Any, Optional
from io import StringIO

import pandas as pd
from django.db import transaction
from django.contrib.auth.models import User

from .models import EquipmentDataset, EquipmentRecord

logger = logging.getLogger(__name__)


# Expected CSV column names (case-insensitive matching)
REQUIRED_COLUMNS = {
    'equipment_name': ['equipment name', 'equipment_name', 'name', 'equipmentname'],
    'equipment_type': ['equipment type', 'equipment_type', 'type', 'equipmenttype'],
    'flowrate': ['flowrate', 'flow_rate', 'flow rate', 'flow'],
    'pressure': ['pressure', 'press'],
    'temperature': ['temperature', 'temp'],
}


class CSVValidationError(Exception):
    """Raised when CSV validation fails."""
    pass


class AnalyticsService:
    """
    Service class for equipment data analytics.
    
    Handles CSV parsing, validation, database persistence,
    and statistical computations using Pandas.
    """
    
    @staticmethod
    def normalize_column_name(col: str) -> Optional[str]:
        """
        Map a CSV column name to its normalized form.
        
        Args:
            col: Original column name from CSV
            
        Returns:
            Normalized column key or None if not recognized
        """
        col_lower = col.strip().lower()
        for key, variations in REQUIRED_COLUMNS.items():
            if col_lower in variations:
                return key
        return None
    
    @classmethod
    def parse_and_validate_csv(cls, file_content: str) -> Tuple[pd.DataFrame, List[str]]:
        """
        Parse CSV content and validate schema.
        
        Args:
            file_content: Raw CSV string content
            
        Returns:
            Tuple of (validated DataFrame, list of warnings)
            
        Raises:
            CSVValidationError: If required columns are missing or data is invalid
        """
        warnings = []
        
        try:
            # Read CSV into DataFrame
            df = pd.read_csv(StringIO(file_content))
        except Exception as e:
            raise CSVValidationError(f"Failed to parse CSV: {str(e)}")
        
        if df.empty:
            raise CSVValidationError("CSV file is empty or contains no data rows.")
        
        # Normalize column names
        column_mapping = {}
        original_columns = df.columns.tolist()
        
        for col in original_columns:
            normalized = cls.normalize_column_name(col)
            if normalized:
                column_mapping[col] = normalized
        
        # Check for required columns
        found_columns = set(column_mapping.values())
        required = set(REQUIRED_COLUMNS.keys())
        missing = required - found_columns
        
        if missing:
            raise CSVValidationError(
                f"Missing required columns: {', '.join(missing)}. "
                f"Found columns: {', '.join(original_columns)}"
            )
        
        # Rename columns to normalized form
        df = df.rename(columns=column_mapping)
        
        # Keep only required columns
        df = df[list(REQUIRED_COLUMNS.keys())]
        
        # Handle missing values
        initial_count = len(df)
        df = df.dropna(subset=['flowrate', 'pressure', 'temperature'])
        dropped_count = initial_count - len(df)
        
        if dropped_count > 0:
            warnings.append(
                f"Dropped {dropped_count} rows with missing numeric values."
            )
        
        if len(df) == 0:
            raise CSVValidationError(
                "No valid data rows remain after removing rows with missing values."
            )
        
        # Validate numeric columns
        numeric_columns = ['flowrate', 'pressure', 'temperature']
        for col in numeric_columns:
            try:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            except Exception as e:
                raise CSVValidationError(
                    f"Column '{col}' contains invalid numeric data: {str(e)}"
                )
        
        # Remove any rows where numeric conversion failed
        before_count = len(df)
        df = df.dropna(subset=numeric_columns)
        if len(df) < before_count:
            warnings.append(
                f"Dropped {before_count - len(df)} rows with non-numeric values."
            )
        
        # Validate reasonable ranges (basic sanity checks)
        if (df['flowrate'] < 0).any():
            warnings.append("Some flowrate values are negative.")
        if (df['pressure'] < 0).any():
            warnings.append("Some pressure values are negative.")
        
        # Clean string columns
        df['equipment_name'] = df['equipment_name'].astype(str).str.strip()
        df['equipment_type'] = df['equipment_type'].astype(str).str.strip().str.lower()
        
        logger.info(f"Successfully validated CSV with {len(df)} records")
        
        return df, warnings
    
    @classmethod
    def compute_statistics(cls, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Compute aggregate statistics from equipment data.
        
        Args:
            df: Validated DataFrame with equipment records
            
        Returns:
            Dictionary containing computed statistics
        """
        stats = {
            'total_equipment': len(df),
            'avg_flowrate': round(df['flowrate'].mean(), 4),
            'avg_pressure': round(df['pressure'].mean(), 4),
            'avg_temperature': round(df['temperature'].mean(), 4),
            'min_flowrate': round(df['flowrate'].min(), 4),
            'max_flowrate': round(df['flowrate'].max(), 4),
            'min_pressure': round(df['pressure'].min(), 4),
            'max_pressure': round(df['pressure'].max(), 4),
            'min_temperature': round(df['temperature'].min(), 4),
            'max_temperature': round(df['temperature'].max(), 4),
            'std_flowrate': round(df['flowrate'].std(), 4),
            'std_pressure': round(df['pressure'].std(), 4),
            'std_temperature': round(df['temperature'].std(), 4),
            'type_distribution': df['equipment_type'].value_counts().to_dict(),
        }
        
        return stats
    
    @classmethod
    @transaction.atomic
    def process_upload(
        cls,
        user: User,
        filename: str,
        file_content: str
    ) -> Tuple[EquipmentDataset, Dict[str, Any], List[str]]:
        """
        Process a CSV upload end-to-end.
        
        Parses the CSV, validates data, computes statistics,
        and persists to database within a transaction.
        
        Args:
            user: Authenticated user performing the upload
            filename: Original filename
            file_content: Raw CSV content
            
        Returns:
            Tuple of (created dataset, statistics dict, warnings list)
            
        Raises:
            CSVValidationError: If validation fails
        """
        # Parse and validate
        df, warnings = cls.parse_and_validate_csv(file_content)
        
        # Compute statistics
        stats = cls.compute_statistics(df)
        
        # Create dataset record
        dataset = EquipmentDataset.objects.create(
            user=user,
            filename=filename,
            total_records=stats['total_equipment'],
            avg_flowrate=stats['avg_flowrate'],
            avg_pressure=stats['avg_pressure'],
            avg_temperature=stats['avg_temperature'],
        )
        
        # Bulk create equipment records for efficiency
        records = [
            EquipmentRecord(
                dataset=dataset,
                name=row['equipment_name'],
                equipment_type=row['equipment_type'],
                flowrate=row['flowrate'],
                pressure=row['pressure'],
                temperature=row['temperature'],
            )
            for _, row in df.iterrows()
        ]
        
        EquipmentRecord.objects.bulk_create(records, batch_size=1000)
        
        logger.info(
            f"Processed upload: {filename} with {len(records)} records "
            f"for user {user.username}"
        )
        
        return dataset, stats, warnings
    
    @classmethod
    def get_dataset_summary(cls, dataset: EquipmentDataset) -> Dict[str, Any]:
        """
        Get comprehensive summary statistics for a dataset.
        
        Recomputes statistics from stored records for accuracy.
        
        Args:
            dataset: The dataset to summarize
            
        Returns:
            Dictionary with full statistics and metadata
        """
        records = dataset.records.all().values(
            'flowrate', 'pressure', 'temperature', 'equipment_type'
        )
        
        if not records:
            return {
                'dataset_id': dataset.id,
                'filename': dataset.filename,
                'uploaded_at': dataset.uploaded_at,
                'total_equipment': 0,
                'avg_flowrate': 0,
                'avg_pressure': 0,
                'avg_temperature': 0,
                'min_flowrate': 0,
                'max_flowrate': 0,
                'min_pressure': 0,
                'max_pressure': 0,
                'min_temperature': 0,
                'max_temperature': 0,
                'std_flowrate': 0,
                'std_pressure': 0,
                'std_temperature': 0,
                'type_distribution': {},
            }
        
        # Convert to DataFrame for computation
        df = pd.DataFrame(list(records))
        stats = cls.compute_statistics(df)
        
        return {
            'dataset_id': dataset.id,
            'filename': dataset.filename,
            'uploaded_at': dataset.uploaded_at,
            **stats,
        }
