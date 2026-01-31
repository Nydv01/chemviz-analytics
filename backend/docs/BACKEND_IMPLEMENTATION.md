# Backend Implementation Guide

## Chemical Equipment Parameter Visualizer

### Complete Backend Architecture & API Documentation

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Specification](#api-specification)
6. [Data Flow](#data-flow)
7. [Security Considerations](#security-considerations)
8. [Setup & Deployment](#setup--deployment)
9. [Testing Guidelines](#testing-guidelines)

---

## Architecture Overview

The Chemical Equipment Parameter Visualizer follows a **clean architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────────┐              ┌─────────────────────────┐   │
│  │   React Web     │              │    PyQt5 Desktop        │   │
│  │   Dashboard     │              │    Application          │   │
│  └────────┬────────┘              └───────────┬─────────────┘   │
│           │                                   │                  │
│           └───────────────┬───────────────────┘                  │
│                           │ HTTP/REST                            │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                    Django REST API                               │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │                    Views (API Layer)                     │    │
│  │   • CSVUploadView    • DatasetSummaryView               │    │
│  │   • UploadHistoryView • PDFReportView                   │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │                 Services (Business Logic)                │    │
│  │   • AnalyticsService (Pandas processing)                │    │
│  │   • PDFReportGenerator (ReportLab)                      │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │                 Serializers (Validation)                 │    │
│  │   • CSVUploadSerializer • DatasetSummarySerializer      │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │                   Models (Data Layer)                    │    │
│  │   • EquipmentDataset • EquipmentRecord                  │    │
│  └────────────────────────┬────────────────────────────────┘    │
└───────────────────────────┼─────────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                       SQLite Database                            │
│  ┌──────────────────┐     ┌────────────────────────────────┐    │
│  │ equipment_dataset│────▶│     equipment_record           │    │
│  └──────────────────┘     └────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Views handle HTTP; Services handle business logic
2. **Single Responsibility**: Each module has one purpose
3. **Dependency Injection**: Services are stateless and testable
4. **RESTful Design**: Standard HTTP methods and status codes

---

## Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Django | 4.2+ | Web framework |
| API Layer | Django REST Framework | 3.14+ | REST API |
| Data Processing | Pandas | 2.0+ | CSV parsing & analytics |
| PDF Generation | ReportLab | 4.0+ | Report generation |
| Database | SQLite | 3.x | Data persistence |
| CORS | django-cors-headers | 4.3+ | Cross-origin requests |

---

## Project Structure

```
backend/
├── manage.py                    # Django CLI
├── requirements.txt             # Python dependencies
├── db.sqlite3                   # Database (created on migrate)
│
├── chemical_visualizer/         # Main Django project
│   ├── __init__.py
│   ├── settings.py              # Configuration
│   ├── urls.py                  # Root URL routing
│   ├── wsgi.py                  # WSGI entry point
│   └── asgi.py                  # ASGI entry point
│
├── analytics/                   # Core analytics app
│   ├── __init__.py
│   ├── models.py                # Database models
│   ├── serializers.py           # DRF serializers
│   ├── views.py                 # API endpoints
│   ├── urls.py                  # App URL routing
│   ├── services.py              # Business logic (Pandas)
│   ├── pdf.py                   # PDF generation
│   └── admin.py                 # Django admin config
│
└── authentication/              # Auth module
    ├── __init__.py
    ├── serializers.py           # Auth validation
    ├── views.py                 # Login/logout/register
    └── urls.py                  # Auth URL routing
```

---

## Database Schema

### EquipmentDataset

Stores metadata for each CSV upload.

| Field | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Auto-incrementing primary key |
| user | FK → User | Uploading user |
| filename | CharField(255) | Original filename |
| uploaded_at | DateTime | Upload timestamp |
| total_records | PositiveInteger | Record count |
| avg_flowrate | Float (nullable) | Mean flowrate |
| avg_pressure | Float (nullable) | Mean pressure |
| avg_temperature | Float (nullable) | Mean temperature |
| file_path | CharField(500) | Optional file storage path |

**Retention Policy**: Only the last 5 datasets per user are retained. Older datasets are automatically deleted.

### EquipmentRecord

Individual equipment entries from uploaded CSVs.

| Field | Type | Description |
|-------|------|-------------|
| id | Integer (PK) | Auto-incrementing primary key |
| dataset | FK → EquipmentDataset | Parent dataset |
| name | CharField(255) | Equipment identifier |
| equipment_type | CharField(100) | Equipment category |
| flowrate | Float | Flowrate parameter |
| pressure | Float | Pressure parameter |
| temperature | Float | Temperature parameter |

### Entity Relationship Diagram

```
┌──────────────────────┐       ┌──────────────────────┐
│        User          │       │   EquipmentDataset   │
├──────────────────────┤       ├──────────────────────┤
│ id (PK)              │──┐    │ id (PK)              │
│ username             │  │    │ user_id (FK)         │◀──┘
│ email                │  │    │ filename             │
│ password             │  └───▶│ uploaded_at          │
│ ...                  │       │ total_records        │
└──────────────────────┘       │ avg_flowrate         │
                               │ avg_pressure         │
                               │ avg_temperature      │
                               └──────────┬───────────┘
                                          │
                                          │ 1:N
                                          ▼
                               ┌──────────────────────┐
                               │   EquipmentRecord    │
                               ├──────────────────────┤
                               │ id (PK)              │
                               │ dataset_id (FK)      │
                               │ name                 │
                               │ equipment_type       │
                               │ flowrate             │
                               │ pressure             │
                               │ temperature          │
                               └──────────────────────┘
```

---

## API Specification

### Base URL
```
http://localhost:8000/api/
```

### Authentication Endpoints

#### POST /api/auth/login/
Authenticate user and create session.

**Request:**
```json
{
  "username": "researcher",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "researcher",
    "email": "researcher@lab.edu",
    "first_name": "Jane",
    "last_name": "Doe"
  },
  "csrfToken": "abc123..."
}
```

#### POST /api/auth/logout/
Terminate current session.

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

#### POST /api/auth/register/
Create new user account.

**Request:**
```json
{
  "username": "newuser",
  "email": "new@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123"
}
```

#### GET /api/auth/me/
Get current authenticated user.

---

### Analytics Endpoints

#### POST /api/upload/
Upload and process CSV file.

**Request:** `multipart/form-data`
- `file`: CSV file

**Expected CSV Format:**
```csv
Equipment Name,Equipment Type,Flowrate,Pressure,Temperature
Pump-A1,pump,150.5,3.2,45.8
Valve-B2,valve,75.0,2.1,38.5
...
```

**Response (201):**
```json
{
  "message": "Upload successful",
  "dataset": {
    "id": 5,
    "filename": "equipment_data.csv",
    "uploaded_at": "2024-01-15T10:30:00Z",
    "total_records": 150
  },
  "records_processed": 150,
  "summary": {
    "total_equipment": 150,
    "avg_flowrate": 125.75,
    "avg_pressure": 2.85,
    "avg_temperature": 42.3,
    "type_distribution": {
      "pump": 45,
      "valve": 38,
      "reactor": 25
    }
  },
  "warnings": ["Dropped 2 rows with missing values."]
}
```

#### GET /api/summary/{dataset_id}/
Get comprehensive analytics for a dataset.

**Response (200):**
```json
{
  "dataset_id": 5,
  "filename": "equipment_data.csv",
  "uploaded_at": "2024-01-15T10:30:00Z",
  "total_equipment": 150,
  "avg_flowrate": 125.75,
  "avg_pressure": 2.85,
  "avg_temperature": 42.3,
  "min_flowrate": 10.5,
  "max_flowrate": 350.0,
  "min_pressure": 0.5,
  "max_pressure": 8.2,
  "min_temperature": 15.0,
  "max_temperature": 95.5,
  "std_flowrate": 45.2,
  "std_pressure": 1.8,
  "std_temperature": 15.7,
  "type_distribution": {
    "pump": 45,
    "valve": 38,
    "reactor": 25,
    "exchanger": 20,
    "compressor": 22
  }
}
```

#### GET /api/history/
Get upload history (last 5 datasets).

**Response (200):**
```json
{
  "count": 5,
  "datasets": [
    {
      "id": 5,
      "filename": "latest_equipment.csv",
      "uploaded_at": "2024-01-15T10:30:00Z",
      "total_records": 150
    },
    ...
  ]
}
```

#### GET /api/report/{dataset_id}/
Download PDF report.

**Response:** PDF file download

#### GET /api/dataset/{dataset_id}/
Get full dataset with all records.

#### DELETE /api/dataset/{dataset_id}/
Delete a dataset.

---

## Data Flow

### CSV Upload Flow

```
1. Client sends POST /api/upload/ with CSV file
           │
           ▼
2. CSVUploadView validates file type and size
           │
           ▼
3. AnalyticsService.parse_and_validate_csv()
   • Read CSV with Pandas
   • Normalize column names
   • Validate schema
   • Handle missing values
   • Convert numeric types
           │
           ▼
4. AnalyticsService.compute_statistics()
   • Calculate averages, min, max, std
   • Generate type distribution
           │
           ▼
5. Database Transaction
   • Create EquipmentDataset
   • Bulk create EquipmentRecord entries
   • Enforce retention limit (delete old datasets)
           │
           ▼
6. Return success response with summary
```

### PDF Generation Flow

```
1. Client requests GET /api/report/{id}/
           │
           ▼
2. PDFReportView validates dataset ownership
           │
           ▼
3. AnalyticsService.get_dataset_summary()
   • Query records from database
   • Recompute statistics with Pandas
           │
           ▼
4. PDFReportGenerator.generate()
   • Create document structure
   • Add header with metadata
   • Build summary statistics table
   • Add type distribution table
   • Include equipment data table
           │
           ▼
5. Return PDF as file download
```

---

## Security Considerations

### Authentication
- Session-based authentication via Django's built-in auth
- CSRF protection enabled for all state-changing requests
- Password hashing with Django's default PBKDF2

### Authorization
- All API endpoints (except login/register) require authentication
- Users can only access their own datasets
- QuerySet filtering ensures data isolation

### Input Validation
- File type validation (CSV only)
- File size limits (10MB max)
- Schema validation for CSV columns
- Numeric type coercion with error handling

### CORS Configuration
- Restricted to specific origins (localhost ports)
- Credentials enabled for session cookies

### Recommendations for Production
1. Use environment variables for `SECRET_KEY`
2. Set `DEBUG=False`
3. Configure HTTPS
4. Use PostgreSQL instead of SQLite
5. Implement rate limiting
6. Add API key authentication for desktop client

---

## Setup & Deployment

### Local Development

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | (insecure dev key) | Production secret key |
| `DJANGO_DEBUG` | `True` | Debug mode flag |

### Database Migrations

```bash
# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

---

## Testing Guidelines

### Unit Tests

```python
# analytics/tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from .services import AnalyticsService, CSVValidationError

class AnalyticsServiceTests(TestCase):
    def test_valid_csv_parsing(self):
        csv_content = """Equipment Name,Equipment Type,Flowrate,Pressure,Temperature
Pump-A1,pump,150.5,3.2,45.8"""
        df, warnings = AnalyticsService.parse_and_validate_csv(csv_content)
        self.assertEqual(len(df), 1)
        self.assertEqual(df.iloc[0]['equipment_name'], 'Pump-A1')
    
    def test_missing_columns_raises_error(self):
        csv_content = """Name,Type
Pump-A1,pump"""
        with self.assertRaises(CSVValidationError):
            AnalyticsService.parse_and_validate_csv(csv_content)
```

### API Tests

```python
from rest_framework.test import APITestCase
from rest_framework import status

class UploadAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('testuser', 'test@test.com', 'password')
        self.client.login(username='testuser', password='password')
    
    def test_upload_valid_csv(self):
        csv_content = b"Equipment Name,Equipment Type,Flowrate,Pressure,Temperature\nPump,pump,100,2,40"
        from io import BytesIO
        file = BytesIO(csv_content)
        file.name = 'test.csv'
        response = self.client.post('/api/upload/', {'file': file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
```

### Running Tests

```bash
python manage.py test
```

---

## Appendix: CSV Column Mapping

The system accepts various column name formats:

| Standard Name | Accepted Variations |
|---------------|---------------------|
| equipment_name | Equipment Name, equipment_name, name |
| equipment_type | Equipment Type, equipment_type, type |
| flowrate | Flowrate, flow_rate, flow rate, flow |
| pressure | Pressure, press |
| temperature | Temperature, temp |

---

*This documentation is part of the Chemical Equipment Parameter Visualizer project, designed for research-grade chemical equipment data analysis.*
