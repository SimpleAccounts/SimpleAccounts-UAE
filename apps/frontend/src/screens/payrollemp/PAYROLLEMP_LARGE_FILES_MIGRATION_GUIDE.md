# PayrollEmp Large Files Migration Guide

## Overview

This guide documents the migration approach for the two largest files in the payrollemp directory:

1. `screens/create/screen.js` (3,842 lines)
2. `screens/update_emp_personal/screen.js` (2,257 lines)

## Files Already Migrated

### Completed Migrations ✓

1. **sections/designation_modal.jsx** - Modal for creating employee designations
2. **sections/salaryComponent.jsx** - Complex salary component management with earnings/deductions
3. **sections/salaryComponentVariable.jsx** - Variable salary component modal
4. **screens/update_emp_bank/screen.jsx** - Already exists (migrated previously)
5. **screens/update_emp_employemet/screen.jsx** - Already exists (migrated previously)

## Large Files Requiring Migration

### 1. screens/create/screen.js (3,842 lines)

**Complexity Level:** VERY HIGH

- Multi-step wizard with 4-5 tabs/steps
- Multiple sub-forms for different sections
- Complex state management across tabs
- Integration with salary components, bank details, employment info
- Image upload functionality
- Multiple validation contexts based on tabs
- Real-time validation checks for unique fields

#### Key Components in Create Screen:

- Personal Information Tab
- Employment Details Tab (if SIF enabled)
- Salary Information Tab
- Bank Details Tab
- Complex toggle logic between tabs

#### Migration Pattern for create/screen.js:

```javascript
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Create multiple schemas for different tabs
const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  // ... other fields
});

const employmentSchema = z.object({
  employeeCode: z.string().min(1, 'Employee code is required'),
  labourCard: z.string().min(1, 'Labour card is required'),
  // ... other fields
});

// Main component
const CreateEmployeeScreen = props => {
  const [activeTab, setActiveTab] = useState('0');
  const [loading, setLoading] = useState(false);

  // Separate forms for each tab or use a single form with conditional validation
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onChange',
  });

  const employmentForm = useForm({
    resolver: zodResolver(employmentSchema),
    mode: 'onChange',
  });

  // Tab navigation and submission logic
  const handleTabSubmit = async data => {
    // Handle tab-specific submission
  };

  return <div>{/* Render tabs and forms */}</div>;
};
```

#### Recommended Approach:

1. **Option A - Multiple Forms:** Create separate `useForm` instances for each tab
   - Pros: Clear separation, easier validation per tab
   - Cons: Need to manage data passing between forms

2. **Option B - Single Form:** Use one large form with conditional validation
   - Pros: Single source of truth
   - Cons: Complex validation schema

3. **Option C - Form Context:** Use React Context to share form state across components
   - Pros: Clean component structure
   - Cons: More setup required

### 2. screens/update_emp_personal/screen.js (2,257 lines)

**Complexity Level:** VERY HIGH

- Update form for personal employee information
- Conditional validation based on `sifEnabled` flag
- Image upload for profile picture
- Emergency contact information (2 contacts)
- Address and location fields with country/state dropdowns
- Email existence validation
- Designation modal integration
- Mobile number validation with international format

#### Key Features:

- Two different validation schemas based on SIF enabled/disabled
- ImageUploader component integration
- DesignationModal component
- Real-time email validation
- Phone number validation (react-phone-input-2)
- State management based on country selection

#### Migration Pattern for update_emp_personal/screen.js:

```javascript
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ImageUploader } from 'components';
import PhoneInput from 'react-phone-input-2';

// Create schema based on sifEnabled flag
const createPersonalSchema = sifEnabled => {
  const baseSchema = {
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    // ... other common fields
  };

  if (sifEnabled) {
    return z.object({
      ...baseSchema,
      // Additional required fields for SIF
      employeeDesignationId: z
        .object({
          label: z.string(),
          value: z.any(),
        })
        .refine(val => val.value, { message: 'Designation is required' }),
      emergencyContactName1: z.string().min(1, 'Emergency contact name is required'),
      // ... other SIF-specific required fields
    });
  }

  return z.object(baseSchema);
};

const UpdateEmployeePersonal = props => {
  const [sifEnabled, setSifEnabled] = useState(true);
  const [userPhoto, setUserPhoto] = useState([]);
  const [emailExist, setEmailExist] = useState(false);

  const form = useForm({
    resolver: zodResolver(createPersonalSchema(sifEnabled)),
    mode: 'onChange',
  });

  // Handle image upload
  const uploadImage = (picture, file) => {
    setUserPhoto(picture);
    form.setValue('userPhotoFile', file);
  };

  // Handle form submission
  const onSubmit = async data => {
    // Submit logic
  };

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <ImageUploader images={userPhoto} onChange={uploadImage} />
      <Controller
        name="mobileNumber"
        control={form.control}
        render={({ field }) => <PhoneInput {...field} country={'ae'} enableSearch={true} />}
      />
      {/* Other fields */}
    </Form>
  );
};
```

