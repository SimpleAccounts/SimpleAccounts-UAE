# SimpleAccounts UAE Agents

This directory contains agent applications for SimpleAccounts UAE.

## Structure

Each agent should be in its own subdirectory with its own `package.json`:

```
agents/
├── agent-name-1/
│   ├── package.json
│   └── src/
├── agent-name-2/
│   ├── package.json
│   └── src/
└── README.md
```

## Creating a New Agent

1. Create a new directory under `apps/agents/`
2. Initialize with `npm init`
3. Name it `@simpleaccounts/agent-<name>`
4. The agent will automatically be included in the workspace

## Example package.json for an agent

```json
{
  "name": "@simpleaccounts/agent-example",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "node src/index.js",
    "build": "echo 'build script'",
    "start": "node dist/index.js"
  }
}
```
