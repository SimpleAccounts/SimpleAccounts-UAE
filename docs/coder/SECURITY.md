# Security Considerations

This document outlines security considerations for the Coder workspace environment.

## Docker Socket Access

### Overview

The workspace container has access to the Docker socket (`/var/run/docker.sock`) to enable Docker-in-Docker workflows for testing and deployment tasks.

**Mount Configuration:**

```terraform
# .coder/template.tf
volumes {
  host_path      = "/var/run/docker.sock"
  container_path = "/var/run/docker.sock"
}
```

### Security Implications

⚠️ **CRITICAL**: Mounting the Docker socket gives the container **full control over the Docker host**.

**What this means:**

- Container can create/stop/delete ANY container on the host
- Container can mount ANY host directory
- Container can escape to the host system
- Container can read secrets from other containers
- Container has root-equivalent access to the host

### Risk Mitigation

✅ **Current Mitigations:**

1. **Trusted Users Only**
   - Only authenticated GitHub users with organization access can create workspaces
   - User identities are tracked in workspace names

2. **Isolated Networks**
   - Each workspace has its own Docker network
   - No direct network access between workspaces

3. **Resource Limits**
   - CPU and RAM limits prevent resource exhaustion
   - Auto-stop after 30 minutes reduces exposure window

4. **Audit Trail**
   - Coder logs all workspace creation/deletion events
   - Container logs are available for forensics

### Why Docker Socket is Needed

This workspace requires Docker socket access for:

- **Docker Compose** - Starting/stopping development services
- **Integration Testing** - Running Testcontainers for database tests
- **CI/CD Workflows** - Building and testing Docker images locally
- **Deployment Tasks** - Testing deployment scripts before production

### Alternatives Considered

#### Option 1: Docker-in-Docker (dind)

```terraform
# Run Docker daemon inside container
resource "docker_container" "dind" {
  image      = "docker:dind"
  privileged = true
}
```

**Pros:** Better isolation, no host access
**Cons:**

- Requires privileged mode (still insecure)
- Performance overhead (nested virtualization)
- Complex networking setup
- Larger disk usage

**Decision:** Not implemented due to complexity vs. security tradeoff

#### Option 2: Rootless Docker

```bash
# Run Docker without root privileges
dockerd-rootless.sh
```

**Pros:** Non-root Docker daemon
**Cons:**

- Limited feature support (no overlay2, etc.)
- Complex setup
- Performance limitations

**Decision:** Not implemented due to feature limitations

#### Option 3: Remove Docker Access

**Pros:** Most secure option
**Cons:** Breaks development workflows requiring Docker

**Decision:** Not viable for this use case

### Best Practices for Users

If you need to work in a Coder workspace:

1. **Never run untrusted code** in the workspace
2. **Review Dockerfiles** before building images
3. **Validate docker-compose.yml** files before running them
4. **Use `.dockerignore`** to prevent sensitive files in images
5. **Don't store secrets** in Docker images (use environment variables)
6. **Report suspicious activity** to your administrator

### Monitoring & Incident Response

**If you suspect compromise:**

1. **Immediately stop the workspace** in Coder dashboard
2. **Contact your administrator** with workspace ID
3. **Check Docker logs** for suspicious activity:
   ```bash
   # On host
   docker logs coder-<user>-<workspace>
   ```
4. **Review recent commands** in workspace:
   ```bash
   cat ~/.bash_history
   ```

### Administrator Recommendations

For production deployments, consider:

1. **Network Policies**
   - Implement iptables rules to restrict workspace network access
   - Use Docker network plugins for enhanced isolation

2. **Audit Logging**
   - Enable Docker audit logging: `auditd` with Docker rules
   - Forward logs to SIEM system
   - Monitor for suspicious Docker API calls

3. **Resource Quotas**
   - Enforce per-user workspace limits in Coder
   - Set disk quotas for workspace directories
   - Monitor resource usage and alert on anomalies

4. **Regular Security Reviews**
   - Review workspace creation patterns
   - Audit container images for vulnerabilities
   - Update base images monthly
   - Review user access permissions quarterly

5. **Backup & Recovery**
   - Regular backups of workspace data
   - Test restore procedures
   - Document incident response plan

### Security Scanning

All workspace images are scanned for vulnerabilities using Trivy.

**Scanning Process:**

- Runs automatically on every image build
- Fails builds on CRITICAL/HIGH vulnerabilities
- Results visible in GitHub Actions

**View scan results:**

```bash
# Manual scan
trivy image ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest
```

### Credential Management

**Database Credentials:**

- Auto-generated per workspace using Terraform `random_password`
- 32-character alphanumeric passwords
- Not stored in version control
- Available via environment variables in workspace

**Accessing database password:**

```bash
# Inside workspace
echo $POSTGRES_PASSWORD

# Or connect directly (password auto-injected)
psql -h db -U simpleaccounts -d simpleaccounts
```

**NEVER:**

- Commit passwords to Git
- Share passwords in Slack/email
- Use weak passwords like "password123"
- Reuse passwords across environments

### Network Security

**Workspace Network Architecture:**

```
Internet
    ↓
Traefik (dev-proxy-network)
    ↓
Workspace Container (coder-user-workspace network)
    ↓
    ├─ PostgreSQL (isolated)
    ├─ Redis (isolated)
    └─ No access to other workspaces
```

**Firewall Rules:**

- Workspaces can access internet for package downloads
- Workspaces CANNOT access each other
- Workspaces CANNOT access host services (except Docker socket)
- External access only via Traefik reverse proxy

### Compliance Considerations

**Data Residency:**

- All workspace data stored on `dev-server` in your infrastructure
- No data sent to Coder Inc. servers (self-hosted deployment)
- User identities from GitHub (OAuth)

**GDPR/Privacy:**

- User email addresses from GitHub OAuth
- Workspace logs may contain PII
- Database data isolated per workspace

**SOC2/ISO27001:**

- Audit logs available in Coder
- Access controls via GitHub organization membership
- Encryption at rest: depends on host filesystem
- Encryption in transit: HTTPS via Traefik

### Reporting Security Issues

Found a security vulnerability? Please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. **Email:** security@simpleaccounts.com
3. **Include:**
   - Detailed description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We aim to respond within 24 hours and patch critical issues within 7 days.

---

**Last Updated:** 2025-12-31
**Next Review:** 2026-01-31
