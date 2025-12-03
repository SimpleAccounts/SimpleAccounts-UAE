# Test Case Development Plan – SimpleAccounts-UAE
**Version:** 0.1  
**Date:** December 3, 2025  
**Owner:** QA & Platform Engineering Guild  
**Related Docs:** `docs/TESTING_STRATEGY.md`, `docs/DEPENDENCY_UPGRADE_ANALYSIS.md`

---

## 1. Purpose
Provide a repeatable blueprint for designing, authoring, and maintaining automated (and critical manual) test cases across every SimpleAccounts module. The plan ensures that as we add new features or micro-modules, we know **which layers need coverage, what artifacts to produce, and which tools/environments to use**.

## 2. Scope & Assumptions
- Covers all apps under `apps/` (backend Spring Boot, frontend React SPA, agents/services) plus deployment artifacts in `deploy/`.
- Addresses **functional, integration, contract, E2E, performance, security, and data validation** testing.
- Assumes Java 17+ & Node 18+ build images for running full suites; Testcontainers is available for database-dependent tests.
- Manual exploratory/UAT remains complementary but not a substitute for the automated plan below.

### 2.1 Environment & Tooling Requirements
- **Operating System**: macOS 14 / Ubuntu 22.04 LTS / Windows 11 (WSL2) with at least 8 CPUs & 16 GB RAM to keep Testcontainers + Playwright stable.
- **Java & Maven**: Temurin/OpenJDK 17 (set `JAVA_HOME`) plus Maven 3.9.x (or repo-provided `./mvnw`). Java 21 is acceptable if toolchains are configured, but CI standardizes on 17.
- **Node & npm**: Node 18.x (LTS) with npm 10.x. Install via `nvm`/Homebrew and run `npm config set legacy-peer-deps true` before installing the legacy frontend tree.
- **Docker / Container Runtime**: Docker Desktop ≥ 4.30 (or Colima/podman) with 6 GB RAM allocated; required for Testcontainers, database integration tests, and Playwright’s browser dependencies.
- **Browsers & Playwright**: `npx playwright install --with-deps` to provision Chromium/Firefox/WebKit plus Linux dependencies for CI.
- **Database**: Local PostgreSQL 13+ if you prefer direct DB tests; otherwise rely on Testcontainers’ managed instance.
- **Other Utilities**: `make`, `jq`, and `openssl` for scripting; `pnpm` optional if we add workspaces later.

### 2.2 Required Environment Variables & Services
Store secrets in `.env.test` or CI vault and export before running suites:

| Variable | Purpose | Notes |
|----------|---------|-------|
| `SIMPLEACCOUNTS_DB_HOST` / `PORT` / `DB` / `USER` / `PASSWORD` | Backend datasource connection | Point to local Postgres or Testcontainer overrides. |
| `SIMPLEACCOUNTS_DB_SSL`, `SIMPLEACCOUNTS_DB_SSLMODE`, `SIMPLEACCOUNTS_DB_SSLROOTCERT` | SSL config for DB | Optional for local dev; keep defaults for Testcontainers. |
| `SIMPLEACCOUNTS_HOST` | Base URL exposed to emails/links | Use `http://localhost:8080` for tests. |
| `JWT_SECRET` | Symmetric signing key for auth tests | Keep deterministic secret for repeatable assertions. |
| `SPRING_PROFILES_ACTIVE=test` | Ensures test-specific beans/settings | Export before running Maven commands. |
| `PLAYWRIGHT_BROWSERS_PATH=0` (CI) | Forces local browser download | Prevents shared cache issues in sandboxes. |

Services that must be reachable: Docker daemon, outbound network for dependency downloads, and optional SMTP/3rd-party stubs (provided via WireMock/GreenMail during tests).

## 3. Module Inventory & Critical Flows

