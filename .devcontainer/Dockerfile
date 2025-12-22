# SimpleAccounts-UAE Development Container
# Base image with Node 20 and Java 21 for full-stack development

FROM mcr.microsoft.com/devcontainers/java:21-bookworm

# Install Node.js 20
ARG NODE_VERSION="20"
RUN su vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install ${NODE_VERSION} 2>&1"

# Install additional system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
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
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Set Playwright to use system Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

# Install global npm packages
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && npm install -g npm@latest" 2>&1

# ============================================
# PRE-CACHE DEPENDENCIES FOR FASTER STARTUP
# ============================================

# Create cache directories
RUN mkdir -p /home/vscode/.npm-cache /home/vscode/.m2-cache \
    && chown -R vscode:vscode /home/vscode/.npm-cache /home/vscode/.m2-cache

# --- NPM Dependencies ---
# Copy package files for dependency caching
COPY --chown=vscode:vscode package*.json /tmp/deps/
COPY --chown=vscode:vscode apps/frontend/package*.json /tmp/deps/apps/frontend/

# Install root npm dependencies
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && cd /tmp/deps && npm install" 2>&1

# Install frontend npm dependencies
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && cd /tmp/deps/apps/frontend && npm install --legacy-peer-deps" 2>&1

# --- Maven Dependencies ---
# Copy pom.xml for Maven dependency caching
COPY --chown=vscode:vscode apps/backend/pom.xml /tmp/deps/apps/backend/
COPY --chown=vscode:vscode apps/backend/.mvn /tmp/deps/apps/backend/.mvn/
COPY --chown=vscode:vscode apps/backend/mvnw /tmp/deps/apps/backend/

# Download Maven dependencies
RUN cd /tmp/deps/apps/backend \
    && chmod +x mvnw \
    && ./mvnw dependency:go-offline -B -q || true

# Move cached dependencies to persistent locations
RUN cp -r /tmp/deps/node_modules /home/vscode/.npm-cache/root-node_modules 2>/dev/null || true \
    && cp -r /tmp/deps/apps/frontend/node_modules /home/vscode/.npm-cache/frontend-node_modules 2>/dev/null || true \
    && chown -R vscode:vscode /home/vscode/.npm-cache /home/vscode/.m2

# Cleanup temp files
RUN rm -rf /tmp/deps

# ============================================
# END DEPENDENCY CACHING
# ============================================

# Set working directory
WORKDIR /workspaces/SimpleAccounts-UAE

# Default command
CMD ["sleep", "infinity"]
