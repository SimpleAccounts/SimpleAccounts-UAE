# PO Box / ZIP Code Field Background Color Fix

## Issue

The PO Box/ZIP Code input fields were showing a gray background (`rgb(232, 238, 245)`) instead of white (`rgb(255, 255, 255)`) like other input fields.

## Root Cause

The `Input` component from shadcn/ui uses the `bg-background` CSS class by default, which was being applied to the ZIP Code input. This class has lower specificity than needed to override the gray background.

## Solution Applied

###1. Created CSS Class with `!important`
**File**: `apps/frontend/src/index.css`

Added at the end of the file:

```css
/* Force white background for ZIP/PO Box inputs */
.bg-white-important {
  background-color: #ffffff !important;
}
```

### 2. Updated ZipCodeInput Component

**File**: `apps/frontend/src/components/form_control/zip_code_input.jsx`

Changed the Input className to include `bg-white-important`:

```jsx
<Input
  ...
  className={`rounded-lg bg-white-important ${zipCodeError && zipCodeTouched ? 'border-red-500' : ''}`}
  style={{
    borderColor: '#e5e7eb',
  }}
  data-testid="zip-code-input"
/>
```

## Files Modified

1. `apps/frontend/src/index.css` - Added `.bg-white-important` class
2. `apps/frontend/src/components/form_control/zip_code_input.jsx` - Applied the new class

## Testing

A Playwright test was created in `e2e/contact-pobox-styling.spec.ts` to verify the background color.

**To verify the fix works:**

1. **Restart the frontend dev server** (important!):

   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run frontend
   ```

2. Run the Playwright test:

   ```bash
   npm run test:frontend:e2e -- contact-pobox-styling.spec.ts --project=chromium
   ```

3. Or manually verify by:
   - Opening the contact edit page
   - Inspecting the PO Box Number field
   - Checking that `background-color: rgb(255, 255, 255)` is applied

## Expected Result

After restarting the dev server, the PO Box/ZIP Code fields should have a white background matching all other input fields in the form.

## Additional Fixes Applied (Previous)

1. ✅ Fixed address fields not displaying - changed from legacy props API to React Hook Form context API
2. ✅ Fixed country dropdown not showing countries - added `resetCountryList()` call and useEffect
3. ✅ Fixed event propagation in DataTableRowActions - added `stopPropagation()` to prevent row clicks
4. ✅ Fixed route permissions for edit page - changed route names to match user permissions
