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

**📖 See the following guides for complete design system documentation:**

- **[docs/THEME-GUIDELINES.md](./docs/THEME-GUIDELINES.md)** - Comprehensive theme reference (START HERE)
- **[DESIGN-GUIDE.md](./DESIGN-GUIDE.md)** - Design system overview with examples
- **[MIGRATION-TO-CORPORATE.md](./MIGRATION-TO-CORPORATE.md)** - Migration guide from legacy styles

These guides include:

- Color palette and usage guidelines
- Typography and spacing rules
- Component examples and code snippets
- CSS variables and Tailwind classes reference
- Do's and Don'ts

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
--corp-bg-primary: #ffffff; /* Main background */
--corp-bg-secondary: #f8f9fa; /* Subtle contrast */

/* Brand Colors */
--corp-primary: #2064d8; /* Primary blue (CTAs) */
--corp-primary-dark: #1a56b8; /* Primary hover state */

/* Semantic Colors */
--corp-success: #10b981; /* Green - success states */
--corp-warning: #f59e0b; /* Amber - warnings */
--corp-danger: #ef4444; /* Red - errors */
--corp-info: #3b82f6; /* Blue - info */

/* Text Colors */
--corp-text-primary: #111827; /* Headings */
--corp-text-secondary: #4b5563; /* Body text */
--corp-text-muted: #9ca3af; /* Hints, placeholders */

/* Border Colors */
--corp-border-light: #e5e7eb; /* Default borders */
--corp-border-dark: #d1d5db; /* Emphasized borders */
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

## E2E Testing Requirements (Playwright)

### Critical Testing Philosophy

**ALL E2E tests MUST test actual functionality, not just UI element existence.**

❌ **BAD TEST** - Only checks if button exists:

```typescript
test('should have save button', async ({ page }) => {
  const saveButton = page.getByRole('button', { name: /save/i });
  await expect(saveButton).toBeVisible();
});
```

✅ **GOOD TEST** - Tests actual functionality:

```typescript
test('should create contact and verify it appears in list', async ({ page }) => {
  // Create contact
  await page.goto('/admin/master/contact/create');
  await page.fill('input[placeholder*="First Name"]', 'John');
  await page.fill('input[placeholder*="Last Name"]', 'Doe');
  await page.fill('input[type="email"]', 'john.doe@example.com');
  await page.getByRole('button', { name: /save|create/i }).click();

  // VERIFY contact was created
  await page.goto('/admin/master/contact');
  await expect(page.getByText('John Doe')).toBeVisible();
  await expect(page.getByText('john.doe@example.com')).toBeVisible();
});
```

### Required Test Categories

Every CRUD feature MUST have these test types:

#### 1. CREATE Tests

**Required Tests:**

- **Create with valid data** - Fill all required fields, submit, verify entity appears in list
- **Create validation** - Try to submit with missing required fields, verify validation errors show
- **Create with invalid data** - Submit invalid email/phone/etc, verify validation prevents submission
- **Verify persistence** - After creation, refresh page and verify entity still exists

**Example:**

```typescript
test('should create contact with valid data and verify in list', async ({ page }) => {
  const uniqueEmail = `test${Date.now()}@example.com`;

  // Navigate to create form
  await page.goto('/admin/master/contact/create');

  // Fill required fields
  await page.fill('input[placeholder*="First Name"]', 'John');
  await page.fill('input[placeholder*="Last Name"]', 'Doe');
  await page.fill('input[type="email"]', uniqueEmail);

  // Select contact type
  await page.selectOption('select[name="contactType"]', 'CUSTOMER');

  // Submit form
  await page.getByRole('button', { name: /save|create/i }).click();
  await page.waitForURL('**/contact/**');

  // VERIFY: Go to list and confirm contact exists
  await page.goto('/admin/master/contact');
  await expect(page.getByText('John Doe')).toBeVisible();
  await expect(page.getByText(uniqueEmail)).toBeVisible();

  // VERIFY: Refresh page and confirm persistence
  await page.reload();
  await expect(page.getByText('John Doe')).toBeVisible();
});

test('should validate required fields on create', async ({ page }) => {
  await page.goto('/admin/master/contact/create');

  // Try to submit empty form
  await page.getByRole('button', { name: /save|create/i }).click();

  // VERIFY: Validation errors appear
  await expect(page.getByText(/first name.*required/i)).toBeVisible();
  await expect(page.getByText(/email.*required/i)).toBeVisible();

  // VERIFY: Still on create page (not submitted)
  expect(page.url()).toContain('create');
});

test('should validate email format on create', async ({ page }) => {
  await page.goto('/admin/master/contact/create');

  await page.fill('input[placeholder*="First Name"]', 'John');
  await page.fill('input[type="email"]', 'invalid-email');
  await page.getByRole('button', { name: /save|create/i }).click();

  // VERIFY: Email validation error appears
  await expect(page.getByText(/invalid.*email/i)).toBeVisible();

  // VERIFY: Form not submitted
  expect(page.url()).toContain('create');
});
```