| Module Group | Representative Features | Backend Surface (examples) | Frontend Surface (examples) |
|--------------|------------------------|----------------------------|-----------------------------|
| Customer Invoices & Sales | Quotation, Invoice, Credit Note, Income Receipts | `rest/invoice`, `service/invoice`, `dao/invoice` | `screens/sales`, `screens/invoice`, `components/forms` |
| Expenses & Payables | Supplier invoices, Purchase receipts, Expense categories | `rest/expense`, `service/expense`, `dao/expense` | `screens/expense`, `screens/payables` |
| Banking & Reconciliation | Bank accounts, reconciliation rules, cash flow | `rest/bankaccount`, `service/bank`, `criteria/bankaccount` | `screens/banking`, dashboard widgets |
| Accountant / General Ledger | Opening balance, journals, recurring entries | `rest/accountant`, `service/ledger`, `parserengine` | `screens/accountant`, `screens/journals` |
| Reporting & Analytics | Financial, VAT, payroll, expense reports | `rest/report`, `helper/DashboardRestHelper` | `screens/reports`, `components/charts` |
| Master Data | Chart of accounts, contacts, products, VAT config | `rest/master`, `service/master`, `repository/master` | `screens/master`, `components/tables` |
| Payroll | Payroll config, payroll runs, payslips | `rest/payroll`, `service/payroll`, `dao/payroll` | `screens/payroll`, `components/payroll` |
| Platform & Security | Auth (JWT), RBAC, config controller, file storage | `security/*`, `configcontroller/*`, `fileuploadconfig/*` | `services/global/auth`, `routes/` |
| Integrations & Agents | Email, file imports, migration APIs, 3rd-party agents | `integration/*`, `parserengine/*`, `apps/agents/*` | Frontend upload screens, CLI agents |

Each new module must map itself to **at least one row** (or add a new row) and inherit the test expectations below.

## 4. Test Layers & Deliverables Matrix (≥90% Coverage Target)

| Layer | Goal | Primary Tools | Deliverables per Module |
|-------|------|---------------|-------------------------|
| Unit (Backend) | Validate pure logic: services, helpers, validators | JUnit 5, Mockito, AssertJ | `src/test/java/...` classes with ≥90% line + branch coverage for critical packages |
| Repository/Data | Ensure ORM queries & Liquibase migrations behave | Spring Data Test, Testcontainers (PostgreSQL) | Tests for every custom query + migration smoke suite; ≥90% branch coverage on repositories |
| Slice/Component | Validate controllers, security filters, schedulers in isolation | `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest` (slice) | Controller tests covering success+failure paths, auth checks |
| Contract/API | Keep REST/GraphQL payloads stable for consumers | Spring Cloud Contract, Pact, OpenAPI schema tests | Consumer/provider contracts per public endpoint |
| Frontend Unit/Integration | Guard UI logic, reducers, hooks, API wrappers | Jest, React Testing Library, MSW | Component tests for forms, tables, charts + redux/sagas with ≥90% statements/branches |
| E2E/System | Validate user journeys across backend+frontend | Playwright (preferred) / Cypress | Scripts per high-value flow (invoice creation, payroll run, VAT submit, etc.) |
| Data/Import | Validate file ingestion/exports | JUnit + fixture files, Playwright download assertions | Test sets for CSV/XLS parsing, bad data cases |
| Performance & Reliability | Catch regressions in latency, throughput | Gatling/JMeter, k6, Playwright traces | Smoke perf scenarios + threshold gating in CI nightly |
| Security & Compliance | Validate authz/authn, audit logs, sensitive data | OWASP ZAP, dependency scanning, Spring Security tests | Automated scans + auth matrix regression tests |

## 5. Layer-Specific Plans

### 5.1 Backend Unit Tests
- Create fixture builders per module (`InvoiceFixture`, `ExpenseFixture`, etc.) in `src/test/java/com/simpleaccounts/support`.
- Cover:
  - Calculation utilities (VAT, currency conversions, payroll deductions).
  - Validation logic (DTO validators, parsing helpers).
  - Enum/state transitions (invoice status, recurring schedules).
- Mutation testing (e.g., Pitest) for finance-critical math classes.

### 5.2 Repository & Migration Tests
- Use Testcontainers PostgreSQL seeded via Liquibase changelog applied at test startup.
- For each custom query method or `@Query`:
  - Provide at least one positive, one negative, and one sorting/pagination assertion.
- Add migration smoke suite that:
  - Applies the latest changelog to empty DB.
  - Validates reference data (COA, VAT categories) inserted as expected.

