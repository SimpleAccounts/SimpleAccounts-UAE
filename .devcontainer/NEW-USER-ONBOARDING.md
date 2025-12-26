# New User Onboarding for DevPod

## One-Click Setup (Recommended)

### For Admin: Add New User

1. Get the user's **public SSH key** (ask them to run `cat ~/.ssh/id_ed25519.pub`)

2. On the server, run:
   ```bash
   sudo ./scripts/admin-add-user.sh <username> "<public-ssh-key>"
   ```

3. Send the user the generated one-liner command

### For User: Start Coding

Run the one-liner provided by your admin:

```bash
curl -sSL https://raw.githubusercontent.com/SimpleAccounts/SimpleAccounts-UAE/develop/scripts/user-quick-setup.sh | bash -s -- <username> <server>
```

That's it! Then open VS Code:
```bash
devpod up simpleaccounts-uae --ide vscode
```

---

## Alternative: Full Self-Service Setup

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

| Task | Command |
|------|---------|
| Open in VS Code | `devpod up simpleaccounts-uae --ide vscode` |
| SSH into workspace | `ssh simpleaccounts-uae.devpod` |
| Web IDE (browser) | `http://localhost:8443` (after SSH) |
| Stop workspace | `devpod stop simpleaccounts-uae` |
| Start workspace | `devpod up simpleaccounts-uae` |
| Delete workspace | `devpod delete simpleaccounts-uae` |
| View logs | `devpod logs simpleaccounts-uae` |

---

## First-Time Auth (Inside Workspace)

After your workspace is running, authenticate these services:

```bash
# SSH into workspace
ssh simpleaccounts-uae.devpod

# Authenticate GitHub
gh auth login

# Authenticate Claude (optional)
claude
```

---

## Troubleshooting

### SSH Connection Failed

```bash
# Test SSH directly
ssh <username>-devpod

# Check your key is on server
ssh <username>@<server> 'cat ~/.ssh/authorized_keys'
```

### Workspace Won't Start

```bash
# Check status
devpod status simpleaccounts-uae

# View logs
devpod logs simpleaccounts-uae

# Recreate if needed
devpod delete simpleaccounts-uae
devpod up git@github.com:SimpleAccounts/SimpleAccounts-UAE.git --provider <username>-ssh --id simpleaccounts-uae
```

### Permission Denied in Container

```bash
# On server, fix ownership
sudo chown -R 1000:1000 /home/<username>/.devpod-mount/
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  Your Machine                                                 │
│  ┌────────────────┐                                          │
│  │ DevPod Client  │ ──SSH──►  Dev Server (65.108.51.136)     │
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

| Script | Location | Purpose |
|--------|----------|---------|
| `admin-add-user.sh` | `scripts/` | Admin adds new user with SSH key |
| `user-quick-setup.sh` | `scripts/` | User one-click setup |
| `devpod-setup.sh` | `scripts/` | Full self-service setup |
