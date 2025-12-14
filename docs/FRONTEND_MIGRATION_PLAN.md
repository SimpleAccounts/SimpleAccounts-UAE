# Frontend Migration Plan: Vite + shadcn/ui + Tailwind CSS

## Overview

Comprehensive migration of SimpleAccounts-UAE frontend from Create React App with mixed UI libraries to a modern Vite + shadcn/ui + Tailwind CSS stack.

## Current State Analysis

| Component        | Current                                  | Target                    |
| ---------------- | ---------------------------------------- | ------------------------- |
| Build Tool       | Create React App 5.0.1                   | Vite 5.x                  |
| React            | 18.2.0                                   | 18.2.0 (keep)             |
| UI Components    | Mixed (CoreUI, Reactstrap, MUI v4/v5)    | shadcn/ui + Base UI       |
| Styling          | Bootstrap 4.6 + SASS + styled-components | Tailwind CSS              |
| State Management | Redux + Redux Thunk                      | Redux Toolkit             |
| Routing          | React Router 5.0.1                       | React Router 6.x          |
| Forms            | Formik 1.5.1                             | React Hook Form + Zod     |
| Date/Time        | Moment.js 2.30.1                         | Day.js                    |
| Tables           | react-bootstrap-table                    | TanStack Table            |
| Charts           | Chart.js 2.8 + ApexCharts                | ApexCharts (consolidated) |

## Impact Analysis

| Category             | Files Affected          | Complexity |
| -------------------- | ----------------------- | ---------- |
| Total JS/JSX files   | 1,234                   | -          |
| UI Library imports   | 310 files (406 imports) | High       |
| Formik usage         | 157 files               | Medium     |
| Moment.js usage      | 190 files               | Low        |
| React Router usage   | 16 files                | Medium     |
| Redux stores/actions | ~100 files              | Medium     |

---

## Phase 1: Foundation & Build System

### 1.1 Vite Migration

- [ ] Initialize Vite configuration
- [ ] Migrate environment variables (REACT*APP* → VITE\_)
- [ ] Update import aliases and paths
- [ ] Configure build optimization
- [ ] Update CI/CD scripts

### 1.2 Tailwind CSS Setup

- [ ] Install Tailwind CSS and dependencies
- [ ] Configure tailwind.config.js
- [ ] Set up CSS custom properties for theming
- [ ] Create base utility classes
- [ ] Configure PostCSS

### 1.3 shadcn/ui + Base UI Setup

- [ ] Install shadcn/ui CLI and dependencies
- [ ] Configure components.json
- [ ] Set up Base UI primitives
- [ ] Create component directory structure
- [ ] Configure path aliases

---

## Phase 2: Core Infrastructure

### 2.1 React Router v6 Migration

- [ ] Update react-router-dom to v6
- [ ] Migrate Switch → Routes
- [ ] Migrate component prop → element prop
- [ ] Update useHistory → useNavigate
- [ ] Migrate nested routes
- [ ] Update route guards/protected routes

### 2.2 Redux Toolkit Migration

- [ ] Install @reduxjs/toolkit
- [ ] Create store with configureStore
- [ ] Migrate reducers to createSlice
- [ ] Replace Redux Thunk with createAsyncThunk
- [ ] Update component connections

### 2.3 Date Library Migration (Moment → Day.js)

- [ ] Install Day.js with required plugins
- [ ] Create date utility wrapper
- [ ] Migrate moment() calls to dayjs()
- [ ] Update date formatting patterns
- [ ] Update date picker components

---

## Phase 3: Form System Migration

### 3.1 React Hook Form Setup

- [ ] Install react-hook-form and @hookform/resolvers
- [ ] Install Zod for validation
- [ ] Create form component wrappers
- [ ] Create reusable form field components

### 3.2 Formik → React Hook Form Migration

- [ ] Migrate simple forms (auth, settings)
- [ ] Migrate medium complexity forms (contacts, products)
- [ ] Migrate complex forms (invoices, payroll)
- [ ] Update validation schemas (Yup → Zod)

---

## Phase 4: UI Component Library Migration

### 4.1 Core shadcn/ui Components

- [ ] Add Button component
- [ ] Add Input component
- [ ] Add Select component
- [ ] Add Dialog/Modal component
- [ ] Add Card component
- [ ] Add Table component
- [ ] Add Form components
- [ ] Add Dropdown Menu component
- [ ] Add Toast/Notification component
- [ ] Add Tabs component
- [ ] Add Badge component
- [ ] Add Alert component

### 4.2 Layout Components Migration

- [ ] Migrate Header/Navbar (CoreUI → shadcn)
- [ ] Migrate Sidebar (CoreUI → shadcn)
- [ ] Migrate Footer
- [ ] Migrate Page layouts
- [ ] Create responsive container components

### 4.3 Data Display Components

- [ ] Install TanStack Table
- [ ] Create DataTable component with shadcn styling
- [ ] Migrate react-bootstrap-table usage
- [ ] Add sorting, filtering, pagination
- [ ] Migrate ag-grid instances (if keeping)

### 4.4 Form Components Migration