### 5.3 Service & Workflow Tests
- Write `@SpringBootTest` (slice) verifying orchestration in modules:
  - Invoice approval pipeline (draft → approved → posted).
  - Expense reimbursement (submit → audit → post to GL).
  - Payroll run (generate payslips, lock period).
- Include time-travel tests (use `Clock` abstraction) for recurring jobs.

### 5.4 Controller, Security & API Tests
- `@WebMvcTest` per controller verifying:
  - AuthN (JWT required) and AuthZ (role codes from `constant/RoleCode`).
  - Validation errors return consistent error codes (`constant/WebLayerErrorCodeEnum`).
  - Sorting/filtering parameters match `criteria/*` expectations.
- Add contract tests aligning with `ConfigController`, `MigrationController`, and public master data endpoints.

### 5.5 File Import/Export & Parser Tests
- Create test fixtures mirroring `/apps/backend/sample-file/`.
- Write parser tests for CSV, Excel, and XML pipelines (`parserengine/*`).
- Validate error rows, partial success handling, and large file streaming (→ use temp files via JUnit `@TempDir`).

### 5.6 Integrations, Messaging, and Agents
- For email and future agents:
  - Use GreenMail or WireMock to simulate SMTP/HTTP integrations.
  - Contract tests for outbound webhooks.
- Agents (in `apps/agents`): add CLI/unit tests verifying command execution and authentication flows.

### 5.7 Frontend Unit & Integration Tests
- Expand `src/components`, `screens/*`, and `services/global` suites:
  - Test navigation guards (role-based routes).
  - Form validation & API error surfaces.
  - Global store/reducer logic (redux tests already stubbed).
- Mock API via MSW to keep tests deterministic.

### 5.8 End-to-End Flows
Author Playwright specs grouped by module:
1. **Authentication & Permissions** – login, OTP, role switching.
2. **Invoice Lifecycle** – create → approve → email → download PDF.
3. **Expense Workflow** – upload receipt, categorize, post to ledger.
4. **Bank Reconciliation** – import bank CSV, auto-match, manual reconcile.
5. **Master Data CRUD** – add chart-of-account entry, edit VAT, soft-delete product.
6. **Payroll Run** – configure payroll, run period, export payslips.
7. **Reporting** – generate Profit & Loss, export to Excel, verify totals.
8. **Migration/Setup** – run config wizard, verify default data.

Each script must log step names & attach artifacts (screenshots, HAR files).

## 6. Cross-Cutting Test Categories
- **Data Integrity**: double-entry balance assertions, rounding rules.
- **Localization & Currency**: AED vs multi-currency, RTL layouts (if applicable).
- **Accessibility**: WCAG AA scans on major forms.
- **Resilience**: Introduce fault injection (Toxiproxy) for external services.
- **Upgrade Readiness**: smoke suite aligned with dependency upgrades (ties back to `TESTING_STRATEGY.md`).

## 7. Test Data & Environment Strategy
- Maintain reusable seed datasets per module (JSON or SQL) under `apps/backend/src/test/resources/data/<module>`.
- Provide anonymized production-like CSV/XLS for import tests stored in `temp_logs/test-fixtures` (Git LFS if needed).
- Define three env tiers:
  1. **CI** – lightweight Testcontainers, MSW mocks.
  2. **QA** – shared DB, nightly E2E+performance.
  3. **Staging** – mirrors production infra; used for release sign-off and security scans.

## 8. Automation & CI Gating
- Update root `package.json`/`pom.xml` scripts to expose:
  - `npm run test:frontend:unit`, `npm run test:frontend:e2e`.
  - `mvn test`, `mvn verify -Pcontract`, `mvn verify -Pperf` (nightly).
- CI stages:
  1. **Lint & Unit** – fail-fast on PRs.
  2. **Component & Contract** – required for merge to `main`.
  3. **E2E & Perf Smoke** – nightly, results posted to Slack.
  4. **Security Scan** – weekly or before release.
- Enforce coverage thresholds: 90% line + 90% branch coverage per module (backend & frontend) with mutation score ≥70% on finance-critical packages.

