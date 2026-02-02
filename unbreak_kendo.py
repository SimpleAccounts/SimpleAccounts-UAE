import os
import re

def unbreak_file(filepath):
    print(f"Un-breaking {filepath}")
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Remove the incorrectly added </div> tags at the end
    content = re.sub(r'(</div>\n)+export default', 'export default', content)
    
    # 2. Fix the broken opening tag that still has attributes outside
    # Match <div> followed by Kendo attributes and ending with >
    content = re.sub(r'<div>\s*\(this\.pdfExportComponent = component\)\}.*?>', '<div>', content, flags=re.DOTALL)
    content = re.sub(r'<div>\s*ref=\{pdfExportComponent\}.*?>', '<div>', content, flags=re.DOTALL)
    
    # 3. Fix the case where PDFExport was partially replaced
    content = re.sub(r'<PDFExport[^>]*>', '<div>', content, flags=re.DOTALL)

    # 4. Remove other leftovers that might be floating around
    content = re.sub(r'\s+ref=\{pdfExportComponent\}\n?', '', content)
    content = re.sub(r'\s+ref=\{component => \(this\.pdfExportComponent = component\)\}\n?', '', content)
    content = re.sub(r'\s+scale=\{0\.8\}\n?', '', content)
    content = re.sub(r'\s+paperSize="A3"\n?', '', content)
    content = re.sub(r'\s+fileName=\{[^}]*\}\n?', '', content)
    content = re.sub(r'\s+margin=\{\{ top: 0, bottom: 0, left: 30, right: 31 \}\}\n?', '', content)

    # 5. Restore missing </div> tags if they were removed by the aggressive regex
    # This is hard to do automatically perfectly, but let's try to balance it.
    # We'll use a stack-based approach to find where the imbalance is.
    
    # But wait, the aggressive regex removed </div></div> pairs. 
    # Usually these were at the end of the return statement.
    
    # Let's count again.
    open_tags = len(re.findall(r'<div', content))
    close_tags = len(re.findall(r'</div', content))
    
    if open_tags > close_tags:
        diff = open_tags - close_tags
        # Find the last ); or } and insert before it
        if ");" in content:
            # Find the last );
            pos = content.rfind(");")
            content = content[:pos] + "</div>\n" * diff + content[pos:]
        elif "}" in content:
            # Find the last }
            pos = content.rfind("}")
            content = content[:pos] + "</div>\n" * diff + content[pos:]

    with open(filepath, 'w') as f:
        f.write(content)

# List of files to fix
files_to_fix = [
    "apps/frontend/src/screens/request_for_quotation/screens/view/screen.js",
    "apps/frontend/src/screens/goods_received_note/screens/view/screen.js",
    "apps/frontend/src/screens/goods_received_note/screens/view/screen.jsx",
    "apps/frontend/src/screens/detailed_general_ledger_report/screen.js",
    "apps/frontend/src/screens/creditNotes/screens/view/screen.js",
    "apps/frontend/src/screens/inventory/sections/inventory_summary/index.jsx",
    "apps/frontend/src/screens/inventory/sections/inventory_summary/sections/invetoryHistorymodal.js",
    "apps/frontend/src/screens/purchase_order/screens/view/screen.js",
    "apps/frontend/src/screens/purchase_order/screens/view/screen.jsx",
    "apps/frontend/src/screens/product/screens/detail/sections/invetoryHistorymodal.jsx",
    "apps/frontend/src/screens/payrollemp/screens/view/sections/viewPayslip.js",
    "apps/frontend/src/screens/financial_report/sections/expense_details/screen.js",
    "apps/frontend/src/screens/financial_report/sections/payables_invoice_details/screen.js",
    "apps/frontend/src/screens/financial_report/sections/purchase_by_item/screen.js",
    "apps/frontend/src/screens/financial_report/sections/ar_aging_report/screen.jsx",
    "apps/frontend/src/screens/financial_report/sections/sales_by_customer/screen.js",
    "apps/frontend/src/screens/financial_report/sections/sales_by_product/screen.js",
    "apps/frontend/src/screens/financial_report/sections/trail_Balances/screen.js",
    "apps/frontend/src/screens/financial_report/sections/payroll_summary/screen.js",
    "apps/frontend/src/screens/financial_report/sections/purchase_by_vendor/screen.js",
    "apps/frontend/src/screens/financial_report/sections/Fta_Audit_Report/screen.js",
    "apps/frontend/src/screens/financial_report/sections/balance_sheet/screen.js",
    "apps/frontend/src/screens/financial_report/sections/receivable_invoice_details/screen.js",
    "apps/frontend/src/screens/financial_report/sections/horizontal_balance_sheet/screen.js",
    "apps/frontend/src/screens/financial_report/sections/expense_by_catogery/screen.js",
    "apps/frontend/src/screens/financial_report/sections/corporate_tax/screens/view/screen.js",
    "apps/frontend/src/screens/financial_report/sections/debit_note_details/screen.js",
    "apps/frontend/src/screens/financial_report/sections/payables_invoice_summary/screen.js",
    "apps/frontend/src/screens/financial_report/sections/cashflow/screen.js",
    "apps/frontend/src/screens/financial_report/sections/credit_note_details/screen.js",
    "apps/frontend/src/screens/financial_report/sections/Excise_Audit_Report/screen.js",
    "apps/frontend/src/screens/financial_report/sections/invoice_details/screen.jsx",
    "apps/frontend/src/screens/financial_report/sections/receivable_invoice_summary/screen.js",
    "apps/frontend/src/screens/financial_report/sections/soa_statementsOfAccounts/screen.jsx",
    "apps/frontend/src/screens/financial_report/sections/vat_return/screen.js",
    "apps/frontend/src/screens/financial_report/sections/profit_and_loss/screen.js",
    "apps/frontend/src/screens/financial_report/sections/customer_account_statement/screen.js",
    "apps/frontend/src/screens/quotation/screens/view/screen.js",
    "apps/frontend/src/screens/request_for_quotation/screens/view/screen.jsx",
    "apps/frontend/src/screens/customer_invoice/screens/view/screen.js",
    "apps/frontend/src/screens/creditNotes/screens/view/screen.jsx",
    "apps/frontend/src/screens/debitNotes/screens/view/screen.js",
    "apps/frontend/src/screens/quotation/screens/view/screen.jsx",
    "apps/frontend/src/screens/expense/screens/view/screen.js",
    "apps/frontend/src/screens/supplier_invoice/screens/view/screen.js",
    "apps/frontend/src/screens/supplier_invoice/screens/view/screen.jsx",
    "apps/frontend/src/screens/expense/screens/view/screen.jsx",
    "apps/frontend/src/screens/debitNotes/screens/view/screen.jsx"
]

for f in files_to_fix:
    if os.path.exists(f):
        unbreak_file(f)
