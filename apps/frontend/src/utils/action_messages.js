export const InvoiceMessagesList = [
    { action: 'Sent', list: ['InvoiceSentSuccessfully', 'CustomerInvoicePostedUnsuccessfully', 'InvoiceStatusChangedSuccessfully'] },
    { action: 'Delete', list: ['InvoiceDeletedSuccessfully', 'InvoiceDeletedUnsuccessfully'] },
    { action: 'UnPost', list: ['InvoiceMovedToDraftSuccessfully', 'InvoiceMovedToDraftUnsuccessfully',] },
]

export const CreditNoteMessagesList = [
    { action: 'Sent', list: ['CreditNotePostedSuccessfully', 'CreditNotePostedUnsuccessfully', 'CreditNotePostedSuccessfully'] },
    { action: 'Delete', list: ['TaxCreditNoteDeletedSuccessfully', 'TaxCreditNoteDeletedUnsuccessfully',] },
    { action: 'UnPost', list: ['CrediNoteMovedToDraftSuccessfully', 'CrediNoteMovedToDraftUnsuccessfully',] },
]

export const QuotationMessagesList = [
    { action: 'Sent', list: ['QuotationSentSuccessfully', 'QuotationSentUnsuccessfully', 'QuotationSentSuccessfully'] },
    { action: 'Delete', list: ['QuotationDeletedSuccessfully', 'QuotationDeletedUnsuccessfully',] },
    { action: 'Status Change', list: ['StatusChangedSuccessfully', 'StatusChangedUnsuccessfully',] },
    { action: 'Draft', list: ['QuotationMovedToDraftSuccessfully', 'QuotationMovedToDraftUnsuccessfully',] },
    { action: 'Approved', list:['QuotationApprovedSuccessfully','QuotationApprovedUnsuccessfully']},
    { action: 'Rejected', list:['QuotationRejectedSuccessfully','QuotationRejectedUnsuccessfully']},
]
export const ExpenseMessagesList = [
    { action: 'Sent', list: ['ExpensePostedSuccessfully', 'ExpensePostedUnsuccessfully', 'ExpensePostedSuccessfully'] },
    { action: 'Delete', list: ['ExpenseDeletedSuccessfully', 'ExpenseDeletedUnsuccessfully',] },
    { action: 'UnPost', list: ['ExpenseMovedToDraftSuccessfully', 'ExpenseMovedToDraftUnsuccessfully',] },
]
export const SupplierInvoiceMessagesList = [
    { action: 'Sent', list: ['InvoicePostedSuccessfully', 'InvoicePostedUnsuccessfully', 'InvoicePostedSuccessfully'] },
    { action: 'Delete', list: ['InvoiceDeletedSuccessfully', 'InvoiceDeletedUnsuccessfully',] },
    { action: 'UnPost', list: ['InvoiceMovedToDraftSuccessfully', 'InvoiceMovedToDraftUnsuccessfully',] },
]
export const DebitNoteMessagesList = [
    { action: 'Sent', list: ['DebitNoteStatusChangedSuccessfully', 'DebitNoteStatusChangedUnsuccessfully', 'DebitNoteStatusChangedSuccessfully'] },
    { action: 'Delete', list: ['DebitNoteDeletedSuccessfully', 'DebitNoteDeletedUnsuccessfully',] },
    { action: 'UnPost', list: ['DebitNoteMovedToDraftSuccessfully', 'DebitNoteMovedToDraftUnsuccessfully',] },
]
export const PrchaseOrderMessagesList = [
    { action: 'Sent', list: ['PurchaseOrderPostedSuccessfully', 'PurchaseOrderPostedUnsuccessfully', 'PurchaseOrderPostedSuccessfully'] },
    { action: 'Delete', list: ['PurchaseOrderDeletedSuccessfully', 'PurchaseOrderDeletedUnuccessfully',] },
    { action: 'Status Change', list: ['StatusChangedSuccessfully', 'StatusChangedUnsuccessfully',] },
]