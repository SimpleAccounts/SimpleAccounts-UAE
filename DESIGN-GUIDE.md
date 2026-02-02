# SimpleAccounts UAE - Corporate Design System

**Modern, Minimal, Professional**

> **📖 Note:** For the complete, authoritative theme reference, see **[docs/THEME-GUIDELINES.md](./docs/THEME-GUIDELINES.md)**. This document provides an overview and quick examples.

This design system follows industry best practices from Stripe, Linear, and OpenAI's UI guidelines for clean, professional business applications.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Migration Guide](#migration-guide)

---

## Design Principles

### 1. **Clarity First**

- Use white/light backgrounds for maximum readability
- High contrast for financial data and numbers
- Clean borders instead of heavy shadows
- Minimal visual noise

### 2. **Professional & Trustworthy**

- Consistent spacing and alignment
- Professional color palette
- Subtle, purposeful animations
- WCAG AA accessibility compliance

### 3. **System Integration**

- Use system fonts (no custom fonts)
- Inherit browser/OS text sizing
- Respect user preferences (dark mode, reduced motion)
- Brand colors only for primary actions

### 4. **Efficiency**

- Quick visual scanning
- Clear information hierarchy
- Predictable interactions
- Minimal cognitive load

---

## Color System

### Primary Colors (Brand)

```css
--corp-primary: #2064d8; /* Primary blue - from logo */
--corp-primary-dark: #1a56b8; /* Hover state */
```

**Usage:**

- Primary buttons, links, active states
- Call-to-action elements
- Selected/focused states

### Background Colors

```css
--corp-bg-primary: #ffffff; /* Main background */
--corp-bg-secondary: #f8f9fa; /* Subtle contrast */
--corp-bg-tertiary: #f3f4f6; /* Deeper contrast, table headers */
```

**Usage:**

- Page backgrounds: `--corp-bg-primary`
- Cards/panels: `--corp-bg-primary` with border
- Table headers: `--corp-bg-secondary`
- Hover effects: `--corp-bg-hover`

### Semantic Colors

```css
--corp-success: #10b981; /* Green for success */
--corp-warning: #f59e0b; /* Amber for warnings */
--corp-danger: #ef4444; /* Red for errors */
--corp-info: #3b82f6; /* Blue for info */
```

### Text Colors

```css
--corp-text-primary: #111827; /* Headings, important text */
--corp-text-secondary: #4b5563; /* Body text */
--corp-text-muted: #9ca3af; /* Placeholders, hints */
```

### Border Colors

```css
--corp-border-light: #e5e7eb; /* Default borders */
--corp-border-dark: #d1d5db; /* Emphasized borders */
```

---

## Typography

### Font Stack (System Fonts)

```css
font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

**Always use system fonts** - No custom fonts, following OpenAI guidelines.

### Type Scale

```jsx
// Page Title
<h1 className="text-3xl font-bold text-corp-text-primary">
  Dashboard
</h1>

// Section Heading
<h2 className="text-2xl font-semibold text-corp-text-primary">
  Recent Transactions
</h2>

// Subsection
<h3 className="text-lg font-semibold text-corp-text-primary">
  Invoice Details
</h3>

// Body Text
<p className="text-base text-corp-text-secondary">
  Regular paragraph text
</p>

// Small Text / Caption
<span className="text-sm text-corp-text-tertiary">
  Last updated 2 hours ago
</span>

// Fine Print
<span className="text-xs text-corp-text-muted">
  Terms and conditions apply
</span>
```

---

## Spacing & Layout

### Spacing Scale (Tailwind)

```
xs:  0.25rem (4px)   - Tight spacing
sm:  0.5rem  (8px)   - Compact elements
md:  1rem    (16px)  - Default spacing
lg:  1.5rem  (24px)  - Section spacing
xl:  2rem    (32px)  - Large spacing
2xl: 3rem    (48px)  - Page sections
```

### Layout Patterns

#### Page Container

```jsx
<div className="min-h-screen bg-corp-bg-secondary p-6">
  <div className="max-w-7xl mx-auto">{/* Page content */}</div>