#### 2. READ/VIEW Tests

**Required Tests:**

- **View list** - Verify entities display in list with correct data
- **View details** - Click entity, verify detail page shows all data correctly
- **Search functionality** - Search for entity, verify results update
- **Filter functionality** - Apply filters, verify list updates correctly

**Example:**

```typescript
test('should display contacts in list with correct data', async ({ page }) => {
  // First create a test contact
  const uniqueEmail = `test${Date.now()}@example.com`;
  await createTestContact(page, 'John', 'Doe', uniqueEmail);

  // Navigate to list
  await page.goto('/admin/master/contact');

  // VERIFY: Contact appears with correct data
  const row = page.getByRole('row', { name: new RegExp(uniqueEmail) });
  await expect(row).toBeVisible();
  await expect(row.getByText('John Doe')).toBeVisible();
  await expect(row.getByText(uniqueEmail)).toBeVisible();
});

test('should search contacts by name', async ({ page }) => {
  // Create two test contacts
  await createTestContact(page, 'John', 'Doe', 'john@test.com');
  await createTestContact(page, 'Jane', 'Smith', 'jane@test.com');

  await page.goto('/admin/master/contact');

  // VERIFY: Both contacts appear
  await expect(page.getByText('John Doe')).toBeVisible();
  await expect(page.getByText('Jane Smith')).toBeVisible();

  // Search for "John"
  await page.fill('input[placeholder*="search" i]', 'John');
  await page.waitForTimeout(500); // Wait for search to trigger

  // VERIFY: Only John appears
  await expect(page.getByText('John Doe')).toBeVisible();
  await expect(page.getByText('Jane Smith')).not.toBeVisible();

  // Clear search
  await page.fill('input[placeholder*="search" i]', '');
  await page.waitForTimeout(500);

  // VERIFY: Both appear again
  await expect(page.getByText('John Doe')).toBeVisible();
  await expect(page.getByText('Jane Smith')).toBeVisible();
});
```

#### 3. UPDATE/EDIT Tests

**Required Tests:**

- **Edit with valid data** - Edit entity, save, verify changes appear in list
- **Edit validation** - Clear required field, verify validation prevents save
- **Edit persistence** - After editing, refresh and verify changes persisted
- **Verify original data loads** - Open edit form, verify existing data pre-fills

**Example:**

```typescript
test('should edit contact and verify changes in list', async ({ page }) => {
  // Create test contact
  const originalEmail = `original${Date.now()}@example.com`;
  await createTestContact(page, 'John', 'Doe', originalEmail);

  // Navigate to list and click edit
  await page.goto('/admin/master/contact');
  const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
  await actionsButton.click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  // VERIFY: Form loads with existing data
  await expect(page.locator('input[placeholder*="First Name"]')).toHaveValue('John');
  await expect(page.locator('input[placeholder*="Last Name"]')).toHaveValue('Doe');

  // Edit data
  const newEmail = `updated${Date.now()}@example.com`;
  await page.fill('input[placeholder*="First Name"]', 'Johnny');
  await page.fill('input[type="email"]', newEmail);

  // Save changes
  await page.getByRole('button', { name: /update|save/i }).click();
  await page.waitForURL('**/contact/**');

  // VERIFY: Changes appear in list
  await page.goto('/admin/master/contact');
  await expect(page.getByText('Johnny Doe')).toBeVisible();
  await expect(page.getByText(newEmail)).toBeVisible();
  await expect(page.getByText(originalEmail)).not.toBeVisible();

  // VERIFY: Refresh and confirm persistence
  await page.reload();
  await expect(page.getByText('Johnny Doe')).toBeVisible();
});

test('should validate required fields on edit', async ({ page }) => {
  // Create test contact
  await createTestContact(page, 'John', 'Doe', 'john@test.com');

  // Open edit form
  await page.goto('/admin/master/contact');
  const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
  await actionsButton.click();
  await page.getByRole('menuitem', { name: 'Edit' }).click();

  // Clear required field
  await page.fill('input[placeholder*="First Name"]', '');

  // Try to save
  await page.getByRole('button', { name: /update|save/i }).click();

  // VERIFY: Validation error appears
  await expect(page.getByText(/first name.*required/i)).toBeVisible();

  // VERIFY: Still on edit page
  expect(page.url()).toContain('contact');
});
```

