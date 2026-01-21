import os
import re

def fix_file(filepath):
    print(f"Fixing {filepath}")
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Remove imports from @progress/kendo
    content = re.sub(r'import.*@progress/kendo-.*;\n?', '', content)
    
    # 2. Fix the broken opening tag.
    # It might look like <PDFExport ... > OR <div> (this.pdfExportComponent = component)} ... >
    content = re.sub(r'<PDFExport[^>]*>', '<div>', content, flags=re.DOTALL)
    content = re.sub(r'<div> \(this\.pdfExportComponent = component\)\}[^>]*>', '<div>', content, flags=re.DOTALL)
    
    # 3. Remove known broken remnants if they ended up outside tags
    content = re.sub(r'ref=\{pdfExportComponent\}\n?', '', content)
    content = re.sub(r'ref=\{component => \(this\.pdfExportComponent = component\)\}\n?', '', content)
    content = re.sub(r'scale=\{0\.8\}\n?', '', content)
    content = re.sub(r'paperSize="A3"\n?', '', content)
    content = re.sub(r'fileName=\{[^}]*\}\n?', '', content)
    content = re.sub(r'margin=\{\{ top: 0, bottom: 0, left: 30, right: 31 \}\}\n?', '', content)

    # 4. Remove pdfExportComponent useRef/ref
    content = re.sub(r'const pdfExportComponent = useRef\(null\);\n?', '', content)
    content = re.sub(r'this\.pdfExportComponent = React\.createRef\(\);\n?', '', content)
    
    # 5. Remove exportPDFWithComponent method/function
    content = re.sub(r'const exportPDFWithComponent = \(\) => .*?(\n|;)', '', content)
    # Multiline versions
    content = re.sub(r'const exportPDFWithComponent = \(\) => \{\n.*?\n\s+\};?\n?', '', content, flags=re.DOTALL)
    content = re.sub(r'exportPDFWithComponent = \(\) => \{\n.*?\n\s+\};?\n?', '', content, flags=re.DOTALL)
    
    # 6. Remove this.pdfExportComponent.save() calls
    content = re.sub(r'this\.pdfExportComponent\.save\(\);?\n?', '', content)
    content = re.sub(r'pdfExportComponent\.current\.save\(\);?\n?', '', content)

    # 7. Remove any buttons that use exportPDFWithComponent or FileText icon
    content = re.sub(r'<Button[^>]*onClick=\{[^}]*exportPDFWithComponent[^}]*\}[^>]*>.*?</Button>\n?', '', content, flags=re.DOTALL)
    # Also handle the icon inside
    content = re.sub(r'<Button[^>]*>(\s*)<FileText[^>]*\/>(\s*)<\/Button>\n?', '', content, flags=re.DOTALL)

    # 8. Re-check div balance. If we have <div> followed by <div>, and we know we replaced PDFExport,
    # we might have introduced a redundancy. But the main issue is the MISSING </div> at the end.
    
    # Let's count <div> and </div>
    open_divs = len(re.findall(r'<div', content))
    close_divs = len(re.findall(r'</div', content))
    
    print(f"  Div count: open={open_divs}, close={close_divs}")
    
    if open_divs > close_divs:
        diff = open_divs - close_divs
        print(f"  Adding {diff} missing </div> tags at the end of the component")
        # Try to find the end of the component (usually before the export default or the end of the file)
        if "export default" in content:
            content = content.replace("export default", "</div>\n" * diff + "export default")
        else:
            content += "</div>\n" * diff

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
    "apps/frontend/src/screens/balance_sheet/screen.js", # Corrected path
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
