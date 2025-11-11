Carpool App — Local development

This repository contains two main parts:

- backend/ — FastAPI backend (Python) with Prisma ORM
- carpool-app/ — React frontend (Create React App)

This README explains how to clone the repo, install dependencies, and run the frontend and backend locally for development.

Prerequisites
- Git
- Node.js (v16+ recommended) and npm (or yarn)
- Python 3.10+ (or 3.9+) and virtualenv
- PostgreSQL (the project expects a database URL; the original dev DB ran in Docker on port 5433)
- (Optional) npx / npm available to run Prisma CLI

1) Clone

```bash
git clone <repo_url>
cd Carpool-App
```

Replace <repo_url> with your repository URL (e.g. https://github.com/yourname/Carpool-App.git).

2) Backend (FastAPI + Prisma)

Open a terminal and go to the backend folder:

```bash
cd backend
```

Create a Python virtual environment and activate it:

```bash
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
```

Install Python dependencies. If a requirements file exists you can use it. Otherwise install the main packages used in this project:

```bash
pip install -r requirements.txt  # if present
# OR install minimum recommended packages:
pip install "fastapi[all]" prisma python-multipart
```

Prisma client generation

This project uses Prisma for schema and ORM. You should have Node/npm available to run the Prisma CLI (via npx). From `backend/` run:

```bash
# Generate Prisma client (reads prisma/schema.prisma)
npx prisma generate --schema=prisma/schema.prisma
```

If you need to run migrations / create the database schema (be careful: this will modify your database), use:

```bash
# Run migration (if you have migration files and want to apply them)
npx prisma migrate deploy --schema=prisma/schema.prisma
# or for development (interactive):
npx prisma migrate dev --schema=prisma/schema.prisma
```

Set environment variables

Prisma reads the database URL from `prisma/.env` (or from your environment). Edit `backend/prisma/.env` and set `DATABASE_URL` to point to your Postgres instance (example using Docker/Postgres on port 5433):

```
DATABASE_URL="postgresql://user:password@localhost:5433/database_name"
```

Start the backend server (development):

```bash
# from backend/
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

You should see Uvicorn logs and the server listening on http://127.0.0.1:8000.

Open Prisma Studio (optional):

```bash
npx prisma studio --schema=prisma/schema.prisma
# then open the URL shown (usually http://localhost:5555)
```

Notes about CORS and uploads
- The backend is configured to allow requests from `http://localhost:3000` and `http://127.0.0.1:3000` during development. If your frontend runs on a different origin, update `app.add_middleware(CORSMiddleware, allow_origins=[...])` in `backend/app.py`.
- Uploaded profile images are saved to `backend/uploads` (the server creates this directory automatically).

3) Frontend (React)

Open a new terminal and go to the React app folder:

```bash
cd carpool-app
```

Install node dependencies and run the dev server:

```bash
npm install
npm start
# or using yarn
# yarn install
# yarn start
```

The React dev server runs on http://localhost:3000 by default.

4) Try the signup flow
- Make sure the backend server (uvicorn) is running.
- Visit http://localhost:3000, use the Signup form and submit. The frontend will POST a multipart/form-data request to `http://127.0.0.1:8000/signup` and the backend will create the user and save the uploaded profile image.

5) Troubleshooting
- CORS errors (in browser console): ensure the backend is running and `allow_origins` contains the origin shown in the browser (e.g. `http://localhost:3000` or `http://127.0.0.1:3000`). If you changed the port, add it to the list.
- Backend crashes on startup: check the terminal where you started `uvicorn` for stack traces. Common issues: missing DATABASE_URL, Prisma client not generated, or DB connection refused.
- Prisma errors: run `npx prisma generate --schema=prisma/schema.prisma` and ensure `prisma/.env` DATABASE_URL is correct.

6) Useful commands summary

From repo root:

```bash
# Start backend
cd backend
source .venv/bin/activate   # if you're using venv
uvicorn app:app --reload --host 127.0.0.1 --port 8000

# Start frontend (in a separate terminal)
cd carpool-app
npm install
npm start

# Prisma studio (optional)
cd backend
npx prisma studio --schema=prisma/schema.prisma
```

License / author
- Project by Sahana_Narasipura_Vasudevarao

---
