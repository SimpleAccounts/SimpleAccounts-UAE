# Additional Material-UI to Radix/shadcn Migration

## Overview

This document outlines the additional migration work performed to replace remaining Material-UI components with Radix UI/shadcn equivalents. This work builds upon the previous migration documented in `MATERIAL_UI_MIGRATION_SUMMARY.md`.

## Migration Date
December 19, 2025

## Newly Migrated Files

### 1. Email Popup Card Component
**Original File**: `/apps/frontend/src/components/sent_document/email_popup_card.jsx`
**Migrated File**: `/apps/frontend/src/components/sent_document/email_popup_card_migrated.jsx`

**Components Replaced**:
- `TextField` (Material-UI) → `Textarea` (shadcn/ui)
- `Checkbox` (@mui/material) → `Checkbox` (Radix/shadcn)

**Key Changes**:
```jsx
// TextField Migration
// Before
<TextField
  type="textarea"
  className="textarea"
  inputProps={{ maxLength: 255 }}
  multiline
  name="subject"
  id="subject"
  maxRows="4"
  placeholder={'Enter the Subject'}
  onChange={(e) => {
    field.onChange(e);
    updateState(e, 'subject', e.target.value);
  }}
  value={currentEntityEmailDetails.subject && currentEntityEmailDetails.subject}
/>

// After
<Textarea
  className="textarea"
  maxLength={255}
  rows={4}
  name="subject"
  id="subject"
  placeholder="Enter the Subject"
  onChange={(e) => {
    field.onChange(e);
    updateState(e, 'subject', e.target.value);
  }}
  value={currentEntityEmailDetails.subject && currentEntityEmailDetails.subject}
/>

// Checkbox Migration
// Before
<Checkbox
  checked={attach}
  onClick={() => {
    setAttach(!attach);
  }}
/>

// After
<div className="flex items-center space-x-2">
  <Checkbox
    checked={attach}
    onCheckedChange={(checked) => {
      setAttach(checked);
    }}
    id="attachPdf"
  />
  <Label htmlFor="attachPdf" className="cursor-pointer">Attach the pdf version of document</Label>
</div>
```

**Improvements**:
- Better accessibility with proper label associations
- Cleaner API with `onCheckedChange` instead of `onClick`
- Removed Material-UI specific props (`inputProps`, `multiline`, `maxRows`)
- Added semantic HTML structure with flex layout

---

### 2. Customer Modal Component
**Original File**: `/apps/frontend/src/screens/creditNotes/sections/customer_modal.jsx`
**Migrated File**: `/apps/frontend/src/screens/creditNotes/sections/customer_modal_migrated.jsx`

**Components Replaced**:
- `IconButton` (Material-UI) → Native `button` with Tailwind
- Font Awesome icon → `ChevronUp` (Lucide React)

**Key Changes**:
```jsx
// Before
<IconButton aria-label="delete" size="medium" onClick={() => handleShowDetails(false)}>
  <i className="fa fa-angle-double-up" aria-hidden="true"></i>
</IconButton>

// After
<button
  type="button"
  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
  onClick={() => handleShowDetails(false)}
>
  <ChevronUp className="h-4 w-4" aria-hidden="true" />
</button>
```

**Improvements**:
- Replaced proprietary component with semantic HTML
- Migrated to Lucide React icons (consistent with shadcn/ui)
- Used Tailwind CSS for styling (no custom CSS needed)
- Better theming support with accent colors
- Cleaner, more maintainable code

---

### 3. Product Table Component
**Original File**: `/apps/frontend/src/components/product_table/screen.jsx`
**Migrated File**: `/apps/frontend/src/components/product_table/screen_migrated.jsx`

**Components Replaced**:
- `TextField` (Material-UI) → `Textarea` (shadcn/ui)

