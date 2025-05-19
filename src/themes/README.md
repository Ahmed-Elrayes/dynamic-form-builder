# Dynamic Form Builder - Theme System

## Overview
The Dynamic Form Builder now supports a flexible theming system that allows you to switch between different CSS frameworks. Currently, the system includes support for:

1. Bootstrap 5.2 (default)
2. Tailwind CSS

This theming system makes it easy to adapt the form builder to match your project's styling requirements without modifying the core functionality.

## How to Use

### Basic Usage
When initializing a DynamicForm, you can specify which theme to use:

```javascript
// Using Bootstrap 5.2 (default)
const form = new DynamicForm({
    config: formConfig,
    mount: 'form-container',
    onSubmit: handleSubmit,
    // No theme specified - will use default (Bootstrap 5.2)
});

// Using Tailwind CSS
const form = new DynamicForm({
    config: formConfig,
    mount: 'form-container',
    onSubmit: handleSubmit,
    theme: 'tailwind' // Specify theme by name
});

// Or using a theme instance directly
const tailwindTheme = new TailwindTheme();
const form = new DynamicForm({
    config: formConfig,
    mount: 'form-container',
    onSubmit: handleSubmit,
    theme: tailwindTheme // Specify theme instance
});
```

### Setting the Default Theme
You can set the default theme for all forms:

```javascript
// Set Tailwind as the default theme for all forms
ThemeManager.setDefaultTheme('tailwind');

// Now all forms will use Tailwind by default
const form = new DynamicForm({
    config: formConfig,
    mount: 'form-container',
    onSubmit: handleSubmit
    // No theme specified - will use Tailwind
});
```

## Creating Custom Themes

You can create your own custom themes by extending the base `Theme` class:

```javascript
import Theme from './Theme';

export default class CustomTheme extends Theme {
    // Implement all required methods
    getFormClasses() {
        return 'my-custom-form-class';
    }

    getLabelClasses() {
        return 'my-custom-label-class';
    }

    // ... implement all other required methods
}
```

Then register your custom theme with the ThemeManager:

```javascript
import CustomTheme from './CustomTheme';

// Register the custom theme
ThemeManager.register('custom', new CustomTheme());

// Use the custom theme
const form = new DynamicForm({
    config: formConfig,
    mount: 'form-container',
    onSubmit: handleSubmit,
    theme: 'custom'
});
```

## Theme Architecture

The theming system consists of:

1. **Theme Interface**: A base class that defines the contract for all themes
2. **Theme Implementations**: Concrete implementations for specific CSS frameworks
3. **ThemeManager**: A utility for registering and retrieving themes

Each theme provides methods that return the appropriate CSS class names for various form elements, such as inputs, labels, buttons, etc.

### Modal Support

Each theme also provides methods for creating and initializing modals:

- `createModal(modalOptions)`: Creates a modal structure and returns an object containing the modal element and modal body element
- `initializeModal(modal, options)`: Initializes the modal and returns an object with methods to control the modal (show, hide, toggle, dispose)

This allows each theme to implement modals in a way that's appropriate for the CSS framework it's based on. For example:

- The Bootstrap theme uses Bootstrap's modal component
- The Tailwind theme implements its own modal functionality with Tailwind CSS classes

## Available Themes

### Bootstrap 5.2 Theme
The Bootstrap theme uses standard Bootstrap 5.2 classes for form elements, including:
- `form-control` for inputs
- `form-label` for labels
- `btn btn-primary` for submit buttons
- etc.

For modals, the Bootstrap theme uses Bootstrap's built-in modal component:
- `modal fade` for the modal container
- `modal-dialog` for the dialog container
- `modal-content` for the content container
- `modal-header`, `modal-body` for the header and body sections
- Uses Bootstrap's Modal JavaScript API for showing/hiding

### Tailwind CSS Theme
The Tailwind theme uses Tailwind CSS classes for form elements, including:
- `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm` for inputs
- `block text-sm font-medium text-gray-700 mb-1` for labels
- `inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-4` for submit buttons
- etc.

For modals, the Tailwind theme implements a custom modal component:
- `fixed inset-0 z-10 overflow-y-auto` for the modal container
- `flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0` for the dialog container
- `relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg` for the content container
- Custom JavaScript for showing/hiding with animations and event handling

## Example Usage

Here's a complete example of how to use the theming system:

### Basic Form with Theme Selection

```javascript
// Import required modules
import DynamicForm from './dynamic-form-builder';
import ThemeManager from './themes/ThemeManager';

// Form configuration
const formConfig = [
    {
        type: 'text',
        name: 'username',
        label: 'Username',
        required: true
    },
    {
        type: 'email',
        name: 'email',
        label: 'Email',
        required: true
    },
    {
        type: 'submit',
        label: 'Submit'
    }
];

// Initialize form with Tailwind theme
const form = new DynamicForm({
    config: formConfig,
    mount: 'form-container',
    onSubmit: (formData) => {
        console.log('Form submitted:', formData);
    },
    theme: 'tailwind'
});
```

### Modal Form with Different Themes

```javascript
// Bootstrap Modal Form
function showBootstrapModalForm() {
    const form = new DynamicForm({
        config: formConfig,
        // No mount specified - will create a modal
        modalOptions: {
            id: 'bootstrap-modal-form',
            title: 'Bootstrap Modal Form'
        },
        onSubmit: (formData) => {
            console.log('Bootstrap form submitted:', formData);
        },
        theme: 'bootstrap5' // Use Bootstrap theme
    });
}

// Tailwind Modal Form
function showTailwindModalForm() {
    const form = new DynamicForm({
        config: formConfig,
        // No mount specified - will create a modal
        modalOptions: {
            id: 'tailwind-modal-form',
            title: 'Tailwind Modal Form'
        },
        onSubmit: (formData) => {
            console.log('Tailwind form submitted:', formData);
        },
        theme: 'tailwind' // Use Tailwind theme
    });
}

// Trigger buttons
document.getElementById('show-bootstrap-modal').addEventListener('click', showBootstrapModalForm);
document.getElementById('show-tailwind-modal').addEventListener('click', showTailwindModalForm);
```
