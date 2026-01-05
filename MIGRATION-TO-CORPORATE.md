# Migration from Neumorphic to Corporate Theme

## What Changed?

We've transitioned from a **neumorphic (soft UI)** design to a **minimal corporate** design system. This change provides:

✅ Better readability for financial data
✅ More professional appearance
✅ Cleaner, modern look
✅ Easier maintenance
✅ Better accessibility
✅ Follows industry best practices (Stripe, Linear, OpenAI)

---

## Files Updated

### Core Theme Files

1. **`apps/frontend/src/index.css`** ✅
   - Replaced neumorphic CSS variables with corporate ones
   - Added shadcn/ui compatible variables
   - Created utility classes (`.corp-*`)

2. **`apps/frontend/tailwind.config.js`** ✅
   - Removed neumorphic shadow utilities
   - Added corporate color system
   - Simplified shadow system

3. **`DESIGN-GUIDE.md`** ✅ NEW
   - Complete corporate design system documentation
   - Component examples and code snippets
   - Migration patterns

4. **`CLAUDE.md`** ✅
   - Updated to reference corporate design
   - Quick reference for developers

---

## Migration Steps for Developers

### Step 1: Review New Design System

Read the **[DESIGN-GUIDE.md](./DESIGN-GUIDE.md)** to understand:

- New color palette
- Component patterns
- Best practices

### Step 2: Update Components Gradually

You don't need to update everything at once. Migrate components as you work on them:

#### Before (Neumorphic)

```jsx
<div
  className="rounded-2xl p-6"
  style={{
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff',
  }}
>
  <h3 style={{ color: 'var(--neu-text-primary)' }}>Invoice Details</h3>
  <button
    className="px-4 py-2 rounded-xl"
    style={{
      background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
      boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
    }}
  >
    Save
  </button>
</div>
```

#### After (Corporate)

```jsx
<div className="corp-card p-6">
  <h3 className="text-lg font-semibold text-corp-text-primary">Invoice Details</h3>
  <button className="corp-btn-primary">Save</button>
</div>
```

### Step 3: Use Find & Replace

Quick patterns to speed up migration:

#### Backgrounds

```bash
Find:    style={{ background: 'var(--neu-bg'
Replace: className="bg-white
```

```bash
Find:    bg-neu-bg
Replace: bg-white
```

#### Text Colors

```bash
Find:    var(--neu-text-primary)
Replace: var(--corp-text-primary)
```

```bash
Find:    var(--neu-text-secondary)
Replace: var(--corp-text-secondary)
```

#### Shadows (remove dual shadows)

```bash
Find:    boxShadow: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff'
Replace: className="shadow-corp-md"
```

#### Border Radius

```bash
Find:    rounded-2xl
Replace: rounded-lg
```

```bash
Find:    rounded-xl
Replace: rounded-md
```

---

## Common Component Migrations

### Cards

#### Before

```jsx
<div
  className="rounded-2xl p-6"
  style={{
    background: 'var(--neu-bg)',
    boxShadow: 'var(--neu-shadow-raised)',
  }}
>
  Content
</div>
```

#### After

```jsx
<div className="corp-card p-6">Content</div>
```

---

### Buttons

#### Before (Primary)

```jsx
<button
  className="px-4 py-2 rounded-xl text-white"
  style={{
    background: 'linear-gradient(145deg, #2064d8, #1a4fa8)',
    boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
  }}
>
  Save
</button>
```

#### After (Primary)

```jsx
<button className="corp-btn-primary">Save</button>
```

#### Before (Secondary)

```jsx
<button
  className="px-4 py-2 rounded-xl"
  style={{
    background: 'var(--neu-bg)',
    boxShadow: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
  }}
>
  Cancel
</button>
```

#### After (Secondary)

```jsx
<button className="corp-btn">Cancel</button>
```

---

### Inputs

#### Before

```jsx
<input
  className="px-4 py-2 rounded-xl border-0"
  style={{
    background: 'var(--neu-bg)',
    boxShadow: 'inset 2px 2px 4px #c4c9cf, inset -2px -2px 4px #ffffff',
    color: 'var(--neu-text-primary)',
  }}
  placeholder="Enter value..."
/>
```

#### After

```jsx
<input className="corp-input w-full" placeholder="Enter value..." />
```

---

### Tables

#### Before

```jsx
<div
  className="rounded-2xl overflow-hidden"
  style={{
    background: 'var(--neu-bg)',
    boxShadow: 'var(--neu-shadow-raised)',
  }}
>
  <table className="w-full">
    <thead style={{ background: 'rgba(32, 100, 216, 0.05)' }}>
      <th style={{ color: 'var(--neu-text-primary)' }}>Name</th>
    </thead>
    <tbody>
      <td style={{ color: 'var(--neu-text-secondary)' }}>John</td>
    </tbody>
  </table>
</div>
```

#### After

```jsx
<table className="corp-table">
  <thead>
    <th>Name</th>
  </thead>
  <tbody>
    <tr>
      <td>John</td>
    </tr>
  </tbody>
</table>
```

