# Contributing to SimpleAccounts UAE

Thank you for your interest in contributing to SimpleAccounts UAE! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Preferred Qualifications](#preferred-qualifications)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment (see below)
4. Create a new branch for your feature or bug fix
5. Make your changes
6. Submit a pull request

## Preferred Qualifications

While we welcome contributors from all backgrounds, the following qualifications are particularly valuable for this project:

### Technical Skills

- **Software Development**: Experience in software development or AI engineering
  - Frontend: React, JavaScript/TypeScript, modern web development
  - Backend: Java, Spring Boot, RESTful APIs
  - Full-stack development experience
  - Understanding of software architecture and design patterns

- **Automation & AI**: Experience with RPA (Robotic Process Automation) or automation tools
  - Familiarity with AI/ML concepts and implementations
  - Experience building intelligent agents or automated workflows
  - Understanding of agentic AI systems

### Domain Knowledge

- **Accounting & Finance**: Background in accounting, finance, or consulting
  - Understanding of accounting principles and financial reporting
  - Experience with accounting software or financial systems
  - Knowledge of VAT, tax compliance, and regulatory requirements
  - Familiarity with UAE accounting standards and practices

### Interests & Values

- **Open Source**: Interest in open-source projects and contributing to the community
  - Experience contributing to open-source projects
  - Understanding of open-source development workflows
  - Commitment to collaborative development

- **Agentic AI**: Interest in Agentic AI and intelligent automation
  - Curiosity about how AI agents can transform business processes
  - Enthusiasm for exploring cutting-edge AI technologies
  - Interest in building practical AI solutions for real-world problems

### Additional Assets

- Experience with monorepo structures and npm workspaces
- Knowledge of Docker and containerization
- Understanding of PostgreSQL and database design
- Experience with testing frameworks (Jest, JUnit)
- Familiarity with CI/CD pipelines and DevOps practices

**Note**: These qualifications are preferred but not required. We value diverse perspectives and welcome contributors at all skill levels. If you're passionate about accounting software, automation, or open-source development, we'd love to have you contribute!

## Development Setup

### Prerequisites

- Node.js (check `.nvmrc` for version)
- npm
- Java JDK 11+ (for backend)
- Maven (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/SimpleAccounts-UAE.git
cd SimpleAccounts-UAE

# Install dependencies
npm install

# Install frontend dependencies
cd apps/frontend
npm install --legacy-peer-deps
cd ../..
```

### Running the Application

```bash
# Run frontend (development mode)
npm run frontend

# Run backend
npm run backend:run

# Build frontend
npm run frontend:build

# Build backend
npm run backend:build
```

### Project Structure

```
SimpleAccounts-UAE/
├── apps/
│   ├── frontend/          # React frontend application
│   ├── backend/           # Java Spring Boot backend
│   └── agents/            # Agent applications
├── packages/              # Shared packages
├── deploy/                # Deployment configurations
└── docs/                  # Documentation
```

## How to Contribute

### Reporting Bugs

- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Check if the bug has already been reported
- Include detailed steps to reproduce
- Include screenshots if applicable
- Specify your environment (OS, browser, versions)

### Suggesting Features

- Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- Describe the problem you're trying to solve
- Explain your proposed solution
- Consider alternatives you've thought about

### Code Contributions

1. **Find an issue** to work on, or create one
2. **Comment on the issue** to let others know you're working on it
3. **Fork and branch** from `develop`
4. **Write tests** for your changes
5. **Follow coding standards** (see below)
6. **Submit a PR** against the `develop` branch

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Follow the PR template
5. Request review from maintainers
6. Address review feedback
7. Squash commits if requested

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/invoice-export`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation changes (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/user-service`)
- `test/` - Test additions (e.g., `test/auth-unit-tests`)

## Coding Standards

### Frontend (JavaScript/TypeScript)

- Use ESLint configuration provided
- Use Prettier for formatting
- Follow React best practices
- Write meaningful component names
- Use functional components with hooks

### Backend (Java)

- Follow Java naming conventions
- Use meaningful variable and method names
- Write JavaDoc for public methods
- Keep methods focused and small
- Use dependency injection

### General Guidelines

- Write self-documenting code
- Keep functions/methods small and focused
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- Write tests for new functionality

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(invoice): add PDF export functionality

fix(auth): resolve session timeout issue

docs(readme): update installation instructions
```

## Questions?

- Open a [discussion](https://github.com/SimpleAccounts/SimpleAccounts-UAE/discussions)
- Contact the team at support@simpleaccounts.com

Thank you for contributing!
