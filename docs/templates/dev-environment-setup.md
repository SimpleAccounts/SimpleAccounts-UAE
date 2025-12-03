# Development Environment Setup Guide

Complete guide to set up SimpleAccounts-UAE development environment on a new machine.

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 4 cores | 8 cores |
| RAM | 8 GB | 16 GB |
| Disk | 20 GB free | 50 GB free |
| OS | macOS 12+, Ubuntu 20.04+, Windows 10+ (WSL2) | macOS 14, Ubuntu 22.04 |

---

## Step 1: Install Required Tools

### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install essential tools
brew install git curl wget jq

# Install SDKMAN for Java version management
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 8 (required for backend)
sdk install java 8.0.422-zulu
sdk use java 8.0.422-zulu

# Verify Java
java -version
# Expected: openjdk version "1.8.0_422"

# Install NVM for Node version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc  # or ~/.bashrc

# Install Node 20 (required for frontend)
nvm install 20
nvm use 20
nvm alias default 20

# Verify Node
node -v  # Expected: v20.x.x
npm -v   # Expected: v10.x.x

# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Install Docker (optional, for Testcontainers)
brew install --cask docker
```

### Ubuntu/Debian

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget jq build-essential

# Install SDKMAN for Java
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 8
sdk install java 8.0.422-zulu
sdk use java 8.0.422-zulu

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node 20
nvm install 20
nvm use 20

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Install Docker (optional)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Windows (WSL2)

```powershell
# Enable WSL2 (in PowerShell as Admin)
wsl --install

# Install Ubuntu from Microsoft Store
# Then follow Ubuntu instructions above inside WSL2
```

---

## Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/SimpleAccounts/SimpleAccounts-UAE.git
cd SimpleAccounts-UAE

# Verify structure
ls -la
# Should see: apps/, docs/, deploy/, scripts/, etc.
```

---

## Step 3: Database Setup

### Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE simpleaccounts_db;
CREATE USER simpleaccounts_db_user WITH ENCRYPTED PASSWORD 'SimpleAccounts@2023';
GRANT ALL PRIVILEGES ON DATABASE simpleaccounts_db TO simpleaccounts_db_user;

# Grant schema permissions (PostgreSQL 15+)
\c simpleaccounts_db
GRANT ALL ON SCHEMA public TO simpleaccounts_db_user;

# Exit
\q
```

### Verify Connection

```bash
psql -h localhost -U simpleaccounts_db_user -d simpleaccounts_db
# Enter password: SimpleAccounts@2023
# Should connect successfully
\q
```

---

## Step 4: Backend Setup

### Create Environment File

```bash
# Create backend .env file
cat > apps/backend/.env << 'EOF'
SIMPLEACCOUNTS_DB_HOST=localhost
SIMPLEACCOUNTS_DB_PORT=5432
SIMPLEACCOUNTS_DB=simpleaccounts_db
SIMPLEACCOUNTS_DB_USER=simpleaccounts_db_user
SIMPLEACCOUNTS_DB_PASSWORD=SimpleAccounts@2023
SIMPLEACCOUNTS_DB_SSL=false
SIMPLEACCOUNTS_DB_SSLMODE=
SIMPLEACCOUNTS_DB_SSLROOTCERT=
SIMPLEACCOUNTS_HOST=http://localhost:8080
SIMPLEACCOUNTS_SMTP_USER=
SIMPLEACCOUNTS_SMTP_PASS=
SIMPLEACCOUNTS_SMTP_HOST=
SIMPLEACCOUNTS_SMTP_PORT=
SIMPLEACCOUNTS_SMTP_AUTH=
SIMPLEACCOUNTS_SMTP_STARTTLS_ENABLE=
JWT_SECRET=simpleaccounts
EOF
```

### Build and Run Backend

```bash
cd apps/backend

# Set Java version
sdk use java 8.0.422-zulu

# Build (skip tests for first run)
./mvnw clean install -DskipTests

# Run tests
./mvnw test
# Expected: Tests run: 51, Failures: 0, Errors: 0

# Start backend
./run.sh
# Or: ./mvnw spring-boot:run

# Verify backend is running
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

---

## Step 5: Frontend Setup

### Create Environment File

```bash
# Create frontend .env file
cat > apps/frontend/.env << 'EOF'
PORT=3000
CHOKIDAR_USEPOLLING=true
GENERATE_SOURCEMAP=false
SIMPLEACCOUNTS_HOST=http://localhost:8080
SKIP_PREFLIGHT_CHECK=true
SIMPLEACCOUNTS_RELEASE=local-dev
SIMPLE_SERVICES_HOST=https://simpleaccounts-azure-function-app.azurewebsites.net
SIMPLE_SERVICES_GET_SUBSCRIPTION_KEY=<your-subscription-key>
EOF
```

