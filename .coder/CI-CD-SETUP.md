# Coder Template CI/CD Setup

This repository uses GitHub Actions to automatically deploy Coder template updates.

## How It Works

The workflow `.github/workflows/coder-template-push.yml` automatically:

- Triggers on changes to `.coder/template.tf` or related files
- Installs Coder CLI
- Pushes the updated template to Coder
- Can also be triggered manually via "workflow_dispatch"

## Initial Setup

### 1. Create Coder Session Token

Generate a long-lived API token for CI/CD:

```bash
# Login to Coder
coder login https://coder.dev.simpleaccounts.io

# Create a token (expires in 1 year)
coder tokens create ci-cd-deploy --lifetime 8760h
```

Copy the generated token (starts with `cGm...`).

### 2. Add GitHub Secret

1. Go to: https://github.com/SimpleAccounts/SimpleAccounts-UAE/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `CODER_SESSION_TOKEN`
4. Value: Paste the token from step 1
5. Click **"Add secret"**

### 3. Enable Workflow

The workflow is now active! It will automatically run when:

- `.coder/template.tf` is modified
- `.coder/build.yaml` is modified
- `.coder/.terraform.lock.hcl` is modified
- Manually triggered via Actions tab

## Manual Trigger

To manually deploy the template:

1. Go to: https://github.com/SimpleAccounts/SimpleAccounts-UAE/actions/workflows/coder-template-push.yml
2. Click **"Run workflow"**
3. Select branch (usually `develop`)
4. Click **"Run workflow"** button

## Monitoring Deployments

View deployment history:

- GitHub Actions: https://github.com/SimpleAccounts/SimpleAccounts-UAE/actions/workflows/coder-template-push.yml
- Coder Template: https://coder.dev.simpleaccounts.io/templates/simpleaccounts-uae

## Troubleshooting

### Token Expired

If deploys fail with authentication errors:

1. Generate new token: `coder tokens create ci-cd-deploy --lifetime 8760h`
2. Update GitHub secret: Settings → Secrets → Actions → `CODER_SESSION_TOKEN`

### Template Push Fails

Check the Actions log for detailed error messages:

1. Go to failed workflow run
2. Click on "Push Template" step
3. Review Terraform/Coder error messages

### Force Deploy

To force a template update without code changes:

1. Use "workflow_dispatch" (manual trigger)
2. Or make a minor change to `.coder/build.yaml` (add comment)

## Security

- ✅ Token stored as encrypted GitHub Secret
- ✅ Token only accessible to this repository
- ✅ Workflow runs in isolated GitHub-hosted runners
- ✅ Token never appears in logs (automatically masked)
- ⚠️ Rotate token annually for security

## Benefits

- 🚀 **Automatic deployment** - No manual `coder templates push` needed
- 🔄 **Git as source of truth** - Template always matches repository
- 📝 **Audit trail** - All changes tracked in Git history
- ✅ **CI validation** - Catches errors before users see them
- 🎯 **Consistency** - Same deployment process every time
