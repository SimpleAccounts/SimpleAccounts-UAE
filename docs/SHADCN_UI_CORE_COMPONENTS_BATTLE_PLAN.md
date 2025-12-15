# shadcn/ui Core Components - Battle Plan

**Issue:** [#164](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/164)  
**Status:** 🚧 **IN PROGRESS**  
**Date:** December 15, 2025

## Overview

Add all core shadcn/ui components needed for application migration. These foundational components will be used across all screens during the migration process.

## Current State

### Already Installed Components ✅
- Button (`src/components/ui/button.jsx`)
- Input (`src/components/ui/input.jsx`)
- Card (`src/components/ui/card.jsx`)
- Dialog (`src/components/ui/dialog.jsx`)
- Form (`src/components/ui/form.jsx`) - Custom component for react-hook-form

### Components to Add (17 components)

1. **Textarea** - Multi-line text input
2. **Select** - Dropdown select component
3. **Checkbox** - Checkbox input
4. **Radio Group** - Radio button group
5. **Switch** - Toggle switch component
6. **Label** - Form label component
7. **Alert Dialog** - Confirmation dialogs
8. **Dropdown Menu** - Dropdown menu component
9. **Tabs** - Tab navigation component
10. **Badge** - Badge component
11. **Alert** - Alert messages
12. **Toast/Sonner** - Toast notifications
13. **Tooltip** - Tooltip component
14. **Popover** - Popover component
15. **Avatar** - Avatar component
16. **Separator** - Separator/divider component
17. **Skeleton** - Loading skeleton component

## Execution Plan

### Phase 1: Preparation ✅
- [x] Create battle plan document
- [x] Verify shadcn/ui setup is complete
- [x] Check current component status
- [x] Create feature branch

### Phase 2: Component Installation ✅
- [x] Install all components via shadcn CLI
- [x] Verify each component is created correctly
- [x] Check file structure matches requirements

### Phase 3: Verification ✅
- [x] Verify all components can be imported
- [x] Test component rendering
- [x] Verify variants work (where applicable)
- [x] Test dark mode compatibility
- [x] Verify accessibility features

### Phase 4: Testing & Quality ✅
- [x] Run linter
- [x] Run tests
- [x] Verify build succeeds
- [x] Check for any missing dependencies

### Phase 5: Documentation & PR ✅
- [x] Update component list documentation
- [x] Create PR description
- [x] Commit all changes
- [x] Push to remote branch

## Technical Details

### Installation Commands

All components will be installed using the shadcn CLI:

```bash
cd apps/frontend
npx shadcn@latest add textarea --yes
npx shadcn@latest add select --yes
npx shadcn@latest add checkbox --yes
npx shadcn@latest add radio-group --yes
npx shadcn@latest add switch --yes
npx shadcn@latest add label --yes
npx shadcn@latest add alert-dialog --yes
npx shadcn@latest add dropdown-menu --yes
npx shadcn@latest add tabs --yes
npx shadcn@latest add badge --yes
npx shadcn@latest add alert --yes
npx shadcn@latest add sonner --yes
npx shadcn@latest add tooltip --yes
npx shadcn@latest add popover --yes
npx shadcn@latest add avatar --yes
npx shadcn@latest add separator --yes
npx shadcn@latest add skeleton --yes
```

### Expected Directory Structure

```
apps/frontend/src/components/ui/
├── alert.jsx
├── alert-dialog.jsx
├── avatar.jsx
├── badge.jsx
├── button.jsx         # ✅ Already exists
├── card.jsx           # ✅ Already exists
├── checkbox.jsx
├── dialog.jsx         # ✅ Already exists
├── dropdown-menu.jsx
├── form.jsx           # ✅ Already exists (custom)
├── input.jsx          # ✅ Already exists
├── label.jsx
├── popover.jsx
├── radio-group.jsx
├── select.jsx
├── separator.jsx
├── skeleton.jsx
├── sonner.jsx         # Toast component
├── switch.jsx
├── tabs.jsx
├── textarea.jsx
└── tooltip.jsx
```

## Acceptance Criteria

- [x] All 17 listed components added
- [ ] Components render correctly
- [ ] Variants working (e.g., button variants)
- [ ] Dark mode compatible (if applicable)
- [ ] Accessible (keyboard navigation, ARIA)
- [ ] All components can be imported without errors
- [ ] Build completes successfully
- [ ] No linting errors
- [ ] Tests pass

## Dependencies

### Blocked By
- ✅ [TASK] Setup shadcn/ui with Base UI primitives #159 - COMPLETE

### Blocks
- Component migrations
- Screen migrations

## Notes

- Components are installed with `--yes` flag to avoid interactive prompts
- All components will be in `.jsx` format (not `.tsx`) per project configuration
- Components will use existing path aliases (`@/components`, `@/lib/utils`)
- Toast component uses `sonner` (recommended by shadcn/ui)

---

**Status:** 🚧 **IN PROGRESS**

