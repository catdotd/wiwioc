# Visual Template Reviewer

A web-based system for structured template governance and review.\
Built with **React (Vite)** and **Django REST Framework** using
**PostgreSQL**.

---

## Tech Stack

### Frontend

- React
- Vite

### Backend

- Django
- Django REST Framework

### Database

- PostgreSQL

---

## Project Structure

    VisualTemplateReviewer/
    │
    ├── frontend/              # React application
    │
    ├── backend/
    │   ├── config/            # Django project configuration
    │   ├── users/             # Authentication app
    │   ├── manage.py
    │   └── requirements.txt
    │
    └── README.md

---

# Local Development Setup

## 1. Clone the Repository

```bash
git clone <repo-url>
cd VisualTemplateReviewer
```

---

# Backend Setup (Django + PostgreSQL)

## 2. Create and Activate Virtual Environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

**Windows:**

```bash
.venv\Scripts\activate
```

---

## 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 4. Install PostgreSQL (if not already installed)

**Mac (Homebrew):**

```bash
brew install postgresql
brew services start postgresql
```

Verify installation:

```bash
psql --version
```

---

## 5. Create Local Database

Open PostgreSQL:

```bash
psql postgres
```

Then run:

```sql
CREATE DATABASE visual_template_reviewer;

CREATE USER vtr_user WITH PASSWORD 'password';

ALTER ROLE vtr_user SET client_encoding TO 'utf8';
ALTER ROLE vtr_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vtr_user SET timezone TO 'UTC';

ALTER DATABASE visual_template_reviewer OWNER TO vtr_user;

GRANT ALL PRIVILEGES ON DATABASE visual_template_reviewer TO vtr_user;

ALTER SCHEMA public OWNER TO vtr_user;
GRANT USAGE, CREATE ON SCHEMA public TO vtr_user;

ALTER ROLE vtr_user CREATEDB;

\q
```

---

## 6. Configure Environment Variables

Create a `.env` file inside `backend/`:

    DJANGO_SECRET_KEY=dev-secret-key
    DB_NAME=visual_template_reviewer
    DB_USER=vtr_user
    DB_PASSWORD=password
    DB_HOST=localhost
    DB_PORT=5432

Ensure `.env` is included in `.gitignore`.

Example `settings.py` database configuration:

```python
import os

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "visual_template_reviewer"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}
```

---

## 7. Run Migrations

```bash
python3 manage.py migrate
```

---

## 8. Create Superuser (Optional)

```bash
python3 manage.py createsuperuser
```

---

## 9. Start Backend Server

```bash
python3 manage.py runserver
```

Backend runs at:

    http://127.0.0.1:8000

---

# Frontend Setup

Open a new terminal.

## 10. Install Dependencies

```bash
cd frontend
npm install
```

---

## 11. Start Development Server

```bash
npm run dev
```

Frontend runs at:

    http://localhost:5173

---

# Development Guidelines

- Always activate `.venv` before backend work.
- Do not commit:
  - `backend/.venv/`
  - `backend/.env`
  - `frontend/node_modules/`
- Ensure PostgreSQL is running before running migrations.

---

# Common Issues

### ModuleNotFoundError

- Ensure virtual environment is activated.
- Re-run:

```bash
pip install -r requirements.txt
```

### Database Connection Errors

- Confirm PostgreSQL is running.
- Verify `.env` values match your local database configuration.

---

# Initial API Endpoint

Authentication endpoint:

    POST /api/auth/login/

Example request body:

```json
{
  "username": "your_username",
  "password": "your_password"
}
```
