# Purchase Order Create Screen Migration

## Status: IN PROGRESS

This file (screen.js - 3258 lines) is being migrated from Formik/Yup to React Hook Form/Zod.

## Complexity Analysis
- Class-based component with 20+ render methods
- Complex BootstrapTable integration with custom cell renderers
- Extensive state management (20+ state variables)
- Line items management with dynamic rows
- File upload validation
- Currency and VAT calculations
- Supplier and product modals

## Migration Strategy
Due to the extreme size and complexity, this migration requires:
1. Converting class component to function component with hooks
2. Replacing Formik with useForm hook
3. Converting Yup schema to Zod schema
4. Updating all Field components to Controller/register
5. Preserving all render methods and table logic
6. Maintaining all business logic and calculations

## Key Validation Rules (from Yup schema)
- po_number: Required string
- supplierId: Required string
- poApproveDate: Required date
- poReceiveDate: Required date (must be after poApproveDate)
- placeOfSupplyId: Conditionally required (based on tax treatment)
- attachmentFile: Optional, file type and size validation
- lineItemsString: Array of line items, each with:
  - quantity: Required, must be > 0
  - unitPrice: Required, must be > 0
  - vatCategoryId: Required
  - productId: Required

## Estimated Lines: ~3300 (after migration)
