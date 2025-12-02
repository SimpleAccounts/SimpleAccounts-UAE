export default {
  // API_ROOT_URL:'https://devbox-api.app.simpleaccounts.io',
  //API_ROOT_URL: "https://dev-api.app.simpleaccounts.io",
  // API_ROOT_URL: 'https://k8s-api.dev.simplevat.com',
   
  
  
 // API_ROOT_URL: 'http://localhost:8080',



  // API_ROOT_URL: 'http://192.168.2.105:8080',
  // API_ROOT_URL: 'https://datainn-api.ae.simpleaccounts.io',
  API_ROOT_URL: window._env_.SIMPLEVAT_HOST,

 // API_ROOT_URL: 'https://sit2-api.app.simpleaccounts.io',


  
  // FRONTEND_RELEASE: 'latest',
  FRONTEND_RELEASE: window._env_.SIMPLEVAT_RELEASE,
 // STRAPI_BASE_URL : 'https://strapi-api-test-ae.app.simpleaccounts.io',
 SIMPLE_SERVICES_HOST: window._env_.SIMPLE_SERVICES_HOST,
 SIMPLE_SERVICES_GET_SUBSCRIPTION_KEY: window._env_.SIMPLE_SERVICES_GET_SUBSCRIPTION_KEY,



  DASHBOARD: true,
  INCOME_MODULE: true,
  EXPENSE_MODULE: true,
  BANKING_MODULE: true,
  ACCOUNTANT_MODULE: true,
  REPORTS_MODULE: true,
  MASTER_MODULE: true,
  INVENTORY_MODULE: true,
  PAYROLL_MODULE: true,

  EXPENSE_EXPENSES: true,
  EXPENSE_SI: true,
  EXPENSE_PR: true,
  EXPENSE_RFQ: false,
  EXPENSE_PO: false,
  EXPENSE_GRN: false,
  EXPENSE_DN: true,

  INCOME_CI: true,
  INCOME_IR: true,
  INCOME_Q: true,
  INCOME_TCN: true,

  BANKING_BA: true,

  ACCOUNTANT_OB: true,
  ACCOUNTANT_JOURNALS: true,

  MASTER_COA: true,
  MASTER_CONTACT: true,
  MASTER_PRODUCTS: true,
  MASTER_PC: true,
  MASTER_VAT: true,
  MASTER_CR: true,
  MASTER_EMPLOYEE: true,

  PAYROLL_PR: true,
  PAYROLL_PC: true,

  ADD_ROLES: true,
  ADD_CURRENCY: true,

  SETTING_THEME: false,
  SETTING_IMPORT: true,

  REPORTS_HEAD_FI: true,
  REPORTS_PAL: true,
  REPORTS_BS: true,
  REPORTS_HBS: true,
  REPORTS_TB: true,
  REPORTS_CF: true,

  REPORTS_HEAD_SALES: true,
  REPORTS_SALESBYCUSTOMER: true,
  REPORTS_SALSEBYPRODUCT: true,

  REPORTS_HEAD_EXPENSE: true,
  REPORTS_EXPENSEDETAILS: true,
  REPORTS_EXPENSEBYCATEGORY: true,

  REPORTS_HEAD_RECEIVABLE: true,
  REPORTS_RECEIVABLEINVOICESUMMARY: true,
  REPORTS_RECEIVABLEINVOICEDETAILS: true,

  REPORTS_HEAD_PR: true,
  REPORTS_TAXCREDITNOTEDETAILS: true,

  REPORTS_HEAD_DN: true,

  REPORTS_HEAD_INVOICES: true,
  REPORTS_INVOICEDETAILS: true,

  REPORTS_ARAGINGREPORT: true,

  REPORT_DGL: true,

  REPORTS_HEAD_PURCHASE: true,
  REPORTS_PURCHASEBYVENDOR: true,
  REPORTS_PURCHASEBYPRODUCT: true,

  REPORTS_PAYABLE: true,
  REPORTS_PAYABLESINVOICESUMMARY: true,
  REPORTS_PAYABLEINVOICEDETAILS: true,

  REPORTS_PAYROLLSSUMMARY: true,

  REPORTS_HEAD_VAT: true,
  REPORTS_VAT_REPORTS: true,
  REPORTS_FTA_AUDIT: true,
  REPORTS_EXCISE_TAX: true,
  VALIDATE_SUBSCRIPTION: true,

  BASE_ROUTE: "/admin",
  SECONDARY_BASE_ROUTE: "/admin/income",
};
