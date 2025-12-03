#!/bin/bash

# Set Java 11 for compatibility with this legacy project
export JAVA_HOME=$(/usr/libexec/java_home -v 11 2>/dev/null || echo "$JAVA_HOME")

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run Spring Boot application (use mvn if mvnw not available)
if [ -f ./mvnw ]; then
    ./mvnw spring-boot:run
else
    mvn spring-boot:run
fi
