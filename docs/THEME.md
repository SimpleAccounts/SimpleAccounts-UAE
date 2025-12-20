# SimpleAccounts UAE - Neumorphic Design System & Theme Documentation

This document outlines the standardized **Neumorphic (Soft UI)** design system for the SimpleAccounts UAE application. This aesthetic combines modern minimalism with tactile depth, creating elements that appear to be extruded from or pressed into the background.

## 1. Core Principles

- **Soft UI (Neumorphism)**: Elements mimic physical objects using subtle light and shadow to create depth.
- **Low Contrast, High Depth**: Distinctions are made via shadows (`neu-out`, `neu-in`) rather than harsh borders.
- **Monochromatic Base**: A specific off-white (`#e0e5ec`) and dark grey (`#2b2d33`) background is crucial for the effect.
- **Rounded Geometry**: Generous border radii (typically `1rem` to `2rem`) are essential to the soft look.
- **Tactile Interaction**: Buttons and inputs should physically respond (press in/pop out) on interaction.

## 2. Layout & Backgrounds

### Global Background

The application background must match the component base color to maintain the illusion of continuity.

**Light Mode:** `#e0e5ec`
**Dark Mode:** `#2b2d33` (approximate, adjusted for shadows)

```jsx
<div className="min-h-screen bg-neu-bg dark:bg-neu-bg-dark text-foreground transition-colors duration-300">
  {/* Content */}
</div>
```

### Main Card (The "Extruded" Surface)

The primary container uses an "outer" shadow to appear raised from the background.

```jsx
<Card className="w-full shadow-neu-out dark:shadow-neu-out-dark bg-neu-bg dark:bg-neu-bg-dark border-none rounded-[2rem]">
  <CardContent>{/* Content */}</CardContent>
</Card>
```

**Tailwind Utilities:**

- `shadow-neu-out`: Light mode raised effect.
- `shadow-neu-out-dark`: Dark mode raised effect.

## 3. Typography

### Headings

- **Font**: Inter (default sans).
- **Style**: High contrast against the soft background, often using the primary color or strong foreground color.
- **Page Title**: `text-3xl font-bold tracking-tight text-foreground/80`

### Body Text

- **Default**: `text-sm font-medium text-muted-foreground`
- **Link/Action**: `text-primary font-bold hover:text-primary/80`

## 4. Components & Interactive Elements

### Buttons

Buttons appear raised (`neu-out`) by default and pressed (`neu-in`) when clicked.

```jsx
<Button className="h-12 rounded-xl bg-primary text-primary-foreground font-bold shadow-neu-out dark:shadow-neu-out-dark hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-neu-in dark:active:shadow-neu-in-dark transition-all duration-200">
  Action Label
</Button>
```

### Input Fields (The "Pressed" Surface)

Inputs use an "inner" shadow (`neu-in`) to appear recessed into the background.

```jsx
<Input
  className="h-12 rounded-xl bg-neu-bg dark:bg-neu-bg-dark border-none shadow-neu-in dark:shadow-neu-in-dark focus:ring-0 focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] transition-all duration-300"
  placeholder="Type here..."
/>
```

**Focus State**: The inner shadow is often sharpened or tinted to indicate focus, avoiding default browser rings.

### Select & Dropdowns

Custom styling (e.g., for `react-select`) is required to match the native input look.

```javascript
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#e0e5ec', // neu-bg
    boxShadow: state.isFocused
      ? 'inset 2px 2px 5px rgba(0,0,0,0.1), inset -2px -2px 5px rgba(255,255,255,0.7)' // Pressed look
      : '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)', // Raised look
    border: 'none',
    borderRadius: '0.75rem',
  }),
  // ... menu and option styles
};
```

## 5. Shadow System (Tailwind Config)

These custom utilities are defined in `tailwind.config.js`:

```javascript
colors: {
  neu: {
    bg: '#e0e5ec',
    'bg-dark': '#2b2d33',
  },
},
boxShadow: {
  'neu-out': '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
  'neu-in': 'inset 6px 6px 10px 0 rgba(163,177,198, 0.7), inset -6px -6px 10px 0 rgba(255,255,255, 0.8)',
  'neu-out-dark': '5px 5px 10px #1e1f23, -5px -5px 10px #383b43',
  'neu-in-dark': 'inset 5px 5px 10px #1e1f23, inset -5px -5px 10px #383b43',
},
```

## 6. Implementation Checklist

When converting a page to Neumorphism:

1.  [ ] Set the **Page Background** to `bg-neu-bg dark:bg-neu-bg-dark`.
2.  [ ] Replace standard Cards with **Neumorphic Cards** (no border, `shadow-neu-out`).
3.  [ ] Update all **Inputs** to use `shadow-neu-in` and remove borders.
4.  [ ] Style **Buttons** with `shadow-neu-out` and add `active:shadow-neu-in` for the click effect.
5.  [ ] Ensure **Icons** (Lucide) are used consistently and sized appropriately.
6.  [ ] Remove harsh dividers or borders; use spacing or subtle shadow insets (`neu-in`) to separate content.

## 7. Branding & Colors

- **Neu Base**: `#e0e5ec` (Light), `#2b2d33` (Dark)
- **Primary Blue**: `#2064d8` (Main Actions)
- **Text**: Slate/Gray scale for softness. Black is rarely used pure.
