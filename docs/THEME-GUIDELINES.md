# SimpleAccounts UAE - Corporate Theme Guidelines

**Version:** 2.0
**Last Updated:** January 2026
**Status:** Active - All new development MUST follow these guidelines

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Color System](#color-system)
4. [Dark Mode](#dark-mode)
5. [Typography](#typography)
6. [Spacing & Layout](#spacing--layout)
7. [Shadows & Elevation](#shadows--elevation)
8. [Border Radius](#border-radius)
9. [Component Guidelines](#component-guidelines)
10. [Icons](#icons)
11. [Accessibility](#accessibility)
12. [CSS Variables Reference](#css-variables-reference)
13. [Tailwind Classes Reference](#tailwind-classes-reference)
14. [Do's and Don'ts](#dos-and-donts)
15. [Migration from Legacy Styles](#migration-from-legacy-styles)

---

## Overview

SimpleAccounts UAE uses a **Minimal Corporate Design System** inspired by industry-leading SaaS applications:

- **Stripe** - Clean financial interfaces
- **Linear** - Modern task management
- **OpenAI** - Minimal, professional aesthetic

This design system prioritizes:

- **Readability** - Critical for financial data
- **Professionalism** - Builds user trust
- **Accessibility** - WCAG AA compliance
- **Consistency** - Unified user experience

---

## Design Philosophy

### Core Principles

| Principle              | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| **Clarity First**      | White/light backgrounds, high contrast, minimal visual noise |
| **Professional**       | Clean borders, subtle shadows, consistent spacing            |
| **System Integration** | System fonts, respect user preferences                       |
| **Efficiency**         | Quick scanning, clear hierarchy, predictable interactions    |
| **Accessibility**      | WCAG AA compliance, semantic colors                          |

### What This Means in Practice

1. **Use white backgrounds** for content areas (not colored backgrounds)
2. **Use borders** to define boundaries (not shadows alone)
3. **Use subtle shadows** for depth (not heavy drop shadows)
4. **Use system fonts** (no custom web fonts)
5. **Use brand colors sparingly** (only for CTAs and active states)

---

## Color System

### Brand Colors (Primary)

| Variable              | Hex       | Usage                                 |
| --------------------- | --------- | ------------------------------------- |
| `--corp-primary`      | `#2064d8` | Primary buttons, links, active states |
| `--corp-primary-dark` | `#1a56b8` | Hover states for primary elements     |
| `--corp-secondary`    | `#10b981` | Success states, positive actions      |

```css
/* Brand Colors */
--corp-primary: #2064d8;
--corp-primary-dark: #1a56b8;
--corp-secondary: #10b981;
```

### Background Colors

| Variable              | Hex       | Usage                             |
| --------------------- | --------- | --------------------------------- |
| `--corp-bg-primary`   | `#ffffff` | Main content areas, cards         |
| `--corp-bg-secondary` | `#f8f9fa` | Page backgrounds, subtle contrast |
| `--corp-bg-tertiary`  | `#f3f4f6` | Deeper contrast, table headers    |

```css
/* Backgrounds */
--corp-bg-primary: #ffffff;
--corp-bg-secondary: #f8f9fa;
--corp-bg-tertiary: #f3f4f6;
```

### Semantic Colors

| Variable         | Hex       | Usage                             |
| ---------------- | --------- | --------------------------------- |
| `--corp-success` | `#10b981` | Success messages, positive values |
| `--corp-warning` | `#f59e0b` | Warnings, pending states          |
| `--corp-danger`  | `#ef4444` | Errors, destructive actions       |
| `--corp-info`    | `#3b82f6` | Informational messages            |

```css
/* Semantic Colors */
--corp-success: #10b981;
--corp-warning: #f59e0b;
--corp-danger: #ef4444;
--corp-info: #3b82f6;
```

### Text Colors

| Variable                | Hex       | Usage                         |
| ----------------------- | --------- | ----------------------------- |
| `--corp-text-primary`   | `#111827` | Headings, important text      |
| `--corp-text-secondary` | `#4b5563` | Body text, descriptions       |
| `--corp-text-muted`     | `#9ca3af` | Placeholders, hints, captions |

```css
/* Text Colors */
--corp-text-primary: #111827;
--corp-text-secondary: #4b5563;
--corp-text-muted: #9ca3af;
```

### Border Colors

| Variable              | Hex       | Usage                            |
| --------------------- | --------- | -------------------------------- |
| `--corp-border-light` | `#e5e7eb` | Default borders, dividers        |
| `--corp-border-dark`  | `#d1d5db` | Emphasized borders, hover states |

```css
/* Borders */
--corp-border-light: #e5e7eb;
--corp-border-dark: #d1d5db;
```

---

## Dark Mode

SimpleAccounts UAE supports a dual-theme system with both light and dark modes. The theme respects user system preferences and can be toggled manually.

### How Dark Mode Works

The application uses `next-themes` with Tailwind CSS class-based dark mode:

1. **Class-based switching**: The `.dark` class is added to the `<html>` element
2. **CSS Variables**: All colors are defined as CSS custom properties that change based on theme
3. **System preference**: By default, respects the user's system preference (`prefers-color-scheme`)
4. **Persistence**: Theme choice is stored in localStorage (`simpleaccounts-theme`)

### Theme Provider Configuration

```jsx
// In src/index.js
import { ThemeProvider } from 'next-themes';

<ThemeProvider
  attribute="class"
  defaultTheme="light"
  enableSystem={true}
  storageKey="simpleaccounts-theme"
>
  <App />
</ThemeProvider>;
```

### Theme Toggle Component

Two components are available for theme switching:

#### Simple Toggle (Light/Dark only)

```jsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

<ThemeToggle />;
```

#### Dropdown Toggle (Light/Dark/System)

```jsx
import { ThemeToggleDropdown } from '@/components/ui/theme-toggle';

<ThemeToggleDropdown />;
```

### Using Theme in Components

```jsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // resolvedTheme gives actual theme ('light' or 'dark')
  // theme can be 'light', 'dark', or 'system'

  return (
    <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

### Dark Mode Color Palette

#### Background Colors (Dark Mode)

| Variable              | Hex       | Usage                          |
| --------------------- | --------- | ------------------------------ |
| `--corp-bg-primary`   | `#0f172a` | Main content areas (Slate 900) |
| `--corp-bg-secondary` | `#1e293b` | Cards, panels (Slate 800)      |
| `--corp-bg-tertiary`  | `#334155` | Deeper contrast (Slate 700)    |

#### Text Colors (Dark Mode)

| Variable                | Hex       | Usage                               |
| ----------------------- | --------- | ----------------------------------- |
| `--corp-text-primary`   | `#f8fafc` | Headings, important text (Slate 50) |
| `--corp-text-secondary` | `#e2e8f0` | Body text (Slate 200)               |
| `--corp-text-muted`     | `#94a3b8` | Placeholders, hints (Slate 400)     |

#### Border Colors (Dark Mode)

| Variable              | Hex       | Usage                          |
| --------------------- | --------- | ------------------------------ |
| `--corp-border-light` | `#334155` | Default borders (Slate 700)    |
| `--corp-border-dark`  | `#475569` | Emphasized borders (Slate 600) |

#### Brand Colors (Dark Mode - Adjusted for contrast)

| Variable         | Hex       | Usage                   |
| ---------------- | --------- | ----------------------- |
| `--corp-primary` | `#3b82f6` | Primary blue (Blue 500) |
| `--corp-success` | `#34d399` | Success (Emerald 400)   |
| `--corp-warning` | `#fbbf24` | Warning (Amber 400)     |
| `--corp-danger`  | `#f87171` | Danger (Red 400)        |
| `--corp-info`    | `#60a5fa` | Info (Blue 400)         |

### Dark Mode Shadows

Shadows in dark mode are more subtle with higher opacity:

| Variable           | Value                         |
| ------------------ | ----------------------------- |
| `--shadow-corp-sm` | `0 1px 3px rgba(0,0,0,0.4)`   |
| `--shadow-corp-md` | `0 4px 6px rgba(0,0,0,0.4)`   |
| `--shadow-corp-lg` | `0 10px 15px rgba(0,0,0,0.4)` |

### Writing Dark Mode Compatible Components

#### Using CSS Variables (Recommended)

CSS variables automatically switch between light and dark values:

```jsx
// Component uses CSS variables - automatically dark mode compatible
<div className="bg-corp-bg-primary text-corp-text-primary border-corp-border-light">
  Content adapts to theme automatically
</div>
```

#### Using Tailwind dark: prefix

For custom styles, use Tailwind's `dark:` prefix:

```jsx
<div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100">
  Custom dark mode styling
</div>
```

#### Conditional Rendering

For complex dark mode logic:

```jsx
import { useTheme } from 'next-themes';

function Logo() {
  const { resolvedTheme } = useTheme();

  return <img src={resolvedTheme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} alt="Logo" />;
}
```

### Dark Mode Accessibility

Dark mode maintains WCAG AA compliance with proper contrast ratios:

| Combination                  | Light Mode | Dark Mode | Status  |
| ---------------------------- | ---------- | --------- | ------- |
| Primary text on background   | 16.1:1     | 15.8:1    | ✅ Pass |
| Secondary text on background | 7.5:1      | 10.4:1    | ✅ Pass |
| Muted text on background     | 3.5:1      | 4.5:1     | ✅ Pass |
| Primary color on background  | 5.2:1      | 5.9:1     | ✅ Pass |

### Dark Mode Best Practices

#### ✅ DO

- Use CSS variables for colors (they auto-switch)
- Test both themes during development
- Use `resolvedTheme` instead of `theme` for actual theme value
- Consider images and icons in both themes
- Handle hydration mismatch (component may render differently server vs client)

#### ❌ DON'T

- Hardcode colors (`#ffffff` instead of `var(--corp-bg-primary)`)
- Forget to test hover and focus states in dark mode
- Use `theme` directly when you need the resolved value (it can be 'system')
- Ignore contrast ratios in dark mode

### Handling Hydration Mismatch

When using theme-dependent rendering, wrap in a mounted check:

```jsx
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

function ThemeAwareComponent() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return placeholder during SSR/hydration
  if (!mounted) {
    return <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />;
  }

  return <div>{resolvedTheme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}</div>;
}
```

---

## Typography

### Font Stack

**Always use system fonts** - no custom web fonts.

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

### Type Scale

| Element              | Size               | Weight                | Color                      |
| -------------------- | ------------------ | --------------------- | -------------------------- |
| Page Title (h1)      | `text-3xl` (30px)  | `font-bold` (700)     | `text-corp-text-primary`   |
| Section Heading (h2) | `text-2xl` (24px)  | `font-semibold` (600) | `text-corp-text-primary`   |
| Subsection (h3)      | `text-lg` (18px)   | `font-semibold` (600) | `text-corp-text-primary`   |
| Body Text            | `text-base` (16px) | `font-normal` (400)   | `text-corp-text-secondary` |
| Small Text           | `text-sm` (14px)   | `font-normal` (400)   | `text-corp-text-secondary` |
| Caption              | `text-xs` (12px)   | `font-normal` (400)   | `text-corp-text-muted`     |

### Code Examples

```jsx
// Page Title
<h1 className="text-3xl font-bold text-corp-text-primary">Dashboard</h1>

// Section Heading
<h2 className="text-2xl font-semibold text-corp-text-primary">Invoices</h2>

// Body Text
<p className="text-base text-corp-text-secondary">Regular paragraph content</p>

// Caption
<span className="text-xs text-corp-text-muted">Last updated 2 hours ago</span>
```

---

## Spacing & Layout

### Spacing Scale

| Name  | Size      | Pixels | Usage            |
| ----- | --------- | ------ | ---------------- |
| `xs`  | `0.25rem` | 4px    | Tight spacing    |
| `sm`  | `0.5rem`  | 8px    | Compact elements |
| `md`  | `1rem`    | 16px   | Default spacing  |
| `lg`  | `1.5rem`  | 24px   | Section spacing  |
| `xl`  | `2rem`    | 32px   | Large spacing    |
| `2xl` | `3rem`    | 48px   | Page sections    |

### Layout Patterns

#### Page Container

```jsx
<div className="min-h-screen bg-corp-bg-secondary p-6">
  <div className="max-w-7xl mx-auto">{/* Page content */}</div>
</div>
```

#### Card Grid

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{/* Cards */}</div>
```

#### Form Layout

```jsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{/* Form fields */}</div>
</form>
```

---

## Shadows & Elevation

### Corporate Shadow System

| Variable           | Value                         | Usage              |
| ------------------ | ----------------------------- | ------------------ |
| `--shadow-corp-xs` | `0 1px 2px rgba(0,0,0,0.05)`  | Subtle elevation   |
| `--shadow-corp-sm` | `0 1px 3px rgba(0,0,0,0.1)`   | Cards, buttons     |
| `--shadow-corp-md` | `0 4px 6px rgba(0,0,0,0.1)`   | Dropdowns, modals  |
| `--shadow-corp-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Prominent elements |
| `--shadow-corp-xl` | `0 20px 25px rgba(0,0,0,0.1)` | Hero sections      |

### Usage Guidelines

- **Cards**: `shadow-corp-sm` or `shadow-corp-md`
- **Dropdowns**: `shadow-corp-md` or `shadow-corp-lg`
- **Modals**: `shadow-corp-lg` or `shadow-corp-xl`
- **Hover states**: Increase shadow level by one step

```jsx
// Card with shadow
<div className="bg-white border border-corp-border-light rounded-lg shadow-corp-sm p-6">
  Content
</div>

// Card with hover effect
<div className="bg-white border border-corp-border-light rounded-lg shadow-corp-sm
               hover:shadow-corp-md transition-shadow">
  Content
</div>
```

---

## Border Radius

### Radius Scale

| Variable           | Value            | Usage                  |
| ------------------ | ---------------- | ---------------------- |
| `--radius-corp-xs` | `0.25rem` (4px)  | Small elements, badges |
| `--radius-corp-sm` | `0.375rem` (6px) | Buttons, inputs        |
| `--radius-corp-md` | `0.5rem` (8px)   | Cards, panels          |
| `--radius-corp-lg` | `0.75rem` (12px) | Large cards, modals    |
| `--radius-corp-xl` | `1rem` (16px)    | Hero sections          |

### Tailwind Classes

| Class        | Size | Usage            |
| ------------ | ---- | ---------------- |
| `rounded-sm` | 4px  | Small elements   |
| `rounded`    | 6px  | Default          |
| `rounded-md` | 8px  | Buttons, inputs  |
| `rounded-lg` | 12px | Cards            |
| `rounded-xl` | 16px | Large containers |

---

## Component Guidelines

### Buttons

#### Primary Button (CTA)

```jsx
<button className="bg-corp-primary text-white px-4 py-2 rounded-md
                   font-medium hover:bg-corp-primary-dark transition-colors">
  Save Changes
</button>

// Or use utility class
<button className="corp-btn-primary">Save Changes</button>
```

#### Secondary Button

```jsx
<button className="bg-white border border-corp-border-light text-corp-text-primary
                   px-4 py-2 rounded-md font-medium hover:bg-corp-bg-secondary
                   hover:border-corp-border-dark transition-colors">
  Cancel
</button>

// Or use utility class
<button className="corp-btn">Cancel</button>
```

#### Danger Button

```jsx
<button
  className="bg-corp-danger text-white px-4 py-2 rounded-md
                   font-medium hover:bg-red-600 transition-colors"
>
  Delete
</button>
```

### Cards

```jsx
<div className="bg-white border border-corp-border-light rounded-lg shadow-corp-sm p-6">
  <h3 className="text-lg font-semibold text-corp-text-primary mb-4">
    Card Title
  </h3>
  <p className="text-corp-text-secondary">
    Card content goes here
  </p>
</div>

// Or use utility class
<div className="corp-card p-6">
  Content
</div>
```

### Inputs

```jsx
<input
  type="text"
  className="w-full px-3 py-2 bg-white border border-corp-border-light rounded-md
             text-corp-text-primary placeholder:text-corp-text-muted
             focus:outline-none focus:border-corp-primary focus:ring-2
             focus:ring-corp-primary/10 transition-colors"
  placeholder="Enter value..."
/>

// Or use utility class
<input className="corp-input w-full" placeholder="Enter value..." />
```

### Tables

```jsx
<table className="w-full">
  <thead className="bg-corp-bg-secondary border-b-2 border-corp-border-light">
    <tr>
      <th className="px-4 py-3 text-left text-sm font-semibold text-corp-text-primary">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-corp-border-light hover:bg-corp-bg-secondary">
      <td className="px-4 py-3 text-sm text-corp-text-secondary">
        Value
      </td>
    </tr>
  </tbody>
</table>

// Or use utility class
<table className="corp-table">...</table>
```

### Badges

```jsx
// Success Badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                bg-green-100 text-green-800">
  Paid
</span>

// Warning Badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                bg-amber-100 text-amber-800">
  Pending
</span>

// Danger Badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                bg-red-100 text-red-800">
  Overdue
</span>

// Or use utility classes
<span className="corp-badge-success">Paid</span>
<span className="corp-badge-warning">Pending</span>
<span className="corp-badge-danger">Overdue</span>
```

---

## Icons

### Icon Library

Use **Lucide React** exclusively for all icons.

```bash
npm install lucide-react
```

### Usage

```jsx
import { Plus, Search, Settings, Trash2, Edit, ChevronDown } from 'lucide-react';

// Default icon (muted)
<Search className="w-5 h-5 text-corp-text-muted" />

// Active/Primary icon
<Plus className="w-5 h-5 text-corp-primary" />

// Success icon
<CheckCircle className="w-5 h-5 text-corp-success" />

// Danger icon
<Trash2 className="w-5 h-5 text-corp-danger" />
```

### Icon Button

```jsx
<button
  className="p-2 rounded-md border border-corp-border-light
                   hover:bg-corp-bg-secondary transition-colors"
>
  <Settings className="w-5 h-5 text-corp-text-muted" />
</button>
```

---

## Accessibility

### Requirements

- **WCAG AA Compliance** - Minimum requirement
- **Color Contrast** - 4.5:1 for normal text, 3:1 for large text
- **Focus States** - Visible focus indicators on all interactive elements
- **Screen Readers** - Proper ARIA labels and semantic HTML

### Focus States

```jsx
// Focus ring for interactive elements
<button className="... focus:outline-none focus:ring-2 focus:ring-corp-primary/50
                   focus:ring-offset-2">
  Button
</button>

// Input focus
<input className="... focus:border-corp-primary focus:ring-2 focus:ring-corp-primary/10" />
```

### Color Contrast Check

| Combination            | Contrast Ratio | Status             |
| ---------------------- | -------------- | ------------------ |
| `#111827` on `#ffffff` | 16.1:1         | ✅ Pass            |
| `#4b5563` on `#ffffff` | 7.5:1          | ✅ Pass            |
| `#9ca3af` on `#ffffff` | 3.5:1          | ⚠️ Large text only |
| `#2064d8` on `#ffffff` | 5.2:1          | ✅ Pass            |

---

## CSS Variables Reference

### Complete Variable List

```css
/* =========================
   CORPORATE THEME VARIABLES
   ========================= */

/* Brand Colors */
--corp-primary: #2064d8;
--corp-primary-dark: #1a56b8;
--corp-secondary: #10b981;

/* Background Colors */
--corp-bg-primary: #ffffff;
--corp-bg-secondary: #f8f9fa;
--corp-bg-tertiary: #f3f4f6;

/* Text Colors */
--corp-text-primary: #111827;
--corp-text-secondary: #4b5563;
--corp-text-muted: #9ca3af;

/* Border Colors */
--corp-border-light: #e5e7eb;
--corp-border-dark: #d1d5db;

/* Semantic Colors */
--corp-success: #10b981;
--corp-warning: #f59e0b;
--corp-danger: #ef4444;
--corp-info: #3b82f6;

/* Shadows */
--shadow-corp-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-corp-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
--shadow-corp-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
--shadow-corp-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
--shadow-corp-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

/* Border Radius */
--radius-corp-xs: 0.25rem;
--radius-corp-sm: 0.375rem;
--radius-corp-md: 0.5rem;
--radius-corp-lg: 0.75rem;
--radius-corp-xl: 1rem;
```

### Dark Mode Variables

When `.dark` class is applied to `<html>`, these variables are used:

```css
/* ============================
   DARK MODE THEME VARIABLES
   ============================ */

/* Brand Colors (Adjusted for dark backgrounds) */
--corp-primary: #3b82f6; /* Blue 500 */
--corp-primary-dark: #60a5fa; /* Blue 400 (hover) */

/* Background Colors (Slate palette) */
--corp-bg-primary: #0f172a; /* Slate 900 */
--corp-bg-secondary: #1e293b; /* Slate 800 */
--corp-bg-tertiary: #334155; /* Slate 700 */
--corp-bg-hover: #1e293b;

/* Text Colors */
--corp-text-primary: #f8fafc; /* Slate 50 */
--corp-text-secondary: #e2e8f0; /* Slate 200 */
--corp-text-muted: #94a3b8; /* Slate 400 */

/* Border Colors */
--corp-border-light: #334155; /* Slate 700 */
--corp-border-dark: #475569; /* Slate 600 */

/* Semantic Colors (Brighter for dark backgrounds) */
--corp-success: #34d399; /* Emerald 400 */
--corp-warning: #fbbf24; /* Amber 400 */
--corp-danger: #f87171; /* Red 400 */
--corp-info: #60a5fa; /* Blue 400 */

/* Dark Mode Shadows (Higher opacity) */
--shadow-corp-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-corp-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4);
--shadow-corp-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
--shadow-corp-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
--shadow-corp-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
```

---

## Tailwind Classes Reference

### Quick Reference Card

```jsx
/* ==================
   BACKGROUNDS
   ================== */
bg-white                    // White background
bg-corp-bg-secondary        // Light gray (#f8f9fa)
bg-corp-bg-tertiary         // Deeper gray (#f3f4f6)
bg-corp-primary             // Primary blue
bg-corp-success             // Green
bg-corp-warning             // Amber
bg-corp-danger              // Red

/* ==================
   TEXT COLORS
   ================== */
text-corp-text-primary      // Dark text (#111827)
text-corp-text-secondary    // Medium text (#4b5563)
text-corp-text-muted        // Light text (#9ca3af)
text-corp-primary           // Primary blue text
text-corp-success           // Green text
text-corp-danger            // Red text

/* ==================
   BORDERS
   ================== */
border border-corp-border-light   // Default border
border-corp-border-dark           // Emphasized border
border-corp-primary               // Primary color border

/* ==================
   SHADOWS
   ================== */
shadow-corp-xs              // Subtle shadow
shadow-corp-sm              // Small shadow
shadow-corp-md              // Medium shadow
shadow-corp-lg              // Large shadow
shadow-corp-xl              // Extra large shadow

/* ==================
   BORDER RADIUS
   ================== */
rounded-sm                  // 4px
rounded                     // 6px (default)
rounded-md                  // 8px
rounded-lg                  // 12px
rounded-xl                  // 16px

/* ==================
   UTILITY CLASSES
   ================== */
.corp-card                  // Card with border and shadow
.corp-btn                   // Secondary button
.corp-btn-primary           // Primary button
.corp-input                 // Input field
.corp-table                 // Styled table
.corp-badge-success         // Green badge
.corp-badge-warning         // Amber badge
.corp-badge-danger          // Red badge
.corp-divider               // Horizontal divider
```

---

## Do's and Don'ts

### ✅ DO

| Practice                          | Example                               |
| --------------------------------- | ------------------------------------- |
| Use white backgrounds for content | `bg-white`                            |
| Use borders to define boundaries  | `border border-corp-border-light`     |
| Use subtle shadows for elevation  | `shadow-corp-sm`                      |
| Use system fonts                  | Default font stack                    |
| Use semantic colors               | `text-corp-danger` for errors         |
| Maintain consistent spacing       | `p-6 gap-4`                           |
| Follow WCAG AA contrast           | 4.5:1 minimum                         |
| Use Lucide icons                  | `import { Plus } from 'lucide-react'` |

### ❌ DON'T

| Avoid                                 | Why                            |
| ------------------------------------- | ------------------------------ |
| Colored backgrounds (e.g., `#e8eef5`) | Reduces readability            |
| Dual neumorphic shadows               | Outdated, heavy appearance     |
| Custom web fonts                      | Inconsistent, slower loading   |
| Excessive shadows                     | Creates visual clutter         |
| Hardcoded colors in components        | Use CSS variables instead      |
| `rounded-2xl` or larger               | Too soft for professional apps |
| Gradient backgrounds                  | Save for special emphasis only |
| Mixing design systems                 | Creates inconsistency          |

---

## Migration from Legacy Styles

### Neumorphic to Corporate Mapping

| Old (Neumorphic)                                         | New (Corporate)                   |
| -------------------------------------------------------- | --------------------------------- |
| `#e8eef5`                                                | `#ffffff` or `#f8f9fa`            |
| `#c4c9cf`                                                | `#e5e7eb`                         |
| `boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #fff'` | `shadow-corp-md`                  |
| `boxShadow: 'inset ...'`                                 | `border border-corp-border-light` |
| `rounded-2xl`                                            | `rounded-lg`                      |
| `rounded-xl`                                             | `rounded-md`                      |
| `var(--neu-bg)`                                          | `var(--corp-bg-primary)`          |
| `var(--neu-text-primary)`                                | `var(--corp-text-primary)`        |
| `linear-gradient(145deg, ...)`                           | Solid color `bg-corp-primary`     |

### Find & Replace Patterns

```bash
# Background colors
Find:    #e8eef5
Replace: #f8f9fa

# Border colors
Find:    #c4c9cf
Replace: #e5e7eb

# CSS variable prefixes
Find:    var(--neu-
Replace: var(--corp-

# Border radius
Find:    rounded-2xl
Replace: rounded-lg

Find:    rounded-xl
Replace: rounded-md
```

### Component Migration Example

#### Before (Legacy)

```jsx
<div
  className="rounded-2xl p-6"
  style={{
    background: '#e8eef5',
    boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff',
  }}
>
  <h3 style={{ color: '#1e3a5f' }}>Title</h3>
  <button
    style={{
      background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
      boxShadow: '3px 3px 6px #c4c9cf',
    }}
  >
    Save
  </button>
</div>
```

#### After (Corporate)

```jsx
<div className="corp-card p-6">
  <h3 className="text-lg font-semibold text-corp-text-primary">Title</h3>
  <button className="corp-btn-primary">Save</button>
</div>
```

---

## Related Documentation

- **[DESIGN-GUIDE.md](../DESIGN-GUIDE.md)** - Full design system documentation
- **[MIGRATION-TO-CORPORATE.md](../MIGRATION-TO-CORPORATE.md)** - Migration guide
- **[CLAUDE.md](../CLAUDE.md)** - Development quick reference
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library documentation
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility class reference

---

## Questions?

- Review component examples in `/apps/frontend/src/components/ui/`
- Check the theme reference page at `/theme-reference` in the app
- Consult the shadcn/ui documentation for component patterns

---

**Remember:** Consistency is key. When in doubt, follow existing patterns in the codebase and refer to this guide.
