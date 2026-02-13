# Garbo - Modern User & Brand Management System

Garbo is a unified platform for managing users, brands, and categories, featuring a modern React frontend and a robust .NET 10 API.

## 🚀 Key Features

-   **Authentication**: Secure JWT-based auth with HttpOnly cookies, refresh tokens, and graceful session management.
-   **User Management**: Registration, Login, Forgot Password (OTP), Email Verification, and specific "Reactivate Account" flow for soft-deleted users.
-   **Brand & Category Management**: Full CRUD operations with search, pagination, and image management. Redone with a premium barber-themed catalog.
-   **Docker Ready**: Single-container deployment for both Frontend and Backend, optimized with multi-stage builds.
-   **PostgreSQL**: High-performance, open-source database backend.

---

## 🛠️ Technology Stack

-   **Frontend**: React 18, Vite, TailwindCSS, Shadcn UI, React Query, Axios.
-   **Backend**: .NET 10 Web API, Entity Framework Core, PostgreSQL.
-   **Email**: FluentEmail with SMTP (Brevo/SendGrid).
-   **Containerization**: Docker & Docker Compose.

---

## 📦 Deployment (Docker Compose)

The easiest way to run Garbo is using Docker Compose. This starts both the application and the PostgreSQL database.

### 1. Clone & Configure
```bash
git clone https://github.com/walaeddine/garbo.git
cd garbo
cp .env.example .env
```

### 2. Update Environment Variables
Open `.env` and configure your secrets. **Do NOT commit `.env` to version control.**

| Variable | Description | Example |
| :--- | :--- | :--- |
| `CONNECTION_STRING` | Postgres Connection String | `Host=db;Database=GarboDb;Username=postgres;Password=your_password` |
| `DB_PASSWORD` | Postgres Database Password | `your_password` |
| `JWT_SECRET` | Strong Secret Key (min 32 chars) | `SuperSecretKey...` |
| `EMAIL_*` | SMTP Configuration | See `.env.example` |
| `ADMIN_EMAIL` | Initial Admin Email | `admin@example.com` |
| `ADMIN_PASSWORD` | Initial Admin Password | `StrongPassword123!` |

### 3. Build & Run
```bash
docker-compose up -d --build
```
-   **App**: `http://localhost:8080`
-   **Database**: `localhost:5432`

---

## 💻 Local Development

You can run the application services locally for development while keeping the database in Docker.

### 1. Start Database
Start only the database service:
```bash
docker-compose up -d db
```

### 2. Configure Local Environment
Ensure your `.env` file uses `localhost` for the connection string:
```bash
CONNECTION_STRING=Host=localhost;Database=GarboDb;Username=postgres;Password=your_password
```

### 3. Run Backend
```bash
cd src/backend/Api
# Option A: Run with helper script (Linux/Mac)
chmod +x run_backend.sh && ./run_backend.sh

# Option B: Run manually (injecting env vars required)
dotnet watch run
```
*Backend runs on: `https://localhost:5000`*

### 4. Run Frontend
```bash
cd src/frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## 🔒 Security Notes
-   **Secrets**: All sensitive data is loaded from environment variables. `appsettings.json` is scrubbed of secrets.
-   **DbInitializer**: On first run, the app applies migrations and seeds the Admin user defined in `.env`.