### Install Dependencies and Run

```bash
cd apps/frontend

# Set Node version
nvm use 20

# Configure npm for legacy peer deps
npm config set legacy-peer-deps true

# Install dependencies
npm install

# Run tests
npm test -- --watchAll=false
# Expected: Tests: 151 passed

# Start frontend
npm start
# Opens http://localhost:3000
```

---

## Step 6: Verify Installation

### Checklist

```bash
# 1. Backend health check
curl -s http://localhost:8080/actuator/health | jq .
# Expected: {"status":"UP"}

# 2. Frontend accessible
curl -s http://localhost:3000 | head -5
# Expected: HTML content

# 3. Backend tests pass
cd apps/backend && ./mvnw test
# Expected: BUILD SUCCESS, 51 tests passed

# 4. Frontend tests pass
cd apps/frontend && npm test -- --watchAll=false
# Expected: 151 tests passed
```

### Login Test

1. Open http://localhost:3000
2. Login with test credentials (ask team for credentials)
3. Verify dashboard loads successfully

---

## Quick Reference Commands

### Daily Development

```bash
# Start backend (terminal 1)
cd apps/backend
sdk use java 8.0.422-zulu
./run.sh

# Start frontend (terminal 2)
cd apps/frontend
nvm use 20
npm start
```

### Running Tests

```bash
# All backend tests
cd apps/backend && ./mvnw test

# All frontend tests
cd apps/frontend && npm test -- --watchAll=false

# Single frontend test file
npm test -- path/to/test.js --watchAll=false
```

### Database Operations

```bash
# Connect to database
psql -h localhost -U simpleaccounts_db_user -d simpleaccounts_db

# View tables
\dt

# Run query
SELECT * FROM users LIMIT 5;

# Exit
\q
```

### Git Operations

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add .
git commit -m "feat: Add new feature"

# Push and create PR
git push -u origin feature/my-feature
```

---

## Environment Variables Reference

### Backend (`apps/backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `SIMPLEACCOUNTS_DB_HOST` | Database host | `localhost` |
| `SIMPLEACCOUNTS_DB_PORT` | Database port | `5432` |
| `SIMPLEACCOUNTS_DB` | Database name | `simpleaccounts_db` |
| `SIMPLEACCOUNTS_DB_USER` | Database user | `simpleaccounts_db_user` |
| `SIMPLEACCOUNTS_DB_PASSWORD` | Database password | (required) |
| `SIMPLEACCOUNTS_HOST` | Backend URL | `http://localhost:8080` |
| `JWT_SECRET` | JWT signing key | `simpleaccounts` |
| `SIMPLEACCOUNTS_SMTP_*` | Email configuration | (optional) |

### Frontend (`apps/frontend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Dev server port | `3000` |
| `SIMPLEACCOUNTS_HOST` | Backend API URL | `http://localhost:8080` |
| `SIMPLEACCOUNTS_RELEASE` | Version string | `local-dev` |
| `SIMPLE_SERVICES_HOST` | External services | (optional) |

---

## Troubleshooting

### Java Issues

| Problem | Solution |
|---------|----------|
| Wrong Java version | `sdk use java 8.0.422-zulu` |
| JAVA_HOME not set | `export JAVA_HOME=$(sdk home java 8.0.422-zulu)` |
| Maven not found | `./mvnw` uses wrapper, no install needed |

### Node Issues

| Problem | Solution |
|---------|----------|
| Wrong Node version | `nvm use 20` |
| npm install fails | `npm config set legacy-peer-deps true` |
| Permission errors | Don't use `sudo` with npm |

### Database Issues

| Problem | Solution |
|---------|----------|
| Connection refused | `brew services start postgresql@15` or `sudo systemctl start postgresql` |
| Auth failed | Verify password in `.env` matches database user |
| Database doesn't exist | Run database setup steps again |

### Port Conflicts

| Problem | Solution |
|---------|----------|
| Port 8080 in use | `lsof -i :8080` then `kill <PID>` |
| Port 3000 in use | `lsof -i :3000` then `kill <PID>` |
| Port 5432 in use | Another PostgreSQL instance running |

---

## IDE Setup (Optional)

### VS Code

```bash
# Recommended extensions
code --install-extension vscjava.vscode-java-pack
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

### IntelliJ IDEA

1. Open `apps/backend` as Maven project
2. Set SDK to Java 8
3. Enable annotation processing for Lombok

---

## Support

- **Documentation**: `docs/` folder
- **Issues**: GitHub Issues
- **Team Chat**: [Slack/Teams channel]

---

*Last Updated: December 2025*
