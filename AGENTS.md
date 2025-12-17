# Repository Guidelines

## Getting Started

For complete setup instructions including prerequisites, database setup, environment configuration, and running the application, see **[SETUP.md](./SETUP.md)**.

**Quick Start:**

```bash
# Prerequisites: Node 20+, Java 21, PostgreSQL 14+

# 1. Install dependencies
npm install

# 2. Setup database and create apps/backend/.env (see SETUP.md)

# 3. Run application
npm run backend:run   # Terminal 1
npm run frontend      # Terminal 2
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

## Security & Configuration

- **Never commit secrets** - use local `.env` files
- See [SECURITY.md](./SECURITY.md) for vulnerability reporting
- See [SETUP.md](./SETUP.md) for environment configuration
