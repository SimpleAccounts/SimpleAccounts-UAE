#!/bin/bash
# Wrapper script to run SonarQube MCP server with correct Java version

# Find Java 21+
find_java21() {
    # Check JAVA_HOME first
    if [ -n "$JAVA_HOME" ]; then
        JAVA_VERSION=$("$JAVA_HOME/bin/java" -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$JAVA_VERSION" -ge 21 ] 2>/dev/null; then
            echo "$JAVA_HOME/bin/java"
            return 0
        fi
    fi

    # macOS: Use java_home utility
    if [ -x /usr/libexec/java_home ]; then
        JAVA21_HOME=$(/usr/libexec/java_home -v 21 2>/dev/null)
        if [ -n "$JAVA21_HOME" ]; then
            echo "$JAVA21_HOME/bin/java"
            return 0
        fi
    fi

    # Linux: Check common locations
    for java_path in /usr/lib/jvm/java-21-*/bin/java /usr/lib/jvm/temurin-21-*/bin/java; do
        if [ -x "$java_path" ]; then
            echo "$java_path"
            return 0
        fi
    done

    # Fallback to PATH
    echo "java"
}

JAVA_CMD=$(find_java21)
JAR_PATH="${HOME}/.local/share/mcp-servers/sonarqube-mcp-server.jar"

if [ ! -f "$JAR_PATH" ]; then
    echo "Error: SonarQube MCP server JAR not found at $JAR_PATH" >&2
    echo "Run: ./scripts/setup-mcp-sonarqube.sh" >&2
    exit 1
fi

exec "$JAVA_CMD" -jar "$JAR_PATH"
