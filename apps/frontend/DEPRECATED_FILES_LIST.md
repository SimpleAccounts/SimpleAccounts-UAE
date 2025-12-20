# Deprecated Files List
**Files Ready for Removal After Testing**

These files have been replaced by their `.jsx` counterparts and are no longer in use.
They can be safely removed after thorough testing of the new React Hook Form/Zod implementations.

## Designation Screens
```bash
# Old Formik/Yup files (deprecated)
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/designation/screens/create/screen.js
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/designation/screens/detail/screen.js
```

## Employment Screens
```bash
# Old Formik/Yup files (deprecated)
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/employment/screens/create/screen.js
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/employment/screens/detail/screen.js
```

## Employee Bank Details Screens
```bash
# Old Formik/Yup files (deprecated)
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/employee_Bank_Details/screens/create/screen.js
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/employee_Bank_Details/screens/detail/screen.js
```

## Currency Convert Screens
```bash
# Old Formik/Yup files (deprecated)
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/currencyConvert/screens/create/screen.js
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/currencyConvert/screens/detail/screen.js
```

## VAT Code Screens
```bash
# Old Formik/Yup files (deprecated)
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/vat_code/screens/create/screen.js
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/vat_code/screens/detail/screen.js
```

## Product Category Screens
```bash
# Old Formik/Yup files (deprecated)
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/product_category/screens/create/screen.js
rm /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend/src/screens/product_category/screens/detail/screen.js
```

## Removal Script
To remove all deprecated files at once (run after thorough testing):

```bash
#!/bin/bash
# Remove all deprecated Formik/Yup screen.js files

cd /Users/moshinhashmi/github/SimpleAccounts-UAE/apps/frontend

# Designation
rm src/screens/designation/screens/create/screen.js
rm src/screens/designation/screens/detail/screen.js

# Employment
rm src/screens/employment/screens/create/screen.js
rm src/screens/employment/screens/detail/screen.js

# Employee Bank Details
rm src/screens/employee_Bank_Details/screens/create/screen.js
rm src/screens/employee_Bank_Details/screens/detail/screen.js

# Currency Convert
rm src/screens/currencyConvert/screens/create/screen.js
rm src/screens/currencyConvert/screens/detail/screen.js

# VAT Code
rm src/screens/vat_code/screens/create/screen.js
rm src/screens/vat_code/screens/detail/screen.js

# Product Category
rm src/screens/product_category/screens/create/screen.js
rm src/screens/product_category/screens/detail/screen.js

echo "All deprecated screen.js files removed successfully!"
```

## Important Notes

1. **Before Removal**: Ensure all tests pass and application works as expected
2. **Testing Period**: Recommended to keep old files for at least one release cycle
3. **Backup**: Consider creating a backup branch before removing files
4. **Git History**: Files will still be available in git history if needed

## Total Files to Remove
- **12 files** (2 per screen directory)
- All are `.js` files containing Formik/Yup code
- All have been replaced by `.jsx` files with React Hook Form/Zod

