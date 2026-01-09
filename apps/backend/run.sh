#!/bin/bash

set -euo pipefail

REQUIRED_JAVA_VERSION="${REQUIRED_JAVA_VERSION:-21}"

ensure_java() {
    if command -v java &> /dev/null; then
        local java_version
        # Filter out JAVA_TOOL_OPTIONS message and get version from "openjdk version" or "java version" line
        java_version=$(java -version 2>&1 | grep -E '(openjdk|java) version' | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
        if [ "$java_version" -ge "$REQUIRED_JAVA_VERSION" ] 2>/dev/null; then
            return 0
        fi
    fi

    if [ -n "${JAVA_HOME:-}" ] && [ -x "$JAVA_HOME/bin/java" ]; then
        local java_version
        # Filter out JAVA_TOOL_OPTIONS message and get version from "openjdk version" or "java version" line
        java_version=$("$JAVA_HOME/bin/java" -version 2>&1 | grep -E '(openjdk|java) version' | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
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

# Memory settings for development
# MAVEN_OPTS controls the Maven JVM (compilation)
# spring-boot.run.jvmArguments controls the Spring Boot application JVM
export MAVEN_OPTS="${MAVEN_OPTS:--Xmx1g -XX:+UseG1GC}"
SPRING_JVM_ARGS="${SPRING_JVM_ARGS:--Xmx1g -XX:+UseG1GC}"

# Run Spring Boot application (use mvn if mvnw not available)
if [ -f ./mvnw ]; then
    ./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="$SPRING_JVM_ARGS"
else
    mvn spring-boot:run -Dspring-boot.run.jvmArguments="$SPRING_JVM_ARGS"
fi
