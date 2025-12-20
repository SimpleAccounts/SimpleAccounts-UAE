# Migration Notes for Request for Quotation Sections

## Files Migrated
- ✅ `supplier_modal.js` → `supplier_modal.jsx` (Completed)
- ⚠️ `createPo.js` → `createPo.jsx` (Needs manual review)

## CreatePO Migration Complexity

The `createPo.js` file is a complex 1714-line Redux-connected class component with:

1. **Redux State Management**: Uses `mapStateToProps` and `mapDispatchToProps`
2. **Complex Table Logic**: Bootstrap Table with dynamic rows and Field-level validation
3. **Dynamic Form Fields**: Each table row has multiple validated fields
4. **getDerivedStateFromProps**: Complex state derivation logic
5. **Amount Calculations**: Real-time VAT, excise, and total calculations

### Migration Strategy

Due to the complexity, this file requires:

1. Keep Redux connection or migrate to Redux Toolkit
2. Replace Formik `Field` components with React Hook Form `Controller`
3. Use `useFieldArray` for dynamic table rows
4. Migrate Yup validation to Zod
5. Convert class lifecycle methods to useEffect hooks
6. Maintain calculation logic in custom hooks

### Recommended Approach

This file should be migrated in phases:
1. Convert class to functional component
2. Replace Formik with React Hook Form
3. Migrate validation schema to Zod
4. Test thoroughly with actual data

## Current Status

- Basic structure created in `createPo.jsx`
- Needs full implementation and testing
- Consider breaking into smaller components (table rows, calculations, etc.)
