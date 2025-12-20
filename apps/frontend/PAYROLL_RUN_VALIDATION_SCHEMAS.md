# Payroll Run Validation Schemas

This document outlines the Zod validation schemas created for the payroll_run screens migration.

## 1. Approver Screen Schema

**File:** `apps/frontend/src/screens/payroll_run/screens/approver/screen.jsx`

```typescript
const approverSchema = z.object({
  comment: z.string().min(1, 'Reason is required'),
});
```

**Fields:**
- `comment` (required): Reason for rejecting or voiding the payroll

**Validation Rules:**
- Must be a non-empty string
- Required when rejecting or voiding a payroll

---

## 2. Create Payroll List Schema

**File:** `apps/frontend/src/screens/payroll_run/screens/createPayrollList/screen.jsx`

```typescript
const createPayrollSchema = z.object({
  payrollSubject: z.string().min(1, 'Payroll subject is required'),
  payrollDate: z.date({ required_error: 'Payroll date is required' }),
  payrollApprover: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
  startDate: z.any().refine((val) => val !== null && val !== '', {
    message: 'Start date is required',
  }),
  endDate: z.any().refine((val) => val !== null && val !== '', {
    message: 'End date is required',
  }),
});
```

**Fields:**
- `payrollSubject` (required): Subject line for the payroll
- `payrollDate` (required): Date when the payroll is processed
- `payrollApprover` (optional): User who will approve the payroll
- `startDate` (required): Start date of the pay period
- `endDate` (required): End date of the pay period

**Validation Rules:**
- Payroll subject must be non-empty
- Payroll date is required
- Approver is required for submission but optional for draft creation
- Start and end dates are required for pay period calculation

**Dynamic Validation:**
Additional validation is implemented via `useEffect` hooks:
- Payroll subject uniqueness check (prevents duplicates)
- Conditional approver requirement (required for submit, optional for draft)

---

## 3. Update Payroll Schema

**File:** `apps/frontend/src/screens/payroll_run/screens/updatePayroll/screen.jsx`

```typescript
const updatePayrollSchema = z.object({
  payrollSubject: z.string().optional(),
  payrollDate: z.date({ required_error: 'Payroll date is required' }),
  payrollApprover: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .nullable()
    .optional(),
  startDate: z.any().optional(),
  endDate: z.any().optional(),
});
```

**Fields:**
- `payrollSubject` (optional): Can be updated if payroll is in draft status
- `payrollDate` (required): Payroll processing date
- `payrollApprover` (optional): Approver can be changed if not yet submitted
- `startDate` (optional): Pay period start (disabled if already submitted)
- `endDate` (optional): Pay period end (disabled if already submitted)

**Validation Rules:**
- Most fields are optional as they may be disabled based on payroll status
- Payroll date is always required
- Dynamic validation based on status (Draft, Submitted, Approved, etc.)

**Status-Based Validation:**
- Draft: All fields editable
- Submitted/Approved/Paid/Voided: Most fields disabled
- Conditional approver requirement for submission

---

## Common Patterns

### Controller Usage
All form fields use React Hook Form's `Controller` component:

```javascript
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => (
    <Input
      {...field}
      className={errors.fieldName ? 'is-invalid' : ''}
    />
  )}
/>
```

### Error Display
Errors are displayed using Bootstrap's invalid-feedback class:

```javascript
{errors.fieldName && (
  <div className="invalid-feedback">
    {errors.fieldName.message}
  </div>
)}
```

### Dynamic Validation with useEffect
For complex validation rules that depend on state:

```javascript
useEffect(() => {
  if (conditionRequired && !fieldValue) {
    setError('fieldName', {
      type: 'manual',
      message: 'Field is required',
    });
  } else {
    clearErrors('fieldName');
  }
}, [conditionRequired, fieldValue]);
```

---

## Validation Features

1. **Required Field Validation**: Essential fields marked with red asterisk (*)
2. **Conditional Validation**: Fields required based on action (draft vs submit)
3. **Async Validation**: Payroll subject uniqueness check via API
4. **Date Validation**: Date range validation for pay periods
5. **Status-Based Validation**: Different rules for different payroll statuses
6. **Custom Error Messages**: User-friendly error messages for all validations

---

## Testing Validation

### Approver Screen
- [ ] Test empty comment on reject
- [ ] Test empty comment on void
- [ ] Verify comment accepts text input

### Create Payroll List
- [ ] Test empty payroll subject
- [ ] Test duplicate payroll subject
- [ ] Test without selecting payroll date
- [ ] Test without selecting date range
- [ ] Test submit without approver
- [ ] Test create (draft) without approver

### Update Payroll
- [ ] Test field disabling based on status
- [ ] Test approver requirement for update & submit
- [ ] Test date validation
- [ ] Test employee selection validation

---

## Migration Benefits

1. **Type Safety**: Zod provides runtime type checking
2. **Better DX**: Clear, declarative schema definitions
3. **Reusability**: Schemas can be exported and reused
4. **Composability**: Complex schemas built from simpler ones
5. **Error Messages**: Consistent error message format
6. **Performance**: Efficient validation with minimal re-renders

---

**Last Updated:** December 19, 2024
