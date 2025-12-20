# React Hook Form + Zod Migration - Quick Reference

## Cheat Sheet for Common Patterns

### Import Statements

```javascript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
```

### Basic Form Setup

```javascript
// Define schema
const schema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  name: z.string().min(1, 'Required'),
});

// Initialize form
const {
  control,
  handleSubmit,
  formState: { errors },
  setValue,
  watch,
} = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', name: '' },
});

// Submit handler
const onSubmit = data => {
  console.log(data);
};

// In JSX
<Form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</Form>;
```

### Common Field Types

#### Text Input

```javascript
<Controller
  name="firstName"
  control={control}
  render={({ field }) => (
    <Input {...field} type="text" className={errors.firstName ? 'is-invalid' : ''} />
  )}
/>;
{
  errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>;
}
```

#### Select (react-select)

```javascript
<Controller
  name="country"
  control={control}
  render={({ field }) => <Select {...field} options={options} />}
/>
```

#### DatePicker

```javascript
<Controller
  name="dob"
  control={control}
  render={({ field }) => (
    <DatePicker selected={field.value} onChange={date => field.onChange(date)} />
  )}
/>
```

#### Checkbox

```javascript
<Controller
  name="terms"
  control={control}
  render={({ field }) => (
    <Input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
  )}
/>
```

#### PhoneInput

```javascript
<Controller
  name="phone"
  control={control}
  render={({ field }) => (
    <PhoneInput {...field} country={'ae'} onChange={value => field.onChange(value)} />
  )}
/>
```

### Zod Schema Patterns

```javascript
// Required string
z.string().min(1, 'Required')

// Email
z.string().email('Invalid email')

// Number
z.number().min(0, 'Must be positive')

// Optional field
z.string().optional()

// Select object
z.object({ label: z.string(), value: z.any() })

// Date
z.date()

// Conditional validation
z.object({
  field1: z.string(),
  field2: z.string()
}).refine((data) => data.field1 || data.field2, {
  message: 'At least one field required',
  path: ['field1']
})

// Complex conditional
z.object({...}).superRefine((data, ctx) => {
  if (data.type === 'special' && !data.special Field) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Required when type is special',
      path: ['specialField'],
    });
  }
})
```

### Common Operations

```javascript
// Set value
setValue('fieldName', value, { shouldValidate: true });

// Get value
const value = getValues('fieldName');

// Watch value (reactive)
const watchedValue = watch('fieldName');

// Reset form
reset(); // to defaults
reset({ newDefaults }); // with new values

// Trigger validation
trigger('fieldName');
trigger(); // all fields

// Clear errors
clearErrors('fieldName');
clearErrors(); // all errors
```

### Hybrid Class Component Pattern

```javascript
class MyComponent extends React.Component {
  handleSubmit = data => {
    // Handle submission
  };

  render() {
    return <MyForm onSubmit={this.handleSubmit} initialValues={this.state.initValue} />;
  }
}

function MyForm({ onSubmit, initialValues }) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  return <Form onSubmit={handleSubmit(onSubmit)}>{/* fields */}</Form>;
}
```

### Before/After Comparison

#### Formik

```javascript
<Formik
  initialValues={{ name: '' }}
  validationSchema={Yup.object({ name: Yup.string().required() })}
  onSubmit={values => console.log(values)}
>
  {props => (
    <Form>
      <Input
        value={props.values.name}
        onChange={props.handleChange('name')}
        className={props.errors.name && props.touched.name ? 'is-invalid' : ''}
      />
    </Form>
  )}
</Formik>
```

#### React Hook Form

```javascript
const schema = z.object({ name: z.string().min(1) });
const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '' },
});

<Form onSubmit={handleSubmit(data => console.log(data))}>
  <Controller
    name="name"
    control={control}
    render={({ field }) => <Input {...field} className={errors.name ? 'is-invalid' : ''} />}
  />
</Form>;
```

### Custom Validation with Input Constraints

```javascript
<Controller
  name="age"
  control={control}
  render={({ field }) => (
    <Input
      {...field}
      type="number"
      onChange={e => {
        const value = e.target.value;
        // Only allow numbers
        if (value === '' || /^\d+$/.test(value)) {
          field.onChange(value);
        }
      }}
    />
  )}
/>
```

### Error Display Patterns

```javascript
// Simple
{
  errors.fieldName && <div className="invalid-feedback">{errors.fieldName.message}</div>;
}

// With touched state (add mode: 'onBlur' to useForm options)
{
  errors.fieldName && <div className="invalid-feedback">{errors.fieldName.message}</div>;
}

// Inline
<Input className={errors.fieldName ? 'is-invalid' : ''} />;
```

## Common Migrations

### Yup → Zod

| Yup                            | Zod                                   |
| ------------------------------ | ------------------------------------- |
| `Yup.string().required('msg')` | `z.string().min(1, 'msg')`            |
| `Yup.string().email('msg')`    | `z.string().email('msg')`             |
| `Yup.string().min(5, 'msg')`   | `z.string().min(5, 'msg')`            |
| `Yup.string().max(10, 'msg')`  | `z.string().max(10, 'msg')`           |
| `Yup.number().required('msg')` | `z.number({ required_error: 'msg' })` |
| `Yup.number().positive('msg')` | `z.number().positive('msg')`          |
| `Yup.date().required('msg')`   | `z.date({ required_error: 'msg' })`   |
| `Yup.boolean()`                | `z.boolean()`                         |
| `Yup.string().nullable()`      | `z.string().nullable()`               |
| `Yup.string().optional()`      | `z.string().optional()`               |

## Tips

1. Always use `Controller` for controlled components (Select, DatePicker, etc.)
2. Use `{...field}` spread for simple inputs
3. Add `shouldValidate: true` when setting values programmatically
4. Use `watch()` for reactive values, not `getValues()`
5. For custom input constraints, override onChange in Controller's render
6. Test validation by submitting empty form first

## Debugging

```javascript
// Log current form values
console.log(watch());

// Log specific field
console.log(watch('fieldName'));

// Log all errors
console.log(errors);

// Check if form is valid
console.log(formState.isValid);

// Check form state
console.log(formState);
```

## Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- Example files: `payrollemp/sections/*.jsx`, `payroll_run/sections/*.jsx`
