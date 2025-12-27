# DevPod Setup Guide

This guide explains how to set up your development environment using [DevPod](https://devpod.sh/) for SimpleAccounts-UAE.

## What is DevPod?

DevPod creates reproducible development environments using containers. Benefits:

- **Zero configuration** - Everything is pre-configured (Java 21, Node 20, PostgreSQL 18, Redis 7)
- **Fast setup** - Prebuilt images mean you're coding in under a minute
- **Consistent** - Same environment for all developers
- **IDE agnostic** - Works with VS Code, JetBrains IDEs, Cursor, or SSH
- **Zombie-free** - Uses tini init system to prevent zombie processes

## Choose Your Setup

| Setup | Best For | Access Method |
|-------|----------|---------------|
| **DevPod (Single User)** | Local development, solo work | `localhost:3000` via port forwarding |
| **Traefik Multi-User** | Team collaboration, shared server | `username.server-ip.nip.io` via reverse proxy |

**Quick decision:**
- Working alone or locally? → Use DevPod (this guide)
- Sharing a dev server with teammates? → Use [Multi-User Setup](./../.devcontainer/proxy/README.md)

## Prerequisites

1. **Install DevPod CLI**

   **macOS:**

   ```bash
   brew install devpod
   ```

   **Linux:**

   ```bash
   curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-linux-amd64"
   chmod +x devpod
   sudo mv devpod /usr/local/bin/
   ```

   **Windows:**
   Download from [GitHub Releases](https://github.com/loft-sh/devpod/releases/latest)

2. **Install Docker Desktop** (or Docker Engine on Linux)

3. **Install your preferred IDE** (VS Code, Cursor, IntelliJ, etc.)

## Quick Start

### One Command Setup

```bash
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide vscode
```

This will:

1. Pull the prebuilt dev container image (~30 seconds)
2. Start PostgreSQL and Redis
3. Clone the repository
4. Install all dependencies
5. Open VS Code connected to the container

### Using Different IDEs

```bash
# VS Code (default)
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide vscode

# Cursor
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide cursor

# IntelliJ IDEA
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide intellij

# WebStorm
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide webstorm

# PyCharm
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide pycharm

# SSH only (no IDE)
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide none
```

## Running the Application

Once your workspace is ready, open two terminals:

### Terminal 1: Frontend

```bash
cd apps/frontend
npm run dev
```

Frontend runs at: http://localhost:3000

### Terminal 2: Backend

```bash
cd apps/backend
./mvnw spring-boot:run
```

Backend runs at: http://localhost:8080

## Services

| Service               | URL/Port              | Credentials                                                                            |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| Frontend (Vite)       | http://localhost:3000 | -                                                                                      |
| Backend (Spring Boot) | http://localhost:8080 | -                                                                                      |
| PostgreSQL            | localhost:5432        | User: `simpleaccounts`<br>Password: `simpleaccounts_dev`<br>Database: `simpleaccounts` |
| Redis                 | localhost:6379        | -                                                                                      |

## Common Commands

### Workspace Management

| Command                            | Description                     |
| ---------------------------------- | ------------------------------- |
| `devpod up simpleaccounts-uae`     | Start workspace and open IDE    |
| `devpod list`                      | List all workspaces             |
| `devpod ssh simpleaccounts-uae`    | SSH into the container          |
| `devpod stop simpleaccounts-uae`   | Stop workspace (preserves data) |
| `devpod delete simpleaccounts-uae` | Delete workspace                |

### Direct SSH Access

DevPod automatically configures SSH. You can connect directly:

```bash
ssh simpleaccounts-uae.devpod
```

### Rebuild After Changes

If `.devcontainer/` files are updated:

```bash
devpod up simpleaccounts-uae --recreate
```

## Working with a Specific Branch

```bash
# Clone a specific branch
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --branch feature/my-feature --ide vscode

# Or from your fork
devpod up https://github.com/YOUR-USERNAME/SimpleAccounts-UAE --ide vscode
```

## Database Access

### Using psql (inside container)

```bash
psql -h localhost -U simpleaccounts -d simpleaccounts
```

### Using VS Code Extension

The PostgreSQL extension is pre-installed. Connect with:

- Host: `localhost`
- Port: `5432`
- User: `simpleaccounts`
- Password: `simpleaccounts_dev`
- Database: `simpleaccounts`

## Pre-installed Tools

The dev container includes:

| Tool                      | Version     |
| ------------------------- | ----------- |
| Java (Eclipse Temurin)    | 21          |
| Node.js                   | 20          |
| npm                       | Latest      |
| Maven                     | Via wrapper |
| PostgreSQL                | 18          |
| Redis                     | 7           |
| Git                       | Latest      |
| GitHub CLI                | Latest      |
| Docker-in-Docker          | Latest      |
| Chromium (for Playwright) | Latest      |

## VS Code Extensions

These extensions are automatically installed:

**Java Development:**

- Java Extension Pack
- Spring Boot Extension Pack

**Frontend Development:**

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Next

**Testing:**

- Playwright Test

**Database:**

- PostgreSQL Client

**Productivity:**

- GitLens
- GitHub Copilot
- Error Lens
- Path Intellisense

## Troubleshooting

### Workspace Won't Start

```bash
# Run with debug output
devpod up simpleaccounts-uae --debug

# Check status
devpod status simpleaccounts-uae
```

### Port Already in Use

Stop any local services using ports 3000, 8080, 5432, or 6379.

### Docker Issues

```bash
# Ensure Docker is running
docker ps

# Reset Docker if needed
docker system prune -a
```

### Reset Everything

```bash
# Delete and recreate workspace
devpod delete simpleaccounts-uae --force
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide vscode
```

### Container Build Issues

If the prebuilt image fails, you can build locally:

1. Edit `.devcontainer/docker-compose.yml`
2. Comment out the `image:` line
3. Uncomment the `build:` section
4. Run `devpod up simpleaccounts-uae --recreate`

## Using a Remote Server (Optional)

If you have access to a remote development server:

### 1. Configure SSH

Add to `~/.ssh/config`:

```
Host dev-server
    HostName <server-ip>
    User <your-username>
    IdentityFile ~/.ssh/id_ed25519
```

### 2. Add SSH Provider

```bash
devpod provider add ssh --option HOST=dev-server
```

### 3. Create Workspace on Server

```bash
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --provider ssh --ide vscode
```

## Container Naming Convention

When multiple developers use the same remote server, container names can be confusing. By default, DevPod generates random names like `simpleacco-d415b` or `default-mu-f2154`.

### Configure Username in Container Names

To include your username in container names for easier identification:

**Option 1: Set per-workspace (recommended)**

```bash
COMPOSE_PROJECT_NAME="${USER}-simpleaccounts" devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide vscode
```

**Option 2: Set globally for SSH provider**

```bash
devpod provider set-options ssh DOCKER_COMPOSE_PROJECT_NAME='${USER}-simpleaccounts'
```

**Option 3: Create a shell alias**

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias devpod-sa='COMPOSE_PROJECT_NAME="${USER}-simpleaccounts" devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE'

# Usage:
devpod-sa --ide vscode
devpod-sa --ide cursor
```

This will create containers named like `john-simpleaccounts-devcontainer-1` instead of `default-abc123-devcontainer-1`.

## Resources

- [DevPod Documentation](https://devpod.sh/docs)
- [Dev Container Specification](https://containers.dev/)
- [SimpleAccounts Contributing Guide](../CONTRIBUTING.md)
- [Project Setup Guide](../SETUP.md)
