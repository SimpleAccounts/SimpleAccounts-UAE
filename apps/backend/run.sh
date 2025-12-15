#!/bin/bash

set -euo pipefail

REQUIRED_JAVA_VERSION="${REQUIRED_JAVA_VERSION:-21}"

ensure_java() {
    if command -v java &> /dev/null; then
        local java_version
        java_version=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$java_version" -ge "$REQUIRED_JAVA_VERSION" ] 2>/dev/null; then
            return 0
        fi
    fi

    if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
        local java_version
        java_version=$("$JAVA_HOME/bin/java" -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$java_version" -ge "$REQUIRED_JAVA_VERSION" ] 2>/dev/null; then
            export PATH="$JAVA_HOME/bin:$PATH"
            return 0
        fi
    fi

    if [ -x /usr/libexec/java_home ]; then
        local java21_home
        java21_home=$(/usr/libexec/java_home -v "$REQUIRED_JAVA_VERSION" 2>/dev/null || true)
        if [ -n "$java21_home" ]; then
            export JAVA_HOME="$java21_home"
            export PATH="$JAVA_HOME/bin:$PATH"
            return 0
        fi
    fi

    echo "Error: Java ${REQUIRED_JAVA_VERSION}+ is required." >&2
    echo "Install Java ${REQUIRED_JAVA_VERSION}+ and try again." >&2
    exit 1
}

# Load environment variables from .env file
if [ -f "${ENV_FILE:-.env}" ]; then
    set -a
    # shellcheck disable=SC1090
    source "${ENV_FILE:-.env}"
    set +a
fi

ensure_java

# Run Spring Boot application (use mvn if mvnw not available)
if [ -f ./mvnw ]; then
    ./mvnw spring-boot:run
else
    mvn spring-boot:run
fi