## 9. Implementation Roadmap

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| 0 – Foundations | 1 sprint | Test infra upgrade (Java 17 containers, Playwright harness, shared fixtures) |
| 1 – Critical Happy Paths | 1–2 sprints | Unit + controller tests for auth, invoices, expenses + E2E smoke (login, invoice) |
| 2 – Depth & Modules | 2–3 sprints | Expand to banking, reports, master data, payroll; add contract tests & CSV parsers |
| 3 – Non-Functional | 1 sprint | Performance scripts, accessibility scans, resilience tests |
| 4 – Continuous Hardening | Ongoing | Mutation testing on finance logic, nightly chaos tests, coverage uplift |

## 10. Ownership & Reporting
- Assign module leads (backend + frontend) responsible for keeping their suite green.
- Publish dashboard (e.g., SonarQube + Playwright HTML reports) with:
  - Coverage trends per module.
  - Flaky test tracker.
  - Mean time to detect/fix failures.
- Embed checklist in PR template requiring:
  - Tests updated/added?
  - Contract changes reviewed?
  - Test data impact assessed?

## 11. Module-Specific Test Catalog (All Layers + Edge Cases)

Every module must satisfy the following suites before merging. Each bullet implies automated coverage where feasible plus documented manual exploratory notes. Edge cases must be codified as tests (unit, integration, or E2E) rather than tribal knowledge.

### 11.1 Customer Invoices & Sales
- **Backend Unit**: VAT rounding, multi-rate discount stacking, currency conversions (FX gain/loss), credit-note reversing logic, negative quantity guardrails.
- **Repository/Data**: Pagination/sorting queries, status filters, tenant scoping, soft-delete visibility.
- **Service/Slice**: Workflow transitions (draft→approved→sent→paid→archived), concurrency on invoice numbering, email + PDF generation fallbacks.
- **Contracts**: `/invoice`, `/credit-note`, `/quotation`, `/income-receipt` with optional custom fields & attachments.
- **Frontend Unit/Integration**: Form validation, dynamic tax rows, offline draft autosave, Redux invoice reducers, PDF preview rendering.
- **E2E/System**: End-to-end lifecycle, bulk CSV upload with mixed currencies, resend invoice email after token refresh.
- **Edge Cases**: Zero-value invoices, back-dated fiscal crossing, maximum line items, mixed tax schemas, revoked customer access.

### 11.2 Expenses & Payables
- **Backend Unit**: Expense policy checks, receipt parsing, multi-level approvals, per-diem calculations.
- **Repository/Data**: Supplier/category filters, aging buckets, search by memo, multi-entity segregation.
- **Service/Slice**: Approval/rejection flows, attachment retention policy, reimbursement ledger postings.
- **Contracts**: `/expense`, `/purchase-receipt`, `/supplier-invoice`.
- **Frontend Tests**: Upload widget (drag/drop, mobile camera), form wizard, reimbursement calculator, redux store.
- **E2E**: Create→approve→reimburse, duplicate detection, bulk import with malformed rows, policy violation warnings.
- **Edge Cases**: Negative adjustments, VAT-exclusive entries, multi-currency reimbursements, max attachment size, missing receipts.

### 11.3 Banking & Reconciliation
- **Backend Unit**: Bank statement parser (CSV/XLS), auto-match rules, tolerance thresholds, exchange-rate application.
- **Repository/Data**: Statement aggregation queries, reconciliation statuses, lock contention.
- **Service/Slice**: Manual match/unmatch, partial matches, reclassifying entries, ledger posting idempotency.
- **Contracts**: `/bank-account`, `/bank-statement`, `/reconciliation`.
- **Frontend**: Reconciliation UI, filter chips, manual matching drag-and-drop, dashboard widgets.
- **E2E**: Import large statements (>10k rows), auto-match, manual adjustments, final posting.
- **Edge Cases**: Duplicate lines, timezone shifts, missing reference numbers, currency mismatch, network interruption mid-import.