- [ ] Migrate text inputs (Reactstrap → shadcn Input)
- [ ] Migrate select dropdowns (react-select → shadcn Select)
- [ ] Migrate date pickers
- [ ] Migrate file upload components
- [ ] Migrate checkbox/radio components
- [ ] Migrate multi-select components

### 4.5 Feedback Components Migration

- [ ] Migrate modals (Reactstrap Modal → shadcn Dialog)
- [ ] Migrate alerts (Reactstrap Alert → shadcn Alert)
- [ ] Migrate toasts (react-toastify → shadcn Toast)
- [ ] Migrate loaders/spinners
- [ ] Migrate progress indicators

---

## Phase 5: Screen-by-Screen Migration

### 5.1 Authentication Screens

- [ ] Login screen
- [ ] Register screen
- [ ] Reset password screen
- [ ] New password screen

### 5.2 Dashboard & Navigation

- [ ] Main dashboard
- [ ] Navigation/sidebar
- [ ] Header components
- [ ] Notification center

### 5.3 Financial Module Screens

- [ ] Customer Invoice (list, create, detail, view)
- [ ] Supplier Invoice (list, create, detail, view)
- [ ] Expense (list, create, detail, view)
- [ ] Payment (list, create, detail)
- [ ] Receipt (list, create, detail)
- [ ] Journal (list, create, detail)
- [ ] Credit Notes
- [ ] Debit Notes

### 5.4 Contact & Product Screens

- [ ] Contact management
- [ ] Product management
- [ ] Product categories
- [ ] Chart of accounts

### 5.5 Procurement Module

- [ ] Request for Quotation
- [ ] Purchase Order
- [ ] Goods Received Note
- [ ] Quotation

### 5.6 Payroll Module

- [ ] Employee management
- [ ] Payroll run
- [ ] Salary components
- [ ] Salary templates
- [ ] Salary structures
- [ ] Designations

### 5.7 Reports Module

- [ ] Financial reports
- [ ] VAT reports
- [ ] Corporate tax reports
- [ ] Transaction reports
- [ ] Inventory reports

### 5.8 Settings & Configuration

- [ ] Organization settings
- [ ] User management
- [ ] Role management
- [ ] General settings
- [ ] Currency settings
- [ ] VAT codes

---

## Phase 6: Chart Library Consolidation

### 6.1 Chart Migration

- [ ] Audit current chart usage
- [ ] Standardize on ApexCharts
- [ ] Remove Chart.js dependency
- [ ] Update dashboard charts
- [ ] Update report charts

---

## Phase 7: Testing & Quality

### 7.1 Test Migration

- [ ] Update Jest configuration for Vite
- [ ] Migrate to Vitest (optional)
- [ ] Update component tests
- [ ] Update E2E tests (Playwright)
- [ ] Ensure coverage thresholds maintained

### 7.2 Code Quality

- [ ] Update ESLint configuration
- [ ] Add Prettier configuration
- [ ] Remove unused dependencies
- [ ] Resolve TypeScript errors (if migrating)

---

## Phase 8: Cleanup & Optimization

### 8.1 Dependency Cleanup

- [ ] Remove Bootstrap CSS
- [ ] Remove CoreUI dependencies
- [ ] Remove Reactstrap
- [ ] Remove MUI v4 (keep v5 DataGrid temporarily)
- [ ] Remove styled-components (if fully migrated)
- [ ] Remove Moment.js
- [ ] Remove old table libraries

### 8.2 Performance Optimization

- [ ] Implement code splitting
- [ ] Optimize bundle size
- [ ] Add lazy loading for routes
- [ ] Configure caching strategies

### 8.3 Final Validation

- [ ] Full regression testing
- [ ] Performance benchmarking
- [ ] Accessibility audit
- [ ] Cross-browser testing

---

## Risk Mitigation

| Risk                        | Mitigation                                       |
| --------------------------- | ------------------------------------------------ |
| Large-scale UI changes      | Incremental migration, screen by screen          |
| Form validation differences | Create adapter layer between Formik/RHF          |
| Bundle size regression      | Regular size audits, tree-shaking verification   |
| Visual inconsistencies      | Design system documentation, component storybook |
| Test failures               | Update tests alongside component migrations      |

## Migration Strategy

### Recommended Approach: Parallel Adoption

1. **Set up new stack alongside existing** - Vite, Tailwind, shadcn can coexist initially
2. **Create component wrappers** - New shadcn components that wrap existing functionality
3. **Migrate screen by screen** - Complete one module before moving to next
4. **Remove old dependencies gradually** - After each module is fully migrated

### Coexistence Pattern

```
src/
├── components/          # Old components (gradually remove)
├── components-new/      # New shadcn components (rename to components later)
├── screens/            # Existing screens (migrate incrementally)
└── lib/                # shadcn utilities
```

---

## Success Criteria

- [ ] Application builds with Vite
- [ ] All screens functional with new UI
- [ ] No Bootstrap/CoreUI/Reactstrap dependencies
- [ ] Bundle size reduced by 30%+
- [ ] All tests passing
- [ ] Performance metrics maintained or improved

---

_Plan created: December 2025_
_Estimated screens: 80+_
_Estimated components: 200+_