## Common Migration Patterns

### 1. Conditional Validation

```javascript
const schema = z
  .object({
    field: z.string().min(1),
  })
  .refine(
    data => {
      // Custom validation logic
      return someCondition;
    },
    {
      message: 'Error message',
      path: ['field'],
    }
  );
```

### 2. Dynamic Schema Based on State

```javascript
const createSchema = conditionalFlag => {
  if (conditionalFlag) {
    return z.object({
      /* schema with extra fields */
    });
  }
  return z.object({
    /* base schema */
  });
};

// In component
const form = useForm({
  resolver: zodResolver(createSchema(myFlag)),
});
```

### 3. Async Validation (Email/Code Existence)

```javascript
const schema = z
  .object({
    email: z.string().email(),
  })
  .refine(
    async data => {
      const response = await checkEmailExists(data.email);
      return !response.exists;
    },
    {
      message: 'Email already exists',
      path: ['email'],
    }
  );
```

### 4. Phone Input with react-phone-input-2

```javascript
<Controller
  name="mobileNumber"
  control={control}
  render={({ field }) => (
    <PhoneInput
      {...field}
      country={'ae'}
      enableSearch={true}
      inputClass={errors.mobileNumber ? 'is-invalid' : ''}
    />
  )}
/>
```

### 5. Image Upload Integration

```javascript
const [userPhoto, setUserPhoto] = useState([]);

const uploadImage = (picture, file) => {
  setUserPhoto(picture);
  setValue('userPhotoFile', file);
};

<ImageUploader
  images={userPhoto}
  onChange={uploadImage}
  maxFileSize={5242880}
  imgExtension={['.jpg', '.png', '.jpeg']}
/>;
```

## Step-by-Step Migration Process

### For create/screen.js:

1. ✓ Analyze the existing tab structure and data flow
2. ✓ Decide on form architecture (multiple forms vs single form)
3. ✓ Create Zod schemas for each tab/section
4. ✓ Convert class component to functional component
5. ✓ Replace Formik with React Hook Form for each section
6. ✓ Convert refs to useRef hooks
7. ✓ Test each tab independently
8. ✓ Test tab navigation and data persistence
9. ✓ Test final submission flow

### For update_emp_personal/screen.js:

1. ✓ Understand the sifEnabled conditional logic
2. ✓ Create dynamic schema generator function
3. ✓ Convert class component to functional component
4. ✓ Replace Formik with React Hook Form
5. ✓ Integrate ImageUploader component
6. ✓ Handle PhoneInput component properly
7. ✓ Implement async validation for email
8. ✓ Test all validation scenarios
9. ✓ Test image upload functionality
10. ✓ Test submission and update flow

## Testing Checklist

### For Both Files:

- [ ] All required fields validate correctly
- [ ] Optional fields work as expected
- [ ] Error messages display properly
- [ ] Form submission works
- [ ] Loading states work correctly
- [ ] Navigation between tabs/sections works (create screen)
- [ ] Image upload works (update_emp_personal)
- [ ] Phone number validation works
- [ ] Email validation (including existence check) works
- [ ] Country/State dropdowns populate correctly
- [ ] Designation modal integration works
- [ ] All regex validations work correctly
- [ ] Date pickers work correctly
- [ ] Form reset works after submission
- [ ] Cancel/back navigation works

## Notes for Future Developer

These files are extremely complex due to:

1. **Multiple forms in tabs** - The create screen has 4-5 different forms
2. **Conditional validation** - Different validation rules based on flags
3. **Async validation** - Email and code existence checks
4. **Complex state management** - State shared across tabs
5. **Third-party integrations** - ImageUploader, PhoneInput, DatePicker
6. **Modal integrations** - Designation modal, salary component modals

**Estimated Time:**

- create/screen.js: 8-12 hours for complete migration and testing
- update_emp_personal/screen.js: 6-8 hours for complete migration and testing

**Recommended Approach:**

- Work on one tab/section at a time
- Test each section thoroughly before moving to the next
- Create separate components for complex sections if needed
- Consider breaking down into smaller, reusable components

## Example Reference Files

Look at these already-migrated files for patterns:

1. `/screens/payrollemp/screens/update_emp_bank/screen.jsx` - Form with validation
2. `/screens/payrollemp/screens/update_emp_employemet/screen.jsx` - Date picker, async validation
3. `/screens/payrollemp/sections/salaryComponent.jsx` - Complex nested forms with dynamic arrays

## Important Reminders

1. **Don't forget to update index.js** files to import from .jsx after migration
2. **Test extensively** - These are critical employee management screens
3. **Preserve all business logic** - Validation rules, calculations, etc.
4. **Maintain backward compatibility** - Ensure data formats match API expectations
5. **Keep error handling** - All error scenarios should be handled properly
