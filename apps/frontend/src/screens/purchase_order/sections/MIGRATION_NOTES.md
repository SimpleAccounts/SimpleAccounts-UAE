# Migration Notes for Purchase Order Sections

## Files Migrated
- ✅ `supplier_modal.js` → `supplier_modal.jsx` (Completed)
- ⚠️ `createGRN.js` → `createGRN.jsx` (Needs manual review)

## CreateGRN Migration Complexity

The `createGRN.js` file is a complex 1532-line Redux-connected class component with:

1. **Redux State Management**: Uses `mapStateToProps` and `mapDispatchToProps`
2. **Complex Table Logic**: Bootstrap Table with GRN quantity tracking
3. **Dynamic Form Fields**: Each table row tracks received vs ordered quantities
4. **getDerivedStateFromProps**: Complex state derivation logic
5. **Amount Calculations**: Real-time calculations based on received quantities

### Migration Strategy

Due to the complexity, this file requires:

1. Keep Redux connection or migrate to Redux Toolkit
2. Replace Formik `Field` components with React Hook Form `Controller`
3. Use `useFieldArray` for dynamic table rows
4. Migrate Yup validation to Zod
5. Convert class lifecycle methods to useEffect hooks
6. Maintain GRN-specific quantity validation

### Recommended Approach

This file should be migrated in phases:
1. Convert class to functional component
2. Replace Formik with React Hook Form
3. Migrate validation schema to Zod
4. Test thoroughly with actual data

## Current Status

- Basic structure created in `createGRN.jsx`
- Needs full implementation and testing
- Consider breaking into smaller components (table rows, quantity validation, etc.)
