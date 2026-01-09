# SimpleAccounts-UAE Development Container
# Base image with Node 20 and Java 21 for full-stack development

FROM mcr.microsoft.com/devcontainers/java:21-bookworm

# Install Node.js 20
ARG NODE_VERSION="20"
RUN su vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"

# ============================================
# INSTALL TOOLS (baked in for faster startup)
# ============================================

# Install Docker CLI, Docker Compose, GitHub CLI, and System Dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
    # Docker Setup
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list \
    # GitHub CLI Setup
    && curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
    # Google Cloud CLI Setup
    && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list \
    # Kubernetes CLI Setup
    && curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | gpg --dearmor -o /usr/share/keyrings/kubernetes-apt-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /" > /etc/apt/sources.list.d/kubernetes.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends \
        direnv \
        docker-ce-cli \
        docker-compose-plugin \
        gh \
        google-cloud-cli \
        kubectl \
        postgresql-client \
        redis-tools \
        chromium \
        chromium-driver \
        fonts-liberation \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcups2 \
        libdbus-1-3 \
        libdrm2 \
        libgbm1 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libx11-xcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxfixes3 \
        libxrandr2 \
        xdg-utils \
        # Playwright / WebKit / Firefox dependencies
        gstreamer1.0-libav \
        gstreamer1.0-plugins-bad \
        gstreamer1.0-plugins-base \
        gstreamer1.0-plugins-good \
        hunspell-en-us \
        libavcodec59 \
        libavformat59 \
        libavutil57 \
        libenchant-2-2 \
        libsecret-1-0 \
        libhyphen0 \
        libmanette-0.2-0 \
        libgles2 \
        libopus0 \
        libwebpdemux2 \
        libwoff1 \
        libharfbuzz-icu0 \
        libevdev2 \
        libnotify4 \
        libflite1 \
        # VNC packages for browser testing and UI preview
        xvfb \
        x11vnc \
        novnc \
        websockify \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Set Playwright browsers path for consistent caching
ENV PLAYWRIGHT_BROWSERS_PATH=/home/vscode/.cache/ms-playwright

# VNC configuration
ENV DISPLAY=:99
ENV VNC_PORT=5900
ENV NOVNC_PORT=6080

# Create index.html redirect for noVNC (Coder subdomain apps request / instead of /vnc.html)
RUN echo '<!DOCTYPE html>\n\
<html>\n\
<head>\n\
    <meta charset="utf-8">\n\
    <title>noVNC - Redirecting...</title>\n\
    <meta http-equiv="refresh" content="0; url=vnc.html?autoconnect=true">\n\
</head>\n\
<body>\n\
    <p>Redirecting to VNC...</p>\n\
    <p>If you are not redirected, <a href="vnc.html?autoconnect=true">click here</a>.</p>\n\
</body>\n\
</html>' > /usr/share/novnc/index.html

# Install global npm packages and AI CLI tools
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && npm install -g npm@latest" 2>&1

# NOTE: code-server is now managed by the Coder template module (see .coder/template.tf)
# This provides better integration with Coder's app system and automatic URL handling

# Install AI CLI tools (Claude, Codex, OpenAI, Gemini)
# These are pre-installed but will be updated on container start via install-cli-tools.sh
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && \
    npm install -g @anthropic-ai/claude-code 2>/dev/null || true && \
    npm install -g @openai/codex 2>/dev/null || true && \
    npm install -g openai 2>/dev/null || true && \
    npm install -g @google/gemini-cli 2>/dev/null || true" 2>&1

# Install SonarQube MCP Server for code quality integration
# Pin version for reproducibility - update version to get newer releases
ARG SONARQUBE_MCP_VERSION="1.5.0.1706"
RUN mkdir -p /home/vscode/.local/share/mcp-servers/storage \
    && curl -fsSL -o /home/vscode/.local/share/mcp-servers/sonarqube-mcp-server.jar \
       "https://github.com/SonarSource/sonarqube-mcp-server/releases/download/${SONARQUBE_MCP_VERSION}/sonarqube-mcp-server-${SONARQUBE_MCP_VERSION}.jar" \
    && echo "${SONARQUBE_MCP_VERSION}" > /home/vscode/.local/share/mcp-servers/sonarqube-mcp-server.version \
    && chown -R vscode:vscode /home/vscode/.local

