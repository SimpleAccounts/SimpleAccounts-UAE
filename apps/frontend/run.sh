#!/bin/bash

# Use Node 16 for local development (Node 14 doesn't work on Apple Silicon)
# CI uses Node 14 on Ubuntu which is compatible

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node version from .nvmrc (16)
nvm use

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
fi

# Run the development server
npm start
