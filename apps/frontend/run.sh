#!/bin/bash

# Use Node 20 for local development (matches CI and package.json engines)
# CI uses Node 20.x on Ubuntu

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node version from .nvmrc (20)
if [ -f ".nvmrc" ]; then
  nvm use
else
  echo "Warning: .nvmrc not found, using Node 20"
  nvm use 20
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
fi

# Run the development server
npm start
