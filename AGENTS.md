# Repository Guidelines

## Project Structure
- `apps/frontend/`: React frontend. Source in `src/`, static assets in `public/`, Playwright e2e in `e2e/`, build output in `build/`.
- `apps/backend/`: Spring Boot backend (WAR). Code in `src/main/java/com/simpleaccounts`, config/resources in `src/main/resources`, tests in `src/test/java`.
- `apps/agents/`: Optional Node-based agents; each agent lives in its own subfolder with a `package.json`.
- `deploy/`, `docs/`, `scripts/`, `k6/`: deployment recipes, product docs, helper scripts, and load tests.

## Setup, Build, and Run
Prereqs: Node 18+, npm 9+, Java 11+, Maven (or `./mvnw`).
Common commands from repo root:
- `npm install` – install workspace dependencies.
- `npm run frontend` – start the React dev server on localhost.
- `npm run backend:run` – run backend via `apps/backend/run.sh`.
- `npm run frontend:build` / `npm run backend:build` – production builds.
- `npm test` / `npm run lint` – run tests or lint across workspaces.

## Coding Style
- Frontend/agents: Prettier + ESLint. 2-space indentation, single quotes, semicolons, 100‑char line width. Format with `npm run format`; pre-commit hooks run `eslint --fix` and Prettier.
- Backend: standard Java conventions, packages under `com.simpleaccounts.*`. Format Java with Google Java Format (`scripts/run-java-formatter.sh`).

## Testing
- Frontend: Jest via `react-scripts`. Name tests `*.test.{js,jsx,ts,tsx}` or place in `__tests__/`. Coverage thresholds are enforced in `apps/frontend/package.json`. Run `cd apps/frontend && npm test`, `npm run test:cov`, or e2e with `npm run test:frontend:e2e`.
- Backend: JUnit 5 + Spring Boot test. Keep tests in `apps/backend/src/test/java` and name classes `*Test.java`. Run `cd apps/backend && ./mvnw test`.

## Commits & Pull Requests
- Use Conventional Commits (`feat:`, `fix(scope):`, etc.); subject lower‑case, ≤72 chars. Commitlint + Husky enforce this.
- Branch from `develop` (`feature/...`, `fix/...`, `docs/...`). PRs target `develop`, include a clear description and linked issue, add screenshots for UI changes, and ensure `npm test`, `npm run lint`, and backend tests pass.

## Security & Configuration
Do not commit secrets. Use local `.env` files for runtime config and follow `SECURITY.md` for vulnerability reporting.
