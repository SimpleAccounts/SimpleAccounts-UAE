# Code Coverage 95% Implementation Plan

**Target:** Achieve 95%+ code coverage across all layers
**Current State:** Backend ~7%, Frontend ~6%
**Scope:** 1,101 backend files, 1,113 frontend files, 64 screens
**Last Updated:** 2025-12-05

---

## Current Progress Summary

| Phase | Status | Progress | Tests Created |
|-------|--------|----------|---------------|
| Phase 1: Backend Service Tests | IN PROGRESS | 13/78 (17%) | ~450 tests |
| Phase 2: Backend Controller Tests | PENDING | 0/50 (0%) | 0 tests |
| Phase 3: Backend DAO/Repository Tests | PENDING | 0/103 (0%) | 0 tests |
| Phase 4: Backend Utility Tests | PENDING | 0/37 (0%) | 0 tests |
| Phase 5: Frontend Screen Tests | PENDING | 0/64 (0%) | 0 tests |
| Phase 6: Frontend Redux Tests | PENDING | 0/128 (0%) | 0 tests |
| Phase 7: Playwright E2E Tests | PENDING | 0/50 (0%) | 0 tests |
| Phase 8: Integration Tests | PENDING | 0/7 (0%) | 0 tests |

**Overall Progress: ~3% complete**

---

## Detailed Todo Status

### Phase 1: Backend Service Layer Tests - IN PROGRESS (17%)

**Completed Service Tests (13 files):**
| # | Service Test File | Status | Est. Tests |
|---|-------------------|--------|------------|
| 1 | InvoiceServiceImplTest.java | DONE | ~10 |
| 2 | ExpenseServiceImplTest.java | DONE | ~10 |
| 3 | ReconcileStatusServiceImplTest.java | DONE | ~15 |
| 4 | VatReportFilingServiceImplTest.java | DONE | ~10 |
| 5 | TransactionServiceImplTest.java | DONE | ~15 |
| 6 | CompanyServiceImplTest.java | DONE | ~50 |
| 7 | ProductServiceImplTest.java | DONE | ~53 |
| 8 | ContactServiceImplTest.java | DONE | ~51 |
| 9 | UserServiceImplTest.java | DONE | ~52 |
| 10 | EmployeeServiceImplTest.java | DONE | ~45 |
| 11 | PaymentServiceImplTest.java | DONE | ~40 |
| 12 | ReceiptServiceImplTest.java | DONE | ~40 |
| 13 | JournalServiceImplTest.java | DONE | ~45 |

