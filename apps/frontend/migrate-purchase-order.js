const fs = require('fs');
const path = require('path');

/**
 * Migration script for purchase_order screens from Formik/Yup to React Hook Form/Zod
 * Converts class components to functional components with hooks
 */

function migratePurchaseOrderFile(filePath) {
  console.log(`\nMigrating: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Step 1: Update imports
  content = content.replace(
    /import\s+{\s*Formik,\s*Field\s*}\s+from\s+['"]formik['"];?/g,
    "import { useForm, Controller } from 'react-hook-form';"
  );

  content = content.replace(
    /import\s+\*\s+as\s+Yup\s+from\s+['"]yup['"];?/g,
    "import { zodResolver } from '@hookform/resolvers/zod';\nimport { z } from 'zod';"
  );

  // Add React hooks import if needed
  if (!content.includes('import React, { useState, useEffect')) {
    content = content.replace(
      /import React from ['"]react['"];/,
      "import React, { useState, useEffect, useRef, useCallback } from 'react';"
    );
  }

  // Step 2: Convert class component to functional component
  const classMatch = content.match(/class\s+(\w+)\s+extends\s+React\.Component\s*{/);

  if (classMatch) {
    const componentName = classMatch[1];
    console.log(`  Converting class component: ${componentName}`);

    // Extract mapStateToProps and mapDispatchToProps
    const mapStateMatch = content.match(/const mapStateToProps[\s\S]*?};/);
    const mapDispatchMatch = content.match(/const mapDispatchToProps[\s\S]*?};/);

    // Find the constructor and extract initial state
    const constructorMatch = content.match(/constructor\(props\)\s*{[\s\S]*?this\.state\s*=\s*{([\s\S]*?)};/);

    // Find the render method
    const renderMatch = content.match(/render\(\)\s*{([\s\S]*?)return\s*\(([\s\S]*?)\);[\s\S]*?}[\s\S]*?export\s+default/);

    if (renderMatch) {
      const renderBody = renderMatch[1];
      const jsx = renderMatch[2];

      // Build the functional component
      let functionalComponent = `\nconst ${componentName} = ({\n`;

      // Add props from mapDispatchToProps
      if (mapDispatchMatch) {
        const dispatchProps = mapDispatchMatch[0].match(/(\w+Actions|\w+):/g) || [];
        functionalComponent += dispatchProps.map(prop => `  ${prop.replace(':', ',')}`).join('\n');
      }

      // Add props from mapStateToProps
      if (mapStateMatch) {
        const statePropsMatch = mapStateMatch[0].match(/(\w+_list|\w+List|\w+):\s*state\./g) || [];
        const stateProps = statePropsMatch.map(prop => prop.split(':')[0].trim());
        functionalComponent += stateProps.map(prop => `  ${prop},`).join('\n');
      }

      functionalComponent += `  history,\n  location,\n}) => {\n`;

      // Convert state to useState hooks
      if (constructorMatch) {
        const stateContent = constructorMatch[1];
        const stateLines = stateContent.split(',\n').map(line => line.trim()).filter(Boolean);

        stateLines.forEach(line => {
          const match = line.match(/(\w+):\s*(.+)/);
          if (match) {
            const [, key, value] = match;
            functionalComponent += `  const [${key}, set${key.charAt(0).toUpperCase() + key.slice(1)}] = useState(${value.replace(/,$/, '')});\n`;
          }
        });
      }

      functionalComponent += `\n  // Form setup with React Hook Form\n`;
      functionalComponent += `  const form = useForm({\n`;
      functionalComponent += `    resolver: zodResolver(createPurchaseOrderSchema),\n`;
      functionalComponent += `    defaultValues: {\n`;
      functionalComponent += `      // Add default values here\n`;
      functionalComponent += `    },\n`;
      functionalComponent += `    mode: 'onChange',\n`;
      functionalComponent += `  });\n\n`;
      functionalComponent += `  const { control, handleSubmit, formState: { errors }, reset, setValue, watch, setError, clearErrors } = form;\n\n`;

      // Add useEffect for componentDidMount
      functionalComponent += `  useEffect(() => {\n`;
      functionalComponent += `    // Component mount logic\n`;
      functionalComponent += `  }, []);\n\n`;

      // Add the return statement with JSX
      functionalComponent += `  return (\n${jsx}\n  );\n};\n\n`;

      // Replace the class with functional component
      const classPattern = new RegExp(`class\\s+${componentName}\\s+extends\\s+React\\.Component\\s*{[\\s\\S]*?}(?=\\s*export)`, 'g');
      content = content.replace(classPattern, functionalComponent);
    }
  }

  // Step 3: Convert Formik to React Hook Form patterns
  content = content.replace(
    /<Formik[\s\S]*?initialValues={(\w+)}[\s\S]*?validationSchema={Yup\.object\(\)\.shape\(([\s\S]*?)\)\s*}[\s\S]*?onSubmit={([\s\S]*?)}[\s\S]*?>\s*{(\w+)\s*=>\s*\(/g,
    (match, initVal, schema, onSubmit, propsName) => {
      return `<form onSubmit={handleSubmit(onSubmit)}>\n  {/* Form fields */}\n  (`;
    }
  );

  // Step 4: Convert Field components to Controller
  content = content.replace(
    /<Field[\s\S]*?name=["']([^"']+)["'][\s\S]*?render={[\s\S]*?field[\s\S]*?form[\s\S]*?=>[\s\S]*?\(/g,
    (match, fieldName) => {
      return `<Controller\n  name="${fieldName}"\n  control={control}\n  render={({ field }) => (`;
    }
  );

  // Step 5: Update form references
  content = content.replace(/props\.setFieldValue/g, 'setValue');
  content = content.replace(/props\.values/g, 'watch()');
  content = content.replace(/props\.errors/g, 'errors');
  content = content.replace(/props\.touched/g, '{}');
  content = content.replace(/this\.formRef\.current\.setFieldValue/g, 'setValue');
  content = content.replace(/this\.formRef\.current\.values/g, 'watch()');

  // Step 6: Convert this.state references to state variables
  content = content.replace(/this\.state\.(\w+)/g, (match, stateVar) => stateVar);
  content = content.replace(/this\.setState\(\{[\s\S]*?(\w+):\s*([^,}]+)[\s\S]*?\}\)/g, (match, key, value) => {
    const setter = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
    return `${setter}(${value})`;
  });

  // Step 7: Convert this.props to direct props
  content = content.replace(/this\.props\.(\w+)/g, (match, prop) => prop);

  // Step 8: Remove </Formik> and </Form> closing tags and replace with form
  content = content.replace(/<\/Formik>/g, '</form>');

  // Only write if content changed significantly
  if (content !== originalContent) {
    const newFilePath = filePath.replace('.js', '.jsx');
    fs.writeFileSync(newFilePath, content, 'utf8');
    console.log(`  ✓ Migrated to: ${newFilePath}`);
    return true;
  } else {
    console.log(`  ⚠ No significant changes made`);
    return false;
  }
}

// Main execution
const files = [
  'src/screens/purchase_order/screens/create/screen.js',
  'src/screens/purchase_order/screens/detail/screen.js',
  'src/screens/purchase_order/screens/view/screen.js',
];

console.log('='.repeat(60));
console.log('Purchase Order Migration Script');
console.log('Formik/Yup → React Hook Form/Zod');
console.log('='.repeat(60));

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      migratePurchaseOrderFile(filePath);
    } catch (error) {
      console.error(`  ✗ Error migrating ${file}:`, error.message);
    }
  } else {
    console.log(`  ⚠ File not found: ${filePath}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log('Migration Complete!');
console.log('Please review the generated .jsx files and make manual adjustments as needed.');
console.log('='.repeat(60));
