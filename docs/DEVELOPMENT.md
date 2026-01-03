# Development Environment Guide

SimpleAccounts-UAE supports **three development environments**. Choose the one that fits your workflow:

## 🚀 Quick Start

| Environment            | When to Use                            | Setup Time    |
| ---------------------- | -------------------------------------- | ------------- |
| **Coder Cloud**        | Remote development, team collaboration | 2 minutes     |
| **Local Devcontainer** | Offline development, full control      | 5-10 minutes  |
| **Manual Local**       | No Docker, direct host installation    | 15-20 minutes |

---

## ☁️ Option 1: Coder Cloud Workspace (Recommended)

### Prerequisites

- Coder account at https://coder.dev.simpleaccounts.io
- VS Code or Cursor IDE
- Coder extension installed

### Setup Steps

1. **Install Coder Extension**

   ```
   VS Code/Cursor → Extensions → Search "Coder" → Install
   ```

2. **Connect to Coder**

   ```
   Command Palette (Cmd+Shift+P)
   → "Coder: Login"
   → URL: https://coder.dev.simpleaccounts.io
   → Paste your session token
   ```

3. **Open Workspace**
   ```
   → "Coder: Open Workspace"
   → Select: SimpleAccounts-UAE
   ```

### ⚠️ Important: Don't Use Devcontainer in Coder

When connecting to Coder:

- ❌ **DO NOT** click "Reopen in Container" if prompted
- ❌ **DO NOT** use Remote-Containers extension
- ✅ **DO** use Coder extension or plain Remote-SSH

**Why?** The Coder workspace is already a fully configured container. Using devcontainer creates nested containers and causes permission errors.

### What's Included

- ✅ PostgreSQL (auto-configured)
- ✅ Redis (auto-configured)
- ✅ All CLI tools (Maven, npm, gh, etc.)
- ✅ VS Code extensions pre-installed
- ✅ Automatic updates

### Quick Commands

```bash
# Frontend
cd apps/frontend && npm run dev

# Backend
cd apps/backend && ./mvnw spring-boot:run
```

---

## 🏠 Option 2: Local Devcontainer

### Prerequisites

- Docker Desktop installed and running
- VS Code with Remote-Containers extension
- At least 8GB RAM available

### Setup Steps

1. **Open in VS Code**

   ```
   code /path/to/SimpleAccounts-UAE
   ```

2. **Reopen in Container**

   ```
   Command Palette → "Dev Containers: Reopen in Container"
   OR
   Click "Reopen in Container" when prompted
   ```

3. **Wait for Setup** (5-10 minutes first time)
   - Downloads Docker images
   - Installs dependencies
   - Configures database

### What Happens

- Creates PostgreSQL container
- Creates Redis container
- Creates devcontainer with all tools
- Runs post-create setup scripts

### Configuration Files

- `.devcontainer/devcontainer.json` - VS Code config
- `.devcontainer/docker-compose.yml` - Container setup
- `.devcontainer/Dockerfile` - Container image
- `.devcontainer/post-create.sh` - One-time setup
- `.devcontainer/post-start.sh` - Runs on each start

---

## 💻 Option 3: Manual Local Setup (No Docker)

For development without containers, install all dependencies directly on your machine.

### Prerequisites

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

### Database Setup

**1. Start PostgreSQL:**

```bash
# macOS (Homebrew)
brew services start postgresql@14

# Linux
sudo systemctl start postgresql

# Windows - Start from Services or pgAdmin
```

**2. Create Database:**

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

### Environment Configuration

**Backend** - Create `apps/backend/.env`:

```bash
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

**Frontend** (Optional) - Create `apps/frontend/.env`:

```bash
# API Base URL (defaults to localhost:8080)
VITE_API_URL=http://localhost:8080

