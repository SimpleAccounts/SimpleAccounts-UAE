# Getting Started

This guide will help you set up and run SimpleAccounts-UAE locally.

## Prerequisites

| Tool           | Version          | Installation                                                                           |
| -------------- | ---------------- | -------------------------------------------------------------------------------------- |
| **Node.js**    | 20.x or higher   | [nodejs.org](https://nodejs.org/) or use `nvm install 20`                              |
| **npm**        | 9.x or higher    | Included with Node.js                                                                  |
| **Java JDK**   | 21               | [Eclipse Temurin](https://adoptium.net/) or use `sdk install java 21.0.9-tem`          |
| **PostgreSQL** | 14.x or higher   | [postgresql.org](https://www.postgresql.org/download/) or `brew install postgresql@14` |
| **Maven**      | 3.9.x (optional) | Included as `./mvnw` wrapper in backend                                                |

### Verify Installations

```bash
node --version    # Should be v20.x.x or higher
npm --version     # Should be 9.x.x or higher
java --version    # Should be openjdk 21.x.x
psql --version    # Should be 14.x or higher
```

---

## Database Setup

### 1. Start PostgreSQL

```bash
# macOS (Homebrew)
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Windows
# Start from Services or pgAdmin
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user (in psql shell)
CREATE DATABASE simpleaccounts;
CREATE USER simpleaccounts_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE simpleaccounts TO simpleaccounts_user;
\q
```

Or use your system user (macOS default):

```bash
createdb simpleaccounts
```

---

## Environment Configuration

### Backend Environment Variables

Create `.env` file in `apps/backend/`:

```bash
# apps/backend/.env

# Database Configuration (Required)
SIMPLEACCOUNTS_DB_HOST=localhost
SIMPLEACCOUNTS_DB_PORT=5432
SIMPLEACCOUNTS_DB=simpleaccounts
SIMPLEACCOUNTS_DB_USER=your_username
SIMPLEACCOUNTS_DB_PASSWORD=your_password

# SSL Configuration (for local development, disable SSL)
SIMPLEACCOUNTS_DB_SSL=false
SIMPLEACCOUNTS_DB_SSLMODE=disable
SIMPLEACCOUNTS_DB_SSLROOTCERT=

# Optional Configuration
# JWT_SECRET=your-64-byte-secret-key-here
# SIMPLEACCOUNTS_HOST=http://localhost:8080
```

### Frontend Environment Variables (Optional)

Create `.env` file in `apps/frontend/` if needed:

```bash
# apps/frontend/.env

# API Base URL (defaults to localhost:8080)
VITE_API_URL=http://localhost:8080

# E2E Testing (optional)
E2E_USERNAME=test@example.com
E2E_PASSWORD=TestPass123!
```

---

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/SimpleAccounts/SimpleAccounts-UAE.git
cd SimpleAccounts-UAE

# Install all workspace dependencies
npm install
```

### 2. Install Frontend Dependencies

```bash
cd apps/frontend
npm install
cd ../..
```

### 3. Build Backend (First Time)

```bash
cd apps/backend
./mvnw clean install -DskipTests
cd ../..
```

---

## Running the Application

### Option 1: Using npm Scripts (Recommended)

From the repository root:

```bash
# Terminal 1 - Start Backend
npm run backend:run

# Terminal 2 - Start Frontend
npm run frontend
```

### Option 2: Running Directly

**Backend:**

```bash
cd apps/backend

# Set environment variables and run
export SIMPLEACCOUNTS_DB_HOST=localhost
export SIMPLEACCOUNTS_DB_PORT=5432
export SIMPLEACCOUNTS_DB=simpleaccounts
export SIMPLEACCOUNTS_DB_USER=your_username
export SIMPLEACCOUNTS_DB_PASSWORD=your_password
export SIMPLEACCOUNTS_DB_SSL=false
export SIMPLEACCOUNTS_DB_SSLMODE=disable

./mvnw spring-boot:run
```

**Frontend:**

```bash
cd apps/frontend
npm run dev
```

### Application URLs

| Service      | URL                                         |
| ------------ | ------------------------------------------- |
| Frontend     | http://localhost:3000                       |
| Backend API  | http://localhost:8080                       |
| Swagger UI   | http://localhost:8080/swagger-ui/index.html |
| OpenAPI Docs | http://localhost:8080/v3/api-docs           |

---

## First Time Setup

1. **Start both frontend and backend** (see above)

2. **Register a Company**
   - Navigate to http://localhost:3000
   - You'll be redirected to the registration page
   - Fill in company details:
     - Company Name
     - Company Address
     - Company/Business Type
     - Emirate (State)
     - Mobile Number (UAE format)
   - Create super admin account:
     - First Name, Last Name
     - Email Address
     - Password (min 8 chars, uppercase, lowercase, number, special char)

3. **Login and Access Dashboard**
   - After registration, you'll be redirected to login
   - Login with your registered credentials
   - Access the dashboard at http://localhost:3000/admin/dashboard

---

## Troubleshooting

### Backend won't start

- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep simpleaccounts`
- Verify environment variables are set correctly
- Check logs: `tail -f /tmp/backend.log`

### Frontend shows blank page

- Clear Vite cache: `rm -rf apps/frontend/node_modules/.vite`
- Restart frontend dev server
- Check browser console for errors

### Database connection errors

- Verify PostgreSQL is running on the configured port
- Check username/password in `.env` file
- Ensure database exists and user has permissions

### Chart.js errors on Dashboard

- Ensure `chartRegistry.js` is imported in `src/index.js`
- Clear browser cache and refresh

### Port already in use

```bash
# Find process using port 3000 (frontend)
lsof -i :3000

# Find process using port 8080 (backend)
lsof -i :8080

# Kill process by PID
kill -9 <PID>
```

---

## Quick Reference

### Common Commands

```bash
# From repository root
npm install              # Install all dependencies
npm run frontend         # Start frontend dev server
npm run backend:run      # Start backend server
npm test                 # Run all tests
npm run lint             # Run linter

# Frontend specific
cd apps/frontend
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run test:cov         # Run tests with coverage
npm run test:frontend:e2e        # Run Playwright E2E tests
npm run test:frontend:e2e:headed # Run E2E tests with browser visible

# Backend specific
cd apps/backend
./mvnw spring-boot:run   # Run Spring Boot
./mvnw clean install     # Build JAR/WAR
./mvnw test              # Run unit tests
```

### Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | React 18, Vite, Redux Toolkit, Chart.js |
| Backend  | Spring Boot 3.4.1, Java 21, Hibernate 6 |
| Database | PostgreSQL 14+                          |
| Testing  | Jest, Playwright, JUnit 5               |
