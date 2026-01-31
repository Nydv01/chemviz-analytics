"""
PDF Report Generation Module.

Generates professional PDF reports for equipment datasets
using ReportLab. Includes summary statistics, data tables,
and optional visualizations.
"""

import io
from datetime import datetime
from typing import Dict, Any, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    Image,
)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.piecharts import Pie

from .models import EquipmentDataset


class PDFReportGenerator:
    """
    Generates PDF reports for equipment datasets.
    
    Creates professional reports with summary statistics,
    data tables, and distribution charts.
    """
    
    def __init__(self, dataset: EquipmentDataset, summary: Dict[str, Any]):
        """
        Initialize the report generator.
        
        Args:
            dataset: The equipment dataset to report on
            summary: Pre-computed summary statistics
        """
        self.dataset = dataset
        self.summary = summary
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Configure custom paragraph styles for the report."""
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Title'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#1a365d'),
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#2d3748'),
        ))
        
        self.styles.add(ParagraphStyle(
            name='ReportBody',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=8,
            textColor=colors.HexColor('#4a5568'),
        ))
    
    def _create_header(self) -> List:
        """Create report header elements."""
        elements = []
        
        # Title
        elements.append(Paragraph(
            "Chemical Equipment Parameter Analysis Report",
            self.styles['ReportTitle']
        ))
        
        # Metadata
        elements.append(Paragraph(
            f"<b>Dataset:</b> {self.dataset.filename}",
            self.styles['ReportBody']
        ))
        elements.append(Paragraph(
            f"<b>Uploaded:</b> {self.dataset.uploaded_at.strftime('%Y-%m-%d %H:%M UTC')}",
            self.styles['ReportBody']
        ))
        elements.append(Paragraph(
            f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}",
            self.styles['ReportBody']
        ))
        elements.append(Paragraph(
            f"<b>Total Equipment Records:</b> {self.summary.get('total_equipment', 0)}",
            self.styles['ReportBody']
        ))
        
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _create_summary_table(self) -> Table:
        """Create summary statistics table."""
        data = [
            ['Parameter', 'Average', 'Minimum', 'Maximum', 'Std Dev'],
            [
                'Flowrate',
                f"{self.summary.get('avg_flowrate', 0):.4f}",
                f"{self.summary.get('min_flowrate', 0):.4f}",
                f"{self.summary.get('max_flowrate', 0):.4f}",
                f"{self.summary.get('std_flowrate', 0):.4f}",
            ],
            [
                'Pressure',
                f"{self.summary.get('avg_pressure', 0):.4f}",
                f"{self.summary.get('min_pressure', 0):.4f}",
                f"{self.summary.get('max_pressure', 0):.4f}",
                f"{self.summary.get('std_pressure', 0):.4f}",
            ],
            [
                'Temperature',
                f"{self.summary.get('avg_temperature', 0):.4f}",
                f"{self.summary.get('min_temperature', 0):.4f}",
                f"{self.summary.get('max_temperature', 0):.4f}",
                f"{self.summary.get('std_temperature', 0):.4f}",
            ],
        ]
        
        table = Table(data, colWidths=[1.5*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
        table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data rows
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2d3748')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            
            # Borders
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('LINEBELOW', (0, 0), (-1, 0), 2, colors.HexColor('#4a5568')),
            
            # Padding
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        
        return table
    
    def _create_type_distribution_table(self) -> Table:
        """Create equipment type distribution table."""
        type_dist = self.summary.get('type_distribution', {})
        
        if not type_dist:
            data = [['Equipment Type', 'Count'], ['No data available', '-']]
        else:
            data = [['Equipment Type', 'Count', 'Percentage']]
            total = sum(type_dist.values())
            
            for eq_type, count in sorted(type_dist.items(), key=lambda x: -x[1]):
                percentage = (count / total * 100) if total > 0 else 0
                data.append([
                    eq_type.title(),
                    str(count),
                    f"{percentage:.1f}%"
                ])
        
        table = Table(data, colWidths=[2*inch, 1*inch, 1*inch])
        table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Data
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f7fafc')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        return table
    
    def _create_equipment_data_table(self) -> List:
        """Create detailed equipment data table."""
        elements = []
        
        records = self.dataset.records.all()[:50]  # Limit to first 50 for PDF
        
        if not records:
            elements.append(Paragraph(
                "No equipment records available.",
                self.styles['ReportBody']
            ))
            return elements
        
        # Create table data
        data = [['Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']]
        
        for record in records:
            data.append([
                record.name[:30] + '...' if len(record.name) > 30 else record.name,
                record.equipment_type.title(),
                f"{record.flowrate:.2f}",
                f"{record.pressure:.2f}",
                f"{record.temperature:.2f}",
            ])
        
        table = Table(
            data,
            colWidths=[1.8*inch, 1.2*inch, 1*inch, 1*inch, 1*inch]
        )
        table.setStyle(TableStyle([
            # Header
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            
            # Alternating row colors
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ALIGN', (2, 1), (-1, -1), 'RIGHT'),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        # Add alternating row colors
        for i in range(1, len(data)):
            if i % 2 == 0:
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, i), (-1, i), colors.HexColor('#f7fafc')),
                ]))
        
        elements.append(table)
        
        if len(self.dataset.records.all()) > 50:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(
                f"<i>Showing first 50 of {self.dataset.records.count()} records.</i>",
                self.styles['ReportBody']
            ))
        
        return elements
    
    def generate(self) -> bytes:
        """
        Generate the complete PDF report.
        
        Returns:
            PDF content as bytes
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch,
        )
        
        elements = []
        
        # Header
        elements.extend(self._create_header())
        
        # Summary Statistics Section
        elements.append(Paragraph(
            "Summary Statistics",
            self.styles['SectionHeader']
        ))
        elements.append(self._create_summary_table())
        elements.append(Spacer(1, 20))
        
        # Equipment Type Distribution
        elements.append(Paragraph(
            "Equipment Type Distribution",
            self.styles['SectionHeader']
        ))
        elements.append(self._create_type_distribution_table())
        elements.append(Spacer(1, 20))
        
        # Detailed Equipment Data
        elements.append(Paragraph(
            "Equipment Data Details",
            self.styles['SectionHeader']
        ))
        elements.extend(self._create_equipment_data_table())
        
        # Footer note
        elements.append(Spacer(1, 30))
        elements.append(Paragraph(
            "<i>This report was automatically generated by the Chemical Equipment "
            "Parameter Visualizer system.</i>",
            self.styles['ReportBody']
        ))
        
        # Build PDF
        doc.build(elements)
        
        return buffer.getvalue()