# E2E Testing (optional)
E2E_USERNAME=test@example.com
E2E_PASSWORD=TestPass123!
```

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/SimpleAccounts/SimpleAccounts-UAE.git
cd SimpleAccounts-UAE

# 2. Install all workspace dependencies
npm install

# 3. Install frontend dependencies
cd apps/frontend && npm install && cd ../..

# 4. Build backend (first time)
cd apps/backend && ./mvnw clean install -DskipTests && cd ../..
```

### Running the Application

From the repository root:

```bash
# Terminal 1 - Start Backend
npm run backend:run

# Terminal 2 - Start Frontend
npm run frontend
```

### Application URLs

| Service      | URL                                         |
| ------------ | ------------------------------------------- |
| Frontend     | http://localhost:3000                       |
| Backend API  | http://localhost:8080                       |
| Swagger UI   | http://localhost:8080/swagger-ui/index.html |
| OpenAPI Docs | http://localhost:8080/v3/api-docs           |

### First Time Setup

1. Navigate to http://localhost:3000
2. Register a company with admin account
3. Login and access the dashboard

---

## 🔧 Troubleshooting

### "Reopen in Container" in Coder

**Problem:** VS Code prompts to reopen in container when connected to Coder
**Solution:** Click "Cancel" or "Don't Reopen" - you're already in a container!

### Permission Denied Errors

**Problem:** `mkdir: cannot create directory: Permission denied`
**Solution:**

- In Coder: Should be fixed by PR #419
- In Local: Rebuild container (`Dev Containers: Rebuild Container`)

### Maven 403 Forbidden

**Problem:** Maven can't download dependencies
**Solution:** Fixed by PR #418 (Maven settings.xml auto-installed)

### npm EACCES Errors

**Problem:** npm can't write files
**Solution:** Fixed by PR #419 (workspace ownership)

### Backend Won't Start (Manual Setup)

**Problem:** Spring Boot fails to start
**Solutions:**

- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -l | grep simpleaccounts`
- Verify environment variables in `apps/backend/.env`

### Database Connection Errors

**Problem:** Can't connect to PostgreSQL
**Solutions:**

- Verify PostgreSQL is running on the configured port
- Check username/password in `.env` file
- Ensure database exists and user has permissions

### Frontend Shows Blank Page

**Problem:** React app loads but shows nothing
**Solutions:**

- Clear Vite cache: `rm -rf apps/frontend/node_modules/.vite`
- Restart frontend dev server
- Check browser console for errors

### Port Already in Use

```bash
# Find process using port 3000 (frontend)
lsof -i :3000

# Find process using port 8080 (backend)
lsof -i :8080

# Kill process by PID
kill -9 <PID>
```

---

## 🏗️ Architecture

### Local Devcontainer Stack

```
┌─────────────────────────────────┐
│   VS Code (your machine)        │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   Docker Desktop                │
│  ┌──────────────────────────┐   │
│  │  Devcontainer            │   │
│  │  - Node.js, Java, Tools  │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  PostgreSQL Container    │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │  Redis Container         │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### Coder Cloud Stack

```
┌─────────────────────────────────┐
│   VS Code (your machine)        │
│   + Coder Extension             │
└────────────┬────────────────────┘
             │ SSH/WebSocket
┌────────────▼────────────────────┐
│   Coder Workspace (cloud)       │
│  ┌──────────────────────────┐   │
│  │  Main Container          │   │
│  │  - All tools included    │   │
│  │  - PostgreSQL            │   │
│  │  - Redis                 │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

**Key Difference:** Coder uses a **single container** with everything pre-configured. Local uses **multiple containers** orchestrated by docker-compose.

---

## 🤝 Team Recommendations

- **Onboarding**: Start with Coder (faster, no local setup)
- **Daily Development**: Use Coder (consistent environment)
- **Offline Work**: Use local devcontainer
- **Custom Experiments**: Use local devcontainer

---

## 📚 Additional Resources

- [Coder Documentation](https://coder.com/docs)
- [VS Code Devcontainers](https://code.visualstudio.com/docs/devcontainers/containers)
- [SimpleAccounts Coder Setup](../.coder/README.md)
- [Devcontainer Config](../.devcontainer/README.md)
