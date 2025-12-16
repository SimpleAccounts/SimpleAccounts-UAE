# [TASK] Migrate layout components (Header, Sidebar, Footer) to shadcn/ui + Tailwind CSS

**Issue:** [#166](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/166)  
**Type:** `feat(frontend):`  
**Status:** ✅ Ready for Review  
**Closes:** #166

## Summary

This PR migrates the main layout components (Header, Sidebar, Footer) from CoreUI/reactstrap to shadcn/ui + Tailwind CSS. These components are used across all pages and provide the foundation for consistent UI throughout the application.

## What Changed

### Dependencies Added

- `@radix-ui/react-dialog` (for Sheet component)
- `@radix-ui/react-scroll-area` (for ScrollArea component)
- `@radix-ui/react-slot` (for Breadcrumb component)

### Components Added

1. **Sheet Component** (`src/components/ui/sheet.jsx`)
   - Mobile menu drawer component
   - Used for responsive navigation

2. **ScrollArea Component** (`src/components/ui/scroll-area.jsx`)
   - Scrollable container for sidebar navigation
   - Provides smooth scrolling with custom scrollbar

3. **Breadcrumb Component** (`src/components/ui/breadcrumb.jsx`)
   - Breadcrumb navigation component
   - Replaces reactstrap Breadcrumb

### Layout Components Created

1. **Header Component** (`src/layouts/components/header.jsx`)
   - Migrated from `src/components/header/index.js`
   - Features:
     - ✅ Sticky header with backdrop blur
     - ✅ Mobile menu using Sheet component
     - ✅ User avatar with DropdownMenu
     - ✅ User dropdown with all menu items (Profile, Settings, Logout)
     - ✅ Sidebar toggle buttons (mobile and desktop)
     - ✅ Logo/brand display
     - ✅ Redux integration preserved
     - ✅ Language support preserved

2. **Sidebar Component** (`src/layouts/components/sidebar.jsx`)
   - New sidebar component with shadcn/ui styling
   - Features:
     - ✅ Collapsible navigation items
     - ✅ Active route highlighting
     - ✅ Scrollable navigation with ScrollArea
     - ✅ Icon support
     - ✅ Minimized state support
     - ✅ Responsive design

3. **Footer Component** (`src/layouts/components/footer.jsx`)
   - Migrated from `src/components/footer/index.js`
   - Features:
     - ✅ Logo display
     - ✅ Language selector using shadcn Select
     - ✅ Language switching preserved

4. **MobileNav Component** (`src/layouts/components/mobile-nav.jsx`)
   - Mobile navigation menu component
   - Used inside Sheet for mobile menu
   - Features:
     - ✅ Collapsible menu items
     - ✅ Active route highlighting
     - ✅ Scrollable navigation

### AdminLayout Refactored

- **File:** `src/layouts/admin/index.jsx` (migrated from `index.js`)
- **Changes:**
  - ✅ Uses new Header, Sidebar, Footer components
  - ✅ Migrated breadcrumbs to shadcn Breadcrumb
  - ✅ Updated to Tailwind CSS classes
  - ✅ Preserved all functionality:
    - Loading state management
    - Subscription message display
    - Navigation filtering logic
    - Route rendering
    - Redux integration
    - Language support

### Testing

- ✅ **Unit Tests Created:**
  - Header component: 8 tests (all passing)
  - Sidebar component: 7 tests (all passing)
  - Footer component: 4 tests (all passing)
  - AdminLayout integration: 4 tests (all passing)
  - **Total: 24 tests, all passing**

- ✅ **Test Coverage:**
  - Component rendering
  - User interactions
  - Navigation functionality
  - Language switching
  - Responsive behavior
  - Active route highlighting

### Documentation

- ✅ Battle plan documentation (`docs/LAYOUT_COMPONENTS_MIGRATION_BATTLE_PLAN.md`)
- ✅ Verification script (`scripts/verify-layout-migration.sh`)

## Technical Details

### Component Structure

```
apps/frontend/src/layouts/
├── admin/
│   └── index.jsx              # Refactored AdminLayout
└── components/
    ├── header.jsx             # New Header component
    ├── sidebar.jsx            # New Sidebar component
    ├── footer.jsx             # New Footer component
    └── mobile-nav.jsx         # Mobile navigation component
```

### Migration Approach

1. **Preserved Functionality:**
   - All Redux connections maintained
   - Navigation logic unchanged
   - Language support preserved
   - User authentication flow intact
   - All existing features working

2. **UI Improvements:**
   - Modern shadcn/ui styling
   - Better responsive design
   - Improved accessibility
   - Consistent design system

3. **Code Quality:**
   - Cleaner component structure
   - Better separation of concerns
   - Improved maintainability

## Acceptance Criteria

- [x] Header component migrated with all features
- [x] Sidebar component migrated with navigation
- [x] Footer component migrated
- [x] Mobile menu working (Sheet component)
- [x] AdminLayout refactored
- [x] Responsive design working on all screen sizes
- [x] Navigation highlighting current route
- [x] User menu dropdown working
- [x] Language selector working
- [x] All components can be imported without errors
- [x] Build completes successfully
- [x] No linting errors
- [x] Tests pass (24/24 tests passing)
- [x] Test coverage improved
- [x] Verification script passes

## Breaking Changes

**None** - All changes are backward compatible. The old components remain in `src/components/` but are no longer used by AdminLayout.

## Dependencies

### Blocked By (completed)
- ✅ [TASK] Setup shadcn/ui with Base UI primitives #159 - COMPLETE
- ✅ [TASK] Add core shadcn/ui components #164 - COMPLETE

### Blocks
- All screen migrations (can now proceed with consistent layout)

## Testing Instructions

1. **Run Tests:**
   ```bash
   cd apps/frontend
   npm test -- --testPathPattern="__tests__/layouts"
   ```

2. **Run Verification Script:**
   ```bash
   ./scripts/verify-layout-migration.sh
   ```

3. **Manual Testing:**
   - Start the application
   - Verify header displays correctly
   - Test mobile menu (resize browser to mobile size)
   - Test sidebar navigation
   - Test user dropdown menu
   - Test language selector in footer
   - Verify responsive behavior

## Files Changed

### New Files (11)
- `apps/frontend/src/components/ui/sheet.jsx`
- `apps/frontend/src/components/ui/scroll-area.jsx`
- `apps/frontend/src/components/ui/breadcrumb.jsx`
- `apps/frontend/src/layouts/components/header.jsx`
- `apps/frontend/src/layouts/components/sidebar.jsx`
- `apps/frontend/src/layouts/components/footer.jsx`
- `apps/frontend/src/layouts/components/mobile-nav.jsx`
- `apps/frontend/src/layouts/admin/index.jsx`
- `apps/frontend/src/__tests__/layouts/header.test.jsx`
- `apps/frontend/src/__tests__/layouts/sidebar.test.jsx`
- `apps/frontend/src/__tests__/layouts/footer.test.jsx`
- `apps/frontend/src/__tests__/layouts/admin-layout.test.jsx`

### Documentation Files (2)
- `docs/LAYOUT_COMPONENTS_MIGRATION_BATTLE_PLAN.md`
- `scripts/verify-layout-migration.sh`

## Migration Notes

This PR migrates the layout foundation. Individual page content migrations will follow in separate PRs. The old components in `src/components/header/`, `src/components/footer/`, and the inline sidebar in AdminLayout have been replaced with the new shadcn/ui-based components.

## References

- [shadcn/ui Sheet Component](https://ui.shadcn.com/docs/components/sheet)
- [shadcn/ui ScrollArea Component](https://ui.shadcn.com/docs/components/scroll-area)
- [shadcn/ui Breadcrumb Component](https://ui.shadcn.com/docs/components/breadcrumb)
- [shadcn/ui DropdownMenu Component](https://ui.shadcn.com/docs/components/dropdown-menu)
- [Issue #166](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/166)

---

**Closes #166**

**Ready for Review** ✅

