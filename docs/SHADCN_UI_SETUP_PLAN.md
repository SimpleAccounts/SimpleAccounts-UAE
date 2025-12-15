# shadcn/ui Setup - Action Plan

**Issue:** [#159](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/159)  
**Status:** 📋 **PLANNING**  
**Priority:** P1 - High  
**Type:** Setup Task  
**Estimated Effort:** Small (< 4 hours)

## Overview

Install and configure shadcn/ui component library with Base UI primitives as the foundation for the new UI system. shadcn/ui provides beautifully designed, accessible components that you own and can customize.

## Prerequisites

### Blocked By (must complete first)
- ✅ **[TASK] Migrate from Create React App to Vite #157** - COMPLETE
- ✅ **[TASK] Setup Tailwind CSS configuration #158** - COMPLETE

### Blocks (cannot start until this is done)
- Component migrations
- Screen migrations

## Current State Analysis

### Existing Setup
- ✅ **Vite** - Build system configured
- ✅ **Tailwind CSS** - Fully configured with shadcn/ui-compatible theme
- ✅ **Path Aliases** - `@/` alias configured in `vite.config.js` and `jsconfig.json`
- ✅ **PostCSS** - Configured with Tailwind and Autoprefixer
- ✅ **CSS Variables** - Theme colors defined in `tailwind.css`

### Project Structure
- **Components:** `src/components/` (existing components)
- **Utils:** `src/utils/` (existing utilities)
- **Path Alias:** `@/` → `src/` (already configured)

## Technical Approach

### Phase 1: Install Dependencies

**Required Packages:**
- `shadcn-ui` (CLI tool, used via npx)
- `clsx` - For conditional class names
- `tailwind-merge` - For merging Tailwind classes
- `@base-ui-components/react` - Base UI primitives (optional, can use shadcn's built-in)

**Installation:**
```bash
cd apps/frontend
npm install clsx tailwind-merge
```

### Phase 2: Initialize shadcn/ui

**Command:**
```bash
cd apps/frontend
npx shadcn@latest init
```

**Configuration Options:**
- Style: `default`
- Base color: `slate` (or match existing theme)
- CSS variables: `true` (already using CSS variables)
- TypeScript: `false` (using JavaScript)
- RSC: `false` (not using React Server Components)

### Phase 3: Configure components.json

**File:** `apps/frontend/components.json`

**Configuration:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/assets/css/tailwind.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Key Points:**
- `css`: Points to our Tailwind CSS file
- `aliases`: Uses existing `@/` path alias
- `cssVariables`: `true` (matches our setup)
- `tsx`: `false` (using `.js` files)

### Phase 4: Create Utility Functions

**File:** `apps/frontend/src/lib/utils.js` (new)

**Content:**
```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for conflict resolution
 * 
 * @param {...any} inputs - Class names or conditional class objects
 * @returns {string} Merged class string
 * 
 * @example
 * cn("px-2 py-1", "px-4") // Returns "py-1 px-4" (px-4 overrides px-2)
 * cn("bg-red-500", isActive && "bg-blue-500") // Conditional classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

**Why `lib/` instead of `utils/`?**
- shadcn/ui convention uses `lib/utils`
- Can create alias or keep both
- Existing `utils/` directory can coexist

### Phase 5: Update Path Aliases (if needed)

**Check if `@/lib` alias is needed:**
- Current: `@/` → `src/`
- shadcn uses: `@/lib/utils`
- This maps to: `src/lib/utils.js` ✅ (works with current setup)

**Optional:** Add explicit alias in `vite.config.js`:
```javascript
'lib': path.resolve(__dirname, './src/lib'),
```

### Phase 6: Install Initial Components

**Core Components to Add:**
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
```

**Component Location:**
- Components will be added to `src/components/ui/`
- Each component is a `.jsx` file (or `.js` if configured)
- Components are copied, not installed as dependencies

### Phase 7: Verify Installation

**Verification Steps:**
1. Check `components.json` exists and is correct
2. Verify `src/lib/utils.js` exists with `cn()` function
3. Verify components in `src/components/ui/`
4. Test importing a component:
   ```javascript
   import { Button } from '@/components/ui/button';
   ```
5. Verify component renders correctly

## Directory Structure

### After Setup
```
apps/frontend/
├── components.json              # shadcn/ui configuration
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (new)
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── card.jsx
│   │   │   └── dialog.jsx
│   │   └── ...                   # Existing components
│   ├── lib/                     # New directory
│   │   └── utils.js             # cn() utility function
│   └── utils/                    # Existing utilities (unchanged)
```

## Detailed Implementation Steps

### Step 1: Install Dependencies

```bash
cd apps/frontend
npm install clsx tailwind-merge
```

**Verification:**
- Check `package.json` for new dependencies
- Verify installation: `npm list clsx tailwind-merge`

### Step 2: Initialize shadcn/ui

```bash
cd apps/frontend
npx shadcn@latest init
```

**Interactive Prompts:**
1. **Style:** `default`
2. **Base color:** `slate` (or `blue` to match brand)
3. **CSS variables:** `Yes` (we're using CSS variables)
4. **TypeScript:** `No`
5. **RSC:** `No`

**Expected Output:**
- Creates `components.json`
- May create `src/lib/utils.js` (or we create it manually)

### Step 3: Verify/Create components.json

**File:** `apps/frontend/components.json`

**Verify Configuration:**
- `css`: Should point to `src/assets/css/tailwind.css`
- `aliases.components`: Should be `@/components`
- `aliases.utils`: Should be `@/lib/utils`
- `cssVariables`: Should be `true`

**If needed, update manually:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/assets/css/tailwind.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Step 4: Create lib/utils.js

**File:** `apps/frontend/src/lib/utils.js`

**If not created by init:**
```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

### Step 5: Update Path Aliases (if needed)

**Check vite.config.js:**
- Verify `@/` alias exists (should already be there)
- Add `lib` alias if needed:
  ```javascript
  'lib': path.resolve(__dirname, './src/lib'),
  ```

**Check jsconfig.json:**
- Verify `baseUrl` is `"./src"` (should already be there)
- This allows `@/lib/utils` to work

### Step 6: Install Initial Components

```bash
cd apps/frontend

# Install core components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
```

**Expected Behavior:**
- Components added to `src/components/ui/`
- Components use `.jsx` extension (or `.js` if configured)
- Components import from `@/lib/utils` for `cn()` function

### Step 7: Test Component Import

**Create Test File:** `apps/frontend/src/components/ShadcnTest.js`

```javascript
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const ShadcnTest = () => {
  return (
    <div className="p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>shadcn/ui Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">If you can see this styled, shadcn/ui is working!</p>
          <Button>Test Button</Button>
        </CardContent>
      </Card>
    </div>
  );
};
```

**Verify:**
- Component imports without errors
- Component renders correctly
- Styles apply correctly

## Configuration Details

### components.json Structure

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/assets/css/tailwind.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Path Alias Configuration

**Current Setup:**
- `@/` → `src/` (already configured)
- `@/components` → `src/components/`
- `@/lib/utils` → `src/lib/utils.js`

**No additional configuration needed** - existing setup works!

## Component Installation Strategy

### Initial Components (Phase 1)
- `button` - Core interactive element
- `input` - Form input element
- `card` - Container component
- `dialog` - Modal/dialog component

### Future Components (as needed)
- `form` - Form wrapper with validation
- `select` - Dropdown select
- `table` - Data table
- `dropdown-menu` - Dropdown menus
- `toast` - Toast notifications
- And many more...

## Testing Strategy

### Manual Testing
1. **Component Import:**
   - Import a component in a test file
   - Verify no import errors

2. **Component Rendering:**
   - Render component in browser
   - Verify styles apply correctly
   - Verify interactivity works

3. **Theme Integration:**
   - Verify components use theme colors
   - Test dark mode (if applicable)

### Automated Testing
- Existing Jest tests should continue to pass
- Add component tests as needed
- Test `cn()` utility function

## Potential Issues & Solutions

### Issue 1: Path Alias Not Working
**Solution:** Verify `vite.config.js` and `jsconfig.json` have correct aliases

### Issue 2: Components Use TypeScript
**Solution:** Configure `tsx: false` in `components.json`, or convert to `.js`

### Issue 3: CSS Variables Not Found
**Solution:** Verify `tailwind.css` path in `components.json` is correct

### Issue 4: cn() Function Not Found
**Solution:** Verify `src/lib/utils.js` exists and exports `cn()`

### Issue 5: Base UI Dependency
**Solution:** shadcn/ui components include their own primitives, Base UI is optional

## Acceptance Criteria

- [ ] `clsx` and `tailwind-merge` installed
- [ ] `components.json` created and configured correctly
- [ ] `src/lib/utils.js` created with `cn()` function
- [ ] Path aliases work correctly
- [ ] Initial components installed (Button, Input, Card, Dialog)
- [ ] Components can be imported without errors
- [ ] Components render correctly with styles
- [ ] Components use theme colors correctly
- [ ] Documentation created

## Files to Create/Modify

### New Files
- `apps/frontend/components.json` - shadcn/ui configuration
- `apps/frontend/src/lib/utils.js` - cn() utility function
- `apps/frontend/src/components/ui/button.jsx` - Button component
- `apps/frontend/src/components/ui/input.jsx` - Input component
- `apps/frontend/src/components/ui/card.jsx` - Card component
- `apps/frontend/src/components/ui/dialog.jsx` - Dialog component

### Modified Files
- `apps/frontend/package.json` - Add clsx, tailwind-merge dependencies
- `apps/frontend/vite.config.js` - May need lib alias (optional)
- `apps/frontend/jsconfig.json` - Verify baseUrl (should be fine)

## Next Steps (Post-Setup)

After shadcn/ui is set up:
1. Begin using components in new features
2. Plan component migrations
3. Add more components as needed
4. Create custom component variants

## Related

- Issue: #159
- Depends on: #157 (Vite migration) ✅, #158 (Tailwind CSS) ✅
- Plan: `docs/TAILWIND_CSS_SETUP_PLAN.md`

---

**Estimated Time:** 2-4 hours  
**Difficulty:** Easy  
**Dependencies:** Vite ✅, Tailwind CSS ✅
