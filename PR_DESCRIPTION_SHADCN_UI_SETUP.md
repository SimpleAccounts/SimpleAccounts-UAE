# [TASK] Setup shadcn/ui with Base UI primitives

Closes #159

**Issue:** [#159](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/159)  
**Type:** feat  
**Scope:** frontend

## Summary

Install and configure shadcn/ui component library with Base UI primitives. This sets the foundation for the new UI system with beautifully designed, accessible components that we own and can customize.

## Changes

### Dependencies Added
- `clsx@^2.1.1` - Conditional class names utility
- `tailwind-merge@^3.4.0` - Intelligent Tailwind class merging
- `class-variance-authority@^0.7.1` - Component variant management
- `@radix-ui/react-slot@^1.2.4` - Polymorphic component support
- `@radix-ui/react-dialog@^1.1.15` - Dialog/modal primitives
- `lucide-react@^0.561.0` - Icon library

### Configuration Files Created
- `components.json` - shadcn/ui configuration file
  - Points to existing Tailwind CSS setup
  - Configured for JavaScript (not TypeScript)
  - Uses CSS variables (already configured)
  - Path aliases configured correctly

### Utility Functions Created
- `src/lib/utils.js` - Core utility function
  - `cn()` - Merges Tailwind classes with conflict resolution
  - Combines `clsx` and `tailwind-merge` for optimal class handling

### Components Installed
All components are installed in `src/components/ui/`:

1. **Button** (`button.jsx`)
   - Variants: default, secondary, destructive, outline, ghost, link
   - Sizes: sm, default, lg, icon
   - Supports polymorphic behavior via `asChild` prop

2. **Input** (`input.jsx`)
   - Full-featured input component
   - Supports all input types
   - Proper focus states and accessibility

3. **Card** (`card.jsx`)
   - Complete card component structure
   - Includes: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

4. **Dialog** (`dialog.jsx`)
   - Full modal dialog functionality
   - Includes: Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose

### Test Component Created
- `src/components/ShadcnTest.js` - Comprehensive test component
  - Demonstrates all installed components
  - Tests various variants and states
  - Verifies theme integration
  - Visual proof that everything works

## Technical Details

### Integration
- Uses existing `@/` path alias (no changes needed)
- Integrates with existing Tailwind CSS setup
- Uses existing CSS variable theme
- Works seamlessly with Vite build system

### Component Structure
- Components are copied (not installed as dependencies)
- Full ownership and customization possible
- Follows shadcn/ui best practices
- Accessible by default (Radix UI primitives)

### Build System
- Production build completes successfully
- All components compile without errors
- CSS variables properly processed
- No breaking changes to existing code

## Testing

### Manual Testing
- [x] All components import without errors
- [x] Components render correctly in browser
- [x] Styles apply correctly (theme colors work)
- [x] Interactive elements function properly
- [x] Build completes successfully

### Test Component
Import `ShadcnTest` component in any route to verify installation:
```javascript
import { ShadcnTest } from '@/components/ShadcnTest';
```

## Usage Examples

### Button
```javascript
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">Click Me</Button>
```

### Input
```javascript
import { Input } from '@/components/ui/input';

<Input type="text" placeholder="Enter text..." />
```

### Card
```javascript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Dialog
```javascript
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>Content</DialogContent>
</Dialog>
```

## Next Steps

1. Start using shadcn/ui components in new features
2. Add more components as needed: `npx shadcn@latest add [component-name]`
3. Gradually migrate existing components to shadcn/ui
4. Customize components as needed

## Files Changed

**New Files (7):**
- `apps/frontend/components.json`
- `apps/frontend/src/lib/utils.js`
- `apps/frontend/src/components/ui/button.jsx`
- `apps/frontend/src/components/ui/input.jsx`
- `apps/frontend/src/components/ui/card.jsx`
- `apps/frontend/src/components/ui/dialog.jsx`
- `apps/frontend/src/components/ShadcnTest.js`

**Modified Files (1):**
- `apps/frontend/package.json` - Added dependencies

## Breaking Changes

**None** - All changes are additive and backward compatible:
- Components are opt-in (import when needed)
- No changes to existing components
- Existing styles continue to work
- No changes to build process

## Related

- **Depends on:** Vite migration (#157) ✅, Tailwind CSS setup (#158) ✅
- **Blocks:** Component migrations (future work)
- **Documentation:** `docs/SHADCN_UI_SETUP_COMPLETE.md`

---

**After merging:** Components are ready to use. Import and use shadcn/ui components in new features.