### 11.4 Accountant / General Ledger
- **Backend Unit**: Journal balancing, recurring schedule generator, closing entries, double-entry validation.
- **Repository/Data**: Ledger queries across periods, audit logs, locked-period enforcement.
- **Service**: Reversals, bulk postings, inter-company eliminations, multi-tenant filters.
- **Contracts**: `/journal`, `/ledger`, `/opening-balance`, `/recurring`.
- **Frontend**: Journal editor, ledger drill-down, recurring entry UI, period lock controls.
- **E2E**: Import opening balance, create journal with attachments, run trial balance, lock/unlock period.
- **Edge Cases**: Imbalanced journal rejection, cross-year adjustments, decimal precision extremes, multi-currency GL entries.

### 11.5 Reporting & Analytics
- **Backend Unit**: KPI aggregations, VAT computations, payroll summaries, cashflow projections.
- **Repository/Data**: Parameterized report queries (date, branch, project, currency), caching layers.
- **Service**: Report generation pipeline, export streaming, snapshot versioning.
- **Contracts**: `/report/*` endpoints (P&L, Balance Sheet, VAT, Payroll, Expense).
- **Frontend**: Chart components, complex filter panels, drill-down interactions, export buttons.
- **E2E**: Generate each report, apply filters, export PDF/XLS/CSV, verify totals vs sample dataset.
- **Edge Cases**: Empty data sets, huge data ranges, mixed currencies, rounding discrepancies, timezone offsets.

### 11.6 Master Data
- **Backend Unit**: COA hierarchy validation, VAT category rules, product SKU uniqueness, contact deduplication.
- **Repository/Data**: Search/pagination, soft-delete exposure, tree traversal for COA.
- **Service**: Bulk import/export pipelines, cascading updates, audit logging.
- **Contracts**: `/chart-of-accounts`, `/contacts`, `/products`, `/vat-category`, `/employee`.
- **Frontend**: CRUD forms, inline validation, table filtering/sorting, bulk action modals.
- **E2E**: Create/edit/delete master entries, CSV import with rollback on failure, permission enforcement.
- **Edge Cases**: Duplicate names, cyclic hierarchies, localization characters, mass updates, conflicting tax codes.

### 11.7 Payroll
- **Backend Unit**: Payslip calculations (allowances/deductions), gratuity, retro adjustments, statutory limits.
- **Repository/Data**: Payroll run summaries, contribution tables, employee eligibility queries.
- **Service/Slice**: Run locking/unlocking, approval workflow, payslip generation, bank file creation.
- **Contracts**: `/payroll/config`, `/payroll/run`, `/payroll/payslip`, `/payroll/export`.
- **Frontend**: Payroll config wizard, run dashboard, payslip preview/download.
- **E2E**: Configure payroll, run period, approve, export bank file, rollback.
- **Edge Cases**: Partial-month hires, unpaid leave, multi-currency salaries, max employee loads, negative adjustments.

### 11.8 Platform & Security
- **Backend Unit**: JWT utilities, permission checks, configuration caching, file upload validation, rate limiter.
- **Slice**: `WebSecurityConfig`, `JwtAuthenticationController`, `JwtRequestFilter`, CORS & CSRF policies.
- **Contracts**: `/authenticate`, `/config`, `/file`, `/health`.
- **Frontend**: Auth service (refresh/logout), route guards, configuration loader, file uploader.
- **E2E**: Login/2FA, token refresh, session timeout, role switching, secure file download.
- **Edge Cases**: Expired/revoked tokens, invalid signatures, oversized uploads, malicious file types, config drift.

### 11.9 Integrations & Agents
- **Backend Unit**: `MailIntegration`, parser engines (`CsvParser`, `ExcelParser`, `TransactionFileParser`), migration utilities.
- **Integration Tests**: GreenMail for SMTP, WireMock for REST/SOAP, Testcontainers for SFTP/Message queues.
- **Agents**: CLI option parsing, retry/backoff, credential rotation, error logging.
- **Frontend**: Upload status indicators, integration management UIs.
- **E2E**: File drop → parser → DB → confirmation email; migration wizard end-to-end; agent-triggered sync with retries.
- **Edge Cases**: Invalid encodings, partial imports, network timeouts, schema mismatches, version downgrade attempts.

