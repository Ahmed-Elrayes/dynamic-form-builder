# Dynamic Form Builder - Helper Text Feature

## Overview
The Dynamic Form Builder has been enhanced to support helper text for form inputs. Helper text provides additional information or guidance to users about how to complete a form field.

## Implementation Details
A new feature has been added to the `dynamic-form-builder.js` class that allows you to specify helper text for any form field. The helper text will appear below the input field with appropriate styling.

## Installation
```npm
npm i @elrayes/dynamic-form-builder
```


## How to Use

When configuring your form fields, you can now include a `helper` property in the field configuration object:

```javascript
import { DynamicForm, ThemeManager } from '@elrayes/dynamic-form-builder';
window.DynamicForm = DynamicForm;
window.ThemeManager = ThemeManager;

const formConfig = [
    {
        type: 'text',
        name: 'username',
        label: 'Username',
        required: true,
        placeholder: 'Enter your username',
        helper: 'Username must be between 3-20 characters and contain only letters and numbers'
    },
    // Other form fields...
];
```

## Example

See `example-helper-text-usage.js` for a complete example of how to use the helper text feature with various input types.

## Styling

The helper text is styled using Bootstrap classes:
- `form-text` - Base Bootstrap class for form helper text
- `text-muted` - Makes the text appear in a muted color
- `small` - Reduces the font size
- `mt-1` - Adds a small top margin

## HTML Structure

For each form field with a helper property, the following HTML structure is generated:

```html
<div class="mb-3">
    <label class="form-label">Field Label</label>
    <input class="form-control" ... />
    <div class="invalid-feedback"></div>
    <div class="form-text text-muted small mt-1">Helper text goes here</div>
</div>
```

## Compatibility

This feature works with all input types supported by the Dynamic Form Builder:
- Text inputs
- Textareas
- Select dropdowns
- Checkboxes
- Radio buttons
- File inputs
- CKEditor fields
- Select2 fields

## TypeScript Support

The Dynamic Form Builder now includes TypeScript support for better type checking and IDE assistance. The following files have been converted to TypeScript:

- `types.ts`: Contains common type definitions used across the project
- `themes/Theme.ts`: Base theme class that defines the interface for all themes
- `themes/ThemeManager.ts`: Manages theme registration and retrieval
- `themes/Bootstrap5Theme.ts`: Bootstrap 5.2 theme implementation
- `themes/TailwindTheme.ts`: Tailwind CSS theme implementation

For the main `dynamic-form-builder.js` file, a TypeScript declaration file (`dynamic-form-builder.d.ts`) has been created to provide type definitions without changing the original JavaScript file.

### Using with TypeScript

To use the library in a TypeScript project, you can import the classes and types as follows:

```typescript
import DynamicForm from './dynamic-form-builder/dynamic-form-builder.js';
import ThemeManager from './dynamic-form-builder/themes/ThemeManager.js';
import { FieldConfig, DynamicFormOptions } from './dynamic-form-builder/types.js';

// Define your form configuration
const config: FieldConfig[] = [
  {
    label: 'Name',
    name: 'name',
    type: 'text',
    required: true,
    placeholder: 'Enter your name',
    helper: 'Please enter your full name'
  },
  // More fields...
  {
    type: 'submit',
    label: 'Submit'
  }
];

// Create a new form
const form = new DynamicForm({
  config,
  onSubmit: async (formData, form) => {
    // Handle form submission
    console.log('Form submitted!');
  }
});
```

### Compiling TypeScript

A `tsconfig.json` file has been included to configure TypeScript compilation. To compile the TypeScript files to JavaScript, you can use the TypeScript compiler:

```bash
# Navigate to the dynamic-form-builder directory
cd resources/js/dynamic-form-builder

# Compile TypeScript files
tsc
```

Alternatively, you can compile specific files:

```bash
tsc --project resources/js/dynamic-form-builder/tsconfig.json
```

This will generate JavaScript files with the same names but with `.js` extensions in the `dist` directory. You can modify the `tsconfig.json` file to change the output directory or other compilation options.
