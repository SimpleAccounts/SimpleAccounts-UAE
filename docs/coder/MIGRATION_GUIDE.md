# Migration Guide: DevPod → Coder

This guide helps you migrate from DevPod to Coder for SimpleAccounts UAE development.

## Why Migrate?

| Feature             | DevPod         | Coder                     |
| ------------------- | -------------- | ------------------------- |
| **Web Dashboard**   | ❌ CLI only    | ✅ Full UI                |
| **One-Click Setup** | Manual scripts | ✅ Click & code           |
| **User Management** | Linux users    | ✅ GitHub OAuth           |
| **IDE Options**     | VS Code only   | ✅ VS Code + Cursor + SSH |
| **Resource Limits** | Manual         | ✅ Built-in quotas        |
| **Auto-Stop**       | Custom script  | ✅ Native support         |
| **Team Visibility** | None           | ✅ See all workspaces     |

## Pre-Migration Checklist

- [ ] Commit and push all your work in DevPod
- [ ] Save any local configuration files
- [ ] Note down any custom environment variables
- [ ] Backup database data if needed
- [ ] List installed tools/packages not in base image

## Migration Steps

### Step 1: Backup Your Work (5 minutes)

```bash
# In your DevPod workspace
cd /workspaces/SimpleAccounts-UAE

# Commit everything
git add .
git commit -m "chore: backup before Coder migration"
git push origin your-branch

# Export database (optional)
pg_dump -h db -U simpleaccounts -d simpleaccounts > ~/backup-$(date +%Y%m%d).sql

# Save environment files
cp apps/frontend/.env.local ~/backup-frontend-env.local
cp apps/backend/src/main/resources/application-local.properties ~/backup-backend-local.properties
```

### Step 2: Access Coder (2 minutes)

1. **Open Coder**: https://coder.dev.simpleaccounts.io
2. **Login with GitHub**: Click "Sign in with GitHub"
3. **Authorize**: Grant access to SimpleAccounts organization

You're now in Coder! 🎉

### Step 3: Create Workspace (3 minutes)

1. **Click "Create Workspace"** button
2. **Select Template**: "SimpleAccounts UAE"
3. **Configure**:
   - **Workspace Name**: `dev` (or `main`, `feature-x`, etc.)
   - **Dotfiles** (optional): Your dotfiles repo URL
   - **Repository**: Keep default (SimpleAccounts-UAE)
4. **Click "Create Workspace"**

Wait ~1-2 minutes for provisioning...

### Step 4: Connect Your IDE (2 minutes)

#### Option A: VS Code Desktop

1. Click **"Open in VS Code"** in Coder dashboard
2. VS Code will automatically connect
3. Extensions install automatically

#### Option B: VS Code Web

1. Click **"Open in Browser"** in Coder dashboard
2. Start coding immediately (no installation needed)

#### Option C: Cursor IDE

1. In Coder dashboard, click **"SSH"** → **"Configure"**
2. Copy SSH config to `~/.ssh/config`
3. In Cursor: **File** → **Remote-SSH** → **Connect to Host** → `coder.your-workspace`

### Step 5: Restore Your Work (5 minutes)

```bash
# In your new Coder workspace
cd /workspaces/SimpleAccounts-UAE

# Pull latest code (should already be cloned)
git fetch --all
git checkout your-branch

# Restore environment files (if different from repo)
# Frontend
cat > apps/frontend/.env.local << 'EOF'
VITE_API_URL=http://localhost:8080
VITE_APP_ENV=development
EOF

# Backend
cat > apps/backend/src/main/resources/application-local.properties << 'EOF'
spring.datasource.url=jdbc:postgresql://db:5432/simpleaccounts
spring.datasource.username=simpleaccounts
spring.datasource.password=simpleaccounts_dev
spring.jpa.hibernate.ddl-auto=update
spring.redis.host=redis
spring.redis.port=6379
EOF

# Restore database (if you exported it)
# psql -h db -U simpleaccounts -d simpleaccounts < ~/backup-20250101.sql
```

### Step 6: Verify Everything Works (5 minutes)

```bash
# Test PostgreSQL
pg_isready -h db -p 5432 -U simpleaccounts
psql -h db -U simpleaccounts -d simpleaccounts -c "SELECT version();"

# Test Redis
redis-cli -h redis ping

# Install dependencies (if not done by post-create)
npm install
cd apps/frontend && npm install
cd ../backend && ./mvnw compile

# Start frontend
cd apps/frontend
npm run dev
# Access: https://your-username-dev.dev.simpleaccounts.io

# Start backend (in new terminal)
cd apps/backend
./mvnw spring-boot:run
# Access: https://your-username-dev-api.dev.simpleaccounts.io
```

### Step 7: Clean Up DevPod (Optional)

Once you've verified everything works:

```bash
# Stop DevPod workspace
devpod stop simpleaccounts-uae

# Delete DevPod workspace (including volumes!)
devpod delete simpleaccounts-uae

# Or keep it as backup for a week
```

## Key Differences

### File Locations

| DevPod                           | Coder                                          |
| -------------------------------- | ---------------------------------------------- |
| `/workspaces/SimpleAccounts-UAE` | Same! `/workspaces/SimpleAccounts-UAE`         |
| `~/.devpod-mount/`               | `/home/coder/.coder-mount/`                    |
| Container name: `dev-<username>` | Container name: `coder-<username>-<workspace>` |

