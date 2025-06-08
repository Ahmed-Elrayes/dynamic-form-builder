# Dynamic Form Builder

A flexible and customizable dynamic form builder with theming support for JavaScript applications.

[![npm version](https://img.shields.io/npm/v/@elrayes/dynamic-form-builder.svg)](https://www.npmjs.com/package/@elrayes/dynamic-form-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Dynamic Form Generation**: Create forms dynamically from JavaScript configuration objects
- **Multiple Input Types**: Support for text, textarea, select, checkbox, radio, file uploads, and more
- **Advanced Components**: Integration with Select2 and CKEditor
- **Validation**: Built-in validation with customizable rules and error messages
- **Theming**: Easily switch between Bootstrap 5 and Tailwind CSS themes
- **TypeScript Support**: Full TypeScript definitions for better development experience
- **Modal Support**: Display forms in modal dialogs
- **Helper Text**: Add explanatory text to form fields
- **File Uploads**: Preview images and display file information

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Field Types](#field-types)
- [Validation](#validation)
- [Theming](#theming)
- [Advanced Usage](#advanced-usage)
- [API Reference](#api-reference)
- [TypeScript Support](#typescript-support)
- [Requirements](#requirements)
- [License](#license)

## Installation

### NPM

```bash
npm install @elrayes/dynamic-form-builder
```

### Yarn

```bash
yarn add @elrayes/dynamic-form-builder
```

### Direct Import in Laravel with Vite

In your `bootstrap.js` file:

```javascript
import { DynamicForm, ThemeManager } from '@elrayes/dynamic-form-builder';

// Make DynamicForm and ThemeManager available globally
window.DynamicForm = DynamicForm;
window.ThemeManager = ThemeManager;
```

## Basic Usage

### Creating a Simple Form

```javascript
import { DynamicForm, ThemeManager } from '@elrayes/dynamic-form-builder';

// Define your form configuration
const formConfig = [
  {
    type: 'text',
    name: 'username',
    label: 'Username',
    required: true,
    placeholder: 'Enter your username',
    helper: 'Username must be between 3-20 characters'
  },
  {
    type: 'email',
    name: 'email',
    label: 'Email Address',
    required: true,
    placeholder: 'Enter your email'
  },
  {
    type: 'password',
    name: 'password',
    label: 'Password',
    required: true,
    placeholder: 'Enter your password'
  },
  {
    type: 'submit',
    label: 'Register'
  }
];

// Create a new form
// If mount is not set it will create a modal
const form = new DynamicForm({
  config: formConfig,
  mount: 'form-container', // ID of the element to mount the form to
  onSubmit: async (formData, form) => {
    // Handle form submission
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      console.log('Success:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  }
});
```

### Using in HTML

```html
<div id="form-container"></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const formConfig = [
      // Your form configuration here
    ];

    const form = new DynamicForm({
      config: formConfig,
      mount: 'form-container',
      onSubmit: async (formData, form) => {
        // Handle form submission
      }
    });
  });
</script>
```

## Field Types

The Dynamic Form Builder supports the following field types:

### Basic Input Types

- `text` - Text input
- `email` - Email input
- `password` - Password input
- `number` - Number input
- `tel` - Telephone input
- `url` - URL input
- `date` - Date input
- `color` - Color picker
- `hidden` - Hidden input

### Complex Input Types

- `textarea` - Multiline text input
- `select` - Dropdown select
- `select2` - Enhanced select with jQuery Select2
- `checkbox` - Single checkbox
- `radio` - Radio button group
- `file` - File upload with preview
- `ckeditor` - Rich text editor (requires CKEditor)
- `submit` - Submit button

### Example Configuration

```javascript
const formConfig = [
  // Text input
  {
    type: 'text',
    name: 'name',
    label: 'Full Name',
    required: true,
    placeholder: 'Enter your full name'
  },

  // Select dropdown
  {
    type: 'select',
    name: 'country',
    label: 'Country',
    options: [
      { label: 'United States', value: 'us' },
      { label: 'Canada', value: 'ca' },
      { label: 'United Kingdom', value: 'uk' }
    ],
    required: true
  },

  // Radio buttons
  {
    type: 'radio',
    name: 'gender',
    label: 'Gender',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' }
    ],
    required: true
  },

  // Checkbox
  {
    type: 'checkbox',
    name: 'terms',
    label: 'I agree to the terms and conditions',
    required: true
  },

  // File upload
  {
    type: 'file',
    name: 'profile_picture',
    label: 'Profile Picture',
    accept: 'image/*'
  },

  // Submit button
  {
    type: 'submit',
    label: 'Submit'
  }
];
```

## Validation

The Dynamic Form Builder includes built-in validation for form fields:

```javascript
{
  type: 'text',
  name: 'username',
  label: 'Username',
  required: true,
  validation: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9]+$/,
    patternMsg: 'Username can only contain letters and numbers',
    custom: (value, input, field) => {
      // Custom validation logic
      if (value === 'admin') {
        return 'Username cannot be "admin"';
      }
      return true; // Return true if valid
    }
  }
}
```

## Theming

The Dynamic Form Builder supports multiple themes:

```javascript
// Use Bootstrap 5 theme (default)
const form = new DynamicForm({
  config: formConfig,
  mount: 'form-container',
  theme: 'bootstrap5',
  onSubmit: async (formData, form) => {
    // Handle form submission
  }
});

// Use Tailwind CSS theme
const form = new DynamicForm({
  config: formConfig,
  mount: 'form-container',
  theme: 'tailwind',
  onSubmit: async (formData, form) => {
    // Handle form submission
  }
});

// Register a custom theme
import { ThemeManager } from '@elrayes/dynamic-form-builder';
import MyCustomTheme from './my-custom-theme';

ThemeManager.register('custom', new MyCustomTheme());

const form = new DynamicForm({
  config: formConfig,
  mount: 'form-container',
  theme: 'custom',
  onSubmit: async (formData, form) => {
    // Handle form submission
  }
});
```

## Advanced Usage

### Modal Forms

```javascript
const form = new DynamicForm({
  config: formConfig,
  modalOptions: {
    id: 'myFormModal',
    title: 'User Registration',
    show: true,
    staticBackdrop: true
  },
  onSubmit: async (formData, form) => {
    // Handle form submission
  }
});
```

### Helper Text

```javascript
{
  type: 'password',
  name: 'password',
  label: 'Password',
  required: true,
  helper: 'Password must be at least 8 characters and include a number and special character'
}
```

### Select2 Integration

```javascript
{
  type: 'select2',
  name: 'tags',
  label: 'Tags',
  multiple: true,
  options: [
    { label: 'JavaScript', value: 'js' },
    { label: 'PHP', value: 'php' },
    { label: 'Python', value: 'py' }
  ],
  select2Options: {
    tags: true,
    placeholder: 'Select or create tags',
    allowClear: true
  }
}
```

### CKEditor Integration

```javascript
{
  type: 'ckeditor',
  name: 'content',
  label: 'Article Content',
  required: true
}
```

## API Reference

### DynamicForm
- `mount`: when it is not sent or null, it will create a modal
```typescript
new DynamicForm({
  config: FieldConfig[],
  mount?: string | HTMLElement | null, // if set to null it will create a modal
  modalOptions?: ModalOptions,
  onSubmit: (formData: FormData, form: HTMLFormElement, builder: DynamicForm) => Promise<any> | any,
  onInitialized?: (instance: DynamicForm, form: HTMLFormElement, inputs: Record<string, HTMLElement | HTMLElement[]>) => void,
  theme?: string | Theme,
})
```

#### Methods

- `getForm()`: Returns the form element
- `getData()`: Returns the form configuration
- `getModalInstance()`: Returns the modal instance
- `collectFormInputs()`: Returns a map of field names to input elements
- `clearForm()`: Clears all inputs and validations, effectively reinitializing the form
- `destroy()`: Cleans up resources

### ThemeManager

```typescript
// Get a registered theme
ThemeManager.get(themeName: string): Theme

// Register a new theme
ThemeManager.register(themeName: string, theme: Theme): void

// Get the default theme
ThemeManager.getDefaultTheme(): Theme

// Set the default theme
ThemeManager.setDefaultTheme(themeName: string): void
```

## TypeScript Support

The Dynamic Form Builder includes full TypeScript support:

```typescript
import { DynamicForm, ThemeManager, FieldConfig, DynamicFormOptions } from '@elrayes/dynamic-form-builder';

const config: FieldConfig[] = [
  {
    type: 'text',
    name: 'username',
    label: 'Username',
    required: true
  },
  // More fields...
];

const options: DynamicFormOptions = {
  config,
  mount: document.getElementById('form-container'),
  onSubmit: async (formData, form) => {
    // Handle form submission
  }
};

const form = new DynamicForm(options);
```

## Requirements

- jQuery 3.0+ (for Select2 integration)
- Bootstrap 5 (for default theme)
- CKEditor (optional, for rich text editing)
- Select2 (optional, for enhanced select dropdowns)

## Development

### Building the Package

To build the package, run:

```bash
npm run build
```

This will compile the TypeScript files into JavaScript in the `dist` directory.

### Testing

To run the tests, use:

```bash
npm test
```

The test script performs the following checks:
1. Cleans the dist directory
2. Builds the package using TypeScript compiler
3. Verifies that all expected files are created in the dist directory
4. Checks that the compiled files contain the expected exports and class definitions

This ensures that the package can be built correctly and that the essential components are properly exported.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Ahmed Elrayes - [ahmedwaill63@gmail.com](mailto:ahmedwaill63@gmail.com)

## Repository

[GitHub Repository](https://github.com/Ahmed-Elrayes/dynamic-form-builder)

## Acknowledgments

This package was created with the assistance of:
- [JetBrains AI Assistant](https://www.jetbrains.com/ai/) - AI-powered coding assistant
- [JetBrains Junie](https://www.jetbrains.com/junie/) - AI development assistant