# Create symlinks in /usr/local/bin for npm global packages
# This ensures CLI tools are in PATH regardless of NVM sourcing
RUN NVM_BIN=$(su vscode -c "source /usr/local/share/nvm/nvm.sh && echo \$(npm prefix -g)/bin") && \
    for tool in claude codex gemini openai; do \
        if [ -x "$NVM_BIN/$tool" ]; then \
            ln -sf "$NVM_BIN/$tool" /usr/local/bin/$tool; \
        fi; \
    done

# Copy CLI tools update script
COPY --chown=vscode:vscode .devcontainer/install-cli-tools.sh /usr/local/bin/install-cli-tools
RUN chmod +x /usr/local/bin/install-cli-tools

# Copy VNC startup script
COPY --chown=vscode:vscode .devcontainer/start-vnc.sh /usr/local/bin/start-vnc
RUN chmod +x /usr/local/bin/start-vnc

# Provide Cursor CLI shim in PATH (resolves actual binary at runtime)
COPY --chown=vscode:vscode .devcontainer/cursor-cli.sh /usr/local/bin/cursor
RUN chmod +x /usr/local/bin/cursor && ln -sf /usr/local/bin/cursor /usr/local/bin/cursor-agent

# ============================================ 
# PRE-CACHE DEPENDENCIES
# ============================================ 

USER vscode

# Pre-cache Maven dependencies
# Copy pom.xml, Maven wrapper, and .mvn directory
WORKDIR /tmp/backend
COPY --chown=vscode:vscode apps/backend/pom.xml apps/backend/mvnw ./
COPY --chown=vscode:vscode apps/backend/.mvn .mvn
# Download dependencies to ~/.m2/repository
# Uses Maven wrapper since Maven is not pre-installed in the base image
# Note: Uses dependency:resolve instead of go-offline to avoid HTTP repository blocking issues
# Create wrapper dist directory first (older wrapper versions don't create parent dirs)
# Allow partial caching if some dependencies fail (|| true)
RUN mkdir -p ~/.m2/wrapper/dists && chmod +x mvnw && ./mvnw dependency:resolve -B -q || true

# Pre-cache NPM dependencies
# Note: Using npm install with fallback to allow partial caching if lockfiles are out of sync
WORKDIR /tmp/root
COPY --chown=vscode:vscode package.json package-lock.json ./
RUN . /usr/local/share/nvm/nvm.sh && (npm ci --ignore-scripts || npm install --ignore-scripts || true)

WORKDIR /tmp/frontend
COPY --chown=vscode:vscode apps/frontend/package.json apps/frontend/package-lock.json apps/frontend/.npmrc* ./
RUN . /usr/local/share/nvm/nvm.sh && (npm ci --legacy-peer-deps --ignore-scripts || npm install --legacy-peer-deps --ignore-scripts || true)

# Install Playwright browsers (baked into image for faster test execution)
# This prevents the need to run 'npx playwright install' every time tests run
RUN . /usr/local/share/nvm/nvm.sh && npx playwright install chromium

# Clean up temp directories
USER root
RUN rm -rf /tmp/backend /tmp/root /tmp/frontend

# Pre-create user directories to avoid permission issues in post-create
USER vscode
RUN mkdir -p ~/.m2/repository ~/.m2/wrapper/dists ~/.npm ~/.cache/ms-playwright \
    && chmod -R 755 ~/.m2 ~/.npm ~/.cache

# Note: code-server and vscode-server directories are created in entrypoint.sh
# as root to avoid permission issues during image build

# Reset working directory and user
USER root
WORKDIR /workspaces

# Copy and set up entrypoint script (runs as root to fix permissions)
COPY --chown=root:root .devcontainer/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Keep container running as root by default
# The entrypoint will fix permissions then switch to vscode user
# This ensures automated permission fixing on every container start

# Set entrypoint and default command
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["sleep", "infinity"]
