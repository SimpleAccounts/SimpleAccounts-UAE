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
    && apt-get update \
    && apt-get -y install --no-install-recommends \
        docker-ce-cli \
        docker-compose-plugin \
        gh \
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
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Set Playwright to use system Chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

# Install global npm packages
RUN su vscode -c "source /usr/local/share/nvm/nvm.sh && npm install -g npm@latest" 2>&1

# ============================================ 
# PRE-CACHE DEPENDENCIES
# ============================================ 

USER vscode

# Pre-cache Maven dependencies
# Copy pom.xml files (and parent poms if needed) to a temp directory
WORKDIR /tmp/backend
COPY --chown=vscode:vscode apps/backend/pom.xml .
# Run go-offline to download dependencies to ~/.m2/repository
RUN mvn dependency:go-offline -B -q

# Pre-cache NPM dependencies
WORKDIR /tmp/root
COPY --chown=vscode:vscode package.json package-lock.json ./
RUN . /usr/local/share/nvm/nvm.sh && npm ci --ignore-scripts

WORKDIR /tmp/frontend
COPY --chown=vscode:vscode apps/frontend/package.json apps/frontend/package-lock.json apps/frontend/.npmrc* ./
RUN . /usr/local/share/nvm/nvm.sh && npm ci --legacy-peer-deps --ignore-scripts

# Clean up temp directories
USER root
RUN rm -rf /tmp/backend /tmp/root /tmp/frontend

# Reset working directory
WORKDIR /workspaces

# Default command
CMD ["sleep", "infinity"]