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

# Pre-cache Maven dependencies (optional - speeds up first build)
# Uncomment if you want to pre-download Maven dependencies
# COPY apps/backend/pom.xml /tmp/pom.xml
# RUN cd /tmp && mvn dependency:go-offline -B

# Set working directory
WORKDIR /workspaces/SimpleAccounts-UAE

# Default command
CMD ["sleep", "infinity"]
