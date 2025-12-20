const fs = require('fs');
const path = require('path');

// Files to migrate
const files = [
  'src/screens/quotation/screens/create/screen.js',
  'src/screens/quotation/screens/detail/screen.js',
  'src/screens/purchase_order/screens/create/screen.js',
  'src/screens/purchase_order/screens/detail/screen.js',
  'src/screens/goods_received_note/screens/create/screen.js',
  'src/screens/goods_received_note/screens/detail/screen.js',
  'src/screens/request_for_quotation/screens/create/screen.js',
  'src/screens/request_for_quotation/screens/detail/screen.js',
  'src/screens/quotation/screen.js',
  'src/screens/organization/screen.js',
  'src/screens/customer_invoice/screen.js',
  'src/screens/customer_invoice/screens/record_payment/screen.js',
  'src/screens/customer_invoice/screens/detail/screen.js',
  'src/screens/customer_invoice/screens/view/screen.js',
  'src/screens/customer_invoice/screens/create/screen.js',
  'src/screens/debitNotes/screens/detail/screen.js',
  'src/screens/debitNotes/screens/create/screen.js',
  'src/screens/expense/screens/detail/screen.js',
  'src/screens/expense/screens/view/screen.js',
  'src/screens/expense/screens/create/screen.js',
  'src/screens/payroll_run/sections/createCompanyDetailsModal.js',
  'src/screens/contact/screen.js',
  'src/screens/payment/screens/detail/screen.js',
  'src/screens/vat_code/screen.js',
  'src/screens/payrollemp/screens/create/screen.js',
  'src/screens/product/screens/detail/sections/invetoryHistorymodal.js',
  'src/screens/product/screens/inventory_edit/screen.js',
  'src/screens/product/screens/inventory_history/screen.js',
  'src/screens/transactions_report/sections/customer_report/index.js',
  'src/screens/transactions_report/sections/expense_report/index.js',
  'src/screens/transactions_report/sections/account_balance/index.js',
  'src/screens/transactions_report/screen.js',
  'src/screens/purchase_order/screens/view/screen.js',
  'src/screens/project/screen.js',
  'src/screens/chart_account/screen.js',
  'src/screens/supplier_invoice/screen.js',
  'src/screens/supplier_invoice/screens/record_payment/screen.js',
  'src/screens/supplier_invoice/screens/detail/screen.js',
  'src/screens/supplier_invoice/screens/view/screen.js',
  'src/screens/supplier_invoice/screens/create/screen.js',
  'src/screens/bank_account/screens/transactions/screens/reconcile/screen.js',
  'src/screens/inventory/sections/inventory_dashboard/index.js',
  'src/screens/inventory/sections/inventory_summary/sections/invetoryHistorymodal.js',
  'src/screens/creditNotes/screens/detail/screen.js',
  'src/screens/goods_received_note/screens/view/screen.js',
  'src/screens/product_category/screen.js',
  'src/screens/currency/screen.js',
  'src/screens/request_for_quotation/screens/view/screen.js'
];

const baseDir = '/Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend';

files.forEach(file => {
  const filePath = path.join(baseDir, file);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace import
    content = content.replace(
      /import\s+\{\s*BootstrapTable,\s*TableHeaderColumn\s*\}\s+from\s+['"]react-bootstrap-table['"]/g,
      "import { DataTable } from '@/components/ui/data-table'"
    );

    // Remove CSS import
    content = content.replace(
      /import\s+['"]react-bootstrap-table\/dist\/react-bootstrap-table-all\.min\.css['"]\s*;?\s*\n/g,
      ''
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Migrated imports in ${file}`);
  } catch (error) {
    console.error(`✗ Error migrating ${file}:`, error.message);
  }
});

console.log('\n✓ Import migration complete. Please manually migrate BootstrapTable components to DataTable.');
console.log('Note: Due to the complexity of table structures in these files, manual conversion is required.');