---

### Page Layout

#### Before

```jsx
<div className="min-h-screen p-6" style={{ background: 'var(--neu-bg, #e8eef5)' }}>
  {/* Content */}
</div>
```

#### After

```jsx
<div className="min-h-screen p-6 bg-corp-bg-secondary">{/* Content */}</div>
```

---

## CSS Variables Migration Table

| Old Neumorphic           | New Corporate           | Usage            |
| ------------------------ | ----------------------- | ---------------- |
| `--neu-bg`               | `--corp-bg-primary`     | Main backgrounds |
| `--neu-bg-alt`           | `--corp-bg-secondary`   | Subtle contrast  |
| `--neu-primary`          | `--corp-primary`        | Primary actions  |
| `--neu-secondary`        | `--corp-secondary`      | Success states   |
| `--neu-warning`          | `--corp-warning`        | Warnings         |
| `--neu-danger`           | `--corp-danger`         | Errors           |
| `--neu-text-primary`     | `--corp-text-primary`   | Headings         |
| `--neu-text-secondary`   | `--corp-text-secondary` | Body text        |
| `--neu-text-muted`       | `--corp-text-muted`     | Hints            |
| `--neu-shadow-raised`    | `--corp-shadow-md`      | Default shadow   |
| `--neu-shadow-raised-sm` | `--corp-shadow-sm`      | Small shadow     |
| `--neu-shadow-raised-lg` | `--corp-shadow-lg`      | Large shadow     |

---

## Tailwind Class Migration

| Old Neumorphic          | New Corporate                     | Purpose          |
| ----------------------- | --------------------------------- | ---------------- |
| `bg-neu-bg`             | `bg-white`                        | White background |
| `shadow-neu-raised`     | `shadow-corp-md`                  | Default shadow   |
| `shadow-neu-raised-sm`  | `shadow-corp-sm`                  | Small shadow     |
| `shadow-neu-pressed`    | `border border-corp-border-light` | Input styling    |
| `rounded-2xl`           | `rounded-lg`                      | Large radius     |
| `rounded-xl`            | `rounded-md`                      | Medium radius    |
| `text-neu-text-primary` | `text-corp-text-primary`          | Primary text     |

---

## Utility Classes Reference

### New Corporate Utility Classes

```css
/* Backgrounds */
.corp-bg              → White background
.corp-bg-secondary    → Light gray background
.corp-bg-tertiary     → Deeper gray background

/* Text */
.corp-text-primary    → Dark text (headings)
.corp-text-secondary  → Medium text (body)
.corp-text-muted      → Light text (hints)

/* Components */
.corp-card            → Card with border and shadow
.corp-btn             → Secondary button
.corp-btn-primary     → Primary button (blue)
.corp-input           → Input field with border
.corp-table           → Styled table
.corp-badge           → Badge/pill base
.corp-badge-success   → Green badge
.corp-badge-warning   → Amber badge
.corp-badge-danger    → Red badge
.corp-divider         → Horizontal divider
```

---

## FAQ

### Q: Do I need to update all components immediately?

**A:** No! Migrate components gradually as you work on them. Both systems can coexist during the transition.

### Q: What if I prefer neumorphic design?

**A:** The team has decided on corporate design for better professionalism and readability in accounting software. Please follow the new design system for consistency.

### Q: Can I still use inline styles?

**A:** Prefer utility classes (`.corp-*`) for consistency. Use inline styles only when necessary.

### Q: Where can I see examples?

**A:** Check **[DESIGN-GUIDE.md](./DESIGN-GUIDE.md)** for comprehensive examples and component patterns.

### Q: What about dark mode?

**A:** Dark mode variables are already configured. The corporate theme supports dark mode out of the box.

---

## Testing Your Migration

After migrating a component:

1. **Visual Check** - Does it look clean and professional?
2. **Contrast Check** - Is text readable? (WCAG AA compliance)
3. **Hover States** - Do interactive elements respond smoothly?
4. **Consistency** - Does it match other migrated components?
5. **Mobile** - Does it work on smaller screens?

---

## Need Help?

- 📖 **Full Documentation**: [DESIGN-GUIDE.md](./DESIGN-GUIDE.md)
- 📝 **Quick Reference**: [CLAUDE.md](./CLAUDE.md) - Corporate Design System section
- 🎨 **shadcn/ui Components**: https://ui.shadcn.com/

---

## Summary

**Old Theme (Neumorphic):**

- Soft gray background (#e8eef5)
- Dual shadows (light + dark)
- Rounded corners (12-24px)
- Muted, subtle appearance

**New Theme (Corporate):**

- White/light backgrounds (#ffffff, #f8f9fa)
- Clean borders + subtle shadows
- Professional appearance
- Better readability for data
- Modern SaaS aesthetic

This migration improves the professional appearance of SimpleAccounts UAE while maintaining brand consistency (keeping the #2064d8 blue for primary actions).
