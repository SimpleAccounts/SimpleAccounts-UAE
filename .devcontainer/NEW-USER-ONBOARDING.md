# New User Onboarding

Welcome to SimpleAccounts UAE development! Choose your setup based on your environment.

## Choose Your Setup

| Setup | Best For | Command |
|-------|----------|---------|
| **Multi-User (Recommended)** | Shared dev server, team collaboration | `./setup-user.sh <username>` |
| **Single User** | Local development, solo work | `devpod up simpleaccounts-uae` |

---

## Option 1: Multi-User Setup (Shared Dev Server)

Best for teams sharing a development server. Each developer gets isolated containers with shareable URLs.

### Quick Start

```bash
# SSH into the dev server
ssh <your-username>@<dev-server-ip>

# Navigate to the project
cd /path/to/SimpleAccounts-UAE/.devcontainer/proxy

# Setup your environment (auto-starts proxy if needed)
./setup-user.sh <your-username>
```

### What You Get

After running the setup script, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Option 1: nip.io URLs (No DNS config needed!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Frontend: http://alice.192-168-1-100.nip.io
  Backend:  http://alice-api.192-168-1-100.nip.io
  Dashboard: http://proxy.192-168-1-100.nip.io:8090
```

### Connect VS Code

1. Open VS Code
2. Install "Dev Containers" extension
3. `Cmd+Shift+P` > "Dev Containers: Attach to Running Container"
4. Select `dev-<your-username>`

### Share Your Environment

Share your URLs with teammates for code review or pair programming:

```
http://alice.192-168-1-100.nip.io
```

Anyone on the same network can access your running application!

### Architecture

```
                              Dev Server
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐                                         │
│  │  Traefik Proxy  │  ← Shared reverse proxy                 │
│  └────────┬────────┘                                         │
│           │                                                  │
│     ┌─────┴─────┬─────────────┐                              │
│     ▼           ▼             ▼                              │
│  ┌──────┐   ┌──────┐     ┌──────┐                            │
│  │alice │   │ bob  │     │carol │  ← Isolated per user       │
│  │ + DB │   │ + DB │     │ + DB │                            │
│  └──────┘   └──────┘     └──────┘                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Option 2: Single User Setup (DevPod)

Best for local development or when you have your own machine.

### One-Click Setup (Recommended)

#### For Admin: Add New User

1. Get the user's **public SSH key** (ask them to run `cat ~/.ssh/id_ed25519.pub`)

2. On the server, run:

   ```bash
   sudo ./scripts/admin-add-user.sh <username> "<public-ssh-key>"
   ```

3. Send the user the generated one-liner command

#### For User: Start Coding

Run the one-liner provided by your admin:

```bash
curl -sSL https://raw.githubusercontent.com/SimpleAccounts/SimpleAccounts-UAE/develop/scripts/user-quick-setup.sh | bash -s -- <username> <server>
```

That's it! Then open VS Code:

```bash
devpod up simpleaccounts-uae --ide vscode
```

### Alternative: Full Self-Service Setup

If you need to set up everything yourself:

```bash
curl -sSL https://raw.githubusercontent.com/SimpleAccounts/SimpleAccounts-UAE/develop/scripts/devpod-setup.sh | bash
```

This will:

1. Install DevPod (if needed)
2. Generate SSH key
3. Copy key to server (requires password)
4. Configure SSH
5. Add DevPod provider
6. Create workspace

---

## Quick Reference

### Multi-User Commands

| Task                  | Command                                             |
| --------------------- | --------------------------------------------------- |
| Setup environment     | `./setup-user.sh <username>`                        |
| List active users     | `docker ps --filter "name=dev-"`                    |
| Stop your environment | `docker compose -f docker-compose.<user>.yml down`  |
| View your logs        | `docker logs dev-<username>`                        |
| Attach VS Code        | Dev Containers: Attach to Running Container         |

### Single-User (DevPod) Commands

| Task              | Command                                   |
| ----------------- | ----------------------------------------- |
| Open in VS Code   | `devpod up simpleaccounts-uae --ide vscode` |
| SSH into workspace | `ssh simpleaccounts-uae.devpod`           |
| Web IDE (browser) | `http://localhost:8443` (after SSH)       |
| Stop workspace    | `devpod stop simpleaccounts-uae`          |
| Start workspace   | `devpod up simpleaccounts-uae`            |
| Delete workspace  | `devpod delete simpleaccounts-uae`        |
| View logs         | `devpod logs simpleaccounts-uae`          |

---

## First-Time Auth (Inside Workspace)

After your workspace is running, authenticate these services:

```bash
# Authenticate GitHub
gh auth login

# Authenticate Claude (optional)
claude
```

---

## Troubleshooting

### Multi-User Setup

#### URL not accessible

```bash
# Check proxy is running
docker ps | grep dev-proxy

# Check your container is running
docker ps | grep dev-<username>

# View proxy logs
docker logs dev-proxy
```

#### Container won't start

```bash
# Check logs
docker logs dev-<username>

# Check compose file
cat .devcontainer/proxy/docker-compose.<username>.yml
```

### Single-User (DevPod) Setup

#### SSH Connection Failed

```bash
# Test SSH directly
ssh <username>-devpod

# Check your key is on server
ssh <username>@<server> 'cat ~/.ssh/authorized_keys'
```

#### Workspace Won't Start

```bash
# Check status
devpod status simpleaccounts-uae

# View logs
devpod logs simpleaccounts-uae

# Recreate if needed
devpod delete simpleaccounts-uae
devpod up git@github.com:SimpleAccounts/SimpleAccounts-UAE.git --provider <username>-ssh --id simpleaccounts-uae
```

#### Permission Denied in Container

```bash
# On server, fix ownership
sudo chown -R 1000:1000 /home/<username>/.devpod-mount/
```

---

## Architecture Comparison

### Multi-User (Shared Server)

```
┌──────────────────────────────────────────────────────────────┐
│  Dev Server                                                   │
│  ┌─────────────────┐                                          │
│  │  Traefik Proxy  │ ← Routes by hostname                     │
│  └────────┬────────┘                                          │
│           │                                                   │
│  ┌────────┴────────┐                                          │
│  │  User Containers │ ← Each user isolated                    │
│  │  (alice, bob...) │                                         │
│  └──────────────────┘                                         │
└──────────────────────────────────────────────────────────────┘
         ▲
         │ HTTP (nip.io URLs)
         │
┌────────┴────────┐
│  Your Browser   │
└─────────────────┘
```

### Single-User (DevPod)

```
┌──────────────────────────────────────────────────────────────┐
│  Your Machine                                                 │
│  ┌────────────────┐                                          │
│  │ DevPod Client  │ ──SSH──►  Dev Server                     │
│  │ VS Code        │           ┌──────────────────────────┐   │
│  └────────────────┘           │ Docker Container         │   │
│                               │ ├─ PostgreSQL :5432      │   │
│                               │ ├─ Redis      :6379      │   │
│                               │ ├─ Frontend   :3000      │   │
│                               │ ├─ Backend    :8080      │   │
│                               │ └─ Code-Server:8443      │   │
│                               └──────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Scripts Reference

| Script                        | Location             | Purpose                          |
| ----------------------------- | -------------------- | -------------------------------- |
| `setup-user.sh`               | `.devcontainer/proxy/` | Multi-user environment setup     |
| `generate-hosts.sh`           | `.devcontainer/proxy/` | Generate /etc/hosts entries      |
| `admin-add-user.sh`           | `scripts/`           | Admin adds new DevPod user       |
| `user-quick-setup.sh`         | `scripts/`           | User one-click DevPod setup      |
| `devpod-setup.sh`             | `scripts/`           | Full self-service DevPod setup   |
