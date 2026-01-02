#!/bin/bash
echo "Checking Java installation..."

# Check if java command works
if command -v java &> /dev/null; then
    echo "✓ Java found in PATH"
    # Filter out JAVA_TOOL_OPTIONS message and show actual version line
    java -version 2>&1 | grep -E '(openjdk|java) version' | head -1
else
    echo "✗ Java not in PATH"
fi

# Check JAVA_HOME
if [ -n "$JAVA_HOME" ]; then
    echo "✓ JAVA_HOME is set: $JAVA_HOME"
    if [ -x "$JAVA_HOME/bin/java" ]; then
        echo "✓ Java executable found at JAVA_HOME"
        # Filter out JAVA_TOOL_OPTIONS message and show actual version line
        "$JAVA_HOME/bin/java" -version 2>&1 | grep -E '(openjdk|java) version' | head -1
    else
        echo "✗ Java executable not found at JAVA_HOME"
    fi
else
    echo "✗ JAVA_HOME not set"
fi

# Try to find Java using java_home
if [ -x /usr/libexec/java_home ]; then
    echo ""
    echo "Available Java versions:"
    /usr/libexec/java_home -V 2>&1 | grep -E "Java|jdk|jre" | head -5 || echo "No Java versions found via java_home"
    
    # Try Java 21
    JAVA_21=$(/usr/libexec/java_home -v 21 2>/dev/null)
    if [ -n "$JAVA_21" ]; then
        echo "✓ Java 21 found at: $JAVA_21"
    else
        echo "✗ Java 21 not found"
    fi
    
    # Try Java 17
    JAVA_17=$(/usr/libexec/java_home -v 17 2>/dev/null)
    if [ -n "$JAVA_17" ]; then
        echo "✓ Java 17 found at: $JAVA_17"
    else
        echo "✗ Java 17 not found"
    fi
fi
