🧪 Chemical Equipment Parameter Visualizer

A production-ready full-stack analytics platform for processing, visualizing, and reporting chemical equipment operational data using CSV inputs, interactive dashboards, and downloadable PDF reports.

This project demonstrates end-to-end software engineering: frontend architecture, backend analytics, secure REST APIs, data visualization, and document generation — all wrapped in a modern, premium UI.

📌 Table of Contents


Project Overview


Why This Project Matters


Key Features


Tech Stack


System Architecture


Project Structure


Installation & Setup


Environment Configuration


API Documentation


Application Screens & Flow


Security Considerations


Performance Optimizations


Testing Strategy


Future Enhancements


Conclusion



🔍 Project Overview
The Chemical Equipment Parameter Visualizer is designed for:


Chemical engineers


Process analysts


Research students


Industrial monitoring use-cases


It allows users to:


Upload CSV datasets containing equipment parameters


Automatically compute meaningful analytics


Visualize trends using interactive charts


Compare datasets over time


Download professional, formatted PDF reports


Maintain a secure, user-specific upload history


The system is built with a dark-mode-first, premium UI, smooth animations, and a scalable backend architecture.

🎯 Why This Project Matters
This project demonstrates:


Real-world CSV data ingestion & validation


Backend analytics computation (not mock data)


Secure session-based authentication


Clean REST API contracts


Frontend state management & UX design


Persistent data handling across refreshes


Production-grade PDF report generation


👉 It reflects how actual analytics platforms are built, not just academic demos.

✨ Key Features
🔐 Authentication & Authorization


Secure login & logout


Session-based authentication


User-scoped dataset access


Protected API endpoints



📂 CSV Upload & Validation


Accepts only .csv files


File size and encoding validation


Schema verification (columns & data types)


Clear, descriptive error messages



📊 Analytics Dashboard


Total equipment count


Average flowrate, pressure & temperature


Comparison with previous dataset


Last updated timestamp


Smooth animated counters



📈 Data Visualization


Equipment type distribution (Donut Chart)


Parameter ranges (Min / Avg / Max)


Fully responsive charts


Dark-mode optimized visuals


Animated transitions for better UX



📋 Detailed Statistics


Summary statistics table


Equipment-level detailed table


Hover insights & animations


Clean, readable tabular design



🕓 Dataset History Management


Persistent upload history


Automatic retention policy (latest 5 datasets)


Dataset deletion support


Quick navigation to dashboards


Download reports directly from history



📄 PDF Report Generation


Professionally formatted PDF reports


Includes summary metrics & distributions


Secure, authenticated downloads


Demo fallback report for sample datasets



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


Pandas (CSV analytics processing)


Custom PDF generation module


Database


SQLite (development)


PostgreSQL (production-ready)



🧩 System Architecture
Frontend (React + TypeScript)
        ↓ REST API
Backend (Django + DRF)
        ↓
Database (PostgreSQL / SQLite)



Frontend consumes a clean REST API


Backend handles validation, analytics & reporting


Database stores user-scoped datasets securely



📁 Project Structure
Frontend
frontend/
 ├── src/
 │   ├── components/
 │   │   ├── dashboard/
 │   │   ├── ui/
 │   ├── pages/
 │   ├── services/
 │   ├── contexts/
 │   ├── types/
 │   ├── App.tsx
 │   └── main.tsx
 ├── index.css
 └── tailwind.config.ts

Backend
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


🚀 Installation & Setup
Prerequisites


Node.js v18+


Python 3.10+


npm / pip


Virtual environment (recommended)



Frontend Setup
cd frontend
npm install
npm run dev


Backend Setup
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


🔑 Environment Configuration
Frontend .env
VITE_API_URL=http://localhost:8000/api

Backend .env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=your-database-url


🔗 API Documentation
Authentication
MethodEndpointPOST/api/auth/login/POST/api/auth/logout/GET/api/auth/me/
Analytics
MethodEndpointPOST/api/upload/GET/api/history/GET/api/summary/<dataset_id>/GET/api/dataset/<dataset_id>/DELETE/api/dataset/<dataset_id>/GET/api/report/<dataset_id>/

🖥 Application Screens & Flow


Login Page – Secure authentication


Upload Page – CSV upload & validation


Dashboard – Analytics, charts & trends


History Page – Dataset management


PDF Reports – Downloadable analytics reports



🔐 Security Considerations


Authenticated endpoints only


User-scoped dataset isolation


CSRF protection


Strict file type & size validation


Secure PDF report downloads



⚡ Performance Optimizations


Dataset retention policy (limits storage growth)


Optimized database queries


Efficient Pandas processing


Lazy-loaded charts


Skeleton loaders for better UX



🧪 Testing Strategy


Manual UI testing


REST API endpoint testing


CSV validation edge-case testing


Error-state handling tests


Cross-browser compatibility checks



🚧 Future Enhancements


Live sensor data integration


Predictive analytics & forecasting


Role-based access control


Cloud storage (AWS S3 / GCP)


Export to Excel


Advanced filters & sorting


