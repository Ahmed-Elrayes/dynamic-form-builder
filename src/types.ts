/**
 * Type definitions for dynamic-form-builder
 */
import DynamicForm from "./dynamic-form-builder";
import {Select2Plugin} from "select2";

// Extend jQuery interface to include select2
declare global {
    interface JQuery<TElement = HTMLElement> {
        select2: Select2Plugin<TElement>;

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

    // Behavior flags
    readonly?: boolean;                 // If true, render as read-only and exclude from FormData
    allowEmpty?: boolean;               // If true, include empty values for this field in FormData
    returnNullAsEmpty?: boolean;        // If true, convert null to empty string when including

    // Select/Radio/Checkbox options
    options?: Array<OptionConfig | string>;
    multiple?: boolean;

    // Select2 specific options
    select2Options?: Select2Options;
    select2Instance?: any; // jQuery select2 instance
    $select2Container?: HTMLElement;

    // File/Dropzone upload options
    accept?: string;
    dropzoneOptions?: Record<string, any>;
    dropzoneInstance?: any;

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
    value: string | number | boolean;
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
    type?: 'modal' | 'offcanvas';
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
    mount?: string | HTMLElement | null;
    modalOptions?: ModalOptions;
    onSubmit: (formData: FormData, form: HTMLFormElement, instance: DynamicForm) => Promise<any> | any;
    onInitialized?: (instance: any, form: HTMLFormElement, inputs: Record<string, HTMLElement | HTMLElement[]>) => void;
    theme?: string | any;
    waitForDOMReady?: boolean;

    // Global behavior defaults (overridable per field)
    allowEmpty?: boolean;            // default false
    returnNullAsEmpty?: boolean;     // default true
}
