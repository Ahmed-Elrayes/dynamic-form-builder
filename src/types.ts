/**
 * Type definitions for dynamic-form-builder
 */
import {DynamicForm} from "./index";

// Extend jQuery interface to include select2
declare global {
  interface JQuery {
    select2: any;
    data(key: string): any;
  }
}

/**
 * Field configuration options
 */
export interface FieldConfig {
  // Basic field properties
  name: string;
  type: string;
  label?: string;
  value?: any;
  placeholder?: string;
  required?: boolean;
  helper?: string;

  // Select/Radio/Checkbox options
  options?: Array<OptionConfig | string>;
  multiple?: boolean;

  // Select2 specific options
  select2Options?: Select2Options;
  select2Instance?: any; // jQuery select2 instance
  $select2Container?: HTMLElement;

  // File upload options
  accept?: string;

  // Textarea/CKEditor options
  rows?: number;
  ckeditorInstance?: any;

  // Validation options
  validation?: ValidationOptions;

  // Callback functions
  onCreate?: (input: HTMLElement | HTMLElement[], field: FieldConfig, index: number) => void;

  // Runtime properties added during form rendering
  input?: HTMLElement | HTMLElement[];
  inputs?: HTMLElement[];
  group?: HTMLElement;
}

/**
 * Option configuration for select/radio/checkbox fields
 */
export interface OptionConfig {
  label: string;
  value: string | number;
  selected?: boolean;
}

/**
 * Select2 configuration options
 */
export interface Select2Options {
  tags?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  [key: string]: any;
}

/**
 * Validation options for fields
 */
export interface ValidationOptions {
  required?: string;
  minLength?: number;
  minLengthMsg?: string;
  maxLength?: number;
  maxLengthMsg?: string;
  pattern?: RegExp | string;
  patternMsg?: string;
  custom?: (value: any, input: HTMLElement | HTMLElement[], field: FieldConfig) => boolean | string;
}

/**
 * Modal options
 */
export interface ModalOptions {
  id?: string;
  title?: string;
  show?: boolean;
  staticBackdrop?: boolean;
}

/**
 * Modal instance returned by theme.initializeModal
 */
export interface ModalInstance {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  dispose: () => void;
  getInstance: () => any;
}

/**
 * Modal creation result
 */
export interface ModalCreationResult {
  modal: HTMLElement;
  modalBody: HTMLElement;
}

/**
 * DynamicForm constructor options
 */
export interface DynamicFormOptions {
  config: (FieldConfig | any)[];
  mount?: string | HTMLElement | Element | null;
  modalOptions?: ModalOptions;
  onSubmit: (formData: FormData, form: HTMLFormElement, builder?: DynamicForm | any) => Promise<any> | any;
  onInitialized?: (instance: any, form: HTMLFormElement, inputs: Record<string, HTMLElement | HTMLElement[]>) => void;
  theme?: string | any;
}
