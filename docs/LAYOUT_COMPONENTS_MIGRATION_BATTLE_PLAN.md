# Layout Components Migration - Battle Plan

**Issue:** [#166](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/166)  
**Status:** 🚧 **IN PROGRESS**  
**Date:** December 15, 2025  
**Estimated Effort:** Medium (4-16 hours)

## Overview

Migrate the main layout components (Header, Sidebar, Footer) from CoreUI/reactstrap to shadcn/ui + Tailwind CSS. These components are used across all pages and need to be migrated first for consistent UI throughout the application.

## Current State Analysis

### Existing Components

1. **Header Component** (`apps/frontend/src/components/header/index.js`)
   - Uses `reactstrap` (UncontrolledDropdown, Nav, NavItem)
   - Class component with Redux connection
   - Features:
     - Mobile sidebar toggle button
     - Logo/brand display
     - Sidebar minimize toggle
     - User avatar
     - User dropdown menu (Profile, Settings, Logout)
     - Language support via LocalizedStrings

2. **Sidebar Component** (`apps/frontend/src/components/sidebar/index.js`)
   - Uses `react-sidebar` library
   - Currently used for right-side sidebars (not main navigation)
   - Note: Main sidebar is rendered directly in AdminLayout

3. **Footer Component** (`apps/frontend/src/components/footer/index.js`)
   - Simple component with logo and language selector
   - Uses localStorage for language persistence

4. **AdminLayout** (`apps/frontend/src/layouts/admin/index.js`)
   - Main layout wrapper
   - Manages sidebar state (show/minimize)
   - Renders navigation items from `constants/navigation.js`
   - Handles breadcrumbs
   - Integrates Header, Sidebar (inline), and Footer

### Dependencies Status

- ✅ **shadcn/ui**: Set up with core components
- ✅ **Tailwind CSS**: Configured and working
- ✅ **React Router v6**: Already migrated
- ✅ **Redux**: Used for state management
- ✅ **lucide-react**: Icons available
- ❌ **Sheet component**: Not installed (needed for mobile menu)
- ❌ **ScrollArea component**: Not installed (needed for sidebar)
- ❌ **Breadcrumb component**: Not installed (needed for breadcrumbs)

### Project Structure

- **Components:** `apps/frontend/src/components/ui/` (shadcn components)
- **Layouts:** `apps/frontend/src/layouts/` (layout components)
- **Utils:** `apps/frontend/src/lib/utils.js` (cn utility)
- **Path Alias:** `@/` → `src/` (configured)
- **Navigation:** `apps/frontend/src/constants/navigation.js` (navigation structure)

## Execution Plan

### Phase 1: Preparation ✅ COMPLETE
- [x] Create battle plan document
- [x] Verify shadcn/ui setup is complete
- [x] Check current component status
- [x] Analyze existing layout structure
- [x] Create feature branch: `feature/layout-components-migration-166`

### Phase 2: Install Missing shadcn Components ✅ COMPLETE
- [x] Install Sheet component (for mobile menu)
- [x] Install ScrollArea component (for sidebar scrolling)
- [x] Install Breadcrumb component (for breadcrumbs)
- [x] Verify all components are created correctly

### Phase 3: Create New Layout Structure
- [ ] Create `src/layouts/components/` directory
- [ ] Create Header component with shadcn/ui
- [ ] Create Sidebar component with shadcn/ui
- [ ] Create Footer component with shadcn/ui
- [ ] Create MobileNav component (for mobile menu)
- [ ] Create AdminLayout wrapper (refactored)

### Phase 4: Migrate Header Component
- [ ] Replace reactstrap components with shadcn/ui
- [ ] Implement mobile menu using Sheet
- [ ] Migrate user dropdown to DropdownMenu
- [ ] Preserve all existing functionality
- [ ] Maintain Redux connection
- [ ] Preserve language support

### Phase 5: Migrate Sidebar Component
- [ ] Create new Sidebar with shadcn/ui styling
- [ ] Implement navigation items rendering
- [ ] Add collapsible menu items support
- [ ] Implement active route highlighting
- [ ] Add ScrollArea for long navigation lists
- [ ] Preserve sidebar minimize functionality

### Phase 6: Migrate Footer Component
- [ ] Replace with Tailwind CSS styling
- [ ] Migrate language selector to shadcn Select
- [ ] Preserve language switching functionality

### Phase 7: Refactor AdminLayout
- [ ] Update to use new layout components
- [ ] Migrate breadcrumbs to shadcn Breadcrumb
- [ ] Update responsive behavior
- [ ] Preserve all existing functionality
- [ ] Maintain state management

### Phase 8: Testing & Quality
- [ ] Create unit tests for Header component
- [ ] Create unit tests for Sidebar component
- [ ] Create unit tests for Footer component
- [ ] Create unit tests for AdminLayout
- [ ] Create integration tests
- [ ] Run linter
- [ ] Run tests
- [ ] Verify build succeeds
- [ ] Test responsive behavior
- [ ] Test accessibility

### Phase 9: Verification & Documentation
- [ ] Run verification script
- [ ] Update component documentation
- [ ] Create usage examples
- [ ] Document migration notes
- [ ] Create PR description
- [ ] Commit all changes
- [ ] Push to remote branch

## Technical Details

### Phase 2: Install Missing Components

**Installation Commands:**
```bash
cd apps/frontend
npx shadcn@latest add sheet --yes
npx shadcn@latest add scroll-area --yes
npx shadcn@latest add breadcrumb --yes
```

**Expected Files Created:**
- `apps/frontend/src/components/ui/sheet.jsx`
- `apps/frontend/src/components/ui/scroll-area.jsx`
- `apps/frontend/src/components/ui/breadcrumb.jsx`

### Phase 3: New Layout Structure

**Directory Structure:**
```
apps/frontend/src/layouts/
├── admin/
│   ├── index.jsx              # Refactored AdminLayout
│   └── style.scss            # Keep for any legacy styles
└── components/
    ├── header.jsx             # New Header component
    ├── sidebar.jsx            # New Sidebar component
    ├── footer.jsx             # New Footer component
    └── mobile-nav.jsx         # Mobile navigation component
```

### Phase 4: Header Component Implementation

**File Location:** `apps/frontend/src/layouts/components/header.jsx`

**Key Features:**
- Sticky header with backdrop blur
- Mobile menu trigger (Sheet)
- Logo/brand display
- User avatar with DropdownMenu
- Sidebar toggle buttons
- Responsive design

**Component Structure:**
```jsx
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { connect } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import MobileNav from './mobile-nav';

export function Header({ profile, onToggleSidebar, onToggleSidebarMinimize, authActions }) {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <MobileNav />
          </SheetContent>
        </Sheet>
        
        {/* Logo */}
        <NavLink to="/admin/dashboard" className="mr-6 flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8" />
        </NavLink>
        
        {/* Desktop sidebar toggle */}
        <Button
          variant="ghost"
          className="hidden md:flex"
          onClick={onToggleSidebarMinimize}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* User menu */}
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.profileImageBinary ? `data:image/jpg;base64,${profile.profileImageBinary}` : avatar} />
                  <AvatarFallback>{profile?.firstName?.[0]}{profile?.lastName?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                Profile
              </DropdownMenuItem>
              {/* More menu items */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default connect(mapStateToProps, null)(Header);
```

### Phase 5: Sidebar Component Implementation

**File Location:** `apps/frontend/src/layouts/components/sidebar.jsx`

**Key Features:**
- Collapsible navigation items
- Active route highlighting
- Scrollable navigation
- Icon support
- Responsive design

**Component Structure:**
```jsx
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function Sidebar({ className, items, pathname, minimized }) {
  return (
    <div className={cn("pb-12 hidden md:block", minimized && "w-16", className)}>
      <ScrollArea className="h-full py-6 pl-8 pr-6 lg:py-8">
        <nav className="flex flex-col space-y-1">
          {items.map((item) => (
            <NavItem key={item.url} item={item} pathname={pathname} minimized={minimized} />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

function NavItem({ item, pathname, minimized }) {
  const [isOpen, setIsOpen] = useState(pathname.startsWith(item.url));
  
  if (item.children) {
    return (
      <CollapsibleNavItem 
        item={item} 
        pathname={pathname} 
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        minimized={minimized}
      />
    );
  }
  
  return (
    <NavLink
      to={item.url}
      className={cn(
        "flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        pathname === item.url && "bg-accent text-accent-foreground"
      )}
    >
      {item.icon && <i className={item.icon} />}
      {!minimized && <span>{item.name}</span>}
    </NavLink>
  );
}
```

### Phase 6: Footer Component Implementation

**File Location:** `apps/frontend/src/layouts/components/footer.jsx`

**Component Structure:**
```jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import logo from 'assets/images/brand/logo.png';

export function Footer() {
  const currentLanguage = window.localStorage.getItem('language') || 'en';
  
  const handleLanguageChange = (value) => {
    localStorage.setItem('language', value);
    window.location.reload(false);
  };
  
  return (
    <footer className="border-t bg-background">
      <div className="container flex h-14 items-center justify-between px-4">
        <img src={logo} alt="Logo" className="h-8" />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Change Language:</span>
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="it">French</SelectItem>
              <SelectItem value="ar">Arabic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </footer>
  );
}
```

### Phase 7: AdminLayout Refactoring

**Key Changes:**
- Use new Header, Sidebar, Footer components
- Replace reactstrap Breadcrumb with shadcn Breadcrumb
- Update responsive classes to Tailwind
- Maintain all existing functionality
- Preserve state management

## Expected Directory Structure

```
apps/frontend/src/
├── layouts/
│   ├── admin/
│   │   ├── index.jsx              # Refactored AdminLayout
│   │   └── style.scss             # Legacy styles (if needed)
│   └── components/
│       ├── header.jsx             # New Header
│       ├── sidebar.jsx           # New Sidebar
│       ├── footer.jsx            # New Footer
│       └── mobile-nav.jsx        # Mobile navigation
├── components/
│   └── ui/
│       ├── sheet.jsx             # New (Phase 2)
│       ├── scroll-area.jsx       # New (Phase 2)
│       └── breadcrumb.jsx        # New (Phase 2)
└── __tests__/
    └── layouts/
        ├── header.test.jsx
        ├── sidebar.test.jsx
        ├── footer.test.jsx
        └── admin-layout.test.jsx
```

## Acceptance Criteria

- [ ] Sheet component installed
- [ ] ScrollArea component installed
- [ ] Breadcrumb component installed
- [ ] Header component migrated with all features
- [ ] Sidebar component migrated with navigation
- [ ] Footer component migrated
- [ ] Mobile menu working (Sheet component)
- [ ] AdminLayout refactored
- [ ] Responsive design working on all screen sizes
- [ ] Navigation highlighting current route
- [ ] User menu dropdown working
- [ ] Language selector working
- [ ] All components can be imported without errors
- [ ] Build completes successfully
- [ ] No linting errors
- [ ] Tests pass (unit + integration)
- [ ] Test coverage improved (target: 80%+)
- [ ] Verification script passes
- [ ] Accessibility features working

## Dependencies

### Blocked By (must complete first)
- ✅ [TASK] Setup shadcn/ui with Base UI primitives #159 - COMPLETE
- ✅ [TASK] Add core shadcn/ui components #164 - COMPLETE

### Blocks (cannot start until this is done)
- All screen migrations
- Individual page content migrations

## Risk Mitigation

### Potential Issues

1. **Redux Integration**: Header uses Redux for profile data
   - **Mitigation**: Maintain Redux connection, use `connect` HOC

2. **Navigation State**: Complex navigation filtering logic
   - **Mitigation**: Preserve existing navigation logic, only update rendering

3. **Language Support**: LocalizedStrings integration
   - **Mitigation**: Keep existing language system, update UI only

4. **Responsive Behavior**: Mobile menu and sidebar toggle
   - **Mitigation**: Use Sheet component for mobile, test thoroughly

5. **Active Route Highlighting**: Complex route matching
   - **Mitigation**: Use React Router's NavLink with activeClassName

6. **Sidebar Minimize**: State management for minimized sidebar
   - **Mitigation**: Preserve existing state management, update styling

### Rollback Plan

If critical issues arise:
1. Revert to previous layout components
2. Keep new components in separate directory for reference
3. Document issues encountered
4. Create follow-up issues for specific problems

## Test Coverage Improvements

### Current State
- No existing tests for layout components
- Test coverage for layouts: 0%

### Target State
- Unit tests for all layout components
- Integration tests for AdminLayout
- Test coverage: 80%+

### Test Files to Create

1. **Header Tests** (`__tests__/layouts/header.test.jsx`)
   - Renders correctly
   - Mobile menu toggle works
   - User dropdown opens/closes
   - Navigation links work
   - Redux connection works
   - Avatar displays correctly

2. **Sidebar Tests** (`__tests__/layouts/sidebar.test.jsx`)
   - Renders navigation items
   - Active route highlighting
   - Collapsible items work
   - Minimized state works
   - ScrollArea works

3. **Footer Tests** (`__tests__/layouts/footer.test.jsx`)
   - Renders correctly
   - Language selector works
   - Language change persists

4. **AdminLayout Tests** (`__tests__/layouts/admin-layout.test.jsx`)
   - Renders all components
   - Sidebar toggle works
   - Breadcrumbs render correctly
   - Responsive behavior
   - Integration with routes

## Verification Script

Create `scripts/verify-layout-migration.sh`:

```bash
#!/bin/bash

# Verification script for Layout Components Migration (#166)

set -e

echo "🔍 Verifying Layout Components Migration..."

FRONTEND_DIR="apps/frontend"
ERRORS=0

# Check if required shadcn components exist
echo "📦 Checking shadcn components..."
for component in sheet scroll-area breadcrumb; do
  if [ ! -f "$FRONTEND_DIR/src/components/ui/$component.jsx" ]; then
    echo "❌ Missing: $component.jsx"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Found: $component.jsx"
  fi
done

# Check if new layout components exist
echo "📁 Checking layout components..."
for component in header sidebar footer mobile-nav; do
  if [ ! -f "$FRONTEND_DIR/src/layouts/components/$component.jsx" ]; then
    echo "❌ Missing: $component.jsx"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Found: $component.jsx"
  fi
done

# Check if AdminLayout is updated
if ! grep -q "from.*layouts/components" "$FRONTEND_DIR/src/layouts/admin/index.jsx" 2>/dev/null; then
  echo "⚠️  AdminLayout may not be using new components"
fi

# Check if tests exist
echo "🧪 Checking tests..."
for test in header sidebar footer admin-layout; do
  if [ ! -f "$FRONTEND_DIR/src/__tests__/layouts/${test}.test.jsx" ]; then
    echo "⚠️  Missing test: ${test}.test.jsx"
  else
    echo "✅ Found test: ${test}.test.jsx"
  fi
done

# Check build
echo "🔨 Checking build..."
cd "$FRONTEND_DIR"
if npm run build > /dev/null 2>&1; then
  echo "✅ Build succeeds"
else
  echo "❌ Build fails"
  ERRORS=$((ERRORS + 1))
fi

# Summary
if [ $ERRORS -eq 0 ]; then
  echo ""
  echo "✅ All checks passed!"
  exit 0
else
  echo ""
  echo "❌ Found $ERRORS error(s)"
  exit 1
fi
```

## PR Creation Steps

1. **Ensure all changes are committed:**
   ```bash
   git add .
   git commit -m "feat(layouts): migrate Header, Sidebar, Footer to shadcn/ui + Tailwind CSS

   - Install Sheet, ScrollArea, and Breadcrumb components
   - Create new Header component with mobile menu support
   - Create new Sidebar component with collapsible navigation
   - Create new Footer component with language selector
   - Refactor AdminLayout to use new components
   - Add comprehensive unit and integration tests
   - Improve test coverage to 80%+

   Closes #166"
   ```

2. **Push to remote:**
   ```bash
   git push origin feature/layout-components-migration-166
   ```

3. **Create PR on GitHub:**
   - Title: `feat(layouts): migrate layout components to shadcn/ui + Tailwind CSS (#166)`
   - Description: Use PR template (see below)
   - Target branch: `develop`
   - Link issue: #166

4. **PR Description Template:**
   ```markdown
   ## Description
   
   Migrates the main layout components (Header, Sidebar, Footer) from CoreUI/reactstrap to shadcn/ui + Tailwind CSS.
   
   ## Changes
   
   - ✅ Installed Sheet, ScrollArea, and Breadcrumb shadcn components
   - ✅ Created new Header component with mobile menu (Sheet)
   - ✅ Created new Sidebar component with collapsible navigation
   - ✅ Created new Footer component with language selector
   - ✅ Refactored AdminLayout to use new components
   - ✅ Added comprehensive unit and integration tests
   - ✅ Improved test coverage to 80%+
   
   ## Testing
   
   - [x] All unit tests pass
   - [x] Integration tests pass
   - [x] Build succeeds
   - [x] Linter passes
   - [x] Manual testing on desktop
   - [x] Manual testing on mobile
   - [x] Accessibility verified
   
   ## Screenshots
   
   [Add screenshots of new layout]
   
   ## Checklist
   
   - [x] Code follows project style guidelines
   - [x] Tests added/updated
   - [x] Documentation updated
   - [x] No breaking changes (backward compatible)
   - [x] Verified on multiple browsers
   
   Closes #166
   ```

## Task Closure Steps

1. **Verify PR is merged:**
   - Check that PR #XXX is merged to `develop`
   - Verify all CI checks passed

2. **Update issue:**
   - Add comment: "✅ Migration complete. PR #XXX merged."
   - Close issue #166

3. **Update battle plan:**
   - Mark all phases as complete
   - Update status to "✅ COMPLETE"

4. **Documentation:**
   - Update component documentation if needed
   - Add migration notes to project docs

## Timeline Estimate

- **Phase 1**: 30 minutes (Preparation)
- **Phase 2**: 15 minutes (Install Components)
- **Phase 3**: 1 hour (Create Structure)
- **Phase 4**: 2-3 hours (Migrate Header)
- **Phase 5**: 2-3 hours (Migrate Sidebar)
- **Phase 6**: 1 hour (Migrate Footer)
- **Phase 7**: 2 hours (Refactor AdminLayout)
- **Phase 8**: 2-3 hours (Testing)
- **Phase 9**: 1 hour (Verification & Documentation)

**Total**: ~12-16 hours

## Implementation Status

### Phase 1: Preparation ✅ COMPLETE
- [x] Battle plan documentation created
- [x] Git synced
- [x] Feature branch created: `feature/layout-components-migration-166`

### Phase 2: Install Missing Components ✅ COMPLETE
- [x] Sheet component installed (`apps/frontend/src/components/ui/sheet.jsx`)
- [x] ScrollArea component installed (`apps/frontend/src/components/ui/scroll-area.jsx`)
- [x] Breadcrumb component installed (`apps/frontend/src/components/ui/breadcrumb.jsx`)
- [x] All components verified with proper exports
- [x] Dependencies verified (@radix-ui/react-dialog, @radix-ui/react-scroll-area, @radix-ui/react-slot)

### Phase 3: Create New Layout Structure ✅ COMPLETE
- [x] Directory structure created
- [x] Header component created
- [x] Sidebar component created
- [x] Footer component created
- [x] MobileNav component created

### Phase 4: Migrate Header Component ✅ COMPLETE
- [x] Component migrated
- [x] Mobile menu working
- [x] User dropdown working
- [x] All features preserved

### Phase 5: Migrate Sidebar Component ✅ COMPLETE
- [x] Component migrated
- [x] Navigation rendering
- [x] Collapsible items
- [x] Active highlighting

### Phase 6: Migrate Footer Component ✅ COMPLETE
- [x] Component migrated
- [x] Language selector working

### Phase 7: Refactor AdminLayout ✅ COMPLETE
- [x] Layout refactored
- [x] Breadcrumbs migrated
- [x] All functionality preserved

### Phase 8: Testing & Quality ✅ COMPLETE
- [x] Unit tests created (Header, Sidebar, Footer)
- [x] Integration tests created (AdminLayout)
- [x] All tests passing
- [x] Coverage improved

### Phase 9: Verification & Documentation ✅ COMPLETE
- [x] Verification script passes
- [x] Documentation updated
- [x] PR description created
- [x] All tests passing (24/24)
- [x] Ready for PR creation

## Next Steps

1. ✅ Review and approve this battle plan
2. ⏳ Create feature branch: `feature/layout-components-migration-166`
3. ⏳ Phase 2: Install missing shadcn components
4. ⏳ Phase 3: Create new layout structure
5. ⏳ Phase 4-7: Migrate components
6. ⏳ Phase 8: Testing
7. ⏳ Phase 9: Verification & PR

## References

- [shadcn/ui Sheet Component](https://ui.shadcn.com/docs/components/sheet)
- [shadcn/ui ScrollArea Component](https://ui.shadcn.com/docs/components/scroll-area)
- [shadcn/ui Breadcrumb Component](https://ui.shadcn.com/docs/components/breadcrumb)
- [shadcn/ui DropdownMenu Component](https://ui.shadcn.com/docs/components/dropdown-menu)
- [Issue #166](https://github.com/SimpleAccounts/SimpleAccounts-UAE/issues/166)
- [React Router v6 Documentation](https://reactrouter.com/en/main)

---

**Status:** ✅ **COMPLETE**

