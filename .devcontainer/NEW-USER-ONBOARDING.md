# New User Onboarding for DevPod

This guide covers setting up a new developer with DevPod access to SimpleAccounts-UAE.

## Prerequisites

- Admin SSH access to the dev server (65.108.51.136)
- DevPod installed on local machine
- GitHub account with repo access

---

## Step 1: Server Setup (SSH as admin)

### 1.1 Create Linux user (if not exists)

```bash
sudo adduser <username>
```

### 1.2 Run DevPod setup script

```bash
sudo setup-devpod-user <username>
```

This script:
- Creates `~/.devpod-mount/` directory structure
- Sets ownership to UID 1000 (vscode user in container)
- Adds user to docker group
- Configures passwordless sudo for docker

### 1.3 (Optional) Share Claude credentials

Only if you want this user to share Claude credentials from another user:

```bash
sudo share-claude-credentials <username> mohsin
```

This creates bind mounts so the new user uses mohsin's Claude authentication.

---

## Step 2: Local Machine Setup (Mac)

### 2.1 Create SSH key

```bash
ssh-keygen -t ed25519 -C "<username>@datainn.io" -f ~/.ssh/id_ed25519_<username>_dev_server
```

### 2.2 Copy public key to server

```bash
ssh-copy-id -i ~/.ssh/id_ed25519_<username>_dev_server.pub <username>@65.108.51.136
```

### 2.3 Add SSH config entry

Add to `~/.ssh/config`:

```
Host <username>-dev-server
    HostName 65.108.51.136
    User <username>
    IdentityFile ~/.ssh/id_ed25519_<username>_dev_server
    IdentitiesOnly yes
    ServerAliveInterval 30
```

### 2.4 Test SSH connection

```bash
ssh <username>-dev-server 'echo "✅ SSH works"'
```

### 2.5 Create DevPod provider

```bash
devpod provider add ssh --name <username>-ssh
```

When prompted:
- Host: `<username>-dev-server`

### 2.6 Create workspace

```bash
devpod up git@github.com:SimpleAccounts/SimpleAccounts-UAE.git --provider <username>-ssh --ide none
```

---

## Step 3: Container Setup (first time)

### 3.1 Authenticate GitHub CLI

```bash
ssh <workspace-name>.devpod 'gh auth login'
```

Follow the prompts to authenticate with GitHub.

### 3.2 Authenticate Claude (if NOT sharing credentials)

Skip this if you ran `share-claude-credentials` in Step 1.3.

```bash
ssh <workspace-name>.devpod 'claude'
```

Follow the browser auth flow.

---

## Quick Reference

| Step | Where | Command |
|------|-------|---------|
| Create user | Server | `sudo adduser <username>` |
| Setup DevPod dirs | Server | `sudo setup-devpod-user <username>` |
| Share Claude (optional) | Server | `sudo share-claude-credentials <username> mohsin` |
| Create SSH key | Local | `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_<username>_dev_server` |
| Copy SSH key | Local | `ssh-copy-id -i ~/.ssh/id_ed25519_<username>_dev_server.pub <username>@65.108.51.136` |
| Add SSH config | Local | Edit `~/.ssh/config` |
| Create provider | Local | `devpod provider add ssh --name <username>-ssh` |
| Create workspace | Local | `devpod up <repo> --provider <username>-ssh` |
| GitHub auth | Container | `gh auth login` |
| Claude auth | Container | `claude` (if not shared) |

---

## Troubleshooting

### Permission denied for Claude

```bash
# On server, fix ownership
sudo chown -R 1000:1000 /home/<username>/.devpod-mount/
```

### NODE_OPTIONS error during setup

Already fixed in `post-create.sh` with `unset NODE_OPTIONS`.

### Container not picking up mounted files

Recreate the workspace:

```bash
devpod stop <workspace-name>
devpod up <workspace-name> --recreate --ide none
```

---

## Server Scripts Reference

### /usr/local/bin/setup-devpod-user

Basic DevPod environment setup for a user.

```bash
sudo setup-devpod-user <username>
```

### /usr/local/bin/share-claude-credentials

Share Claude credentials between users via bind mounts.

```bash
sudo share-claude-credentials <target_user> <source_user>
```

Example: `sudo share-claude-credentials john mohsin`