#### 4. DELETE Tests

**Required Tests:**

- **Delete confirmation** - Click delete, verify confirmation dialog appears
- **Delete and verify removal** - Confirm deletion, verify entity removed from list
- **Delete cancellation** - Click delete, cancel, verify entity still exists
- **Delete with constraints** - Try to delete entity with dependencies, verify prevention

**Example:**

```typescript
test('should delete contact and verify removal from list', async ({ page }) => {
  // Create test contact
  const uniqueEmail = `todelete${Date.now()}@example.com`;
  await createTestContact(page, 'ToDelete', 'Contact', uniqueEmail);

  // Navigate to list
  await page.goto('/admin/master/contact');

  // VERIFY: Contact exists
  await expect(page.getByText(uniqueEmail)).toBeVisible();

  // Click delete
  const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
  await actionsButton.click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();

  // VERIFY: Confirmation dialog appears
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText(/are you sure/i)).toBeVisible();

  // Confirm deletion
  await page.getByRole('button', { name: /delete|confirm/i }).click();
  await page.waitForTimeout(1000);

  // VERIFY: Contact removed from list
  await expect(page.getByText(uniqueEmail)).not.toBeVisible();

  // VERIFY: Refresh and confirm still deleted
  await page.reload();
  await expect(page.getByText(uniqueEmail)).not.toBeVisible();
});

test('should cancel delete and keep contact', async ({ page }) => {
  // Create test contact
  const uniqueEmail = `keepme${Date.now()}@example.com`;
  await createTestContact(page, 'KeepMe', 'Contact', uniqueEmail);

  await page.goto('/admin/master/contact');

  // Click delete
  const actionsButton = page.locator('table tbody button[aria-haspopup="menu"]').first();
  await actionsButton.click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();

  // Cancel deletion
  await page.getByRole('button', { name: /cancel|no/i }).click();

  // VERIFY: Contact still exists
  await expect(page.getByText(uniqueEmail)).toBeVisible();
});
```

### Helper Functions

Create reusable helper functions for common operations:

```typescript
// Helper to create a test contact
async function createTestContact(page: Page, firstName: string, lastName: string, email: string) {
  await page.goto('/admin/master/contact/create');
  await page.fill('input[placeholder*="First Name"]', firstName);
  await page.fill('input[placeholder*="Last Name"]', lastName);
  await page.fill('input[type="email"]', email);
  await page.selectOption('select[name="contactType"]', 'CUSTOMER');
  await page.getByRole('button', { name: /save|create/i }).click();
  await page.waitForURL('**/contact/**');
}

// Helper to login
async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.fill('input#email-input', username);
  await page.fill('input#password-input', password);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL('**/admin/**');
}
```

### Test Data Management

**Use unique identifiers** to avoid conflicts:

```typescript
const timestamp = Date.now();
const email = `test${timestamp}@example.com`;
```

**Clean up test data** when possible:

```typescript
test.afterEach(async ({ page }) => {
  // Delete test contacts created during test
  // This prevents database bloat
});
```

### What NOT to Test

❌ **DO NOT** write tests that only check if UI elements exist
❌ **DO NOT** write tests that don't verify actual functionality
❌ **DO NOT** skip verification steps after actions
❌ **DO NOT** assume operations succeeded without checking

### Test Organization

```
e2e/
├── contact-crud.spec.ts          # Full CRUD operations with verification
├── contact-validation.spec.ts    # All validation scenarios
├── contact-search-filter.spec.ts # Search and filter functionality
└── helpers/
    ├── contact-helpers.ts        # Reusable contact functions
    └── auth-helpers.ts           # Login/logout helpers
```

## Git Workflow

- Branch from `develop`
- Create feature branches: `feature/your-feature-name`
- PR to `develop` for review