**Key Changes**:
```jsx
// Before
<TextField
  type="textarea"
  inputProps={{ maxLength: 2000 }}
  multiline
  minRows={1}
  maxRows={4}
  disabled={disableAll}
  value={
    row["description"] !== "" && row["description"] !== null
      ? row["description"]
      : ""
  }
  onChange={(e) => {
    selectItem(e.target.value, row, "description", idx);
  }}
  placeholder={strings.Description}
  className={`textarea ${hasDescriptionError ? "is-invalid" : ""}`}
/>

// After
<Textarea
  maxLength={2000}
  rows={1}
  disabled={disableAll}
  value={
    row["description"] !== "" && row["description"] !== null
      ? row["description"]
      : ""
  }
  onChange={(e) => {
    selectItem(e.target.value, row, "description", idx);
  }}
  placeholder={strings.Description}
  className={`textarea ${hasDescriptionError ? "is-invalid" : ""}`}
/>
```

**Improvements**:
- Simplified props (removed Material-UI specific `inputProps`, `multiline`, `minRows`, `maxRows`)
- Standard HTML textarea attributes
- Better integration with React Hook Form
- Consistent with other textarea components in the app

---

### 4. Quotation Supplier Modal Component
**Original File**: `/apps/frontend/src/screens/quotation/sections/supplier_modal.jsx`
**Migrated File**: `/apps/frontend/src/screens/quotation/sections/supplier_modal_migrated.jsx`

**Components Replaced**:
- `IconButton` (Material-UI) → Native `button` with Tailwind
- `ArrowUpwardIcon` (Material-UI Icons) → `ChevronUp` (Lucide React)

**Key Changes**:
```jsx
// Before
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

<IconButton
  aria-label="delete"
  size="medium"
  onClick={() => handleShowDetails(false)}
>
  <ArrowUpwardIcon fontSize="inherit" />
</IconButton>

// After
import { ChevronUp } from 'lucide-react';

<button
  type="button"
  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
  onClick={() => handleShowDetails(false)}
  aria-label="Collapse details"
>
  <ChevronUp className="h-5 w-5" aria-hidden="true" />
</button>
```

**Improvements**:
- Consistent icon library (Lucide React) across the app
- Better accessibility with descriptive `aria-label`
- Responsive sizing with Tailwind utilities
- Smooth transitions and hover states
- Reduced bundle size (no Material-UI Icons dependency)

---

## Common Migration Patterns

### Pattern 1: TextField to Textarea
All Material-UI `TextField` components with multiline capabilities have been migrated to shadcn/ui `Textarea`:

**Removed Props**:
- `multiline` - Textarea is multiline by default
- `inputProps={{ maxLength: X }}` - Use `maxLength={X}` directly
- `minRows` - Use `rows` for fixed height
- `maxRows` - Not supported, use CSS for max-height if needed
- `type="textarea"` - Not needed with Textarea component

**Standard HTML Props**:
- `rows={number}` - Number of visible text rows
- `maxLength={number}` - Maximum character length
- `disabled={boolean}` - Disable input
- `placeholder={string}` - Placeholder text
- `onChange`, `onBlur`, `onFocus` - Standard React events

### Pattern 2: Checkbox Event Handling
Material-UI and Radix Checkbox have different event handling patterns:

**Material-UI Pattern**:
```jsx
<Checkbox
  checked={value}
  onClick={() => setValue(!value)}
/>
```

**Radix/shadcn Pattern**:
```jsx
<Checkbox
  checked={value}
  onCheckedChange={(checked) => setValue(checked)}
/>
```

**Key Differences**:
- `onClick` → `onCheckedChange`
- Handler receives boolean value directly (not event object)
- More intuitive API for boolean state

### Pattern 3: IconButton to Native Button
Replace Material-UI IconButton with semantic HTML button and Lucide icons:

**Standard Pattern**:
```jsx
import { IconName } from 'lucide-react';

<button
  type="button"
  className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
  onClick={handleClick}
  aria-label="Descriptive label"
>
  <IconName className="h-4 w-4" aria-hidden="true" />
</button>
```

