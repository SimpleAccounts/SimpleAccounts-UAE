import os
import re

def fix_file_cleanly(filepath):
    print(f"Fixing {filepath} cleanly")
    with open(filepath, 'r') as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        # 1. Skip Kendo imports
        if "@progress/kendo" in line and "import" in line:
            continue
        
        # 2. Fix the opening tag broken by sed
        # Match lines that were part of <PDFExport ... >
        if "<div> (this.pdfExportComponent = component)}" in line:
            new_lines.append("            <div>\n")
            continue
        if "<PDFExport" in line:
            # Check if it has a closing > on the same line
            if ">" in line:
                new_lines.append("            <div>\n")
            else:
                # It's a multiline tag, we'll skip the attributes in subsequent lines
                new_lines.append("            <div>\n")
                continue # We need a state machine to skip until next >
            continue

        # 3. Skip attributes if we are inside a broken tag
        # (This is a simplified version, assuming the attributes were on their own lines)
        if any(attr in line for attr in ["ref={pdfExportComponent}", "ref={component =>", "scale={0.8}", "paperSize=", "fileName={", "margin={{ top: 0"]):
            continue
        
        # 4. Skip exportPDFWithComponent related lines
        if "exportPDFWithComponent =" in line or "const exportPDFWithComponent =" in line:
            continue
        if "this.pdfExportComponent.save()" in line or "pdfExportComponent.current.save()" in line:
            continue
        
        # 5. Skip buttons that used exportPDFWithComponent
        if "onClick={this.exportPDFWithComponent}" in line or "onClick={exportPDFWithComponent}" in line:
            # Try to skip the whole button if it's a single line, but this is risky
            continue

        # 6. Skip the incorrectly added </div> at the end
        if line.strip() == "</div>" and any("export default" in next_line for next_line in lines[lines.index(line):lines.index(line)+5]):
            continue

        new_lines.append(line)

    # Final cleanup of the result
    content = "".join(new_lines)
    
    # Remove empty lines created by skipping
    content = re.sub(r'\n\s*\n', '\n', content)
    
    # Fix the case where attributes are left before a >
    content = re.sub(r'<div>[^>]*>', '<div>', content)
    
    # Fix export default breaking
    content = re.sub(r'ViewPurchaseOrder</div>\n\);', 'ViewPurchaseOrder);', content)
    content = re.sub(r'HorizontalBalanceSheet</div>\n\);', 'HorizontalBalanceSheet);', content)
    content = re.sub(r'VatTransactionsReducer</div>\n\);', 'VatTransactionsReducer);', content)

    # BALANCE DIVS
    open_tags = len(re.findall(r'<div', content))
    close_tags = len(re.findall(r'</div', content))
    
    if open_tags != close_tags:
        print(f"  Imbalance in {filepath}: open={open_tags}, close={close_tags}")
        # If open > close, add </div> before the last ); or }
        if open_tags > close_tags:
            diff = open_tags - close_tags
            # Functional component end pattern
            if ");\n};" in content:
                content = content.replace(");\n};", "</div>\n" * diff + ");\n};")
            # Class component end pattern
            elif ");\n  }\n}" in content:
                content = content.replace(");\n  }\n}", "</div>\n" * diff + ");\n  }\n}")
            elif ");\n}" in content:
                content = content.replace(");\n}", "</div>\n" * diff + ");\n}")
        else:
            # If close > open, this is harder. Let's just log it.
            print(f"  Warning: too many close tags in {filepath}")

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
        fix_file_cleanly(f)
