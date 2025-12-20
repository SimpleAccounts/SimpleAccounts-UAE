# Remaining Payroll Migrations Guide
## Formik + Yup to React Hook Form + Zod

This guide provides detailed migration instructions for the remaining 7 payroll-related files.

## Files to Migrate

### High Priority (Large Complex Files)
1. `/screens/payrollemp/screens/create/screen.js` (3,842 lines)
2. `/screens/payrollemp/screens/update_emp_personal/screen.js` (2,257 lines)

### Medium Priority
3. `/screens/payroll_run/screens/updatePayroll/sections/addEmployees.js`
4. `/screens/payroll_run/screens/createPayrollList/sections/addEmployees.js`
5. `/screens/salary_component/sections/screen_component/index.js`

### Lower Priority (Simpler Forms)
6. `/screens/salaryTemplate/screens/detail/screen.js`
7. `/screens/salaryTemplate/screens/create/screen.js`
8. `/screens/salaryStructure/screens/create/screen.js`
9. `/screens/salaryStructure/screens/detail/screen.js`
10. `/screens/salaryRoles/screens/create/screen.js`
11. `/screens/salaryRoles/screens/detail/screen.js`

## Migration Steps for Each File

### Step 1: Update Imports

Replace:
```javascript
import { Formik, Field } from 'formik';
import * as Yup from 'yup';
```

With:
```javascript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

### Step 2: Convert Class Component to Functional (Optional but Recommended)

For large files like `create/screen.js` and `update_emp_personal/screen.js`, you have two options:

#### Option A: Hybrid Approach (Easier)
Keep the class component structure but extract the form into a separate functional component:

```javascript
class CreateEmployeePayroll extends React.Component {
  // Keep all existing methods and lifecycle
  
  render() {
    return (
      <EmployeeForm
        onSubmit={this.handleSubmit}
        initialValues={this.state.initValue}
        // ... other props
      />
    );
  }
}

// New functional component for the form
function EmployeeForm({ onSubmit, initialValues, ... }) {
  const schema = z.object({
    firstName: z.string().min(1, 'First Name is required'),
    // ... other fields
  });
  
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });
  
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </Form>
  );
}
```

#### Option B: Full Conversion (More Work)
Convert the entire class to a functional component using hooks:
- `constructor` → `useState` declarations
- `componentDidMount` → `useEffect` with `[]` dependency
- `componentDidUpdate` → `useEffect` with specific dependencies
- Instance methods → Regular functions or `useCallback`

### Step 3: Convert Yup Schema to Zod

Common conversions:

```javascript
// STRING VALIDATIONS
// Yup → Zod
Yup.string().required('Message') → z.string().min(1, 'Message')
Yup.string().email('Message') → z.string().email('Message')
Yup.string().min(5, 'Message') → z.string().min(5, 'Message')
Yup.string().max(10, 'Message') → z.string().max(10, 'Message')

// NUMBER VALIDATIONS
Yup.number().required('Message') → z.number({ required_error: 'Message' })
Yup.number().min(0, 'Message') → z.number().min(0, 'Message')
Yup.number().positive('Message') → z.number().positive('Message')

// DATE VALIDATIONS
Yup.date().required('Message') → z.date({ required_error: 'Message' })

// SELECT/OBJECT VALIDATIONS (for react-select)
Yup.string().required('Message') → z.object({ label: z.string(), value: z.any() }, { required_error: 'Message' })

// CONDITIONAL VALIDATIONS
Yup.string().when('otherField', { 
  is: 'value', 
  then: Yup.string().required('Message') 
})

→

z.string().refine((val) => {
  // Access form values via getValues() if needed
  return condition ? val.length > 0 : true;
}, { message: 'Message' })

// OR use superRefine for complex cases
z.object({...}).superRefine((data, ctx) => {
  if (data.otherField === 'value' && !data.thisField) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Message',
      path: ['thisField'],
    });
  }
})

// CUSTOM TESTS
Yup.string().test('name', 'Message', (value) => { ... })

→

z.string().refine((value) => { ... }, { message: 'Message' })
```

### Step 4: Update Form Implementation

Replace Formik component with useForm hook:

```javascript
// BEFORE (Formik)
<Formik
  ref={this.formRef}
  initialValues={initValue}
  onSubmit={(values, { resetForm }) => {
    this.handleSubmit(values, resetForm);
  }}
  validationSchema={schema}
  validate={(values) => {
    let errors = {};
    // Custom validation
    return errors;
  }}
>
  {(props) => (
    <Form onSubmit={props.handleSubmit}>
      {/* Fields */}
    </Form>
  )}
</Formik>

// AFTER (React Hook Form)
const formMethods = useForm({
  resolver: zodResolver(schema),
  defaultValues: initValue,
});

const { control, handleSubmit, formState: { errors }, getValues, setValue, reset } = formMethods;

// For custom validation, use schema's superRefine or refine
// Or use validate in register options

<Form onSubmit={handleSubmit(onSubmit)}>
  {/* Fields */}
</Form>
```

### Step 5: Migrate Form Fields

For each input type:

#### Standard Input Fields
```javascript
// BEFORE
<Input
  type="text"
  id="firstName"
  name="firstName"
  value={props.values.firstName}
  onChange={props.handleChange('firstName')}
  className={props.errors.firstName && props.touched.firstName ? "is-invalid" : ""}
/>
{props.errors.firstName && props.touched.firstName && (
  <div className="invalid-feedback">{props.errors.firstName}</div>
)}

