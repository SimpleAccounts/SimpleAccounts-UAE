#!/bin/bash

# Detect Java 21 dynamically - supports multiple platforms and installation methods
# Priority: JAVA_HOME env var > Maven wrapper > system Java > common install locations

if [ -n "$JAVA_HOME" ]; then
  # Use JAVA_HOME if already set
  JAVA_BIN="$JAVA_HOME/bin/java"
elif [ -f "apps/backend/mvnw" ] || [ -f "./mvnw" ]; then
  # Try to get Java from Maven wrapper
  if command -v java &> /dev/null; then
    JAVA_BIN=$(command -v java)
  else
    JAVA_BIN="java"
  fi
elif command -v java &> /dev/null; then
  # Use system Java
  JAVA_BIN=$(command -v java)
else
  # Try common installation locations (macOS Homebrew, Linux SDKMAN, etc.)
  if [ -d "/opt/homebrew/opt/openjdk@21" ]; then
    # macOS Homebrew OpenJDK 21
    export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
    JAVA_BIN="$JAVA_HOME/bin/java"
  elif [ -d "/usr/lib/jvm/java-21-openjdk" ]; then
    # Linux OpenJDK 21
    export JAVA_HOME="/usr/lib/jvm/java-21-openjdk"
    JAVA_BIN="$JAVA_HOME/bin/java"
  elif [ -d "$HOME/.sdkman/candidates/java/current" ]; then
    # SDKMAN installation
    export JAVA_HOME="$HOME/.sdkman/candidates/java/current"
    JAVA_BIN="$JAVA_HOME/bin/java"
  else
    echo "Error: Java 21 not found. Please install Java 21 or set JAVA_HOME." >&2
    exit 1
  fi
fi

# Verify Java version is 21
JAVA_VERSION=$($JAVA_BIN -version 2>&1 | head -n 1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)
if [ "$JAVA_VERSION" != "21" ]; then
  echo "Warning: Expected Java 21, but found Java $JAVA_VERSION. Continuing anyway..." >&2
fi

# Ensure google-java-format is in the PATH or provide its full path if necessary
# Assuming google-java-format is a command in the system's PATH
google-java-format "$@"
