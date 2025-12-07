#!/bin/bash
# Setup script for SonarQube MCP Server
# This script builds and installs the SonarQube MCP server for Claude Code

set -e

MCP_DIR="$HOME/.local/share/mcp-servers"
JAR_NAME="sonarqube-mcp-server.jar"
REPO_URL="https://github.com/SonarSource/sonarqube-mcp-server.git"
REQUIRED_JAVA_VERSION="21"

echo "Setting up SonarQube MCP Server for Claude Code..."

# Check for Java 21+
check_java() {
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge "$REQUIRED_JAVA_VERSION" ] 2>/dev/null; then
            echo "Found Java $JAVA_VERSION"
            return 0
        fi
    fi

    # Check for JAVA_HOME with JDK 21+
    if [ -n "$JAVA_HOME" ]; then
        JAVA_VERSION=$("$JAVA_HOME/bin/java" -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge "$REQUIRED_JAVA_VERSION" ] 2>/dev/null; then
            echo "Found Java $JAVA_VERSION at JAVA_HOME"
            return 0
        fi
    fi

    # macOS: Check for installed JDKs
    if [ -x /usr/libexec/java_home ]; then
        JAVA21_HOME=$(/usr/libexec/java_home -v 21 2>/dev/null || true)
        if [ -n "$JAVA21_HOME" ]; then
            export JAVA_HOME="$JAVA21_HOME"
            echo "Found Java 21 at $JAVA_HOME"
            return 0
        fi
    fi

    echo "Error: Java 21 or higher is required but not found."
    echo "Please install JDK 21+ and try again."
    exit 1
}

# Create directories
mkdir -p "$MCP_DIR/storage"

# Check if JAR already exists
if [ -f "$MCP_DIR/$JAR_NAME" ]; then
    echo "SonarQube MCP server JAR already exists at $MCP_DIR/$JAR_NAME"
    read -p "Do you want to rebuild? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping build. Setup complete."
        exit 0
    fi
fi

check_java

# Clone and build
TEMP_DIR=$(mktemp -d)
echo "Cloning SonarQube MCP server repository..."
git clone --depth 1 "$REPO_URL" "$TEMP_DIR/sonarqube-mcp-server"

echo "Building SonarQube MCP server (this may take a few minutes)..."
cd "$TEMP_DIR/sonarqube-mcp-server"
./gradlew clean build -x test

# Find and copy JAR
JAR_FILE=$(find build/libs -name "*.jar" -type f | head -1)
if [ -z "$JAR_FILE" ]; then
    echo "Error: Build failed - JAR file not found"
    exit 1
fi

cp "$JAR_FILE" "$MCP_DIR/$JAR_NAME"
echo "Installed JAR to $MCP_DIR/$JAR_NAME"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your SonarQube token as an environment variable:"
echo "   export SONARQUBE_TOKEN=your_token_here"
echo ""
echo "2. Add to your shell profile (~/.bashrc, ~/.zshrc, etc.):"
echo "   export SONARQUBE_TOKEN=your_token_here"
echo ""
echo "3. Restart Claude Code to load the MCP server"
