# Dynamic Form Builder

A flexible, themeable dynamic form builder for modern web apps. Build complete forms from a simple config, validate, theme, and submit — with optional Select2, CKEditor, and Dropzone integrations.

[![npm version](https://img.shields.io/npm/v/@elrayes/dynamic-form-builder.svg)](https://www.npmjs.com/package/@elrayes/dynamic-form-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- Dynamic form generation from a JavaScript/TypeScript config
- Rich field types: text, textarea, select, select2, checkbox, radio, file, dropzone, ckeditor, submit
- Built-in validation: required, min/max length, pattern, custom
- Theme support: Bootstrap 5 and Tailwind out of the box (custom themes supported)
- Modal rendering when no mount is provided
- TypeScript types included

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Field Types](#field-types)
- [Validation](#validation)
- [Theming](#theming)
- [API](#api)
- [TypeScript](#typescript)
- [Integrations (Select2, CKEditor, Dropzone)](#integrations)
- [Requirements](#requirements)
- [License](#license)

## Installation

Using npm

```bash
npm install @elrayes/dynamic-form-builder
```

Using Yarn

```bash
yarn add @elrayes/dynamic-form-builder
```

Laravel + Vite (make globals for Blade use)

In resources/js/bootstrap.js:

```javascript
import { DynamicForm, ThemeManager } from '@elrayes/dynamic-form-builder';

window.DynamicForm = DynamicForm;
window.ThemeManager = ThemeManager;
```

Then rebuild your assets with Vite.

## Quick Start

```javascript
import { DynamicForm } from '@elrayes/dynamic-form-builder';

const form = new DynamicForm({
  config: [
    { type: 'text', name: 'username', label: 'Username', required: true },
    { type: 'email', name: 'email', label: 'Email', required: true },
    { type: 'password', name: 'password', label: 'Password', required: true },
    { type: 'submit', label: 'Register' }
  ],
  mount: 'form-container',
  onSubmit: async (formData, form, instance) => {
    await fetch('/api/register', { method: 'POST', body: formData });
  }
});
```

HTML mount example

```html
<div id="form-container"></div>
```

Modal usage: omit mount (or pass null) and a theme modal will be created.

## Configuration

DynamicForm options

```ts
new DynamicForm({
  config: FieldConfig[],
  mount?: string | HTMLElement | null, // if omitted or null, renders in a modal
  modalOptions?: ModalOptions,         // id, title, show, staticBackdrop
  onSubmit: (formData, form, instance) => Promise<any> | any,
  onInitialized?: (instance, form, inputs) => void,
  theme?: 'bootstrap5' | 'tailwind' | Theme,
  waitForDOMReady?: boolean
})
```

Common FieldConfig keys

- name: string
- type: string (see Field Types)
- label?: string
- value?: any
- placeholder?: string
- required?: boolean
- helper?: string
- options?: Array<{ label: string; value: string|number|boolean; selected?: boolean } | string>
- multiple?: boolean
- select2Options?: Record<string, any>
- dropzoneOptions?: Record<string, any>
- rows?: number (textarea)
- validation?: { required?: string; minLength?: number; minLengthMsg?: string; maxLength?: number; maxLengthMsg?: string; pattern?: RegExp|string; patternMsg?: string; custom?: (value, input, field) => boolean|string }
- onCreate?: (inputEl, field, index) => void

## Field Types

Basic

- text, email, password, number, tel, url, date, color, hidden, textarea

Selects

- select (native)
- select2 (jQuery Select2). Provide select2Options and include Select2 assets.

Choices

- checkbox (single), radio (group via options)

Files

- file (native input with preview for single image; list for multiple)
- dropzone (drag-and-drop via Dropzone)

Rich text

- ckeditor (requires window.initializeEditor to return a CKEditor instance)

Submit

- submit (button)

## Validation

- required: boolean (uses message from validation.required if provided)
- minLength / maxLength: number with optional custom messages
- pattern: RegExp or string with patternMsg
- custom: (value, input, field) => boolean | string

Validation runs on blur/submit and shows theme-appropriate feedback. Radio/checkbox/select2 are handled correctly.

## Theming

Built-in themes: bootstrap5 (default), tailwind.

Pass theme by name or provide a Theme instance. You can register custom themes.

```ts
import { ThemeManager, TailwindTheme } from '@elrayes/dynamic-form-builder';

// use built-in
new DynamicForm({ config, mount: 'el', theme: 'tailwind', onSubmit });

// register custom
ThemeManager.register('myTheme', new TailwindTheme());
new DynamicForm({ config, theme: 'myTheme', onSubmit });
```

## API

Instance methods

- getForm(): HTMLFormElement
- getData(): FieldConfig[]
- getModalInstance(): ModalInstance | null
- collectFormInputs(): Record<string, HTMLElement | HTMLElement[]>
- clearForm(): DynamicForm
- destroy(): void

Callbacks

- onInitialized(instance, form, inputs)
- onSubmit(formData, form, instance)

## TypeScript

Types are bundled. Import what you need.

```ts
import { DynamicForm, FieldConfig, DynamicFormOptions } from '@elrayes/dynamic-form-builder';
```

## Integrations

Select2

- Ensure jQuery and Select2 are loaded. The builder retries initialization briefly to support async loading.
- Provide select2Options; for multiple, name becomes fieldName[]

CKEditor

- Provide a global initializer that returns the editor instance:

```html
<script src="https://cdn.ckeditor.com/ckeditor5/41.2.1/classic/ckeditor.js"></script>
<script>
  window.initializeEditor = (el) => ClassicEditor.create(el);
</script>
```

Dropzone

- Include Dropzone assets. If dropzoneOptions.url is provided, uploads are processed by Dropzone.
- If url is omitted/empty, uploads are deferred: files are appended to FormData on submit (respects multiple).

## Requirements

- jQuery (base dependency; needed for Select2)
- Bootstrap (only if rendering in a modal via bootstrap5 theme)
- Select2 (only for select2 fields)
- CKEditor (only for ckeditor fields)
- Dropzone (only for dropzone fields)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
