# Lessons Learned

This document captures important lessons learned during development to prevent recurring issues.

---

## Table of Contents

1. [History Package Version Mismatch](#1-history-package-version-mismatch)
2. [Apache POI / Java 17 Compatibility](#2-apache-poi--java-17-compatibility)
3. [SonarQube SSL Configuration in Coolify](#3-sonarqube-ssl-configuration-in-coolify)
4. [Java Dependency Version Validity & API Stability](#4-java-dependency-version-validity--api-stability)
5. [DevPod SSH Authentication Failures](#5-devpod-ssh-authentication-failures)
6. [Traefik Multi-Network Container Routing](#6-traefik-multi-network-container-routing)
7. [Vite External Host Access (403 Forbidden)](#7-vite-external-host-access-403-forbidden)

---

## 1. History Package Version Mismatch

**Date:** December 2025

**Issue:** Page navigation stopped working after React 18 upgrade - clicking on menu items or links did not navigate to new pages.

**Root Cause:**
The `history` package was upgraded from `^4.10.1` to `^5.3.0` as part of dependency updates. However, `react-router-dom` v5.x is only compatible with `history` v4.x, not v5.x.

**Symptoms:**

- Clicking navigation links did not change the page
- No errors in console (silent failure)
- URL might change but component did not re-render
- Browser back/forward buttons didn't work correctly

**Technical Details:**

- `history` v5.x introduced breaking changes in its API
- `react-router-dom` v5.x uses `history.listen()` with a different signature than v5.x provides
- In history v4.x: `history.listen((location, action) => {})`
- In history v5.x: `history.listen(({ location, action }) => {})`

**Solution:**
Downgrade the history package from v5.x to v4.x:

```json
// package.json
{
  "dependencies": {
    "history": "^4.10.1", // NOT "^5.3.0"
    "react-router-dom": "^5.3.4"
  }
}
```

**Prevention:**

1. When upgrading React Router, check the required `history` version in its peer dependencies
2. Only upgrade to `history` v5.x when also upgrading to `react-router-dom` v6.x
3. Test navigation thoroughly after any routing-related package updates
4. Review the compatibility matrix before upgrading interdependent packages

**Related Packages:**

- `react-router-dom`: v5.3.4
- `history`: v4.10.1 (required for react-router-dom v5.x)
- `react-router`: v5.3.4

**References:**

- [React Router v5 to v6 Migration Guide](https://reactrouter.com/en/main/upgrading/v5)
- [History Package Changelog](https://github.com/remix-run/history/blob/main/CHANGES.md)

---

## 2. Apache POI / Java 17 Compatibility

**Date:** December 2025

**Issue:** Excel-related tests fail in CI with `ClassCastException` when writing and reading back Excel files.

**Root Cause:**
Apache POI's `ZipSecureFile` class has compatibility issues with Java 17's module system. When writing an Excel file to a temp file and then reading it back using `WorkbookFactory.create()`, a ClassCastException occurs.

**Error Message:**

```
org.apache.poi.openxml4j.exceptions.OpenXML4JRuntimeException: Fail to save:
class org.apache.poi.openxml4j.util.ZipSecureFile$ThresholdInputStream cannot be cast to
class java.util.zip.ZipFile$ZipFileInputStream
```

**Affected Tests:**

- `ExcelUtilTest.testGetDataFromExcel`
- `ExcelParserTest.testReadExcelWithWorkbookFactory`

**Temporary Solution:**
Tests that write-then-read Excel files are skipped with `@Ignore` annotation in CI.

**Permanent Solution (TODO):**

1. Upgrade Apache POI to version 5.2.3+ which has better Java 17 support
2. Or use `try-with-resources` properly and ensure workbook is closed before reading
3. Consider using `SXSSFWorkbook` for streaming operations

**Prevention:**

- Test Excel operations with the same Java version used in CI
- Keep Apache POI updated to latest stable version
- Review POI release notes when upgrading Java versions

---

## 3. SonarQube SSL Configuration in Coolify

**Date:** December 2025

**Issue:** SonarQube analysis fails in GitHub Actions with SSL certificate hostname verification errors.

**Root Cause:**
When SonarQube is deployed via Coolify, Traefik (the reverse proxy) may serve its default self-signed certificate instead of a valid Let's Encrypt certificate. This happens when:

- The domain is not properly configured for SSL in Coolify
- Let's Encrypt challenge fails silently
- The service is accessed before SSL provisioning completes

**Error Message:**

```
Failed to query server version: Hostname sonar-xxx.sslip.io not verified:
    certificate: sha256/...
    DN: CN=TRAEFIK DEFAULT CERT
    subjectAltNames: [xxx.traefik.default]
```

**Current Workaround:**
The workflow continues despite SSL errors (`|| true`), but analysis doesn't upload.

**Permanent Solution (TODO):**

1. In Coolify, configure the SonarQube service:
   - Enable "Generate SSL" or "Let's Encrypt"
   - Ensure the domain resolves correctly
   - Wait for SSL certificate provisioning before using
2. Alternatively, use HTTP instead of HTTPS for internal CI communication
3. Or configure a custom SSL certificate

**Prevention:**

- Verify SSL certificate is valid before configuring CI/CD tools
- Use `curl -v https://your-domain` to check SSL configuration
- Monitor Coolify/Traefik logs for Let's Encrypt errors

---

## 4. Java Dependency Version Validity & API Stability

**Date:** December 2025

**Issue:** Backend tests failed with `NoSuchMethodError` for `commons-csv` and potential resolution issues for `commons-lang3` in CI environments.

**Root Cause:**

1. **Non-Existent Version:** `commons-csv` was bumped to `1.14.1` in `pom.xml`. As of 2025, the latest stable version is `1.13.0`. Specifying a non-existent version caused Maven to potentially fallback to an ancient transitive version (pre-1.3) which lacked newer methods like `withFirstRecordAsHeader()`.
2. **Deprecated API Usage:** The codebase used the deprecated `new CSVParser(...)` constructor, which is fragile across versions.
3. **Bleeding Edge Version:** `commons-lang3` was set to `3.20.0` (very recent). While valid, bleeding-edge versions may not yet be available in all CI/CD Maven mirrors, leading to sporadic build failures.

**Error Message:**

```
java.lang.NoSuchMethodError: org.apache.commons.csv.CSVFormat.withFirstRecordAsHeader()Lorg/apache/commons/csv/CSVFormat;
```

**Solution:**

1. **Downgrade to Stable:** Downgraded `commons-csv` to `1.10.0` and `commons-lang3` to `3.14.0` (proven stable versions).
2. **Refactor to Factory Methods:** Updated code to use the modern, non-deprecated API:

   ```java
   // OLD (Deprecated)
   CSVParser parser = new CSVParser(reader, CSVFormat.EXCEL);

   // NEW (Recommended)
   CSVParser parser = CSVFormat.EXCEL.parse(reader);
   ```

**Prevention:**

1. **Verify Versions:** Always verify a library version exists in Maven Central before adding it to `pom.xml`. Do not guess versions.
2. **Prefer Stable:** For core libraries (commons-\*, guava, etc.), prefer versions that have been out for at least a few months unless a specific bugfix/feature is needed.
3. **Address Deprecations:** Resolve deprecation warnings (`new CSVParser`) proactively to avoid breakage when libraries are eventually upgraded.
4. **Local vs CI:** If a build passes locally but fails in CI, check for version mismatches or mirrors not yet having the latest artifacts.

---

## 5. DevPod SSH Authentication Failures

**Date:** December 2025

**Issue:** DevPod workspace creation gets stuck indefinitely on "Waiting for devpod agent to come up..." and eventually fails with SSH authentication errors.

**Root Cause:**
Multiple SSH keys loaded in the ssh-agent cause the SSH server to reject the connection before finding the correct key. The server's `MaxAuthTries` limit (typically 6) is exceeded when DevPod tries each key in the agent sequentially.

**Error Messages:**

```
Too many authentication failures
Disconnected from 65.108.51.136 port 22

# Or after clearing agent:
moshinhashmi@65.108.51.136: Permission denied (publickey,password).
```

**Symptoms:**

- DevPod repeatedly shows "Waiting for devpod agent to come up..."
- Debug mode (`--debug`) reveals "Too many authentication failures"
- SSH works fine from terminal but DevPod fails
- The issue persists even after configuring `IdentitiesOnly yes` in SSH config

**Technical Details:**

1. DevPod by default adds ALL private keys from `~/.ssh/` to the ssh-agent before connecting
2. Even with `IdentitiesOnly yes` in SSH config, the ssh-agent keys are tried first
3. With 6+ keys in the agent, the server rejects before the correct key is tried
4. DevPod also needs SSH agent forwarding enabled for git operations on the remote

**Solution:**

1. **Disable DevPod's automatic key loading:**

   ```bash
   devpod context set-options -o SSH_ADD_PRIVATE_KEYS=false
   ```

2. **Add `ForwardAgent yes` to SSH config for git credential forwarding:**

   ```
   Host dev-server
       HostName 65.108.51.136
       User mohsin
       IdentityFile ~/.ssh/id_ed25519
       IdentitiesOnly yes
       ForwardAgent yes
       ServerAliveInterval 30
       ServerAliveCountMax 3
       TCPKeepAlive yes
   ```

3. **Manually manage ssh-agent keys - load only required keys:**

   ```bash
   # Clear all keys
   ssh-add -D

   # Add only the key for the dev server
   ssh-add ~/.ssh/id_ed25519

   # Add GitHub key for git operations (will be forwarded)
   ssh-add ~/.ssh/id_rsa_personal

   # Verify only 2 keys are loaded
   ssh-add -l
   ```

4. **Clean up and recreate the workspace:**

   ```bash
   # Delete the stuck workspace
   devpod delete <workspace-name> --force

   # Clean up remote containers if needed
   ssh dev-server "docker ps -a --format '{{.Names}}' | xargs -r docker rm -f"

   # Pull latest image
   ssh dev-server "docker pull ghcr.io/simpleaccounts/simpleaccounts-uae-devcontainer:latest"

   # Create fresh workspace from current directory
   devpod up . --provider ssh --ide cursor --id simpleaccounts-uae
   ```

**Prevention:**

1. Always set `SSH_ADD_PRIVATE_KEYS=false` in DevPod context when using multiple SSH keys
2. Configure `ForwardAgent yes` in SSH config for hosts where you need git access
3. Keep only necessary keys in ssh-agent (2-3 max)
4. Use explicit `IdentityFile` and `IdentitiesOnly yes` in SSH config
5. When DevPod hangs on agent startup, use `--debug` flag to see the actual error

**DevPod Configuration Reference:**

```bash
# View current SSH provider options
devpod provider options ssh

# Update SSH provider with specific flags (if needed)
devpod provider update ssh -o EXTRA_FLAGS="-o IdentitiesOnly=yes"

# List workspaces
devpod list

# Delete workspace with force
devpod delete <name> --force
```

**Related Commands:**

```bash
# Check ssh-agent keys
ssh-add -l

# Clear all keys from agent
ssh-add -D

# Add specific key
ssh-add ~/.ssh/id_ed25519

# Test SSH connection with verbose output
ssh -v dev-server "echo OK"

# Test SSH agent forwarding
ssh -A dev-server "ssh -T git@github.com"
```

---

## 6. Traefik Multi-Network Container Routing

**Date:** December 2025

**Issue:** External URLs via Traefik return 504 Gateway Timeout, even though services are running inside the container and Traefik shows them as "UP".

**Root Cause:**
When a Docker container is connected to multiple networks, Traefik may pick the wrong network IP to route traffic. Traefik selects the first network alphabetically unless explicitly configured.

**Symptoms:**

- Traefik API shows services as "UP" with an IP address
- Requests via Traefik timeout (504 Gateway Timeout)
- Direct container access works fine
- Container is on multiple Docker networks

**Example Scenario:**

```
Container dev-mohsin:
  - mohsin-internal: 172.18.0.4  (internal network for db/redis)
  - dev-proxy-network: 172.19.0.3  (Traefik's network)

Traefik incorrectly tries to route to 172.18.0.4 (wrong network)
```

**Solution:**

Add the `traefik.docker.network` label to specify which network Traefik should use:

```yaml
# docker-compose.yml
services:
  devcontainer:
    labels:
      - 'traefik.enable=true'
      - 'traefik.docker.network=dev-proxy-network' # Add this line!
      - 'traefik.http.routers.myapp.rule=Host(`myapp.example.com`)'
      - 'traefik.http.services.myapp.loadbalancer.server.port=3000'
```

After adding the label, restart both the container and Traefik:

```bash
docker restart my-container
docker restart traefik
```

**Prevention:**

1. Always add `traefik.docker.network` label when containers are on multiple networks
2. Keep the Traefik proxy network consistent across all services
3. Verify the correct IP is shown in Traefik dashboard after changes
4. When debugging, check `docker inspect <container>` to see all network IPs

**Verification:**

```bash
# Check Traefik is using correct IP
curl -s http://localhost:8090/api/http/services | python3 -c \
  'import json,sys; [print(s["name"], s.get("serverStatus",{})) for s in json.load(sys.stdin)]'

# Should show the dev-proxy-network IP, not internal network IP
```

---

## 7. Vite External Host Access (403 Forbidden)

**Date:** December 2025

**Issue:** Vite dev server returns 403 Forbidden when accessed via external proxy (Traefik) or non-localhost hostname.

**Root Cause:**
Vite 5+ has stricter security defaults that reject requests from unknown hosts. Even with `--host 0.0.0.0`, Vite validates the `Host` header and blocks requests that don't match localhost or allowed patterns.

**Error Message:**

- HTTP 403 Forbidden response
- No error in Vite logs (silent rejection)

**Symptoms:**

- `curl localhost:3000` works
- `curl external-url.dev.simpleaccounts.io` returns 403
- No CORS errors (not a CORS issue)
- Traefik shows service as UP

**Solution:**

Add `allowedHosts` with a restricted allowlist to the Vite server configuration:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    port: 3000,
    host: true, // Listen on all interfaces
    allowedHosts: ['localhost', '.nip.io', '.dev.simpleaccounts.local', '.dev.simpleaccounts.io'], // Restrict to known hosts
  },
});
```

**Security Note:** Avoid using `allowedHosts: true` as it disables Vite's host-header check, which mitigates DNS rebinding attacks. Always use a specific allowlist.

**Common patterns:**

- `.dev.simpleaccounts.io` - for production dev URLs with valid SSL (e.g., `alice.dev.simpleaccounts.io`)
- `.nip.io` - for dynamic IP-based URLs (e.g., `user.65-108-51-136.nip.io`) - legacy
- `.dev.simpleaccounts.local` - for local domain routing
- `localhost` - for local development

**Prevention:**

1. When setting up proxy access, always configure `allowedHosts` in Vite
2. Use wildcard patterns for dynamic subdomains (e.g., `.dev.simpleaccounts.io`)
3. Document the required Vite configuration for external access
4. Test with the actual external URL during development setup

**Note:** This is a security feature. In production, Vite's dev server should not be exposed - use a proper build instead.

---

_Add new lessons learned above this line, following the same format._
