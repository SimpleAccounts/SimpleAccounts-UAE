#!/bin/bash

# Set JAVA_HOME to the specific OpenJDK 19 installation
export JAVA_HOME="/opt/homebrew/opt/openjdk@19"

# Ensure google-java-format is in the PATH or provide its full path if necessary
# Assuming google-java-format is a command in the system's PATH
google-java-format "$@"
