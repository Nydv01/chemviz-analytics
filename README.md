🧪 Chemical Equipment Parameter Visualizer

A full-stack web application for analyzing, visualizing, and managing chemical equipment operational data using CSV uploads, interactive dashboards, and downloadable PDF reports.

This project demonstrates modern frontend engineering, backend analytics processing, data visualization, and secure REST API design.

📌 Table of Contents

Project Overview

Key Features

Tech Stack

System Architecture

Project Structure

Setup Instructions

Environment Variables

API Endpoints

Screens & Functionality

Security

Performance Optimizations

Testing

Future Enhancements

Conclusion

🔍 Project Overview

Chemical Equipment Parameter Visualizer is designed to help engineers and analysts:

Upload CSV datasets containing equipment parameters

Automatically compute analytics

Visualize trends using interactive charts

View detailed statistics for each equipment

Generate professional PDF reports

Maintain dataset history securely per user

The system is built with a dark-mode-first premium UI, animated dashboards, and a scalable backend.

✨ Key Features
🔐 Authentication

Secure login & logout

User-specific dataset access

Protected REST APIs

📂 CSV Upload & Validation

Accepts .csv files only

File size and encoding validation

Schema verification

Descriptive error handling

📊 Analytics Dashboard

Total equipment count

Average flowrate, pressure & temperature

Trend comparison with previous dataset

Last updated timestamp

📈 Data Visualization

Equipment type distribution (Donut Chart)

Parameter range comparison (Min / Avg / Max)

Animated, responsive charts

Dark-mode optimized visuals

📋 Detailed Statistics

Parameter summary table

Equipment-level detailed table

Animated rows and hover insights

🕓 Dataset History

Upload history with metadata

Retention policy

Dataset deletion

Report downloads

📄 PDF Report Generation

Professionally formatted reports

Summary statistics & distributions

Downloadable .pdf files

🛠 Tech Stack
Frontend

React (TypeScript)

Vite

Tailwind CSS

ShadCN UI

Framer Motion

Recharts

React Router

Lucide Icons

Backend

Django

Django REST Framework

Pandas (CSV analytics)

PDF generation module

Database

PostgreSQL (production)

SQLite (development)

🧩 System Architecture
Frontend (React + TypeScript)
        ↓ REST API
Backend (Django + DRF)
        ↓
Database (PostgreSQL / SQLite)

📁 Project Structure
frontend/
 ├── src/
 │   ├── components/
 │   │   ├── dashboard/
 │   │   ├── ui/
 │   ├── pages/
 │   ├── services/
 │   ├── types/
 │   ├── contexts/
 │   ├── App.tsx
 │   └── main.tsx
 ├── index.css
 └── tailwind.config.ts

backend/
 ├── analytics/
 │   ├── models.py
 │   ├── serializers.py
 │   ├── views.py
 │   ├── services.py
 │   ├── pdf.py
 │   └── urls.py
 ├── users/
 ├── settings.py
 └── urls.py

🚀 Setup Instructions
Prerequisites

Node.js (v18+ recommended)

Python 3.10+

npm / pip

Virtual environment (recommended)

Frontend Setup
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

Backend Setup
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver

🔑 Environment Variables
Frontend (.env)
VITE_API_URL=http://localhost:8000/api

Backend (.env)
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url

🔗 API Endpoints
Authentication
POST /api/auth/login/
POST /api/auth/logout/
GET  /api/auth/me/

Analytics
POST   /api/upload/
GET    /api/history/
GET    /api/summary/<dataset_id>/
GET    /api/dataset/<dataset_id>/
DELETE /api/dataset/<dataset_id>/
GET    /api/report/<dataset_id>/

🖥 Screens & Functionality

Login Page – Secure authentication

Dashboard – Analytics, charts, trends

Upload Page – CSV upload & validation

History Page – Dataset management

PDF Reports – Downloadable analytics reports

🔐 Security

Authenticated endpoints only

User-scoped datasets

CSRF protection

File type & size validation

Secure report downloads

⚡ Performance Optimizations

Dataset retention policy

Optimized database queries

Efficient Pandas processing

Lazy-loaded charts

Skeleton loaders for UX

🧪 Testing

Manual UI testing

API endpoint testing

CSV validation testing

Error-state testing

Cross-browser testing

🚧 Future Enhancements

Live sensor data integration

Predictive analytics

Role-based access control

Cloud storage support

Export to Excel

Advanced filters & sorting

🏁 Conclusion

The Chemical Equipment Parameter Visualizer is a complete, real-world analytics platform that demonstrates:

Full-stack engineering skills

Data analytics & visualization

Secure REST API design

Modern UI/UX principles

This project is suitable for academic submission, professional portfolios, internships, and client delivery.