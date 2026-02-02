import os

def fix_file(path):
    print(f"Fixing {path}")
    if not os.path.exists(path):
        return
        
    with open(path, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        # If it's an import of kendo, skip it
        if '@progress/kendo-' in line and 'import' in line:
            continue
        
        # Replace tags
        line = line.replace('<PDFExport', '<div')
        line = line.replace('</PDFExport>', '</div>')
        
        # Comment out save()
        if '.save()' in line and 'pdfExportComponent' in line:
            if '=>' in line:
                line = line.replace('pdfExportComponent.save()', '{ /* pdfExportComponent.save() */ }')
                line = line.replace('pdfExportComponent.current.save()', '{ /* pdfExportComponent.current.save() */ }')
                line = line.replace('this.pdfExportComponent.save()', '{ /* this.pdfExportComponent.save() */ }')
                line = line.replace('this.pdfExportComponent.current.save()', '{ /* this.pdfExportComponent.current.save() */ }')
            else:
                indent = line[:len(line) - len(line.lstrip())]
                line = indent + '// ' + line.lstrip()
        
        new_lines.append(line)
        
    with open(path, 'w') as f:
        f.writelines(new_lines)

# Files to fix
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
    fix_file(f)