</div>
```

#### Grid Layout

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{/* Cards */}</div>
```

---

## Components

### Buttons

#### Primary Button (CTA)

```jsx
<button className="corp-btn-primary">
  Save Changes
</button>

// CSS:
.corp-btn-primary {
  background-color: var(--corp-primary);
  color: white;
  border: 1px solid var(--corp-primary);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.corp-btn-primary:hover {
  background-color: var(--corp-primary-hover);
}
```

#### Secondary Button

```jsx
<button className="corp-btn">
  Cancel
</button>

// CSS:
.corp-btn {
  background-color: white;
  border: 1px solid var(--corp-border-light);
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  color: var(--corp-text-primary);
}

.corp-btn:hover {
  background-color: var(--corp-bg-hover);
  border-color: var(--corp-border-medium);
}
```

#### Danger Button

```jsx
<button
  className="bg-corp-danger text-white px-4 py-2 rounded-md
                   hover:bg-red-600 transition-colors"
>
  Delete
</button>
```

### Cards

```jsx
<div className="corp-card p-6">
  <h3 className="text-lg font-semibold text-corp-text-primary mb-4">
    Card Title
  </h3>
  <p className="text-corp-text-secondary">
    Card content goes here
  </p>
</div>

// CSS:
.corp-card {
  background-color: white;
  border: 1px solid var(--corp-border-light);
  border-radius: 0.5rem;
  box-shadow: var(--corp-shadow-sm);
}

.corp-card:hover {
  box-shadow: var(--corp-shadow-md);
}
```

### Inputs

```jsx
<input
  type="text"
  className="corp-input w-full"
  placeholder="Enter value..."
/>

// CSS:
.corp-input {
  background-color: white;
  border: 1px solid var(--corp-border-light);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  color: var(--corp-text-primary);
}

.corp-input:focus {
  outline: none;
  border-color: var(--corp-primary);
  box-shadow: 0 0 0 3px rgba(32, 100, 216, 0.1); /* Blue ring */
}
```

### Select Dropdown

```jsx
<select className="corp-input w-full">
  <option>Select option</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Tables

```jsx
<table className="corp-table">
  <thead>
    <tr>
      <th>Invoice #</th>
      <th>Customer</th>
      <th>Amount</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>INV-001</td>
      <td>Acme Corp</td>
      <td>$1,250.00</td>
      <td>
        <span className="corp-badge-success">Paid</span>
      </td>
    </tr>
  </tbody>
</table>

// CSS:
.corp-table {
  width: 100%;
  border-collapse: collapse;
}

.corp-table thead {
  background-color: var(--corp-bg-secondary);
  border-bottom: 2px solid var(--corp-border-light);
}

.corp-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--corp-text-primary);
  font-size: 0.875rem;
}

.corp-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--corp-border-light);
  color: var(--corp-text-secondary);
}

.corp-table tbody tr:hover {
  background-color: var(--corp-bg-hover);
}
```

### Badges/Status Pills

```jsx
<span className="corp-badge-success">Paid</span>
<span className="corp-badge-warning">Pending</span>
<span className="corp-badge-danger">Overdue</span>
<span className="corp-badge-primary">Draft</span>

// CSS:
.corp-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.corp-badge-success {
  background-color: var(--corp-success-light);
  color: var(--corp-success);
}

.corp-badge-warning {
  background-color: var(--corp-warning-light);
  color: var(--corp-warning);
}
```

### Dividers

```jsx
<hr className="corp-divider my-6" />

// CSS:
.corp-divider {
  border-top: 1px solid var(--corp-border-light);
}
```

### Icon Buttons

```jsx
import { Settings } from 'lucide-react';

<button
  className="p-2 rounded-md border border-corp-border-light
                   hover:bg-corp-bg-hover transition-colors"
>
  <Settings className="w-5 h-5 text-corp-text-tertiary" />
</button>;
```

---

## Migration Guide

### From Neumorphic to Corporate

#### Before (Neumorphic)

```jsx
<div
  className="rounded-2xl p-6"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
  }}