**Pending Service Tests (65 files):**
| # | Service Implementation | Status | Priority |
|---|------------------------|--------|----------|
| 1 | ActivityServiceImpl | PENDING | Medium |
| 2 | BankAccountTypeServiceImpl | PENDING | Low |
| 3 | BankAccountServiceImpl | PENDING | High |
| 4 | BankAccountStatusServiceImpl | PENDING | Medium |
| 5 | ChartOfAccountImpl | PENDING | High |
| 6 | ChartOfAccountCategoryServiceImpl | PENDING | Medium |
| 7 | CoacTransactionCategoryServiceImpl | PENDING | Low |
| 8 | CompanyTypeServiceImpl | PENDING | Low |
| 9 | ConfigurationServiceImpl | PENDING | Medium |
| 10 | ContactTransactionServiceImpl | PENDING | Medium |
| 11 | CountryServiceImpl | PENDING | Low |
| 12 | CreditNoteInvoiceRelationServiceImpl | PENDING | Medium |
| 13 | CurrencyExchangeImpl | PENDING | High |
| 14 | CurrencyServiceImpl | PENDING | High |
| 15 | CustomerInvoiceReceiptServiceImpl | PENDING | High |
| 16 | DateFormatServiceImpl | PENDING | Low |
| 17 | DesignationTransactionCategoryServiceImpl | PENDING | Low |
| 18 | DiscountTypeServiceImpl | PENDING | Low |
| 19 | DocumentTemplateServiceImpl | PENDING | Medium |
| 20 | EmailLogsServiceImpl | PENDING | Low |
| 21 | EmployeeBankDetailsServiceImpl | PENDING | Medium |
| 22 | EmployeeDesignationServiceImpl | PENDING | Medium |
| 23 | EmployeeParentRelationServiceImpl | PENDING | Low |
| 24 | EmployeeTransactionCategoryServiceImpl | PENDING | Low |
| 25 | EmployeeUserRelationServiceImpl | PENDING | Low |
| 26 | EmploymentServiceImpl | PENDING | Medium |
| 27 | EventServiceImpl | PENDING | Low |
| 28 | FileAttachmentServiceImpl | PENDING | Medium |
| 29 | ImportedDraftTransactionServiceImpl | PENDING | High |
| 30 | IndustryTypeServiceImpl | PENDING | Low |
| 31 | InventoryHistoryServiceImpl | PENDING | Medium |
| 32 | InventoryServiceImpl | PENDING | Medium |
| 33 | InvoiceLineItemServiceImpl | PENDING | High |
| 34 | JournalLineItemServiceImpl | PENDING | High |
| 35 | LanguageServiceImpl | PENDING | Low |
| 36 | MailThemeTemplatesServiceImpl | PENDING | Low |
| 37 | PlaceOfSupplyServiceImpl | PENDING | Medium |
| 38 | ProductCategoryServiceImpl | PENDING | Medium |
| 39 | ProductLineItemServiceImpl | PENDING | Medium |
| 40 | ProductWarehouseServiceImpl | PENDING | Medium |
| 41 | ProjectServiceImpl | PENDING | Medium |
| 42 | PurchaseServiceImpl | PENDING | High |
| 43 | ReconcileCategoryServiceImpl | PENDING | Medium |
| 44 | RoleModuleRelationServiceImpl | PENDING | Low |
| 45 | RoleModuleServiceImpl | PENDING | Low |
| 46 | RoleServiceImpl | PENDING | Medium |
| 47 | SearchViewServiceImpl | PENDING | Low |
| 48 | StateServiceImpl | PENDING | Low |
| 49 | SupplierInvoicePaymentServiceImpl | PENDING | High |
| 50 | TaxTransactionServiceImpl | PENDING | High |
| 51 | TaxTreatmentServiceImpl | PENDING | Medium |
| 52 | TitleServiceImpl | PENDING | Low |
| 53 | TransactionCategoryBalanceServiceImpl | PENDING | Medium |
| 54 | TransactionCategoryClosingBalanceServiceImpl | PENDING | Medium |
| 55 | TransactionCategoryServiceImpl | PENDING | High |
| 56 | TransactionExpensesPayrollServiceImpl | PENDING | High |
| 57 | TransactionExpensesServiceImpl | PENDING | High |
| 58 | TransactionParsingSettingServiceImpl | PENDING | Medium |
| 59 | TransactionStatusServiceImpl | PENDING | Medium |
| 60 | UnitTypeServiceImpl | PENDING | Low |
| 61 | VatCategoryServiceImpl | PENDING | High |
| 62 | VatRecordPaymentHistoryServiceImpl | PENDING | Medium |
| 63 | VatReportServiceImp | PENDING | High |
| 64 | VatTaxAgencyServiceImpl | PENDING | Medium |
| 65 | InvoiceServiceImpl (in invoice pkg) | PENDING | High |

---

### Phase 2: Backend Controller Layer Tests - PENDING (0%)

