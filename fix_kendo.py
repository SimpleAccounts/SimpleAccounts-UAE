import os
import re

def fix_file(filepath):
    print(f"Fixing {filepath}")
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Remove imports from @progress/kendo
    content = re.sub(r'import.*@progress/kendo-.*;\n?', '', content)
    
    # 2. Remove pdfExportComponent useRef/ref
    content = re.sub(r'const pdfExportComponent = useRef\(null\);\n?', '', content)
    content = re.sub(r'this\.pdfExportComponent = React\.createRef\(\);\n?', '', content)
    
    # 3. Remove exportPDFWithComponent method/function
    content = re.sub(r'const exportPDFWithComponent = \(\) => .*;\n?', '', content)
    content = re.sub(r'const exportPDFWithComponent = \(\) => \{\n(.*\n)*?\s+\};\n?', '', content)
    content = re.sub(r'exportPDFWithComponent = \(\) => \{\n(.*\n)*?\s+\};\n?', '', content)
    
    # 4. Remove this.pdfExportComponent.save() calls
    content = re.sub(r'this\.pdfExportComponent\.save\(\);\n?', '', content)
    content = re.sub(r'pdfExportComponent\.current\.save\(\);\n?', '', content)

    # 5. Remove any buttons that use exportPDFWithComponent or FileText icon
    # This is tricky because buttons vary. Let's try to find common patterns.
    content = re.sub(r'<Button[^>]*onClick=\{[^}]*exportPDFWithComponent[^}]*\}[^>]*>(\n|.)*?<\/Button>\n?', '', content)
    # Also handle the icon inside
    content = re.sub(r'<Button[^>]*>(\n|\s)*<FileText[^>]*\/>(\n|\s)*<\/Button>\n?', '', content)

    # 6. Fix broken PDFExport tags. They might be <PDFExport or <div> (from previous sed)
    # We want to remove the tag and its attributes entirely, but keep its children.
    # The tags are often like:
    # <PDFExport
    #   ref={...}
    #   ...
    # >
    #   <Child />
    # </PDFExport> OR </div> (from previous sed)
    
    # First, find and replace the opening tag
    content = re.sub(r'<PDFExport(\n|.)*?>', '<div>', content)
    
    # Sometimes they were already partially replaced to <div> but attributes remain outside
    # Let's just look for any leftover Kendo-related attributes if possible, but 
    # the main issue is invalid JSX structure.
    
    # If we see things like 'ref={pdfExportComponent}' or 'paperSize="A3"' outside a tag, it's a mess.
    # Let's try to clean up orphaned attributes if they exist
    content = re.sub(r'\s+ref=\{pdfExportComponent\}\n?', '', content)
    content = re.sub(r'\s+scale=\{0\.8\}\n?', '', content)
    content = re.sub(r'\s+paperSize="A3"\n?', '', content)
    content = re.sub(r'\s+fileName=\{[^}]*\}\n?', '', content)
    
    # Clean up any duplicated <div><div> patterns if we introduced them
    content = re.sub(r'<div>(\s*)<div>', '<div>', content)
    content = re.sub(r'<\/div>(\s*)<\/div>', '</div>', content)

    with open(filepath, 'w') as f:
        f.write(content)

# List of files to fix based on grep results
files_to_fix = [
    "apps/frontend/src/screens/request_for_quotation/screens/view/screen.js",
    "apps/frontend/src/screens/goods_received_note/screens/view/screen.js",
    "apps/frontend/src/screens/goods_received_note/screens/view/screen.jsx",
    "apps/frontend/src/screens/detailed_general_ledger_report/screen.js",
    "apps/frontend/src/screens/creditNotes/screens/view/screen.js",
    "apps/frontend/src/screens/inventory/sections/inventory_summary/index.jsx",
    "apps/frontend/src/screens/inventory/sections/inventory_summary/sections/invetoryHistorymodal.js",
    "apps/frontend/src/screens/purchase_order/screens/view/screen.js.backup",
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
        fix_file(f)
    else:
        print(f"Skipping {f}, not found")
