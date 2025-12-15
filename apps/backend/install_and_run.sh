#!/bin/bash
set -e

echo "========================================="
echo "Backend Setup and Start Script"
echo "========================================="
echo ""

# Check if Homebrew is installed
if command -v brew &> /dev/null; then
    echo "✓ Homebrew found"
    echo ""
    echo "To install Java 21, run:"
    echo "  brew install openjdk@21"
    echo ""
    echo "Then set JAVA_HOME and run:"
    echo "  export JAVA_HOME=\$(/usr/libexec/java_home -v 21)"
    echo "  cd /Users/zecs/workspaces/SimpleAccounts-UAE/apps/backend"
    echo "  ./run.sh"
    echo ""
else
    echo "✗ Homebrew not found"
    echo ""
    echo "Option 1: Install Homebrew first, then Java:"
    echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    echo "  brew install openjdk@21"
    echo ""
    echo "Option 2: Download Java 21 directly:"
    echo "  Visit: https://adoptium.net/temurin/releases/?version=21"
    echo "  Download macOS installer and install it"
    echo ""
fi

echo "========================================="
echo "Current Status:"
echo "========================================="
echo "Backend directory: $(pwd)"
echo "Maven wrapper: $([ -f mvnw ] && echo '✓ Present' || echo '✗ Missing')"
echo "Java: $(command -v java &> /dev/null && echo '✗ Stub only (needs installation)' || echo '✗ Not found')"
echo ""
echo "After installing Java 21, the backend will start automatically"
echo "with the updated error handling code."