## 12. Coverage, Quality Gates & Edge-Case Enforcement
- **Coverage Gate**: 90% line + 90% branch coverage per module (frontend & backend) enforced via CI; builds fail if below threshold.
- **Mutation Baseline**: ≥70% mutation score on finance-critical packages (`invoice`, `ledger`, `tax`, `payroll`, `bank`).
- **Edge-Case Register**: Living checklist (Notion/Jira) mapping each identified boundary condition to an automated test ID; gaps block release.
- **Flake Budget**: No suite may exceed 1% flaky rate over rolling 7 days; offending tests quarantined and fixed before next release.
- **Observability Assertions**: Tests verify logs/metrics/traces for key flows (e.g., invoice created emits audit + metric).
- **Security Scans**: OWASP ZAP/Burp automated in CI, plus dependency and container scanning per build.

## 13. Executing Test Suites

### 13.1 Pre-Flight Setup
1. Clone and install dependencies:
   ```bash
   git clone git@github.com:SimpleAccounts/SimpleAccounts-UAE.git
   cd SimpleAccounts-UAE
   npm install          # installs root + workspaces
   cd apps/frontend && npm install --legacy-peer-deps && cd ../../
   ```
2. Ensure Docker Desktop (or Colima) is running and `docker info` succeeds.
3. Export required env vars (`SIMPLEACCOUNTS_DB_*`, `SPRING_PROFILES_ACTIVE=test`, `JWT_SECRET`, etc.).
4. Install Playwright browsers once per machine: `cd apps/frontend && npx playwright install --with-deps`.

### 13.2 Backend Suites (Maven)
| Suite | Command | Notes |
|-------|---------|-------|
| Unit + Slice (services, controllers) | `cd apps/backend && ./mvnw clean test -Dspring.profiles.active=test` | Uses Surefire; mocks external systems. |
| Repository & Integration (Testcontainers) | `./mvnw verify -DskipITs=false -Dspring.profiles.active=test` | Requires Docker; exercises Postgres + Liquibase. |
| Contract/API | `./mvnw verify -Pcontract` | Runs Spring Cloud Contract + Pact verifications. |
| Performance Smoke | `./mvnw verify -Pperf -Dgatling.skip=false` | Executes Gatling/JMeter scenarios defined under `src/perf`. |
| Security Scans | `./mvnw verify -Psecurity` | Triggers dependency scanning + OWASP ZAP dockerized scans. |
| Mutation Testing | `./mvnw org.pitest:pitest-maven:mutationCoverage` | Enforces ≥70% score on finance-critical packages. |

### 13.3 Frontend Suites (Jest & Playwright)
| Suite | Command | Notes |
|-------|---------|-------|
| Unit/Integration (Jest + RTL) | `cd apps/frontend && npm test -- --watchAll=false` | Executes `react-scripts test` once; fails on coverage gaps. |
| Coverage Report | `npm run test:cov` | Generates HTML/LCOV output under `coverage/`. |
| Store/Redux regression | `npm test -- utils/reducer.test.js` | Filtered run for fast debugging. |
| Playwright E2E Smoke | `npx playwright test --project=chromium --config=playwright.config.ts` | Talks to locally running backend or mocked services via MSW. |
| Playwright Full Matrix | `npx playwright test --headed --trace on` | Captures traces/screenshots for triage. |
| Accessibility subset | `npx playwright test --grep "@a11y"` | Runs axe-core integrations on critical pages. |

### 13.4 Cross-Repo Commands
- **Run everything (CI parity)**:
  ```bash
  npm run test --workspaces --if-present
  ./apps/backend/mvnw verify -Dspring.profiles.active=test
  cd apps/frontend && npm run test:cov && npx playwright test
  ```
- **Nightly pipeline order**: lint → backend unit → frontend unit → backend integration → contract → frontend E2E → performance → security scans.
- **Artifacts**: Maven Surefire/Failsafe reports under `apps/backend/target/`, Jest coverage in `apps/frontend/coverage/`, Playwright traces in `apps/frontend/test-results/`.

---
**Next Steps:** socialize this plan with module owners, prioritize Phase 0 work, then use the matrix to drive concrete Jira tickets for each suite. Future modules must append themselves to Section 3 and follow Sections 4–13 before release.  

