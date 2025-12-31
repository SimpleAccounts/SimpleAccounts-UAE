# New User Onboarding

Welcome to SimpleAccounts UAE development! This guide will help you get started with your development environment.

## Quick Start with Coder (Recommended)

Coder provides a one-click cloud development environment with everything pre-configured.

### Step 1: Access Coder (2 minutes)

1. **Open**: https://coder.dev.simpleaccounts.io
2. **Sign in with GitHub**: Click "Sign in with GitHub"
3. **Authorize**: Grant access to SimpleAccounts organization

### Step 2: Create Your Workspace (3 minutes)

1. Click **"Create Workspace"** button
2. **Select Template**: "SimpleAccounts UAE"
3. **Configure**:
   - **Workspace Name**: `dev` (or any name you prefer)
   - **Dotfiles** (optional): Your personal dotfiles repo URL
   - **Repository**: Keep default (SimpleAccounts-UAE)
4. Click **"Create Workspace"**

Wait ~1-2 minutes for automatic provisioning...

### Step 3: Start Coding (Instant!)

Choose your preferred IDE:

#### Option A: VS Code Web (Browser)

- Click **"Open in Browser"** in Coder dashboard
- No installation needed - code directly in your browser

#### Option B: VS Code Desktop

- Click **"Open in VS Code"** in Coder dashboard
- VS Code automatically connects to your workspace
- Extensions sync automatically

#### Option C: Cursor IDE

1. In Coder dashboard, click **"SSH"** → **"Configure"**
2. Copy SSH config to `~/.ssh/config`
3. In Cursor: **File** → **Remote-SSH** → **Connect to Host** → `coder.your-workspace`

### Step 4: Verify Environment (2 minutes)

```bash
# Check PostgreSQL
pg_isready -h db -p 5432 -U simpleaccounts

# Check Redis
redis-cli -h redis ping

# Check repository
git status

# Start frontend (in terminal)
cd apps/frontend
npm run dev

# Start backend (in new terminal)
cd apps/backend
./mvnw spring-boot:run
```

### Your Workspace URLs

```
Frontend:  https://<your-username>-dev.dev.simpleaccounts.io
Backend:   https://<your-username>-dev-api.dev.simpleaccounts.io
```

## What's Included

### Pre-Installed Services

- **PostgreSQL 16**: Database server (accessible at `db:5432`)
- **Redis 7**: Cache and session storage (accessible at `redis:6379`)
- **All Dev Tools**: Java 21, Node 20, Maven, npm, Docker CLI, GitHub CLI

### Database Connection

```bash
# From inside workspace
psql -h db -p 5432 -U simpleaccounts -d simpleaccounts

# Credentials
User: simpleaccounts
Password: simpleaccounts_dev
Database: simpleaccounts
```

### Common Commands

```bash
# Install dependencies (if not done automatically)
npm install
cd apps/frontend && npm install
cd apps/backend && ./mvnw compile

# Start development servers
npm run frontend        # Frontend (Vite)
npm run backend:run     # Backend (Spring Boot)

# Run tests
npm run frontend:test
npm run backend:test

# Build for production
npm run frontend:build
npm run backend:build
```

## Workspace Features

### Auto-Stop

- Workspaces automatically stop after **30 minutes of inactivity**
- Restart anytime from Coder dashboard (takes ~10 seconds)

### Persistent Data

Your workspace persists:

- ✅ Git repository and all code changes
- ✅ Database data
- ✅ Redis data
- ✅ npm and Maven caches
- ✅ SSH keys and credentials
- ✅ Git configuration
- ✅ Bash history

### Resource Limits

Each workspace has:

- **CPU**: 2 cores
- **RAM**: 4GB
- **Disk**: Shared from server

## Alternative: Local Development

If you prefer local development on your machine:

### Prerequisites

- **Node.js** >= 20.x
- **Java** 21
- **Maven** 3.6+
- **PostgreSQL** 16+
- **Redis** 7+
- **Docker** (for VS Code DevContainers)

### VS Code DevContainer (Local)

1. Install [VS Code](https://code.visualstudio.com/)
2. Install [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Open repository in VS Code
4. Click "Reopen in Container" when prompted

### Manual Setup (Local)

```bash
# Clone repository
git clone https://github.com/SimpleAccounts/SimpleAccounts-UAE.git
cd SimpleAccounts-UAE

# Install dependencies
npm install

# Start PostgreSQL and Redis (via Docker)
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_USER=simpleaccounts \
  -e POSTGRES_PASSWORD=simpleaccounts_dev \
  -e POSTGRES_DB=simpleaccounts \
  postgres:16-alpine

docker run -d --name redis -p 6379:6379 redis:7-alpine

# Start frontend
cd apps/frontend
npm run dev

# Start backend (in new terminal)
cd apps/backend
./mvnw spring-boot:run
```

## Getting Help

### Documentation

- **Coder Guide**: [.coder/README.md](../.coder/README.md)
- **DevContainer Guide**: [.devcontainer/README.md](README.md)
- **Project README**: [../README.md](../README.md)

### Support Channels

- **GitHub Issues**: https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues
- **GitHub Discussions**: https://github.com/SimpleAccounts/SimpleAccounts-UAE/discussions
- **Coder Dashboard**: https://coder.dev.simpleaccounts.io

### Common Issues

#### Can't access workspace

- Check Coder dashboard for workspace status
- Try restarting workspace
- Contact your Coder admin

#### Database connection failed

```bash
# Wait for PostgreSQL to be ready
until pg_isready -h db -p 5432 -U simpleaccounts -q; do sleep 1; done
```

#### Frontend/Backend not loading

- Ensure you're using the correct ports (3000 for frontend, 8080 for backend)
- Check if processes are running: `ps aux | grep node` or `ps aux | grep java`
- Restart the dev server

## Next Steps

1. ✅ **Create your first workspace**
2. ✅ **Familiarize yourself with the codebase**
3. ✅ **Read the project documentation**
4. ✅ **Make your first commit**
5. ✅ **Join team discussions**

Welcome to the team! 🎉
