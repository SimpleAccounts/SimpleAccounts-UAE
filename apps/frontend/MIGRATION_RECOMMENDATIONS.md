# Formik + Yup to React Hook Form + Zod Migration - Recommendations

## Current Status

Out of 58 files requiring migration:

- ✅ **2 files completed** (VAT code create/detail screens)
- ⏳ **56 files remaining**

## Challenge

The remaining 56 files are large and complex, averaging 500-1500 lines of code each. Many contain:

- Complex form validation logic
- Multiple form steps or sections
- Custom validation rules
- Integration with Redux and multiple API calls
- Image uploaders, date pickers, and custom components
- Conditional rendering based on form state

## Recommended Approach

Given the scope and complexity, I recommend a **phased migration approach**:

### Phase 1: Critical User-Facing Forms (High Priority)

Focus on forms that users interact with most frequently:

1. **User Management** (6 files)
   - User create/detail screens
   - User roles create/detail
   - Employee modal
   - Profile screen

2. **Contact & Customer Management** (2 files)
   - Contact create/detail screens

3. **Product Management** (4 files)
   - Product create/detail screens
   - Product category create/detail

### Phase 2: Financial & Transactional Forms (Medium Priority)

4. **Banking & Transactions** (8 files)
   - Bank account forms
   - Transaction management screens

5. **Expense & Payment** (6 files)
   - Expense create/detail
   - Payment modals
   - Opening balance screens

### Phase 3: Configuration & Settings (Lower Priority)

6. **Master Data** (8 files)
   - Chart of accounts
   - Currency conversion
   - Designation management

7. **Settings & Configuration** (4 files)
   - Organization settings
   - General settings
   - Notes settings

### Phase 4: Specialized Forms

8. **Import & Data Management** (5 files)
   - Import screens and modals

9. **Reports & Filters** (3 files)
   - Report filter components

10. **Miscellaneous** (10 files)
    - Employment screens
    - Employee bank details
    - Project management
    - Various modals

## Migration Pattern Summary

Based on the successfully migrated VAT code screens, here's the standard pattern:

### 1. Convert Class Component to Functional Component (if needed)

```javascript
// Before
class CreateScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ... };
  }
}

// After
const CreateScreen = ({ ...props }) => {
  const [state, setState] = useState({ ... });
}
```

### 2. Replace Formik with useForm Hook

```javascript
// Before
<Formik
  initialValues={...}
  validationSchema={Yup.object().shape({...})}
  onSubmit={...}
>
  {(props) => <Form>...</Form>}
</Formik>

// After
const schema = z.object({...});
const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues: {...}
});

<Form onSubmit={handleSubmit(onSubmit)}>...</Form>
```

### 3. Replace Form Fields with Controller

```javascript
// Before (Formik)
<Input
  name="fieldName"
  value={props.values.fieldName}
  onChange={props.handleChange}
  onBlur={props.handleBlur}
/>

// After (React Hook Form)
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => <Input {...field} />}
/>
```

### 4. Update Error Handling

```javascript
// Before
{
  props.errors.fieldName && props.touched.fieldName && (
    <div className="invalid-feedback">{props.errors.fieldName}</div>
  );
}

// After
{
  errors.fieldName && <div className="invalid-feedback">{errors.fieldName.message}</div>;
}
```

## Automated Migration Tool Recommendation

Given the scale of this migration, consider creating an automated migration tool or using:

1. **jscodeshift** - For AST-based code transformations
2. **regex-based scripts** - For simpler pattern replacements
3. **Manual migration with templates** - Using the VAT code screens as templates

## Testing Strategy

After migrating each file:

1. **Visual Testing**: Verify form renders correctly
2. **Validation Testing**: Test all validation rules
3. **Submission Testing**: Verify form submission works
4. **Error Handling**: Test error scenarios
5. **Integration Testing**: Verify integration with Redux and APIs

## Estimated Timeline

Based on complexity:

- **Simple forms** (100-300 lines): 30-45 minutes each
- **Medium forms** (300-800 lines): 1-2 hours each
- **Complex forms** (800+ lines): 2-4 hours each

**Total estimated time**: 60-100 hours for all 56 files

## Next Steps

1. **Review** this migration plan
2. **Prioritize** which files to migrate first based on business needs
3. **Set up** a migration template based on VAT code screens
4. **Create** a test checklist for each migrated file
5. **Start** with Phase 1 (User Management forms)
6. **Track** progress using the FORMIK_TO_REACT_HOOK_FORM_MIGRATION_COMPLETE.md file

## Quick Win Strategy

To show immediate progress, start with these 5 files (estimated 4-5 hours total):

1. Product category create screen
2. Product category detail screen
3. Designation create screen
4. Designation detail screen
5. Currency convert create screen

These are relatively simple forms that follow similar patterns to the VAT code screens.
