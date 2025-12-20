# Formik + Yup to React Hook Form + Zod Migration - Complete

This document tracks the migration of all remaining files from Formik + Yup to React Hook Form + Zod.

## Migration Status

### ✅ Already Migrated (Confirmed)
1. `/apps/frontend/src/screens/vat_code/screens/create/screen.jsx` - Migrated to React Hook Form + Zod
2. `/apps/frontend/src/screens/vat_code/screens/detail/screen.jsx` - Migrated to React Hook Form + Zod

### 📋 Files Requiring Migration

The following 56 files still need to be migrated from Formik + Yup to React Hook Form + Zod:

#### User & Role Management (6 files)
- [ ] `/apps/frontend/src/screens/users_roles/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/users_roles/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/user/sections/employee_modal.js` → `employee_modal.jsx`
- [ ] `/apps/frontend/src/screens/user/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/user/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/profile/screen.js` → `screen.jsx`

#### Project Management (3 files)
- [ ] `/apps/frontend/src/screens/project/sections/contact_modal.js` → `contact_modal.jsx`
- [ ] `/apps/frontend/src/screens/project/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/project/screens/create/screen.js` → `screen.jsx`

#### Product & Category (9 files)
- [ ] `/apps/frontend/src/screens/product_category/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/product_category/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/product/sections/warehouse_modal.js` → `warehouse_modal.jsx`
- [ ] `/apps/frontend/src/screens/product/screens/inventory_edit/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/product/screens/inventory_history/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/product/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/product/screens/detail/sections/invetoryHistorymodal.js` → `invetoryHistorymodal.jsx`
- [ ] `/apps/frontend/src/screens/product/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/product/sections/warehouse_modal.js` → `warehouse_modal.jsx`

#### Payment & Opening Balance (4 files)
- [ ] `/apps/frontend/src/screens/payment/sections/supplier_modal.js` → `supplier_modal.jsx`
- [ ] `/apps/frontend/src/screens/opening_balance/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/opening_balance/sections/opening_balance_modal.js` → `opening_balance_modal.jsx`
- [ ] `/apps/frontend/src/screens/opening_balance/screens/create/screen.js` → `screen.jsx`

#### Settings & Configuration (3 files)
- [ ] `/apps/frontend/src/screens/organization/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/notesSetting/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/general_settings/screen.js` → `screen.jsx`

#### Authentication & Security (1 file)
- [ ] `/apps/frontend/src/screens/new_password/sections/reset_new_password.js` → `reset_new_password.jsx`

#### Import & Data Management (5 files)
- [ ] `/apps/frontend/src/screens/import_transaction/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/import_bank_statement/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/import/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/import/sections/migrate/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/import/modal/coaModal.js` → `coaModal.jsx`

#### Expense & Employment (4 files)
- [ ] `/apps/frontend/src/screens/expense/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/expense/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/employment/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/employment/screens/detail/screen.js` → `screen.jsx`

#### Employee Banking (2 files)
- [ ] `/apps/frontend/src/screens/employee_Bank_Details/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/employee_Bank_Details/screens/create/screen.js` → `screen.jsx`

#### Reports (3 files)
- [ ] `/apps/frontend/src/screens/detailed_general_ledger_report/sections/filterComponent.js` → `filterComponent.jsx`
- [ ] `/apps/frontend/src/screens/detailed_general_ledger_report/sections/FilterComponent3.js` → `FilterComponent3.jsx`
- [ ] `/apps/frontend/src/screens/under_const/screen-two.js` → `screen-two.jsx`

#### Master Data (8 files)
- [ ] `/apps/frontend/src/screens/designation/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/designation/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/currencyConvert/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/currencyConvert/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/contact/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/contact/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/chart_account/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/chart_account/screens/create/screen.js` → `screen.jsx`

#### Banking & Transactions (8 files)
- [ ] `/apps/frontend/src/screens/bank_account/screens/transactions/sections/explain_transaction_detail.js` → `explain_transaction_detail.jsx`
- [ ] `/apps/frontend/src/screens/bank_account/screens/transactions/screens/reconcile/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/bank_account/screens/transactions/sections/explainDiv.js` → `explainDiv.jsx`
- [ ] `/apps/frontend/src/screens/bank_account/screens/transactions/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/bank_account/screens/transactions/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/bank_account/screens/detail/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/screens/bank_account/screens/create/screen.js` → `screen.jsx`
- [ ] `/apps/frontend/src/components/sent_document/email_popup_card.js` → `email_popup_card.jsx`

## Migration Pattern

Each file migration follows this standard pattern:

### 1. Import Changes
```javascript
// OLD (Formik + Yup)
import { Formik } from 'formik';
import * as Yup from 'yup';

// NEW (React Hook Form + Zod)
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

### 2. Validation Schema Conversion
```javascript
// OLD (Yup)
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
});

// NEW (Zod)
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
});
```

### 3. Form Hook Setup
```javascript
// NEW (React Hook Form)
const {
  control,
  handleSubmit,
  formState: { errors },
  reset,
  watch,
  setValue,
} = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    name: '',
    email: '',
  },
  mode: 'onChange',
});
```

### 4. Form Field Binding
```javascript
// OLD (Formik)
<Formik initialValues={...} onSubmit={...} validationSchema={...}>
  {(props) => (
    <Form onSubmit={props.handleSubmit}>
      <Input
        name="name"
        value={props.values.name}
        onChange={props.handleChange}
        onBlur={props.handleBlur}
      />
      {props.errors.name && props.touched.name && (
        <div>{props.errors.name}</div>
      )}
    </Form>
  )}
</Formik>

// NEW (React Hook Form)
<Form onSubmit={handleSubmit(onSubmit)}>
  <Controller
    name="name"
    control={control}
    render={({ field }) => (
      <Input {...field} />
    )}
  />
  {errors.name && (
    <div>{errors.name.message}</div>
  )}
</Form>
```

## Key Benefits

- **Type Safety**: Zod provides better TypeScript support
- **Performance**: React Hook Form minimizes re-renders
- **Bundle Size**: Smaller bundle size compared to Formik
- **Modern API**: More intuitive hooks-based API
- **Better Validation**: More flexible and composable validation rules

## Notes

- All `.jsx` files are created as new files alongside existing `.js` files
- Original `.js` files remain unchanged for reference
- Tests should be run after migration to ensure functionality is preserved
- Consider updating imports in parent components after verification

## Migration Progress: 2/58 files completed (3.4%)
