# SimpleAccounts UAE - Development Guide

## Project Overview

SimpleAccounts UAE is a comprehensive accounting software for UAE businesses with VAT compliance, multi-currency support, and payroll management.

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Spring Boot (Java)
- **Database**: PostgreSQL with Liquibase migrations
- **State Management**: Redux Toolkit

## Neumorphic Design System

This project uses a **Neumorphic (Soft UI)** design system. All new components MUST follow this theme.

### Live Reference

Visit `/theme-reference` route in the app to see live examples of all neumorphic components. This is the authoritative source for component styling.

### Design Principles

1. **Soft shadows** - Dual shadows create depth (dark shadow + light shadow)
2. **Muted background** - Soft gray background (#e8eef5)
3. **Rounded corners** - Generous border radius (12px-24px)
4. **Subtle borders** - Orange/amber for selected states
5. **Blue accents** - Primary actions and icons
6. **Consistency** - All pages must use the same neumorphic styling

### Color Palette

```scss
// Primary Colors
$neu-primary: #1e6eff; // Primary blue - buttons, links, active states
$neu-primary-dark: #0052cc; // Darker blue for gradients
$neu-secondary: #00c896; // Teal/green - success, secondary accents
$neu-warning: #f59e0b; // Amber - selected/active borders
$neu-danger: #ff4d6a; // Red - errors, logout, destructive actions

// Background Colors
$neu-bg: #e8eef5; // Main background (light mode)
$neu-bg-dark: #2b2d33; // Main background (dark mode)

// Shadow Colors
$neu-shadow-dark: #c4c9cf; // Dark shadow color
$neu-shadow-light: #ffffff; // Light shadow color

// Text Colors
$neu-text-primary: #1e3a5f; // Primary text (headings, important)
$neu-text-secondary: #3d5a80; // Secondary text (body, labels)
$neu-text-muted: #98afc2; // Muted text (hints, placeholders)
```

### Shadow System

```scss
// Raised/Extruded Effect (element pops out)
$shadow-raised-xs:
  2px 2px 4px #c4c9cf,
  -2px -2px 4px #ffffff;
$shadow-raised-sm:
  3px 3px 6px #c4c9cf,
  -3px -3px 6px #ffffff;
$shadow-raised-md:
  4px 4px 8px #c4c9cf,
  -4px -4px 8px #ffffff;
$shadow-raised-lg:
  6px 6px 12px #c4c9cf,
  -6px -6px 12px #ffffff;

// Pressed/Inset Effect (element pushed in)
$shadow-pressed-sm:
  inset 2px 2px 4px #c4c9cf,
  inset -2px -2px 4px #ffffff;
$shadow-pressed-md:
  inset 3px 3px 6px #c4c9cf,
  inset -3px -3px 6px #ffffff;
```

### CSS Variables (Use These!)

Always prefer CSS variables for consistency across the app:

```css
:root {
  /* Neumorphic Theme */
  --neu-bg: #e8eef5;
  --neu-primary: #1e6eff;
  --neu-secondary: #00c896;
  --neu-warning: #f59e0b;
  --neu-danger: #ff4d6a;

  --neu-text-primary: #1e3a5f;
  --neu-text-secondary: #3d5a80;
  --neu-text-muted: #98afc2;

  --neu-shadow-dark: #c4c9cf;
  --neu-shadow-light: #ffffff;

  --neu-shadow-raised-sm: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
  --neu-shadow-raised: 6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light);
  --neu-shadow-pressed:
    inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light);
}

.dark {
  --neu-bg: #2b2d33;
  --neu-shadow-dark: #1e1f23;
  --neu-shadow-light: #383b43;
}
```

### Tailwind Classes

Use these Tailwind classes for consistent neumorphic styling:

```jsx
// Background
className = 'bg-neu-bg dark:bg-neu-bg-dark';

// Shadows
className = 'shadow-neu-raised-sm'; // Small raised
className = 'shadow-neu-raised'; // Default raised
className = 'shadow-neu-raised-lg'; // Large raised
className = 'shadow-neu-pressed'; // Pressed/inset

// Border radius
className = 'rounded-xl'; // 12px - buttons, inputs
className = 'rounded-2xl'; // 16px - cards, containers

// Selected/Active state border
className = 'border-2 border-amber-500'; // or use warning color
```

### Component Patterns

#### Page Container

```jsx
<div className="min-h-screen p-6" style={{ background: 'var(--neu-bg, #e8eef5)' }}>
  {/* Page content */}
</div>
```

#### Cards/Containers

```jsx
<div
  className="rounded-2xl p-6"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '6px 6px 12px var(--neu-shadow-dark, #c4c9cf), -6px -6px 12px var(--neu-shadow-light, #ffffff)',
  }}
>
  {/* Content */}
</div>
```

#### Buttons (Raised)

```jsx
<button
  className="px-4 py-2 rounded-xl font-medium transition-all duration-200"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
  }}
>
  Click Me
</button>
```

#### Primary Action Button

```jsx
<button
  className="px-4 py-2 rounded-xl font-medium text-white transition-all duration-200"
  style={{
    background: 'linear-gradient(145deg, #1e6eff, #0052cc)',
    boxShadow:
      '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
  }}
>
  Save
</button>
```

#### Inputs (Pressed/Inset)

```jsx
<input
  className="px-4 py-2 rounded-xl border-0 outline-none w-full"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
    color: 'var(--neu-text-primary, #1e3a5f)',
  }}
  placeholder="Enter text..."
/>
```

#### Select Dropdowns

```jsx
<select
  className="px-4 py-2 rounded-xl border-0 outline-none"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
    color: 'var(--neu-text-primary, #1e3a5f)',
  }}
>
  <option>Option 1</option>
</select>
```

#### Selected/Active Items

```jsx
<div
  className="rounded-xl p-3"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    border: '2px solid var(--neu-warning, #f59e0b)',
  }}
>
  Active Item
</div>
```

#### Icon Containers

```jsx
<div
  className="w-10 h-10 rounded-xl flex items-center justify-center"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
  }}
>
  <IconComponent className="w-5 h-5" style={{ color: 'var(--neu-primary, #1e6eff)' }} />
</div>
```

#### Section Headers

```jsx
<div className="flex items-center gap-3 mb-4">
  <div
    className="w-10 h-10 rounded-xl flex items-center justify-center"
    style={{
      background: 'var(--neu-bg, #e8eef5)',
      boxShadow:
        '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
    }}
  >
    <SectionIcon className="w-5 h-5" style={{ color: 'var(--neu-primary, #1e6eff)' }} />
  </div>
  <h2 style={{ color: 'var(--neu-text-primary, #1e3a5f)', fontWeight: 700 }}>Section Title</h2>
</div>
```

#### Tables

```jsx
<div
  className="rounded-2xl overflow-hidden"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '6px 6px 12px var(--neu-shadow-dark, #c4c9cf), -6px -6px 12px var(--neu-shadow-light, #ffffff)',
  }}
>
  <table className="w-full">
    <thead>
      <tr style={{ background: 'rgba(32, 100, 216, 0.05)' }}>
        <th className="px-4 py-3 text-left" style={{ color: 'var(--neu-text-primary, #1e3a5f)' }}>
          Column
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t" style={{ borderColor: 'rgba(200, 210, 220, 0.3)' }}>
        <td className="px-4 py-3" style={{ color: 'var(--neu-text-secondary, #3d5a80)' }}>
          Data
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Icons

- Use **Lucide React** icons exclusively
- Primary color (`var(--neu-primary, #1e6eff)`) for active/interactive icons
- Muted color (`var(--neu-text-muted, #98afc2)`) for inactive icons
- Secondary color (`var(--neu-secondary, #00c896)`) for success states
- Danger color (`var(--neu-danger, #ff4d6a)`) for error/delete actions

### Gradients (for avatars, logo backgrounds)

```jsx
style={{
  background: 'linear-gradient(145deg, #1e6eff, #0052cc)'
}}
```

### File Structure

```
apps/frontend/src/
├── assets/scss/
│   ├── _variables.scss      # SCSS variables (legacy)
│   ├── _mixins.scss         # SCSS mixins
│   └── style.scss           # Main stylesheet
├── components/ui/           # shadcn/ui components
├── index.css                # Global CSS with CSS variables
├── layouts/
│   ├── admin/index.js       # Admin layout
│   └── components/
│       └── sidebar.jsx      # Neumorphic sidebar
├── screens/
│   └── theme_reference/     # Live theme reference page
└── constants/
    └── theme.js             # Theme constants (create if needed)
```

### Do's and Don'ts

#### DO:

- Use CSS variables (`var(--neu-*)`) for all colors
- Apply dual shadows for depth (light + dark)
- Use rounded corners (12px+ / rounded-xl or rounded-2xl)
- Use amber/orange borders for selected states
- Use blue for primary actions and active icons
- Keep backgrounds consistent (`var(--neu-bg, #e8eef5)`)
- Use Lucide React icons
- Reference `/theme-reference` for component examples
- Use inset shadows for inputs and form fields
- Use raised shadows for buttons and cards

#### DON'T:

- Use pure white (#ffffff) backgrounds for containers
- Use flat/standard drop shadows
- Use sharp corners (always use rounded)
- Mix different design systems (Bootstrap, Material, etc.)
- Use bright/saturated colors for backgrounds
- Use Font Awesome or other icon libraries
- Hard-code colors (use CSS variables)
- Use standard HTML form styling

### Reference Implementation

- **Live Examples**: `/theme-reference` route
- **Sidebar**: `apps/frontend/src/layouts/components/sidebar.jsx`
- **Dashboard**: `apps/frontend/src/screens/dashboard/`
- **Global CSS**: `apps/frontend/src/index.css`

## Development Commands

```bash
# Start frontend dev server
cd apps/frontend && npm run dev

# Start backend
cd apps/backend && ./mvnw spring-boot:run

# Run tests
cd apps/frontend && npm test
```

## Git Workflow

- Branch from `develop`
- Create feature branches: `feature/your-feature-name`
- PR to `develop` for review
