/**
 * Simple test for dynamic-form-builder
 * This test verifies that the package files have the expected content
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  // Check if index.js contains expected exports
  const indexPath = path.join(__dirname, '../dist/index.js');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  if (!indexContent.includes('export { default as DynamicForm }')) {
    console.error('Error: DynamicForm export not found in index.js!');
    process.exit(1);
  }

  if (!indexContent.includes('export { default as ThemeManager }')) {
    console.error('Error: ThemeManager export not found in index.js!');
    process.exit(1);
  }

  // Check if dynamic-form-builder.js exists and contains the class definition
  const dfbPath = path.join(__dirname, '../dist/dynamic-form-builder.js');
  const dfbContent = fs.readFileSync(dfbPath, 'utf8');

  if (!dfbContent.includes('class DynamicForm')) {
    console.error('Error: DynamicForm class not found in dynamic-form-builder.js!');
    process.exit(1);
  }

  // Check if ThemeManager.js exists in themes directory
  const tmPath = path.join(__dirname, '../dist/themes/ThemeManager.js');
  const tmContent = fs.readFileSync(tmPath, 'utf8');

  if (!tmContent.includes('ThemeManager')) {
    console.error('Error: ThemeManager not found in ThemeManager.js!');
    process.exit(1);
  }

  console.log('Package content verification successful!');
} catch (error) {
  console.error('Error verifying package content:', error);
  process.exit(1);
}
