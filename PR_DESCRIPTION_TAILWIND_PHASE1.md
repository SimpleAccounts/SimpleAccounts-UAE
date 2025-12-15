# Tailwind CSS Setup - Phase 1: Dependencies & Configuration

Closes #158

## Summary

Phase 1 of Tailwind CSS setup: Install dependencies, initialize configuration files, and integrate Tailwind CSS into the application. This sets the foundation for Tailwind CSS integration and shadcn/ui component library.

## Changes

### 🎨 Tailwind CSS Setup

**Dependencies Added:**

- `tailwindcss@^3.4.19` - Core Tailwind CSS framework
- `postcss@^8.5.6` - CSS post-processor
- `autoprefixer@^10.4.23` - Automatic vendor prefixing
- `tailwindcss-animate@^1.0.7` - Animation utilities plugin (required for shadcn/ui)

**Configuration Files Created:**

- `tailwind.config.js` - Full Tailwind configuration with:
  - shadcn/ui-compatible theme colors (HSL CSS variables)
  - Dark mode support (class-based)
  - Container configuration
  - `tailwindcss-animate` plugin
- `postcss.config.js` - PostCSS configuration with Tailwind and Autoprefixer
- `src/assets/css/tailwind.css` - Tailwind CSS entry point with:
  - Tailwind directives (`@tailwind base`, `@tailwind components`, `@tailwind utilities`)
  - CSS custom properties for theming (light and dark modes)
  - Primary color matches brand color `#2064d8`

**Integration:**

- Updated `src/index.js` to import Tailwind CSS before global styles
- Added `.npmrc` for `legacy-peer-deps` to handle dependency conflicts

### 🔧 Dependency Updates

**Frontend Dependencies:**

- `ajv-formats@^3.0.1` (from ^2.1.1)
- `base-64@^1.0.0` (from ^0.1.0)
- `react-app-polyfill@^3.0.0` (from ^1.0.1)
- `react-test-renderer@^19.2.3` (from ^19.2.1)
- `sass@^1.96.0` (from ^1.69.0)

**Root Dependencies:**

- `sass@1.96.0` (from 1.32.0)

**Package.json Fixes:**

- Updated `postcss` override version to match devDependency (`^8.5.6`)
- Fixed override conflict that caused npm install errors

### 🚀 CI/CD Updates

**GitHub Actions:**

- Updated all action versions to latest pinned versions
- Updated Java version from 11 to 21 in workflows
- Updated `frontend:build` script to include `--legacy-peer-deps` flag

## Technical Details

### Tailwind CSS Configuration

- **Version:** Tailwind CSS v3.4.19 (latest stable, compatible with shadcn/ui)
- **Dark Mode:** Class-based (`["class"]`) - add `class="dark"` to HTML element
- **Content Scanning:** All JS/JSX/TS/TSX files in `src/` and `index.html`
- **Theme:** shadcn/ui-compatible with HSL CSS variables for theming
- **Primary Color:** `#2064d8` (HSL: 217°, 91%, 60%) - matches existing brand color

### PostCSS Integration

- PostCSS automatically processes CSS in Vite when `postcss.config.js` is present
- Tailwind CSS and Autoprefixer plugins configured
- Works seamlessly with existing SCSS processing

### Build System

- Vite processes Tailwind CSS through PostCSS
- Tailwind CSS imported before global.scss (allows Tailwind utilities to override when needed)
- No conflicts with existing Bootstrap/CoreUI/Material UI styles

## Files Changed

**New Files (4):**

- `apps/frontend/tailwind.config.js`
- `apps/frontend/postcss.config.js`
- `apps/frontend/src/assets/css/tailwind.css`
- `apps/frontend/.npmrc`

**Modified Files (4):**

- `apps/frontend/package.json` - Added Tailwind dependencies, updated other deps, fixed overrides
- `apps/frontend/src/index.js` - Added Tailwind CSS import
- `package.json` (root) - Updated sass version, updated frontend:build script
- `.github/workflows/*.yml` - Updated action versions and Java version

## Testing

- ✅ Configuration files created correctly
- ✅ No syntax errors in config files
- ✅ Dependencies install successfully (with `--legacy-peer-deps`)
- ✅ Build completes successfully
- ✅ Tailwind CSS is processed and included in build output
- ✅ No conflicts with existing styles

## Verification

After merging, verify:

1. Run `npm install` in `apps/frontend` (should work without errors)
2. Run `npm run build` (should complete successfully)
3. Check `dist/assets/` for Tailwind CSS output
4. Test Tailwind utility classes in a component (e.g., `bg-blue-500`, `text-white`, `p-4`)

## Next Steps (Phase 2)

After this PR is merged:

1. Install shadcn/ui component library
2. Create initial shadcn/ui components
3. Begin component migrations

## Breaking Changes

**None** - All changes are additive and backward compatible:

- Tailwind CSS is imported but doesn't override existing styles
- Existing Bootstrap/CoreUI/Material UI styles continue to work
- No changes to existing components required

## Related

- **Depends on:** Vite migration (#157) ✅ Complete
- **Blocks:** shadcn/ui setup (future issue)
- **Documentation:** `docs/TAILWIND_CSS_SETUP_PHASE1_SUMMARY.md`

---

**After merging:** Run `npm install` in `apps/frontend` to install new dependencies.