**50+ Controllers to Test:**
- bankaccountcontroller/* (5 controllers)
- invoicecontroller/* (4 controllers)
- expensescontroller/* (3 controllers)
- payroll/* (10 controllers)
- financialreport/* (8 controllers)
- contactcontroller/* (2 controllers)
- productcontroller/* (2 controllers)
- rest/* (20+ controllers)

---

### Phase 3: Backend DAO/Repository Layer Tests - PENDING (0%)

**103 DAO/Repository files to test:**
- dao/impl/* (65 DAOs)
- repository/* (38 repositories)

---

### Phase 4: Backend Utility & Helper Tests - PENDING (0%)

**37 Utility/Helper files to test:**
- utils/* (22 files)
- helper/* (15 files)

---

### Phase 5: Frontend Screen Component Tests - PENDING (0%)

**64 Screen modules to test:**
- customer_invoice (screen.test.js, reducer.test.js, actions.test.js)
- supplier_invoice
- expense
- bank_account
- payroll/*
- reports/*
- contacts
- products
- chart_of_accounts
- And 55 more...

---

### Phase 6: Frontend Redux Tests - PENDING (0%)

**128 Redux test files needed:**
- 64 reducer.test.js files
- 64 actions.test.js files

---

### Phase 7: Playwright E2E Tests - PENDING (0%)

**50 E2E test spec files needed:**
- auth/* (4 specs)
- dashboard/* (3 specs)
- invoices/* (7 specs)
- expenses/* (4 specs)
- banking/* (4 specs)
- payroll/* (5 specs)
- reports/* (5 specs)
- master-data/* (5 specs)
- settings/* (4 specs)
- cross-cutting/* (5 specs)

---

### Phase 8: Integration Tests - PENDING (0%)

**7 Integration test files needed:**
- InvoiceIntegrationTest.java
- ExpenseIntegrationTest.java
- PayrollIntegrationTest.java
- BankingIntegrationTest.java
- ReportingIntegrationTest.java
- MigrationIntegrationTest.java
- FullWorkflowIntegrationTest.java

---

## Executive Summary

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Backend Line Coverage | 7% | 95% | +88% |
| Backend Branch Coverage | 4% | 90% | +86% |
| Frontend Statement Coverage | 6% | 95% | +89% |
| Frontend Branch Coverage | 2% | 90% | +88% |
| E2E Test Scenarios | 10 | 200+ | +190 |

---

## Test File Summary

| Category | Target | Completed | Remaining |
|----------|--------|-----------|-----------|
| Backend Service Tests | 78 | 13 | 65 |
| Backend Controller Tests | 50 | 0 | 50 |
| Backend DAO Tests | 65 | 0 | 65 |
| Backend Repository Tests | 38 | 0 | 38 |
| Backend Utility Tests | 22 | 0 | 22 |
| Frontend Screen Tests | 64 | 0 | 64 |
| Frontend Reducer Tests | 64 | 0 | 64 |
| Frontend Action Tests | 64 | 0 | 64 |
| Frontend Component Tests | 200 | 0 | 200 |
| Playwright E2E Tests | 50 | 0 | 50 |
| Integration Tests | 7 | 0 | 7 |
| **TOTAL** | **702** | **13** | **689** |

---

## Estimated Test Methods

| Category | Estimated Tests |
|----------|-----------------|
| Backend Service Tests | 3,500 |
| Backend Controller Tests | 2,500 |
| Backend DAO Tests | 1,500 |
| Backend Repository Tests | 800 |
| Backend Utility Tests | 500 |
| Frontend Screen Tests | 1,500 |
| Frontend Reducer Tests | 1,000 |
| Frontend Action Tests | 1,000 |
| Frontend Component Tests | 2,000 |
| Playwright E2E Tests | 500 |
| Integration Tests | 200 |
| **TOTAL** | **15,000** |

**Currently Created: ~450 test methods**
**Remaining: ~14,550 test methods**

---

## Test Patterns

### 1.2 Test Pattern for Services

```java
@ExtendWith(MockitoExtension.class)
class ServiceImplTest {
    @Mock private SomeDao someDao;
    @Mock private OtherService otherService;
    @InjectMocks private ServiceImpl service;

    // CRUD Operations
    @Test void shouldCreate() { }
    @Test void shouldUpdate() { }
    @Test void shouldDelete() { }
    @Test void shouldFindById() { }
    @Test void shouldFindAll() { }

    // Business Logic
    @Test void shouldCalculate() { }
    @Test void shouldValidate() { }

    // Edge Cases
    @Test void shouldHandleNullInput() { }
    @Test void shouldHandleEmptyList() { }
}
```

### 2.2 Controller Test Pattern

```java
@WebMvcTest(SomeController.class)
@Import(SecurityConfig.class)
class SomeControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private SomeService someService;
    @MockBean private JwtTokenUtil jwtTokenUtil;

    @Test void shouldGetAll() { }
    @Test void shouldGetById() { }
    @Test void shouldCreate() { }
    @Test void shouldUpdate() { }
    @Test void shouldDelete() { }
    @Test void shouldRequireAuthentication() { }
}
```

### 5.2 Frontend Test Pattern

```javascript
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

describe('Screen', () => {
  it('should render', () => { });
  it('should show loading state', () => { });
  it('should handle user interactions', () => { });
  it('should dispatch actions', () => { });
});
```

### 7.2 E2E Test Pattern

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature', () => {
  test('should complete user journey', async ({ page }) => {
    await page.goto('/feature');
    await page.click('button');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

---

## Execution Order

1. **Backend Services** - Highest ROI for coverage (IN PROGRESS)
2. **Backend Controllers** - API contract validation
3. **Frontend Reducers** - State management coverage
4. **Frontend Screens** - UI coverage
5. **Playwright E2E** - Full journey validation
6. **Backend DAOs** - Data layer coverage
7. **Remaining utilities** - Edge cases
8. **Integration Tests** - End-to-end workflows

---

## Success Metrics

| Metric | Current | Phase 1 | Phase 2 | Final |
|--------|---------|---------|---------|-------|
| Backend Line | 7% | 50% | 80% | 95% |
| Backend Branch | 4% | 40% | 70% | 90% |
| Frontend Stmt | 6% | 50% | 80% | 95% |
| Frontend Branch | 2% | 40% | 70% | 90% |
| E2E Scenarios | 10 | 50 | 150 | 200+ |
| Total Tests | 1,095 | 5,000 | 10,000 | 15,000+ |
