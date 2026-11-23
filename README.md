
# Hospital Management System

A full-stack Hospital Management System built using React, Tailwind CSS, Django REST Framework, and SQLite.

This project provides an administrative dashboard for managing patients, doctors, and hospital appointments.

## Tech Stack

### Frontend
- React
- JavaScript
- Vite
- Tailwind CSS

### Backend
- Python
- Django
- Django REST Framework
- Token Authentication

### Database
- SQLite

## Features

- Staff login and logout
- Dashboard with real-time database statistics on refresh
- Patient management
- Doctor management
- Appointment booking
- Edit and cancel appointments
- Search doctor and appointment records
- REST API integration
- Responsive administrative interface

## Project Structure

```text
Hospital management/
├── Back-end/
│   ├── accounts/
│   ├── appointments/
│   ├── billing/
│   ├── config/
│   ├── doctors/
│   ├── patients/
│   ├── manage.py
│   └── requirements.txt
├── front-end/
│   ├── public/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

## Installation

### 1. Clone Repository

```bash
git clone YOUR_REPOSITORY_URL
cd "Hospital management"
```

### 2. Backend Setup

```bash
cd Back-end
python -m venv .venv
```

Activate the virtual environment.

Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create the database tables:

```bash
python manage.py migrate
```

Create an administrator account:

```bash
python manage.py createsuperuser
```

Start Django:

```bash
python manage.py runserver
```

Backend URL:

http://127.0.0.1:8000/

### 3. Frontend Setup

Open another terminal from the project root:

```bash
cd front-end
npm install
npm run dev
```

Frontend URL:

http://localhost:5173/

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login/ | Staff login |
| POST | /api/auth/logout/ | Logout |
| GET | /api/auth/me/ | Current user |
| GET, POST | /api/patients/ | List and create patients |
| GET, POST | /api/doctors/ | List and create doctors |
| GET, POST | /api/appointments/ | List and create appointments |

Detail endpoints support update and delete operations according to their Django REST Framework viewsets.

## Authentication

The application uses Django REST Framework Token Authentication.

Protected API endpoints require a valid staff account and authentication token.

## Development Status

Portfolio MVP under final testing.

## Disclaimer

This project is intended for learning and demonstration purposes. Use fictional test data only. It is not production-ready clinical software.

## Author

Selvaraghavan V
BCA Graduate | Full Stack Developer
```
