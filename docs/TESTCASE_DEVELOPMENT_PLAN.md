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

## 4. Test Layers & Deliverables Matrix

| Layer | Goal | Primary Tools | Deliverables per Module |
|-------|------|---------------|-------------------------|
| Unit (Backend) | Validate pure logic: services, helpers, validators | JUnit 5, Mockito, AssertJ | `src/test/java/...` classes with ≥80% line coverage for critical packages |
| Repository/Data | Ensure ORM queries & Liquibase migrations behave | Spring Data Test, Testcontainers (PostgreSQL) | Tests for every custom query + migration smoke suite |
| Slice/Component | Validate controllers, security filters, schedulers in isolation | `@WebMvcTest`, `@DataJpaTest`, `@SpringBootTest` (slice) | Controller tests covering success+failure paths, auth checks |
| Contract/API | Keep REST/GraphQL payloads stable for consumers | Spring Cloud Contract, Pact, OpenAPI schema tests | Consumer/provider contracts per public endpoint |
| Frontend Unit/Integration | Guard UI logic, reducers, hooks, API wrappers | Jest, React Testing Library, MSW | Component tests for forms, tables, charts + redux/sagas |
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
- Enforce coverage thresholds (start 60% backend unit, 50% frontend, grow quarterly).

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

---
**Next Steps:** socialize this plan with module owners, prioritize Phase 0 work, then use the matrix to drive concrete Jira tickets for each suite. Future modules must append themselves to Section 3 and follow Sections 4–8 before release.  

