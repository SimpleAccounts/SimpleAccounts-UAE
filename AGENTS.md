# Repository Guidelines

## Project Structure

- `apps/frontend/`: React frontend. Source in `src/`, static assets in `public/`, Playwright e2e in `e2e/`, build output in `dist/` (Vite) or `build/` (CRA fallback).
- `apps/backend/`: Spring Boot backend (WAR). Code in `src/main/java/com/simpleaccounts`, config/resources in `src/main/resources`, tests in `src/test/java`.
- `apps/agents/`: Optional Node-based agents; each agent lives in its own subfolder with a `package.json`.
- `deploy/`, `docs/`, `scripts/`, `k6/`: deployment recipes, product docs, helper scripts, and load tests.

---

## Getting Started

### Prerequisites

| Tool           | Version          | Installation                                                                           |
| -------------- | ---------------- | -------------------------------------------------------------------------------------- |
| **Node.js**    | 20.x or higher   | [nodejs.org](https://nodejs.org/) or use `nvm install 20`                              |
| **npm**        | 9.x or higher    | Included with Node.js                                                                  |
| **Java JDK**   | 21               | [Eclipse Temurin](https://adoptium.net/) or use `sdk install java 21.0.9-tem`          |
| **PostgreSQL** | 14.x or higher   | [postgresql.org](https://www.postgresql.org/download/) or `brew install postgresql@14` |
| **Maven**      | 3.9.x (optional) | Included as `./mvnw` wrapper in backend                                                |

#### Verify Installations

```bash
node --version    # Should be v20.x.x or higher
npm --version     # Should be 9.x.x or higher
java --version    # Should be openjdk 21.x.x
psql --version    # Should be 14.x or higher
```

---

### Database Setup

#### 1. Start PostgreSQL

```bash
# macOS (Homebrew)
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Windows
# Start from Services or pgAdmin
```

#### 2. Create Database

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

### Environment Configuration

#### Backend Environment Variables

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

#### Frontend Environment Variables (Optional)

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

### Installation

#### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/SimpleAccounts/SimpleAccounts-UAE.git
cd SimpleAccounts-UAE

# Install all workspace dependencies
npm install
```

#### 2. Install Frontend Dependencies

```bash
cd apps/frontend
npm install
cd ../..
```

#### 3. Build Backend (First Time)

```bash
cd apps/backend
./mvnw clean install -DskipTests
cd ../..
```

---

### Running the Application

#### Option 1: Using npm Scripts (Recommended)

From the repository root:

```bash
# Terminal 1 - Start Backend
npm run backend:run

# Terminal 2 - Start Frontend
npm run frontend
```

#### Option 2: Running Directly

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

#### Application URLs

| Service      | URL                                         |
| ------------ | ------------------------------------------- |
| Frontend     | http://localhost:3000                       |
| Backend API  | http://localhost:8080                       |
| Swagger UI   | http://localhost:8080/swagger-ui/index.html |
| OpenAPI Docs | http://localhost:8080/v3/api-docs           |

---

### First Time Setup

1. **Start both frontend and backend** (see above)

2. **Register a Company**
   - Navigate to http://localhost:3000
   - You'll be redirected to the registration page
   - Fill in company details and create super admin account

3. **Login and Access Dashboard**
   - After registration, login with your credentials
   - Access the dashboard at http://localhost:3000/admin/dashboard

---

### Troubleshooting

#### Backend won't start

- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep simpleaccounts`
- Verify environment variables are set correctly
- Check logs: `tail -f /tmp/backend.log`

#### Frontend shows blank page

- Clear Vite cache: `rm -rf apps/frontend/node_modules/.vite`
- Restart frontend dev server
- Check browser console for errors

#### Database connection errors

- Verify PostgreSQL is running on the configured port
- Check username/password in `.env` file
- Ensure database exists and user has permissions

#### Chart.js errors on Dashboard

- Ensure `chartRegistry.js` is imported in `src/index.js`
- Clear browser cache and refresh

---

## Setup, Build, and Run

Common commands from repo root:

- `npm install` – install workspace dependencies.
- `npm run frontend` – start the React dev server on localhost:3000.
- `npm run backend:run` – run backend via `apps/backend/run.sh`.
- `npm run frontend:build` / `npm run backend:build` – production builds.
- `npm test` / `npm run lint` – run tests or lint across workspaces.

## Coding Style

- Frontend/agents: Prettier + ESLint. 2-space indentation, single quotes, semicolons, 100‑char line width. Format with `npm run format`; pre-commit hooks run `eslint --fix` and Prettier.
- Backend: standard Java conventions, packages under `com.simpleaccounts.*`. Format Java with Google Java Format (`scripts/run-java-formatter.sh`).

## Testing

- Frontend: Jest via `react-scripts`. Name tests `*.test.{js,jsx,ts,tsx}` or place in `__tests__/`. Coverage thresholds are enforced in `apps/frontend/package.json`. Run `cd apps/frontend && npm test`, `npm run test:cov`, or e2e with `npm run test:frontend:e2e`.
- Backend: JUnit 5 + Spring Boot test. Keep tests in `apps/backend/src/test/java` and name classes `*Test.java`. Run `cd apps/backend && ./mvnw test`.

## Commits & Pull Requests

- Use Conventional Commits (`feat:`, `fix(scope):`, etc.); subject lower‑case, ≤72 chars. Commitlint + Husky enforce this.
- Branch from `develop` (`feature/...`, `fix/...`, `docs/...`). PRs target `develop`, include a clear description and linked issue, add screenshots for UI changes, and ensure `npm test`, `npm run lint`, and backend tests pass.

## Security & Configuration

Do not commit secrets. Use local `.env` files for runtime config and follow `SECURITY.md` for vulnerability reporting.