>
  Content
</div>
```

#### After (Corporate)

```jsx
<div className="corp-card p-6">Content</div>
```

### Button Migration

#### Before (Neumorphic)

```jsx
<button
  className="px-4 py-2 rounded-xl"
  style={{
    background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
    boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
  }}
>
  Save
</button>
```

#### After (Corporate)

```jsx
<button className="corp-btn-primary">Save</button>
```

### Input Migration

#### Before (Neumorphic)

```jsx
<input
  className="px-4 py-2 rounded-xl border-0"
  style={{
    background: 'var(--neu-bg)',
    boxShadow: 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff',
  }}
/>
```

#### After (Corporate)

```jsx
<input className="corp-input w-full" />
```

### Color Variable Migration

| Old Neumorphic         | New Corporate           | Usage            |
| ---------------------- | ----------------------- | ---------------- |
| `--neu-bg`             | `--corp-bg-primary`     | Main backgrounds |
| `--neu-primary`        | `--corp-primary`        | Primary actions  |
| `--neu-text-primary`   | `--corp-text-primary`   | Headings         |
| `--neu-text-secondary` | `--corp-text-secondary` | Body text        |
| `--neu-shadow-raised`  | `--corp-shadow-md`      | Card shadows     |

### Quick Find & Replace

Use these patterns to quickly migrate:

1. **Background colors:**
   - Find: `bg-neu-bg` or `var(--neu-bg)`
   - Replace: `bg-white` or `var(--corp-bg-primary)`

2. **Shadows:**
   - Find: `shadow-neu-raised` or neumorphic box-shadow
   - Replace: `shadow-corp-sm` or `shadow-corp-md`

3. **Border radius:**
   - Find: `rounded-2xl` or `rounded-xl`
   - Replace: `rounded-lg` or `rounded-md`

4. **Text colors:**
   - Find: `var(--neu-text-*)`
   - Replace: `var(--corp-text-*)`

---

## Tailwind Class Reference

### Quick Reference

```jsx
// Backgrounds
className = 'bg-white'; // White background
className = 'bg-corp-bg-secondary'; // Light gray

// Text
className = 'text-corp-text-primary'; // Dark text (headings)
className = 'text-corp-text-secondary'; // Medium text (body)
className = 'text-corp-text-muted'; // Light text (hints)

// Borders
className = 'border border-corp-border-light'; // Light border
className = 'rounded-md'; // Medium radius
className = 'rounded-lg'; // Large radius

// Shadows
className = 'shadow-corp-sm'; // Subtle shadow
className = 'shadow-corp-md'; // Default shadow
className = 'shadow-corp-lg'; // Prominent shadow

// Spacing
className = 'p-4'; // Padding 1rem
className = 'p-6'; // Padding 1.5rem
className = 'gap-4'; // Gap 1rem
className = 'space-y-4'; // Vertical spacing

// Hover states
className = 'hover:bg-corp-bg-hover'; // Hover background
className = 'hover:border-corp-border-medium'; // Hover border
className = 'transition-colors'; // Smooth transition
```

---

## Best Practices

### ✅ Do's

- Use white/light backgrounds for content areas
- Apply subtle shadows for depth
- Use borders to define boundaries
- Keep hover states subtle and smooth
- Use semantic colors (success, warning, danger)
- Maintain consistent spacing
- Use system fonts
- Follow WCAG AA contrast ratios

### ❌ Don'ts

- Don't use dual neumorphic shadows
- Don't use colored backgrounds (#e8eef5) for main content
- Don't use excessive shadows
- Don't use custom fonts
- Don't use bright/saturated colors for backgrounds
- Don't mix design systems
- Don't use sharp corners without purpose
- Don't override user system preferences

---

## Additional Resources

- **shadcn/ui Components**: https://ui.shadcn.com/
- **Tailwind CSS Docs**: https://tailwindcss.com/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/

---

**Questions?** Review component examples in `/src/components/ui/` or check the shadcn/ui documentation.
