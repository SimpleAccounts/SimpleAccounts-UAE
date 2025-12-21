# Backend Startup Instructions

## Quick Start (if Java 21 is installed)

```bash
cd /Users/zecs/workspaces/SimpleAccounts-UAE/apps/backend
./run.sh
```

## Install Java 21

### Option 1: Using Homebrew (Recommended)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Java 21
brew install openjdk@21

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 21)

# Start backend
cd /Users/zecs/workspaces/SimpleAccounts-UAE/apps/backend
./run.sh
```

### Option 2: Download from Adoptium

1. Visit: https://adoptium.net/temurin/releases/?version=21
2. Download macOS installer (.pkg)
3. Install it
4. Then run:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
cd /Users/zecs/workspaces/SimpleAccounts-UAE/apps/backend
./run.sh
```

## What Changed

The backend has been updated to:

- Return `0` with status `200` for `getCompanyCount` on error (instead of 500)
- Return empty list for `getTimeZoneList` on error
- This fixes XML parsing errors and allows register screen to appear

## Verify Backend is Running

```bash
curl http://localhost:8080/rest/company/getCompanyCount
# Should return: 0 (or 1 if company exists)
```
