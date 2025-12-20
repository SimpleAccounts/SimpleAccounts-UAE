#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Automated Migration Script for Supplier Invoice screens
 * Converts Formik/Yup class components to React Hook Form/Zod functional components
 */

const createScreenPath = path.join(__dirname, 'src/screens/supplier_invoice/screens/create/screen.js');
const detailScreenPath = path.join(__dirname, 'src/screens/supplier_invoice/screens/detail/screen.js');

function migrateFile(inputPath, outputPath) {
  console.log(`\nMigrating: ${path.basename(inputPath)}`);

  let content = fs.readFileSync(inputPath, 'utf8');

  // Step 1: Update imports
  content = content.replace(
    /import\s+{\s*Formik,\s*Field\s*}\s+from\s+['"]formik['"]/g,
    "import { useForm, Controller } from 'react-hook-form'"
  );

  content = content.replace(
    /import\s+\*\s+as\s+Yup\s+from\s+['"]yup['"]/g,
    "import { zodResolver } from '@hookform/resolvers/zod';\nimport { z } from 'zod'"
  );

  // Add React hooks if not present
  if (!content.includes('useState') && content.includes('React.Component')) {
    content = content.replace(
      /import\s+React\s+from\s+['"]react['"]/,
      "import React, { useState, useEffect, useCallback, useRef } from 'react'"
    );
  }

  // Step 2: Convert class component to functional component
  // Find class declaration
  const classMatch = content.match(/class\s+(\w+)\s+extends\s+React\.Component\s*{/);
  if (classMatch) {
    const className = classMatch[1];

    // Extract constructor state to identify useState hooks needed
    const constructorMatch = content.match(/constructor\(props\)\s*{[\s\S]*?this\.state\s*=\s*{([\s\S]*?)};/);

    // Convert class to const function component
    content = content.replace(
      /class\s+(\w+)\s+extends\s+React\.Component\s*{/,
      `const ${className} = ({\n  supplierInvoiceActions,\n  customerInvoiceActions,\n  ProductActions,\n  supplierInvoiceCreateActions,\n  currencyConvertActions,\n  commonActions,\n  history,\n  location,\n  contact_list,\n  currency_list,\n  tax_treatment_list,\n  vat_list,\n  excise_list,\n  product_list,\n  supplier_list,\n  country_list,\n  product_category_list,\n  universal_currency_list,\n  currency_convert_list,\n}) => {`
    );

    // Remove constructor
    content = content.replace(/constructor\(props\)\s*{[\s\S]*?this\.state\s*=\s*{[\s\S]*?};\s*(?:this\.\w+\s*=\s*[^;]+;\s*)*}/m, '');

    // Remove componentDidMount, componentDidUpdate, etc. - will be converted to useEffect
    content = content.replace(/componentDidMount\s*\(\)\s*{/g, 'useEffect(() => {');
    content = content.replace(/componentDidUpdate\s*\([^)]*\)\s*{/g, 'useEffect(() => {');

    // Remove render method wrapper
    content = content.replace(/render\s*\(\)\s*{\s*const\s*{[^}]*}\s*=\s*this\.props;?/g, '');
    content = content.replace(/render\s*\(\)\s*{/g, '');

    // Remove the closing brace of render and class
    const lines = content.split('\n');
    let braceCount = 0;
    let inRender = false;
    let newLines = [];

    for (let line of lines) {
      newLines.push(line);
    }
    content = newLines.join('\n');

    // Replace this.props with direct prop usage
    content = content.replace(/this\.props\./g, '');

    // Replace this.state with state variables
    content = content.replace(/this\.state\.(\w+)/g, '$1');

    // Replace this.setState calls with setState functions
    const stateVars = new Set();
    const setStateMatches = content.matchAll(/this\.setState\(\s*{\s*(\w+):/g);
    for (const match of setStateMatches) {
      stateVars.add(match[1]);
    }

    // Replace this. method calls with direct calls
    content = content.replace(/this\.(\w+)\(/g, '$1(');

    // Remove 'this.' references
    content = content.replace(/this\./g, '');
  }

  // Step 3: Convert Formik to useForm
  // Replace Formik component with form setup
  content = content.replace(
    /<Formik\s+ref={[^}]+}\s+initialValues={([^}]+)}\s+validationSchema={([^}]+)}\s+validate={([^}]+)}\s+onSubmit={([^}]+)}\s*>/g,
    ''
  );

  content = content.replace(
    /<\/Formik>/g,
    ''
  );

  // Convert Formik render prop pattern
  content = content.replace(
    /{\s*\(?props\)?\s*=>\s*{/g,
    ''
  );

  // Step 4: Convert Yup validation to Zod
  // This is complex and file-specific, so we'll insert a placeholder schema
  const zodSchemaPlaceholder = `
// Zod validation schema - Review and adjust field validations
const supplierInvoiceSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  contactId: z.object({
    value: z.union([z.string(), z.number()]),
    label: z.string(),
  }).nullable().refine((val) => val !== null, 'Supplier is required'),
  term: z.object({
    value: z.string(),
    label: z.string(),
  }).nullable().refine((val) => val !== null, 'Term is required'),
  currencyCode: z.union([z.string(), z.number()]).refine((val) => val !== '' && val !== null, 'Currency is required'),
  invoiceDate: z.union([z.string(), z.date()]).refine((val) => val !== null && val !== '', 'Invoice date is required'),
  invoiceDueDate: z.union([z.string(), z.date()]).optional(),
  lineItemsString: z.array(
    z.object({
      quantity: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, 'Quantity must be greater than 0'),
      unitPrice: z.union([z.string(), z.number()]).refine((val) => Number(val) > 0, 'Unit price must be greater than 0'),
      vatCategoryId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val !== null, 'VAT is required'),
      productId: z.union([z.string(), z.number()]).refine((val) => val !== '' && val !== null, 'Product is required'),
      description: z.string().optional(),
      subTotal: z.union([z.string(), z.number()]).optional(),
      vatAmount: z.union([z.string(), z.number()]).optional(),
      exciseAmount: z.union([z.string(), z.number()]).optional(),
      exciseTaxId: z.union([z.string(), z.number()]).optional(),
      unitType: z.string().optional(),
      unitTypeId: z.union([z.string(), z.number()]).optional(),
      isExciseTaxExclusive: z.boolean().optional(),
    })
  ).min(1, 'At least one invoice line item is required'),
  placeOfSupplyId: z.union([z.string(), z.object({ value: z.string(), label: z.string() })]).optional(),
  exchangeRate: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional(),
  discount: z.union([z.string(), z.number()]).optional(),
  attachmentFile: z.instanceof(File).optional(),
});
`;

  // Insert schema after imports
  const lastImportIndex = content.lastIndexOf('import ');
  const endOfImports = content.indexOf('\n', lastImportIndex);
  content = content.slice(0, endOfImports) + '\n' + zodSchemaPlaceholder + content.slice(endOfImports);

  // Step 5: Add useForm hook initialization
  const useFormInit = `
  // Form initialization
  const form = useForm({
    resolver: zodResolver(supplierInvoiceSchema),
    defaultValues: initValue,
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors }, reset, setValue, watch, trigger } = form;
`;

  // Insert after state declarations
  const stateInitPattern = /const\s+\[\w+,\s*set\w+\]\s*=\s*useState/;
  const firstStateMatch = content.search(stateInitPattern);
  if (firstStateMatch !== -1) {
    const afterFirstState = content.indexOf('\n', firstStateMatch);
    content = content.slice(0, afterFirstState) + '\n' + useFormInit + content.slice(afterFirstState);
  }

  // Step 6: Convert Field components to Controller
  content = content.replace(
    /<Field\s+name="([^"]+)"\s+render={\(\{\s*field,\s*form\s*\}\)\s*=>\s*\(/g,
    '<Controller\n      name="$1"\n      control={control}\n      render={({ field }) => ('
  );

  // Convert form.setFieldValue to setValue
  content = content.replace(/form\.setFieldValue\(/g, 'setValue(');

  // Convert form.values to watch()
  content = content.replace(/form\.values\.(\w+)/g, 'watch("$1")');
  content = content.replace(/formRef\.current\.values/g, 'watch()');

  // Convert form.errors to errors
  content = content.replace(/form\.errors\.(\w+)/g, 'errors.$1');

  // Convert form.touched to just check errors (RHF shows errors after touch)
  content = content.replace(/form\.touched\.(\w+)\s*&&\s*form\.errors\.(\w+)/g, 'errors.$1');

  // Step 7: Update form submission
  content = content.replace(
    /<Form\s+([^>]*)\s+onSubmit={props\.handleSubmit}/g,
    '<Form $1 onSubmit={handleSubmit(onSubmit)}'
  );

  // Convert actions parameter in onSubmit
  content = content.replace(
    /(\w+)\s*=\s*\(values,\s*actions\)\s*=>\s*{/g,
    'const $1 = (formData) => {\n  setDisabled(true);'
  );

  content = content.replace(
    /actions\.setSubmitting\(false\)/g,
    'setDisabled(false)'
  );

  // Step 8: Clean up class-specific patterns
  // Remove export default connect wrapper pattern specific to class components
  // Keep the connect HOC but update the component export

  // Final cleanup
  content = content.replace(/}\s*}\s*export\s+default/g, '};\n\nexport default');

  // Write output
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`✓ Created: ${path.basename(outputPath)}`);
  console.log(`  Review the file and make manual adjustments as needed.`);
}

// Main execution
console.log('Supplier Invoice Automated Migration');
console.log('=====================================\n');

// Migrate create screen
const createOutputPath = createScreenPath.replace('.js', '.jsx');
try {
  migrateFile(createScreenPath, createOutputPath);
} catch (err) {
  console.error(`Error migrating create screen: ${err.message}`);
}

// Migrate detail screen
const detailOutputPath = detailScreenPath.replace('.js', '.jsx');
try {
  migrateFile(detailScreenPath, detailOutputPath);
} catch (err) {
  console.error(`Error migrating detail screen: ${err.message}`);
}

console.log('\n=====================================');
console.log('Migration complete!');
console.log('\nIMPORTANT: Review and test the migrated files:');
console.log(`- ${createOutputPath}`);
console.log(`- ${detailOutputPath}`);
console.log('\nManual review required for:');
console.log('1. Zod schema validations');
console.log('2. useEffect dependencies');
console.log('3. State management logic');
console.log('4. Form submission handlers');
console.log('5. Controller components for selects/datepickers');
console.log('6. Error message displays');
console.log('\nUpdate index.js files after testing.');