### Service Names

| Service    | DevPod           | Coder                  |
| ---------- | ---------------- | ---------------------- |
| PostgreSQL | `db:5432`        | Same! `db:5432`        |
| Redis      | `redis:6379`     | Same! `redis:6379`     |
| Frontend   | `localhost:3000` | Same! `localhost:3000` |
| Backend    | `localhost:8080` | Same! `localhost:8080` |

### URLs

| Service  | DevPod                          | Coder                                                  |
| -------- | ------------------------------- | ------------------------------------------------------ |
| Frontend | `http://username.IP.nip.io`     | `https://username-workspace.dev.simpleaccounts.io`     |
| Backend  | `http://username-api.IP.nip.io` | `https://username-workspace-api.dev.simpleaccounts.io` |

### Commands

| Task               | DevPod                             | Coder                                                   |
| ------------------ | ---------------------------------- | ------------------------------------------------------- |
| Start workspace    | `devpod up simpleaccounts-uae`     | Click "Start" in dashboard or `coder start <workspace>` |
| Stop workspace     | `devpod stop simpleaccounts-uae`   | Auto-stops after 30min idle or click "Stop"             |
| Delete workspace   | `devpod delete simpleaccounts-uae` | Click "Delete" in dashboard                             |
| SSH into workspace | `ssh simpleaccounts-uae.devpod`    | `ssh coder.<workspace-name>`                            |

## Credential Migration

Your credentials automatically persist! These directories are preserved:

- ✅ `~/.ssh` (SSH keys)
- ✅ `~/.config/gh` (GitHub CLI)
- ✅ `~/.gitconfig` (Git config)
- ✅ `~/.claude` (Claude CLI)
- ✅ `~/.docker` (Docker config)
- ✅ `~/.kube` (Kubernetes config)

No need to re-authenticate! 🎉

## Troubleshooting

### "Workspace creation failed"

**Check Coder logs:**

```bash
coder logs <workspace-name>
```

**Common causes:**

- Docker network issue → Check Traefik network exists
- Image pull failed → Verify ghcr.io access
- Permission denied → Check Docker socket permissions

### "Can't connect to PostgreSQL"

**Wait for startup:**

```bash
# PostgreSQL takes 10-20 seconds to start
until pg_isready -h db -p 5432 -U simpleaccounts -q; do sleep 1; done
```

### "My code is missing"

**Check Git status:**

```bash
cd /workspaces/SimpleAccounts-UAE
git status
git remote -v
git fetch --all
```

**Repository not cloned?**

```bash
# Clone manually
git clone https://github.com/SimpleAccounts/SimpleAccounts-UAE.git /workspaces/SimpleAccounts-UAE
```

### "Dependencies not installed"

**Run post-create manually:**

```bash
cd /workspaces/SimpleAccounts-UAE
bash .devcontainer/post-create.sh
```

### "Custom tools missing"

**Install tools:**

```bash
# Example: Install extra npm package globally
npm install -g <package-name>

# Or add to Dockerfile for permanent inclusion
```

## Advanced Migration

### Multiple Workspaces

In DevPod, you had one workspace per repo. In Coder, you can have multiple:

```
alice-main     → Main development
alice-feature  → Feature branch work
alice-hotfix   → Emergency fixes
```

**Create second workspace:**

1. Click "Create Workspace" again
2. Use different name: `feature-x`
3. Same template, isolated environment

### Team Collaboration

**Share your running workspace:**

```
Frontend: https://alice-main.dev.simpleaccounts.io
Backend:  https://alice-main-api.dev.simpleaccounts.io
```

Send these URLs to teammates for live demos!

### Resource Adjustments

Need more resources? Ask your Coder admin to:

- Increase CPU/RAM limits in template
- Add `small/medium/large` size options
- Custom resource tiers per user

## FAQs

### Do I lose my DevPod data?

No! Your Git repository is safe (pushed to GitHub). Coder will clone a fresh copy.

### Can I run both DevPod and Coder?

Yes! Keep DevPod as backup during migration. Delete after verification.

### How do I access my old database?

Export from DevPod, import to Coder:

```bash
# In DevPod
pg_dump -h db -U simpleaccounts -d simpleaccounts > backup.sql

# In Coder
psql -h db -U simpleaccounts -d simpleaccounts < backup.sql
```

### What about my VS Code extensions?

They sync automatically via Settings Sync or persist in volume.

### Can I use Cursor instead of VS Code?

Yes! Connect via SSH Remote (see Step 4, Option C).

## Rollback Plan

If you need to go back to DevPod:

```bash
# Start DevPod workspace
devpod up simpleaccounts-uae

# Pull latest code from GitHub
cd /workspaces/SimpleAccounts-UAE
git pull

# Continue working in DevPod
```

Your Coder workspace stays intact (can resume later).

## Support

- **Coder Dashboard**: https://coder.dev.simpleaccounts.io
- **Documentation**: See `.coder/README.md`
- **Issues**: https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues
- **Coder Docs**: https://coder.com/docs

## Summary

✅ **Backup your work** (commit & push)
✅ **Login to Coder** (GitHub OAuth)
✅ **Create workspace** (1 click)
✅ **Connect IDE** (VS Code or Cursor)
✅ **Verify & code** (same environment!)

Migration complete in ~20 minutes! 🚀
