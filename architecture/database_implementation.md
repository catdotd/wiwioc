# Database Implementation Summary

This document summarizes the database architecture and implementation for the **Visual Template Reviewer** backend. This is intended for the database/pipeline team to ensure a smooth handover.

## 1. Core Stack
- **Engine**: PostgreSQL (v18)
- **ORM**: Django Models
- **Connection**: Managed via `dj-database-url`. DATABASE_URL is stored in `.env`.

## 2. Model Architecture (Schema)

### Template Management
- **`JSON_Template`**: The primary container for a template.
  - `id`: UUID (Primary Key)
  - `name`: String
  - `owner`: Foreign Key -> `auth.User`
- **`JSON_Version`**: Individual versions of a template.
  - `id`: UUID (Primary Key)
  - `template`: Foreign Key -> `JSON_Template`
  - `parent_version`: self-referencing Foreign Key (allows branching/inheritance)
  - `json_content`: JSONB field (handles the schema data)
  - `status`: Choice Field (DRAFT, PENDING, APPROVED, REJECTED)

### Discussion System
- **`Comment`**: Threaded discussion on a specific version.
  - `id`: UUID (Primary Key)
  - `version`: Foreign Key -> `JSON_Version`
  - `parent_comment`: self-referencing Foreign Key (enables multi-level threading)
  - `text`: TextField (Markdown supported)

### Governance (Review Workflow)
- **`Review_Request`**: Formal request for approval.
  - `version`: Foreign Key -> `JSON_Version`
  - `requester`: Foreign Key -> `auth.User`
- **`Review_Decision`**: The outcome of a review.
  - `status`: Choice Field (ACKNOWLEDGED, ACCEPTED, DECLINED)
  - **Automation**: Saving an `ACCEPTED` decision automatically updates the `JSON_Version` status to `APPROVED`.

### Identity & Security (RBAC)
- **`Role`**: Enum-style table for permission levels (`Admin`, `Author`, `Reviewer`).
- **`Profile`**: One-to-One link between Django's `User` and our `Role` system.

## 3. Physical State & Migrations
The following migration files in `backend/templates/migrations/` and `backend/users/migrations/` define the physical database state:
1. `0001_initial`: Basic template and version tables.
2. `0002_profile`: RBAC system integration.
3. `0003_review_workflow`: Formal review tables and automated status triggers.

## 4. Handover Notes for Pipeline Team
- **UUIDs**: All primary keys are UUIDs for better distributed system compatibility.
- **JSONB**: The schema content is stored as native PostgreSQL JSONB for efficient querying.
- **Triggers**: Most logic is handled by the Django ORM's `.save()` method (e.g., status updates and profile creation), rather than PostgreSQL-side triggers.
