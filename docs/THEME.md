# SimpleAccounts UAE - Neumorphic Design System

This document outlines the comprehensive **Neumorphic (Soft UI)** design system for SimpleAccounts UAE, inspired by [Themesberg Neumorphism UI](https://themesberg.com/docs/neumorphism-ui/components/accordions/).

## 1. Core Principles

- **Soft UI (Neumorphism)**: Elements mimic physical objects using subtle light and shadow
- **Two Shadow System**: Every element uses opposing shadows (light + dark) for depth
- **Low Contrast, High Depth**: Distinctions via shadows (`neu-raised`, `neu-pressed`) not borders
- **Consistent Background**: Components share the same background color as the page
- **Rounded Geometry**: Generous border radii (12px-32px) for the soft look
- **Tactile Interaction**: Buttons/inputs physically respond (press in/pop out)

## 2. Color Palette

### Light Mode

| Token               | Value     | Usage                  |
| ------------------- | --------- | ---------------------- |
| `$neu-bg`           | `#e6e7ee` | Main background        |
| `$neu-bg-alt`       | `#e0e5ec` | Alternative background |
| `$neu-dark-shadow`  | `#b8b9be` | Dark shadow color      |
| `$neu-light-shadow` | `#ffffff` | Light shadow color     |
| `$neu-border`       | `#d1d9e6` | Subtle borders         |

### Dark Mode

| Token                    | Value     | Usage                  |
| ------------------------ | --------- | ---------------------- |
| `$neu-bg-dark`           | `#2b2d33` | Dark background        |
| `$neu-dark-shadow-dark`  | `#1e1f23` | Dark mode dark shadow  |
| `$neu-light-shadow-dark` | `#383b43` | Dark mode light shadow |

### Brand Colors

| Token      | Value     | Usage               |
| ---------- | --------- | ------------------- |
| `$primary` | `#2563eb` | Primary actions     |
| `$success` | `#10b981` | Success states      |
| `$danger`  | `#ef4444` | Error/danger states |
| `$warning` | `#f59e0b` | Warning states      |
| `$info`    | `#06b6d4` | Info states         |

### Text Colors

| Token         | Value     | Usage                |
| ------------- | --------- | -------------------- |
| `$text-dark`  | `#31344b` | Primary text         |
| `$text-muted` | `#66799e` | Secondary text       |
| `$text-light` | `#93a5be` | Placeholder/disabled |

## 3. Shadow System

### Raised/Soft Shadows (Element pops out)

```scss
$shadow-soft-xs:
  2px 2px 4px #b8b9be,
  -2px -2px 4px #ffffff;
$shadow-soft-sm:
  3px 3px 6px #b8b9be,
  -3px -3px 6px #ffffff;
$shadow-soft:
  6px 6px 12px #b8b9be,
  -6px -6px 12px #ffffff;
$shadow-soft-md:
  8px 8px 16px #b8b9be,
  -8px -8px 16px #ffffff;
$shadow-soft-lg:
  10px 10px 20px #b8b9be,
  -10px -10px 20px #ffffff;
$shadow-soft-xl:
  15px 15px 30px #b8b9be,
  -15px -15px 30px #ffffff;
```

### Inset/Pressed Shadows (Element pushed in)

```scss
$shadow-inset-xs:
  inset 1px 1px 2px #b8b9be,
  inset -1px -1px 2px #ffffff;
$shadow-inset-sm:
  inset 2px 2px 4px #b8b9be,
  inset -2px -2px 4px #ffffff;
$shadow-inset:
  inset 3px 3px 6px #b8b9be,
  inset -3px -3px 6px #ffffff;
$shadow-inset-md:
  inset 4px 4px 8px #b8b9be,
  inset -4px -4px 8px #ffffff;
$shadow-inset-lg:
  inset 6px 6px 12px #b8b9be,
  inset -6px -6px 12px #ffffff;
```

### Tailwind Shadow Classes

```
shadow-neu-flat        - Subtle flat shadow
shadow-neu-raised-sm   - Small raised effect
shadow-neu-raised      - Standard raised effect
shadow-neu-raised-lg   - Large raised effect
shadow-neu-pressed-sm  - Small pressed effect
shadow-neu-pressed     - Standard pressed effect
shadow-neu-btn         - Button default
shadow-neu-btn-hover   - Button hover
shadow-neu-btn-active  - Button active/pressed
shadow-neu-input       - Input field
shadow-neu-input-focus - Input focused
```

## 4. Border Radius

| Token                 | Value            | Usage                     |
| --------------------- | ---------------- | ------------------------- |
| `$border-radius-xs`   | `0.25rem` (4px)  | Small elements            |
| `$border-radius-sm`   | `0.5rem` (8px)   | Badges, small buttons     |
| `$border-radius`      | `0.75rem` (12px) | Default (buttons, inputs) |
| `$border-radius-md`   | `1rem` (16px)    | Dropdowns                 |
| `$border-radius-lg`   | `1.25rem` (20px) | Cards                     |
| `$border-radius-xl`   | `1.5rem` (24px)  | Modals                    |
| `$border-radius-2xl`  | `2rem` (32px)    | Large containers          |
| `$border-radius-pill` | `50rem`          | Pills/toggles             |

## 5. Component Patterns

### Buttons

```scss
// Default state - raised
.btn {
  background: $neu-bg;
  box-shadow:
    3px 3px 6px #b8b9be,
    -3px -3px 6px #ffffff;
  border-radius: 0.75rem;
  transition: all 200ms ease;
}

// Hover - more raised + lift
.btn:hover {
  box-shadow:
    5px 5px 10px #b8b9be,
    -5px -5px 10px #ffffff;
  transform: translateY(-2px);
}

// Active/Pressed - inset
.btn:active {
  box-shadow:
    inset 2px 2px 5px #b8b9be,
    inset -2px -2px 5px #ffffff;
  transform: translateY(0);
}
```

### Inputs

```scss
// Default - pressed/inset appearance
.form-control {
  background: $neu-bg;
  box-shadow:
    inset 2px 2px 4px #b8b9be,
    inset -2px -2px 4px #ffffff;
  border: none;
  border-radius: 0.75rem;
}

// Focus - deeper inset + ring
.form-control:focus {
  box-shadow:
    inset 3px 3px 6px #b8b9be,
    inset -3px -3px 6px #ffffff,
    0 0 0 3px rgba(37, 99, 235, 0.15);
}
```

### Cards

```scss
.card {
  background: $neu-bg;
  box-shadow:
    6px 6px 12px #b8b9be,
    -6px -6px 12px #ffffff;
  border: none;
  border-radius: 1.25rem;
}
```

### Navigation Items

```scss
// Default - flat
.nav-item {
  box-shadow:
    2px 2px 4px #b8b9be,
    -2px -2px 4px #ffffff;
}

// Hover - raised
.nav-item:hover {
  box-shadow:
    3px 3px 6px #b8b9be,
    -3px -3px 6px #ffffff;
  transform: translateY(-1px);
}

// Active - pressed
.nav-item.active {
  box-shadow:
    inset 2px 2px 4px #b8b9be,
    inset -2px -2px 4px #ffffff;
}
```

## 6. SCSS Mixins

Use these mixins for consistent neumorphic styling:

```scss
@import 'assets/scss/mixins';

// Raised effects
@include neu-raised; // Standard raised
@include neu-raised('sm'); // Small raised
@include neu-raised('lg'); // Large raised

// Pressed effects
@include neu-pressed; // Standard pressed
@include neu-pressed('sm'); // Small pressed

// Components
@include neu-button; // Default button
@include neu-button-primary; // Primary colored button
@include neu-input; // Input field
@include neu-card; // Card container
@include neu-dropdown; // Dropdown menu
@include neu-nav-item; // Navigation item
```

## 7. Tailwind Classes

### Background

```
bg-neu-bg           - Light neumorphic background
bg-neu-bg-dark      - Dark mode background
```

### Shadows

```
shadow-neu-raised      - Raised effect
shadow-neu-raised-sm   - Small raised
shadow-neu-pressed     - Pressed effect
shadow-neu-pressed-sm  - Small pressed
shadow-neu-btn         - Button shadow
shadow-neu-input       - Input shadow
```

### Border Radius

```
rounded-neu-sm    - 0.5rem
rounded-neu       - 0.75rem
rounded-neu-md    - 1rem
rounded-neu-lg    - 1.25rem
rounded-neu-xl    - 1.5rem
rounded-neu-2xl   - 2rem
```

## 8. Implementation Checklist

When creating or converting a component:

- [ ] Set background to `$neu-bg` or `bg-neu-bg`
- [ ] Remove all borders (use shadows instead)
- [ ] Apply appropriate shadow (`neu-raised` or `neu-pressed`)
- [ ] Add generous border-radius (minimum 0.75rem)
- [ ] Implement hover state (more shadow + slight lift)
- [ ] Implement active state (inset shadow + no lift)
- [ ] Add smooth transition (200ms ease)
- [ ] Ensure focus states have ring + shadow

## 9. File Structure

```
src/assets/scss/
├── _variables.scss          # All color, shadow, spacing variables
├── _mixins.scss             # Neumorphic mixins
├── _neumorphic-components.scss  # Component-specific styles
└── style.scss               # Main stylesheet with global overrides

tailwind.config.js           # Tailwind shadow, color, radius extensions
```

## 10. Resources

- [Themesberg Neumorphism UI](https://themesberg.com/docs/neumorphism-ui/components/accordions/)
- [Neumorphism.io Generator](https://neumorphism.io/)
- [CSS-Tricks: Neumorphism and CSS](https://css-tricks.com/neumorphism-and-css/)
