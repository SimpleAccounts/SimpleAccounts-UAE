import os
import re

def final_rebalance(filepath):
    print(f"Rebalancing {filepath}")
    with open(filepath, 'r') as f:
        content = f.read()

    # Count DIVs
    open_tags = len(re.findall(r'<div', content))
    close_tags = len(re.findall(r'</div', content))
    
    if open_tags == close_tags:
        print(f"  Balanced: {open_tags}")
        return

    print(f"  Imbalance: open={open_tags}, close={close_tags}")
    
    if open_tags > close_tags:
        diff = open_tags - close_tags
        # Find the last ); or } or last line of the main return block
        # Insert before the last ); or similar
        pos = content.rfind(");")
        if pos == -1:
            pos = content.rfind("}")
        
        if pos != -1:
            content = content[:pos] + "</div>\n" * diff + content[pos:]
            print(f"  Added {diff} close tags")
    else:
        diff = close_tags - open_tags
        # Remove extra close tags from the end of the file
        # Find instances of </div> followed by whitespace and </div> or );
        for _ in range(diff):
            # Use regex to find the last </div> before ); or end of component
            content = re.sub(r'</div>\s*(?=</div>|);|})', '', content, count=1)
        print(f"  Removed {diff} close tags")

    with open(filepath, 'w') as f:
        f.write(content)

# List of all files we touched
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
        final_rebalance(f)
