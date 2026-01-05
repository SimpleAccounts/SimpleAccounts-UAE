# SimpleAccounts UAE - Development Guide

## Project Overview

SimpleAccounts UAE is a comprehensive accounting software for UAE businesses with VAT compliance, multi-currency support, and payroll management.

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Spring Boot (Java)
- **Database**: PostgreSQL with Liquibase migrations
- **State Management**: Redux Toolkit

## Corporate Design System

This project uses a **Minimal Corporate Design System** inspired by modern SaaS applications (Stripe, Linear, OpenAI). All new components MUST follow this clean, professional theme.

### Design Documentation

**📖 See [DESIGN-GUIDE.md](./DESIGN-GUIDE.md) for complete design system documentation**, including:

- Color palette and usage guidelines
- Typography and spacing rules
- Component examples and code snippets
- Migration guide from neumorphic to corporate theme

### Design Principles

1. **Clarity First** - White/light backgrounds, high contrast, minimal noise
2. **Professional** - Clean borders, subtle shadows, consistent spacing
3. **System Integration** - Use system fonts, respect user preferences
4. **Accessibility** - WCAG AA compliance, semantic colors
5. **Brand Colors** - Primary blue (#2064d8) for CTAs and active states only
6. **Consistency** - Follow OpenAI-inspired minimal design patterns

### Quick Reference

#### Color Variables

```css
/* Backgrounds */
--corp-bg-primary: #ffffff /* Main background */ --corp-bg-secondary: #f8f9fa /* Subtle contrast */
  /* Brand Colors */ --corp-primary: #2064d8 /* Primary blue (CTAs) */ --corp-secondary: #21d8aa
  /* Success/teal */ /* Semantic Colors */ --corp-success: #10b981 --corp-warning: #f59e0b
  --corp-danger: #ef4444 --corp-info: #3b82f6 /* Text Colors */ --corp-text-primary: #111827
  /* Headings */ --corp-text-secondary: #4b5563 /* Body */ --corp-text-muted: #9ca3af /* Hints */;
```

#### Component Examples

```jsx
// Primary Button
<button className="corp-btn-primary">Save</button>

// Card
<div className="corp-card p-6">Content</div>

// Input
<input className="corp-input w-full" />

// Table
<table className="corp-table">...</table>

// Badge
<span className="corp-badge-success">Paid</span>
```

#### Tailwind Utilities

```jsx
// Backgrounds
className = 'bg-white border border-corp-border-light';

// Text
className = 'text-corp-text-primary font-semibold';

// Shadows
className = 'shadow-corp-sm'; // Subtle
className = 'shadow-corp-md'; // Default
className = 'shadow-corp-lg'; // Prominent

// Spacing
className = 'p-6 gap-4'; // Consistent spacing
```

### Icons & Assets

- Use **Lucide React** icons exclusively
- Primary color (`#2064d8`) for CTAs and active icons
- Muted color (`#9ca3af`) for inactive icons
- Success color (`#10b981`) for positive states
- Danger color (`#ef4444`) for destructive actions

## Development Commands

### DevContainer (Recommended)

When using the devcontainer, PostgreSQL and Redis are automatically started and configured.
Environment variables are pre-configured in `.devcontainer/.env`.

```bash
# From apps/frontend directory
npm start                    # Start frontend dev server (port 3000)

# From apps/backend directory
./mvnw spring-boot:run       # Start backend server (port 8080)

# Or from repo root (recommended)
npm run frontend             # Start frontend dev server
npm run backend:run          # Start backend server
```

### Running Frontend and Backend Together

```bash
# Terminal 1 - Frontend
npm run frontend

# Terminal 2 - Backend
npm run backend:run
```

### Available URLs

| Service     | URL                                   |
| ----------- | ------------------------------------- |
| Frontend    | http://localhost:3000                 |
| Backend API | http://localhost:8080                 |
| Swagger UI  | http://localhost:8080/swagger-ui.html |

### Database Connection (DevContainer)

The devcontainer automatically configures PostgreSQL with these settings:

- **Host**: localhost (shared network namespace)
- **Port**: 5432
- **Database**: simpleaccounts
- **User**: simpleaccounts
- **Password**: simpleaccounts_dev

### Testing

```bash
# Frontend tests
cd apps/frontend && npm test

# Backend tests
cd apps/backend && ./mvnw test

# E2E tests (Playwright)
cd apps/frontend && npm run test:frontend:e2e
```

## Git Workflow

- Branch from `develop`
- Create feature branches: `feature/your-feature-name`
- PR to `develop` for review