**Tailwind Classes Explained**:
- `inline-flex items-center justify-center` - Flexbox centering
- `gap-2` - Space between icon and text (if any)
- `px-3 py-2` - Padding
- `text-sm font-medium` - Typography
- `rounded-md` - Border radius
- `hover:bg-accent hover:text-accent-foreground` - Hover states
- `transition-colors` - Smooth color transitions

## Import Changes Summary

### Add These Imports
```jsx
// shadcn/ui components
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Lucide React icons
import { ChevronUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
```

### Remove These Imports
```jsx
// Material-UI Core
import { TextField } from '@material-ui/core';
import { Checkbox } from '@mui/material';
import IconButton from '@material-ui/core/IconButton';

// Material-UI Icons
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
```

## Testing Checklist

For each migrated file, verify:

### Functional Testing
- [ ] Form submissions work correctly
- [ ] Validation messages display as expected
- [ ] Controlled components update state properly
- [ ] onChange/onCheckedChange handlers fire correctly
- [ ] Error states display correctly
- [ ] Required field validation works

### Visual Testing
- [ ] Components render with correct styling
- [ ] Spacing and alignment match original design
- [ ] Hover states work as expected
- [ ] Focus states are visible
- [ ] Dark mode compatibility (if applicable)
- [ ] Responsive behavior on mobile

### Accessibility Testing
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader labels are correct
- [ ] ARIA attributes are present
- [ ] Focus indicators are visible
- [ ] Form labels are properly associated

### Integration Testing
- [ ] React Hook Form validation works
- [ ] Zod schemas validate correctly
- [ ] Form submission to backend succeeds
- [ ] Error handling displays properly
- [ ] Redux state updates correctly (if applicable)

## Remaining Material-UI Usage

### Files Still Using Material-UI Icons
The following files still import Material-UI icons and should be migrated to Lucide React:

1. `/apps/frontend/src/screens/goods_received_note/sections/supplier_modal.jsx`
2. `/apps/frontend/src/screens/purchase_order/sections/supplier_modal.jsx`
3. `/apps/frontend/src/screens/request_for_quotation/sections/supplier_modal.jsx`
4. `/apps/frontend/src/screens/payment/sections/supplier_modal.jsx`

**Pattern for Migration**:
- Replace `ArrowUpwardIcon` → `ChevronUp` (Lucide)
- Replace `IconButton` → Native `button` with Tailwind
- Apply same styling pattern as shown above

### Other Supplier Modal Files
Similar patterns should be applied to:
- `/apps/frontend/src/screens/creditNotes/sections/customer_modal.js` (already has .jsx migrated version)
- Other modal components using IconButton

## Benefits of This Migration

### 1. Consistency
All form components now use the same design system, making the codebase more maintainable and predictable.

### 2. Smaller Bundle Size
- Removed Material-UI core dependency from these files
- Lucide icons are tree-shakeable (only import what you use)
- Radix primitives are lightweight

### 3. Better Developer Experience
- Simpler, more intuitive component APIs
- Better TypeScript support
- Easier to customize with Tailwind CSS
- Clear documentation

### 4. Improved Accessibility
- Radix UI primitives are built with accessibility in mind
- Better keyboard navigation
- Proper ARIA attributes out of the box
- Screen reader friendly

### 5. Modern React Patterns
- Hooks-based API
- Better integration with React 18+
- Consistent with modern React ecosystem

## Next Steps

### Immediate
1. Test all migrated components thoroughly
2. Update component documentation
3. Notify QA team of changes for testing

### Short Term
1. Migrate remaining supplier modal files (4 files)
2. Replace Material-UI icons with Lucide React throughout
3. Remove Material-UI dependencies from package.json

### Long Term
1. Create component migration guide for team
2. Update style guide with new patterns
3. Consider migrating other UI libraries to shadcn/ui
4. Document best practices for new components

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## Migration Author

This migration was performed to modernize the frontend codebase and align with current best practices in React development.

For questions or issues, please refer to the frontend team's documentation or create an issue in the project repository.