// AFTER
<Controller
  name="firstName"
  control={control}
  render={({ field }) => (
    <Input
      {...field}
      type="text"
      id="firstName"
      className={errors.firstName ? "is-invalid" : ""}
    />
  )}
/>
{errors.firstName && (
  <div className="invalid-feedback">{errors.firstName.message}</div>
)}
```

#### React-Select Fields
```javascript
// BEFORE
<Select
  options={options}
  value={props.values.country}
  onChange={(option) => props.handleChange('country')(option)}
  className={props.errors.country && props.touched.country ? 'is-invalid' : ''}
/>

// AFTER
<Controller
  name="country"
  control={control}
  render={({ field }) => (
    <Select
      {...field}
      options={options}
      className={errors.country ? 'is-invalid' : ''}
    />
  )}
/>
```

#### DatePicker Fields
```javascript
// BEFORE
<DatePicker
  selected={props.values.dob}
  onChange={(value) => props.handleChange("dob")(value)}
  className={props.errors.dob && props.touched.dob ? "is-invalid" : ""}
/>

// AFTER
<Controller
  name="dob"
  control={control}
  render={({ field }) => (
    <DatePicker
      {...field}
      selected={field.value}
      onChange={(date) => field.onChange(date)}
      className={errors.dob ? "is-invalid" : ""}
    />
  )}
/>
```

#### PhoneInput Fields
```javascript
// BEFORE
<PhoneInput
  country={'ae'}
  value={props.values.mobileNumber}
  onChange={(value) => props.handleChange('mobileNumber')(value)}
/>

// AFTER
<Controller
  name="mobileNumber"
  control={control}
  render={({ field }) => (
    <PhoneInput
      {...field}
      country={'ae'}
      onChange={(value) => field.onChange(value)}
    />
  )}
/>
```

#### Checkbox/Radio with Formik Field
```javascript
// BEFORE
<Field
  name="terms"
  type="checkbox"
  render={({ field }) => (
    <Input {...field} type="checkbox" />
  )}
/>

// AFTER
<Controller
  name="terms"
  control={control}
  render={({ field }) => (
    <Input
      {...field}
      type="checkbox"
      checked={field.value}
      onChange={(e) => field.onChange(e.target.checked)}
    />
  )}
/>
```

### Step 6: Handle Dynamic Form Values

#### Setting Values Programmatically
```javascript
// BEFORE (Formik)
this.formRef.current.setFieldValue('employeeDesignationId', value, true)

// AFTER (React Hook Form)
setValue('employeeDesignationId', value, { shouldValidate: true })
```

#### Getting Values
```javascript
// BEFORE (Formik)
props.values.employeeDesignationId

// AFTER (React Hook Form)
getValues('employeeDesignationId')
// or use watch for reactive updates
const employeeDesignationId = watch('employeeDesignationId')
```

#### Resetting Form
```javascript
// BEFORE (Formik)
resetForm()

// AFTER (React Hook Form)
reset() // Reset to default values
reset({ firstName: 'New Value' }) // Reset with new values
```

### Step 7: Handle Form Submission

```javascript
// BEFORE (Formik)
<Formik
  onSubmit={(values, { resetForm, setSubmitting }) => {
    handleSubmit(values, resetForm);
  }}
>

// AFTER (React Hook Form)
const onSubmit = (data) => {
  handleSubmit(data);
  // To reset: reset()
  // To set submitting state: use useState
};

<Form onSubmit={handleSubmit(onSubmit)}>
```

### Step 8: Handle Form Refs

If you need to access form methods from parent component:

```javascript
// Create a ref
const formRef = useRef();

// In parent component, pass ref
<FormComponent ref={formRef} />

// In child component, use forwardRef and useImperativeHandle
const FormComponent = forwardRef((props, ref) => {
  const formMethods = useForm({...});
  
  useImperativeHandle(ref, () => ({
    submit: formMethods.handleSubmit(onSubmit),
    reset: formMethods.reset,
    setValue: formMethods.setValue,
  }));
  
  return <Form>...</Form>;
});
```

## Testing Checklist

After migration, test each form:

- [ ] Form renders without errors
- [ ] All fields are editable
- [ ] Validation works on submit
- [ ] Validation works on blur (if configured)
- [ ] Error messages display correctly
- [ ] Form submission works
- [ ] Form reset works
- [ ] Dynamic field updates work (e.g., dependent dropdowns)
- [ ] File uploads work (if applicable)
- [ ] Date picker interactions work
- [ ] Phone input formatting works
- [ ] Select dropdown interactions work
- [ ] Conditional fields show/hide correctly

## Common Pitfalls

1. **Select fields not clearing**: Make sure to use `{...field}` spread operator
2. **Date picker not updating**: Use `onChange={(date) => field.onChange(date)}`
3. **Checkbox value not boolean**: Use `checked={field.value}` and `onChange={(e) => field.onChange(e.target.checked)}`
4. **Custom validation not working**: Use `superRefine` for complex validations
5. **Form not re-rendering**: Use `watch()` for reactive values
6. **Touched state missing**: React Hook Form validates on submit by default. Add `mode: 'onBlur'` to useForm options for blur validation

## Example Migration: Complete Form

See `/screens/payrollemp/sections/designation_modal.jsx` and `/screens/payroll_run/sections/createCompanyDetailsModal.jsx` for complete examples of migrated forms.

## Need Help?

- React Hook Form Docs: https://react-hook-form.com/
- Zod Docs: https://zod.dev/
- Migration discussions: Check the team Slack channel
