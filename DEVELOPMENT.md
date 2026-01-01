# Development Environment Guide

SimpleAccounts-UAE supports **two development environments**. Choose the one that fits your workflow:

## 🚀 Quick Start

| Environment            | When to Use                            | Setup Time   |
| ---------------------- | -------------------------------------- | ------------ |
| **Coder Cloud**        | Remote development, team collaboration | 2 minutes    |
| **Local Devcontainer** | Offline development, full control      | 5-10 minutes |

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
- [SimpleAccounts Coder Setup](.coder/README.md)
- [Devcontainer Config](.devcontainer/README.md)
