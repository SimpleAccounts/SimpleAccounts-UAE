# DevPod Setup Guide

This guide explains how to set up your development environment using [DevPod](https://devpod.sh/) for SimpleAccounts-UAE.

## What is DevPod?

DevPod creates reproducible development environments using containers. Benefits:

- **Zero configuration** - Everything is pre-configured (Java 21, Node 20, PostgreSQL 18, Redis 7)
- **Fast setup** - Prebuilt images mean you're coding in under a minute
- **Consistent** - Same environment for all developers
- **IDE agnostic** - Works with VS Code, JetBrains IDEs, Cursor, or SSH
- **Zombie-free** - Uses tini init system to prevent zombie processes
- **Shareable URLs** - Auto-connects to Traefik for team collaboration

## Choose Your Setup

| Setup              | Best For                           | Access Method                        |
| ------------------ | ---------------------------------- | ------------------------------------ |
| **Local DevPod**   | Local development, solo work       | `localhost:3000` via port forwarding |
| **Remote DevPod**  | Team collaboration, shared server  | `username.server-ip.nip.io` via Traefik |

Both setups use the same DevPod workflow - the only difference is where containers run.

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

## Quick Start (Local)

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

# SSH only (no IDE)
devpod up https://github.com/SimpleAccounts/SimpleAccounts-UAE --ide none
```

## Remote Server Setup (Team Collaboration)

For teams sharing a dev server with shareable URLs.

### 1. Configure SSH (one-time)

Add to `~/.ssh/config`:

```
Host dev-server
    HostName <server-ip>
    User <your-username>
    IdentityFile ~/.ssh/id_ed25519
```

### 2. Add SSH Provider (one-time)

```bash
devpod provider add ssh
```

### 3. Launch Workspace

```bash
devpod up git@github.com:SimpleAccounts/SimpleAccounts-UAE.git \
  --provider ssh \
  --provider-option HOST=dev-server \
  --ide vscode
```

### What Happens

1. DevPod clones repo to your home directory on dev-server
2. Starts isolated containers: `dev-<username>`, `db-<username>`, `redis-<username>`
3. Auto-connects to Traefik network (if available)
4. Opens VS Code connected to the container
5. Prints shareable URLs

### Shareable URLs

After startup, you get shareable URLs (if Traefik is running):

| Service   | URL                                        |
| --------- | ------------------------------------------ |
| Frontend  | `http://<username>.<server-ip>.nip.io`     |
| Backend   | `http://<username>-api.<server-ip>.nip.io` |
| Web IDE   | `http://<username>-ide.<server-ip>.nip.io` |

**Example for user `alice` on server `65.108.51.136`:**
- Frontend: `http://alice.65-108-51-136.nip.io`
- Backend: `http://alice-api.65-108-51-136.nip.io`
- Web IDE: `http://alice-ide.65-108-51-136.nip.io`

### Web IDE Password

The Web IDE (code-server) is password protected. On first launch, a random password is generated and displayed in the terminal.

**View your password:**
```bash
cat ~/.config/code-server/config.yaml
```

**Change your password:**
```bash
nano ~/.config/code-server/config.yaml
# Edit the 'password:' line, save, then restart:
pkill code-server && code-server /workspaces/SimpleAccounts-UAE &
```

Your password is stored in your home directory and persists across container restarts.

### Admin: Install Traefik (one-time)

Before team members can get shareable URLs, an admin must install Traefik:

```bash
ssh dev-server
cd /path/to/SimpleAccounts-UAE/.devcontainer/proxy
sudo ./install-traefik-service.sh
```

See [Multi-User Setup](./../.devcontainer/proxy/README.md) for details.

## Running the Application

Once your workspace is ready, open two terminals:

### Terminal 1: Frontend

```bash
cd apps/frontend
npm run dev
```

Frontend runs at: http://localhost:3000 (or shareable URL on remote)

### Terminal 2: Backend

```bash
cd apps/backend
./mvnw spring-boot:run
```

Backend runs at: http://localhost:8080 (or shareable URL on remote)

## Services

**From your local machine (via port forwarding):**

| Service               | URL/Port              | Credentials                                                                            |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| Frontend (Vite)       | http://localhost:3000 | -                                                                                      |
| Backend (Spring Boot) | http://localhost:8080 | -                                                                                      |
| PostgreSQL            | localhost:5432        | User: `simpleaccounts`<br>Password: `simpleaccounts_dev`<br>Database: `simpleaccounts` |
| Redis                 | localhost:6379        | -                                                                                      |

**Inside the container (internal network):**

| Service    | Hostname | Port |
| ---------- | -------- | ---- |
| PostgreSQL | `db`     | 5432 |
| Redis      | `redis`  | 6379 |

The application is pre-configured with environment variables to use the internal hostnames (`db`, `redis`).

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
psql -h db -U simpleaccounts -d simpleaccounts
```

### Using VS Code Extension

The PostgreSQL extension is pre-installed. Connect with:

- Host: `db` (internal hostname)
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
| Docker CLI                | Latest      |
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

## Container Naming

Containers are automatically named based on your username:

| Container       | Name Pattern       |
| --------------- | ------------------ |
| Devcontainer    | `dev-<username>`   |
| PostgreSQL      | `db-<username>`    |
| Redis           | `redis-<username>` |

This ensures no conflicts when multiple developers use the same server.

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

### Container Not Getting Traefik URLs (Remote)

```bash
# Check if Traefik is running
docker ps | grep dev-proxy

# Manually connect to Traefik network
docker network connect dev-proxy-network dev-<username>

# Verify routing
curl http://localhost:8090/api/http/routers | grep <username>
```

### Container Build Issues

If the prebuilt image fails, you can build locally:

1. Edit `.devcontainer/docker-compose.yml`
2. Comment out the `image:` line
3. Uncomment the `build:` section
4. Run `devpod up simpleaccounts-uae --recreate`

## Resources

- [DevPod Documentation](https://devpod.sh/docs)
- [Dev Container Specification](https://containers.dev/)
- [Multi-User Setup Guide](../.devcontainer/proxy/README.md)
- [SimpleAccounts Contributing Guide](../CONTRIBUTING.md)
- [Project Setup Guide](../SETUP.md)
