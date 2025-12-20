# Supplier Invoice Migration Guide: Formik/Yup to React Hook Form/Zod

## Overview

Migrating supplier_invoice create and detail screens (~3800 and ~3200 lines respectively) from Class Components with Formik/Yup to Functional Components with React Hook Form/Zod.

## Files to Migrate

- `src/screens/supplier_invoice/screens/create/screen.js` → `screen.jsx`
- `src/screens/supplier_invoice/screens/detail/screen.js` → `screen.jsx`

## Migration Steps

### 1. Update Imports

**OLD (Formik/Yup):**

```javascript
import React from 'react';
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
```

**NEW (React Hook Form/Zod):**

```javascript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

### 2. Convert Class Component to Functional Component

**OLD:**

```javascript
class CreateSupplierInvoice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data: [...],
      // ... other state
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    // initialization
  }

  render() {
    // JSX
  }
}
```

**NEW:**

```javascript
const CreateSupplierInvoice = ({
  supplierInvoiceActions,
  supplierInvoiceCreateActions,
  // ... other props
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([...]);
  // ... other state

  const form = useForm({
    resolver: zodResolver(createSupplierInvoiceSchema),
    defaultValues: { /* ... */ },
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = form;

  useEffect(() => {
    // initialization (componentDidMount equivalent)
  }, []);

  // Component JSX
  return (
    // JSX
  );
};
```

### 3. Create Zod Validation Schema

**OLD (Yup):**

```javascript
validationSchema={Yup.object().shape({
  invoice_number: Yup.string().required('Invoice number is required'),
  contactId: Yup.string().required('Supplier Name Is Required'),
  term: Yup.string().required('Term Is Required'),
  invoiceDate: Yup.string().required('Invoice Date is required'),
  currency: Yup.string().required('Currency is required'),
  lineItemsString: Yup.array()
    .required('Atleast one invoice sub detail is mandatory')
    .of(
      Yup.object().shape({
        quantity: Yup.string()
          .test('quantity', 'Quantity Greater Than 0', (value) => value > 0)
          .required('Quantity is required'),
        unitPrice: Yup.string()
          .test('Unit Price', 'Unit Price Greater Than 1', (value) => value > 0)
          .required('Unit price is required'),
        vatCategoryId: Yup.string().required('VAT Is Required'),
        productId: Yup.string().required('Product Is Required'),
      })
    ),
})}
```

**NEW (Zod):**

```javascript
const createSupplierInvoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  contactId: z.union([
    z.string().min(1, 'Supplier Name is required'),
    z.object({ value: z.union([z.string(), z.number()]), label: z.string() }),
  ]),
  term: z
    .union([
      z.string().min(1, 'Term is required'),
      z.object({ value: z.string(), label: z.string() }),
    ])
    .refine(
      val => {
        if (typeof val === 'object' && val.label === 'Select Terms') return false;
        return true;
      },
      { message: 'Term is required' }
    ),
  currencyCode: z.union([
    z.string().min(1, 'Currency is required'),
    z.object({ value: z.string(), label: z.string() }),
  ]),
  invoiceDate: z
    .union([z.string(), z.date()])
    .refine(val => val !== '', { message: 'Invoice date is required' }),
  invoiceDueDate: z.string().optional(),
  placeOfSupplyId: z
    .union([z.string(), z.object({ value: z.string(), label: z.string() })])
    .optional(),
  lineItemsString: z
    .array(
      z.object({
        quantity: z
          .union([z.string(), z.number()])
          .refine(value => parseFloat(value) > 0, { message: 'Quantity must be greater than 0' }),
        unitPrice: z
          .union([z.string(), z.number()])
          .refine(value => parseFloat(value) > 0, { message: 'Unit price must be greater than 0' }),
        vatCategoryId: z
          .union([z.string(), z.number()])
          .refine(value => value !== '', { message: 'VAT is required' }),
        productId: z
          .union([z.string(), z.number()])
          .refine(value => value !== '', { message: 'Product is required' }),
      })
    )
    .min(1, 'At least one invoice line item is required'),
  exchangeRate: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional(),
  discount: z.union([z.string(), z.number()]).optional(),
  totalNet: z.number().optional(),
  totalVatAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  // ... other fields
});
```

### 4. Convert Formik render prop to Form submission

**OLD:**

```javascript
<Formik
  ref={this.formRef}
  initialValues={this.state.initValue}
  validationSchema={/* ... */}
  validate={(values) => {
    // custom validation
  }}
  onSubmit={(values, actions) => {
    this.createSupplierInvoice(values, actions);
  }}
>
  {(props) => (
    <Form onSubmit={props.handleSubmit}>
      {/* form fields */}
    </Form>
  )}
</Formik>
```

**NEW:**

```javascript
<Form onSubmit={handleSubmit(onSubmit)}>{/* form fields */}</Form>
```

### 5. Convert Field Components

**For complex inputs (Select, DatePicker) - use Controller:**

**OLD:**

```javascript
<Field
  name="contactId"
  render={({ field, form }) => (
    <Select
      value={field.value}
      onChange={e => {
        form.setFieldValue('contactId', e.value);
      }}
      options={supplier_list}
    />
  )}
/>
```

**NEW:**

```javascript
<Controller
  name="contactId"
  control={control}
  render={({ field }) => (
    <Select
      {...field}
      value={
        field.value?.value ? field.value : supplier_list.find(option => option.value == field.value)
      }
      onChange={option => {
        field.onChange(option);
        setContactDetails(option.value);
      }}
      options={supplier_list}
      className={errors.contactId ? 'is-invalid' : ''}
    />
  )}
/>;
{
  errors.contactId && <div className="invalid-feedback d-block">{errors.contactId.message}</div>;
}
```

**For simple text inputs - use Controller or register():**

**OLD:**

```javascript
<Field
  name="invoice_number"
  render={({ field, form }) => (
    <Input
      {...field}
      type="text"
      onChange={e => {
        form.setFieldValue('invoice_number', e.target.value);
      }}
    />
  )}
/>
```

**NEW:**

```javascript
<Controller
  name="invoice_number"
  control={control}
  render={({ field }) => (
    <Input {...field} type="text" className={errors.invoice_number ? 'is-invalid' : ''} />
  )}
/>;
{
  errors.invoice_number && <div className="invalid-feedback">{errors.invoice_number.message}</div>;
}
```

### 6. Convert State Management

**OLD:**

```javascript
this.setState({ loading: true });
this.formRef.current.setFieldValue('contactId', value);
const values = this.formRef.current.values;
```

**NEW:**

```javascript
setLoading(true);
setValue('contactId', value, { shouldValidate: true });
const values = watch();
```

### 7. Convert Form Submission

**OLD:**

```javascript
createSupplierInvoice = (values, actions) => {
  const formData = new FormData();
  formData.append('contactId', values.contactId);
  // ... build formData

  this.props.supplierInvoiceCreateActions
    .createInvoice(formData)
    .then(res => {
      actions.setSubmitting(false);
      // handle success
    })
    .catch(err => {
      actions.setSubmitting(false);
      // handle error
    });
};
```

**NEW:**

```javascript
const onSubmit = formData => {
  setDisabled(true);
  const postFormData = new FormData();
  postFormData.append(
    'contactId',
    formData.contactId ? (formData.contactId.value ?? formData.contactId) : ''
  );
  // ... build formData

  supplierInvoiceCreateActions
    .createInvoice(postFormData)
    .then(res => {
      setDisabled(false);
      // handle success
      if (createMore) {
        reset({
          /* default values */
        });
      } else {
        history.push('/admin/expense/supplier-invoice');
      }
    })
    .catch(err => {
      setDisabled(false);
      // handle error
    });
};
```

### 8. Convert Product Table and Line Items

The supplier_invoice screens use a dynamic product table similar to customer_invoice. Key points:

1. Store line items in both local state and form state
2. Use `setValue('lineItemsString', newData, { shouldValidate: true })` when updating
3. Call `updateAmount(newData)` after changes to recalculate totals
4. Watch for changes with `watch('lineItemsString')`

### 9. Handle Supplier Selection and VAT Logic

```javascript
const setContactDetails = supplierID => {
  setValue('contactId', supplierID, { shouldValidate: true });
  const supplier = supplier_list.find(obj => obj.value === supplierID);
  if (supplier) {
    const currencyCode = supplier.label.currency.currencyCode;
    const taxTreatment = supplier.label.taxTreatment.taxTreatment;
    setTaxTreatmentId(taxTreatment);
    // ... other logic
    setCurrency(currencyCode);
  }
};
```

### 10. Update index.js Files

After creating screen.jsx files:

```javascript
// Before
import screen from './screen';

// After
import screen from './screen.jsx';
```

## Key Differences from Customer Invoice

1. **Supplier vs Customer**: Uses supplier_list instead of customer_list
2. **Module Type**: Type 1 (expense) vs Type 2 (income)
3. **RFQ/PO Support**: Supplier invoices can be created from RFQ or Purchase Orders
4. **Reverse Charge**: Additional isReverseChargeEnabled flag
5. **Navigation**: Routes to `/admin/expense/supplier-invoice` instead of `/admin/income/customer-invoice`

## Testing Checklist

- [ ] Form validation works correctly
- [ ] Supplier selection updates currency and tax treatment
- [ ] Line items can be added/removed
- [ ] VAT calculations are correct
- [ ] Discount calculations work
- [ ] File upload functions
- [ ] Create and Create & More buttons work
- [ ] Navigation after save works
- [ ] Error messages display correctly
- [ ] All modals (Supplier, Product) integrate properly
- [ ] RFQ/PO integration works (if applicable)
- [ ] Reverse charge toggle works

## Common Pitfalls

1. **Watch vs State**: Use `watch()` for form values, not state
2. **Validation Timing**: Set `shouldValidate: true` when using `setValue()`
3. **Select Values**: Handle both string and object values for selects
4. **Line Item Arrays**: Keep in sync between local state and form state
5. **Ref Migration**: `this.formRef` → `useForm()` hook, no ref needed
6. **This Binding**: Remove all `this.` references and use direct function calls

## Reference Files

- Customer Invoice Create: `src/screens/customer_invoice/screens/create/screen.jsx`
- Expense Create: `src/screens/expense/screens/create/screen.jsx`
- Original Supplier Create: `src/screens/supplier_invoice/screens/create/screen.js`
