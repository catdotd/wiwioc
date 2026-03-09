# Backend Architecture & API Technical Documentation

This document serves as the final technical guide for the **Visual Template Reviewer** backend. It outlines the system's architecture, file structure, and implementation status for the team.

## 1. System Overview
The backend is built with **Django (v5.2)** and **Django REST Framework (DRF)**. It uses a **PostgreSQL (v18)** database for data persistence and **JWT (JSON Web Tokens)** for secure, role-based authentication.

---

## 2. File Architecture & Directory Map
Here is where every major component of the backend "lives":

- **Core Configuration**: [backend/config/](backend/config/)
  - `settings.py`: Includes JWT, Database, and RBAC configurations.
  - `urls.py`: Main routing, including JWT token paths (`/api/token/`) and a root redirect to `/admin/`.

- **User & Role System**: [backend/users/](backend/users/)
  - `models.py`: Defines the `Role` and `Profile` models (links Django Users to Roles like Admin, Author, Reviewer).
  - `admin.py`: Registers User/Profile management in the Dashboard.

- **Templates, Versions, & Workflow**: [backend/templates/](backend/templates/)
  - `models.py`: The "Brain." Contains `JSON_Template`, `JSON_Version`, `Comment`, `Review_Request`, and `Review_Decision`.
  - `views.py`: API logic (CRUD operations) and ownership protection (`perform_create`).
  - `serializers.py`: Data transformation layer (converts DB records to JSON for the frontend).
  - `permissions.py`: Custom RBAC logic (`IsAuthorOrReadOnly`, `IsReviewer`).
  - `urls.py`: API endpoint registration.

---

## 3. API Endpoints Reference
The base URL is `http://127.0.0.1:8000/`.

### **Authentication**
- `POST /api/token/`: Exchange credentials for Access & Refresh tokens.
- `POST /api/token/refresh/`: Renew an expired Access Token.

### **Core Data**
- `GET/POST /api/templates/`: Manage high-level template containers.
- `GET/POST /api/versions/`: Manage specific JSON versions of a template.
- `GET/POST /api/comments/`: Threaded discussion on a specific version.

### **Governance (Review Workflow)**
- `POST /api/review-requests/`: Request a formal review for a version.
- `POST /api/review-decisions/`: Final Approve/Reject (Locked to **Reviewer** role).

---

## 4. Current Status: Frontend vs. Backend
> [!IMPORTANT]
> **Integration Status**: The backend is **Feature Complete**, but the frontend is currently **Disconnected**.
- **Frontend State**: The React app is still using **Mock Data** (hardcoded JSON files) for display.
- **Next Step**: The frontend team must replace those mock calls with real `fetch` or `axios` calls to the API endpoints listed above, including attaching the **JWT Access Token** to the headers of every request.

---

## 5. Handover Checklist for Teammates
1. **Migrations**: Run `python manage.py migrate` to build the table structure.
2. **Setup Roles**: Log into the `/admin/` and manually add the roles: `Admin`, `Author`, and `Reviewer`.
3. **Assign Profiles**: Every user must have a `Profile` linked to a `Role` for permission checks to work.
