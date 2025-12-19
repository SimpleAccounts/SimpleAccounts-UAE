# SimpleAccounts UAE - Design System & Theme Documentation

This document outlines the standardized design system and theme guidelines for the SimpleAccounts UAE application. These standards are based on the modernized Registration and Login screens and should be applied consistently across all new and refactored pages.

## 1. Core Principles

- **Modern & Professional**: Clean lines, generous whitespace, and a polished look suitable for financial software.
- **Glassmorphism**: Subtle transparency and blur effects to create depth and hierarchy.
- **Interactive Feedback**: clear hover, focus, and active states for all interactive elements.
- **Dark Mode First**: All components must be fully compatible with dark mode, using Slate color palette.

## 2. Layout & Backgrounds

### Page Container

Authentication and landing pages should use a rich radial gradient background that adapts to dark mode.

```jsx
<div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black p-4 py-8 transition-colors duration-300">
  {/* Content */}
</div>
```

### Main Card (Glassmorphism)

The primary content container (forms, dashboards) should use a glassmorphism effect with a large shadow and rounded corners.

```jsx
<Card className="w-full max-w-4xl animate-slide-up shadow-2xl shadow-blue-900/5 dark:shadow-blue-900/20 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden">
  {/* Card Content */}
</Card>
```

## 3. Typography

### Headings

- **Font**: Inter (default sans).
- **Page Title**: `text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent`
- **Section Headers**: `text-xl font-semibold tracking-tight text-foreground`

### Body Text

- **Default**: `text-sm text-foreground`
- **Muted/Description**: `text-sm text-muted-foreground`

## 4. Components & Interactive Elements

### Buttons

Primary buttons should include a subtle scale effect on hover and active states.

```jsx
<Button
  className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
  disabled={loading}
>
  {loading ? <ButtonSpinner /> : 'Action Label'}
</Button>
```

### Input Fields (Modern Filled Look)

Inputs use a custom SCSS class `.input-transition` to provide a "filled" appearance that lifts on hover/focus.

**SCSS Definition (add to component style.scss or global):**

```scss
.input-transition {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;

  &:hover {
    background-color: #ffffff;
    border-color: #94a3b8;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  &:focus {
    background-color: #ffffff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
    transform: translateY(-1px);
  }
}

:global(.dark) .input-transition {
  background-color: rgba(30, 41, 59, 0.5);
  border-color: rgba(51, 65, 85, 0.6);
  color: white;

  &:hover {
    background-color: rgba(30, 41, 59, 0.8);
    border-color: #64748b;
  }

  &:focus {
    background-color: rgba(15, 23, 42, 1);
    border-color: #3b82f6;
  }
}
```

**Usage:**

```jsx
<Input className="input-transition" {...props} />
```

### Form Labels

Labels should be semibold and clearly associated with their inputs.

```jsx
<FormLabel className="font-semibold">
  Label Text <span className="text-destructive">*</span>
</FormLabel>
```

### Section Headers (Icon + Text)

For multi-step forms or segmented content, use icon-based headers.

```jsx
<div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-primary shadow-sm">
    <IconName className="h-6 w-6" />
  </div>
  <div>
    <h3 className="text-xl font-semibold tracking-tight text-foreground">Section Title</h3>
    <p className="text-sm text-muted-foreground">Helper text for this section</p>
  </div>
</div>
```

## 5. Animations

Use utility classes to add polish to entering elements.

- **Fade In**: `animate-fade-in`
- **Slide Up**: `animate-slide-up` (useful for cards/modals)
- **Scale In**: `animate-scale-in` (useful for success states/icons)
- **Shake**: `animate-shake` (for errors)

## 6. Iconography

Use `lucide-react` for all icons.

- **Standard Size**: `h-4 w-4` (buttons/small inputs), `h-5 w-5` (standard), `h-6 w-6` (section headers).
- **Stroke**: Default.

## 7. Implementation Checklist

When creating or refactoring a page:

1.  [ ] Wrap page in the **Radial Gradient Container**.
2.  [ ] Use the **Glassmorphism Card** for main content.
3.  [ ] Apply `.input-transition` class to all inputs/selects.
4.  [ ] Ensure **Dark Mode** contrast is sufficient (test with `dark` class).
5.  [ ] Add **Micro-interactions** (hover scale, focus rings).
6.  [ ] Use **Skeleton Loaders** (`<SkeletonCard />`) for initial data fetching states.

## 8. Technology Stack & Dependencies

### Core Frameworks

- **Frontend Library**: React (v18+)
- **Build Tool**: Vite (Migration from CRA)
- **State Management**: Redux Toolkit (Slices, Thunks)
- **Routing**: React Router Dom (v6)

### UI & Styling

- **Styling Engine**: Tailwind CSS (v3.4+)
- **Component Primitives**: Radix UI (via Shadcn/UI patterns)
- **Icons**: Lucide React (Preferred), FontAwesome (Legacy support)
- **CSS Preprocessor**: SASS/SCSS (for legacy styles & complex animations)
- **UI Components**:
  - `@radix-ui/*`: Accessible primitives for dialogs, dropdowns, etc.
  - `react-select`: Advanced select inputs.
  - `react-datepicker`: Date selection.
  - `sonner`: Modern toast notifications.

### Form Handling & Validation

- **Form Library**: React Hook Form (v7+)
- **Validation**: Zod (Schema-based validation)
- **Legacy Support**: Formik + Yup (Do not use for new features)

### Utilities

- **HTTP Client**: Axios
- **Date Formatting**: Day.js (Preferred), Date-fns (Legacy)
- **Charts**: ApexCharts, Chart.js
- **PDF Generation**: @react-pdf/renderer, jspdf

### Branding Guidelines

#### Logo Usage

- **Primary Logo**: `assets/images/brand/logo.png`
- Ensure adequate whitespace around the logo.
- Use the transparent version on colored backgrounds.

#### Color Palette

The application uses a primary Blue/Teal theme.

| Color Name       | Hex Code  | Usage                                |
| :--------------- | :-------- | :----------------------------------- |
| **Primary Blue** | `#2064d8` | Main actions, Headers, Active states |
| **Hover Blue**   | `#21d8aa` | Hover states for primary buttons     |
| **Success**      | `#1bc852` | Success badges, Completed steps      |
| **Danger**       | `#f83245` | Error messages, Delete actions       |
| **Warning**      | `#fe7c18` | Alerts, Partially paid statuses      |
| **Background**   | `#f8fafc` | Page background (Light mode)         |
| **Surface**      | `#ffffff` | Card backgrounds                     |

#### Typography

- **Font Family**: Inter (System sans-serif stack as fallback).
- **Weights**:
  - Regular (400): Body text.
  - Medium (500): Navigation, Buttons.
  - Semibold (600): Section headers, Labels.
  - Bold (700): Page titles, Important numbers.
