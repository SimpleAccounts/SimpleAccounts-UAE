# Repository Guidelines

## Getting Started

For complete setup instructions including prerequisites, database setup, environment configuration, and running the application, see **[SETUP.md](./SETUP.md)**.

**Quick Start (DevContainer - Recommended):**

The devcontainer automatically sets up PostgreSQL, Redis, and all environment variables.

```bash
# From repo root - run in separate terminals
npm run frontend      # Terminal 1 - starts Vite dev server (port 3000)
npm run backend:run   # Terminal 2 - starts Spring Boot (port 8080)
```

**Quick Start (Manual Setup):**

```bash
# Prerequisites: Node 20+, Java 21, PostgreSQL 14+

# 1. Install dependencies
npm install

# 2. Setup database and create apps/backend/.env (see SETUP.md)

# 3. Run application
npm run frontend      # Terminal 1 - starts Vite dev server (port 3000)
npm run backend:run   # Terminal 2 - starts Spring Boot (port 8080)
```

**Alternative commands (from app directories):**

```bash
cd apps/frontend && npm start           # Frontend dev server
cd apps/backend && ./mvnw spring-boot:run  # Backend server
```

---

## Project Structure

- `apps/frontend/`: React frontend. Source in `src/`, static assets in `public/`, Playwright e2e in `e2e/`, build output in `dist/` (Vite) or `build/` (CRA fallback).
- `apps/backend/`: Spring Boot backend (WAR). Code in `src/main/java/com/simpleaccounts`, config/resources in `src/main/resources`, tests in `src/test/java`.
- `apps/agents/`: Optional Node-based agents; each agent lives in its own subfolder with a `package.json`.
- `deploy/`, `docs/`, `scripts/`, `k6/`: deployment recipes, product docs, helper scripts, and load tests.

---

## Build and Run Commands

From repo root:

| Command                  | Description                             |
| ------------------------ | --------------------------------------- |
| `npm install`            | Install workspace dependencies          |
| `npm run frontend`       | Start React dev server (localhost:3000) |
| `npm run backend:run`    | Run backend via `apps/backend/run.sh`   |
| `npm run frontend:build` | Production build for frontend           |
| `npm run backend:build`  | Production build for backend            |
| `npm test`               | Run tests across workspaces             |
| `npm run lint`           | Run linter across workspaces            |

---

## Coding Style

### Frontend/Agents

- Prettier + ESLint
- 2-space indentation, single quotes, semicolons
- 100-char line width
- Format with `npm run format`
- Pre-commit hooks run `eslint --fix` and Prettier

### Theme & Design System (Neumorphic)

- **Strict Adherence Required**: All new screens and UI components MUST follow the **Neumorphic (Soft UI)** design system.
- **Live Reference**: Visit `/theme-reference` route for live component examples
- **Key Requirements**:
  - Background color: `#e8eef5` (never use pure white)
  - Dual shadows for raised elements (dark + light)
  - Inset shadows for form inputs
  - Rounded corners: `rounded-xl` (12px) or `rounded-2xl` (16px)
  - Amber border (`#f59e0b`) for selected/active states
  - Use `lucide-react` icons exclusively
  - Use CSS variables: `var(--neu-bg)`, `var(--neu-primary)`, etc.
  - See **[CLAUDE.md](./CLAUDE.md)** for complete theme documentation

### Backend

- Standard Java conventions
- Packages under `com.simpleaccounts.*`
- Format Java with Google Java Format (`scripts/run-java-formatter.sh`)

---

## Testing

### Frontend

- Jest via `react-scripts`
- Name tests `*.test.{js,jsx,ts,tsx}` or place in `__tests__/`
- Coverage thresholds enforced in `apps/frontend/package.json`

```bash
cd apps/frontend
npm test                     # Run tests
npm run test:cov             # Run with coverage
npm run test:frontend:e2e    # Playwright E2E tests
```

### Backend

- JUnit 5 + Spring Boot test
- Tests in `apps/backend/src/test/java`
- Name classes `*Test.java`

```bash
cd apps/backend
./mvnw test
```

---

## Commits & Pull Requests

### Commit Convention

- Use Conventional Commits: `feat:`, `fix(scope):`, `docs:`, `chore:`, etc.
- Subject must be lower-case, ≤72 chars
- Commitlint + Husky enforce this

### Branch Naming

- Branch from `develop`
- Use prefixes: `feature/...`, `fix/...`, `docs/...`

### PR Requirements

- Target `develop` branch
- Include clear description and linked issue
- Add screenshots for UI changes
- Ensure `npm test`, `npm run lint`, and backend tests pass

---

## Neumorphic Design System

**All UI work MUST strictly follow the Neumorphic theme. See [CLAUDE.md](./CLAUDE.md) for complete documentation.**

### Color Palette

```
Primary Blue:    #1e6eff (buttons, links, active icons)
Secondary Green: #00c896 (success states)
Warning Amber:   #f59e0b (selected/active borders)
Danger Red:      #ff4d6a (errors, destructive actions)
Background:      #e8eef5 (main bg - NEVER use white)
Text Primary:    #1e3a5f (headings)
Text Secondary:  #3d5a80 (body text)
Text Muted:      #98afc2 (placeholders, hints)
Shadow Dark:     #c4c9cf
Shadow Light:    #ffffff
```

### Shadow Patterns

```jsx
// Raised elements (buttons, cards)
boxShadow: '6px 6px 12px var(--neu-shadow-dark, #c4c9cf), -6px -6px 12px var(--neu-shadow-light, #ffffff)';

// Pressed/inset elements (inputs, textareas)
boxShadow: 'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)';
```

### Mandatory Requirements

1. **Background**: Always use `#e8eef5` - never pure white
2. **Shadows**: Use dual shadows (dark + light) for all raised elements
3. **Inputs**: Use inset shadows for all form fields
4. **Corners**: Use `rounded-xl` (12px) or `rounded-2xl` (16px)
5. **Selection**: Use amber border (`#f59e0b`) for active/selected states
6. **Icons**: Use Lucide React icons exclusively
7. **Variables**: Use CSS variables (`var(--neu-*)`) for all colors

### Before Submitting UI Changes

- [ ] Background is `#e8eef5` (not white)
- [ ] All cards/buttons have dual raised shadows
- [ ] All inputs have inset shadows
- [ ] All elements have rounded corners (rounded-xl+)
- [ ] Selected states use amber border
- [ ] Icons are from Lucide React
- [ ] Colors use CSS variables
- [ ] Verified against `/theme-reference` page

---

## Security & Configuration

- **Never commit secrets** - use local `.env` files
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting
- See [SETUP.md](./SETUP.md) for environment configuration
