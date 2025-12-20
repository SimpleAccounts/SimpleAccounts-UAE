# Purchase Order Migration Testing Notes

## Quick Test Commands

### Start the development server

```bash
npm run dev
```

### Navigate to Purchase Order screens

1. Create: http://localhost:5173/admin/expense/purchase-order/create
2. View List: http://localhost:5173/admin/expense/purchase-order
3. Edit: Click edit on any PO from the list
4. View: Click view on any PO from the list

## Critical Test Scenarios

### 1. Create Purchase Order

- [ ] Form loads without errors
- [ ] PO number is auto-generated
- [ ] Can select supplier
- [ ] Can select RFQ (optional)
- [ ] Can add products to table
- [ ] Can remove products from table
- [ ] Calculations work correctly:
  - [ ] Line item subtotals
  - [ ] Total net amount
  - [ ] VAT calculations
  - [ ] Excise tax
  - [ ] Discounts
  - [ ] Grand total
- [ ] Validation errors show correctly
- [ ] Can upload attachments
- [ ] Create button creates PO
- [ ] Redirects to list after creation

### 2. Edit Purchase Order

- [ ] Existing PO loads correctly
- [ ] All fields populate with existing data
- [ ] Can modify fields
- [ ] Calculations update on changes
- [ ] Update button saves changes
- [ ] Validation works on edit

### 3. View Purchase Order

- [ ] PO details display correctly
- [ ] PDF export works
- [ ] Print function works
- [ ] GRN list shows (if applicable)

## Console Error Checks

Open browser console (F12) and check for:

- ❌ No import errors
- ❌ No undefined variable errors
- ❌ No validation schema errors
- ❌ No React Hook errors

## Common Issues to Watch For

1. **Field mapping issues**: GRN fields may not perfectly map to PO fields
2. **API endpoint differences**: createGRN vs createPO
3. **State management**: useEffect dependencies may need adjustment
4. **Validation**: Zod schema may need refinement for PO-specific rules

## If Issues Occur

1. Check browser console for errors
2. Verify API responses in Network tab
3. Compare with original .js.backup files
4. Review field name mappings in the migration

## Rollback if Needed

```bash
cd src/screens/purchase_order/screens/create
mv screen.jsx screen.jsx.broken
mv screen.js.backup screen.js
# Edit index.js to import from './screen' instead of './screen.jsx'
```
