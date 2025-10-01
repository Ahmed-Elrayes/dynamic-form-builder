// IMPORTANT: CKEditor must be globally available (e.g. via CDN in your Blade, see below)
// You may also use CKEditor 5/4 npm but for simplicity, CDN is often easier for use in forms
import $ from 'jquery';
import ThemeManager from './themes/ThemeManager.js';
import Theme from './themes/Theme.js';
import {DynamicFormOptions, FieldConfig, ModalInstance, ModalOptions, OptionConfig} from './types.js';

// Define global interfaces for external libraries
declare global {
    interface Window {
        $: any;
        bootstrap: any;
        initializeEditor?: (element: HTMLElement) => Promise<any>;
    }
}

export default class DynamicForm {
    private _config: (FieldConfig | any)[];
    private _mount: HTMLElement | Element | null;
    private _onSubmit: (formData: FormData, form: HTMLFormElement, instance: DynamicForm) => Promise<any> | any;
    private _onInitialized?: (instance: DynamicForm, form: HTMLFormElement, inputs: Record<string, HTMLElement | HTMLElement[]>) => void;
    private _ckeditors: (FieldConfig | any)[] = []; // Hold field configs for CKEditor
    private _theme: Theme;
    private _modalOptions: ModalOptions;
    private _modalInstance: ModalInstance | null = null;
    private _modal: HTMLElement | null = null;
    private _form!: HTMLFormElement;
    private _requiredPackages: Set<string> = new Set();
    private _hasSelect2: boolean = false; // Flag to track if select2 is available

    // Global defaults for submission behavior
    private _allowEmptyDefault: boolean = false;
    private _returnNullAsEmptyDefault: boolean = true;

    /**
     * @param {DynamicFormOptions} options
     */
    constructor({
                    config,
                    mount = null,
                    modalOptions = {},
                    onSubmit,
                    onInitialized = undefined,
                    theme = null,
                    waitForDOMReady = false,
                    allowEmpty = false,
                    returnNullAsEmpty = true
                }: DynamicFormOptions) {
        this._config = config;
        this._mount = typeof mount === 'string' ? document.getElementById(mount) : mount;
        this._onSubmit = onSubmit;
        this._onInitialized = onInitialized;
        // Set global behavior defaults
        this._allowEmptyDefault = !!allowEmpty;
        this._returnNullAsEmptyDefault = !!returnNullAsEmpty;

        // Check for required packages based on field types
        this.#checkRequiredPackages();

        // Initialize theme
        if (theme instanceof Theme) {
            this._theme = theme;
        } else if (typeof theme === 'string') {
            this._theme = ThemeManager.get(theme);
        } else {
            this._theme = ThemeManager.getDefaultTheme();
        }

        this._modalOptions = Object.assign({
            id: 'dynamicFormModal',
            title: 'Form Submission',
            show: true,
            type: 'modal'
        }, modalOptions);

        // If waitForDOMReady is true, wait for DOM to be fully loaded before initializing
        if (waitForDOMReady) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.#initialize(mount));
            } else {
                // DOM already loaded
                this.#initialize(mount);
            }
        } else {
            // Initialize immediately
            this.#initialize(mount);
        }
    }

    /**
     * Initialize the form
     * @param mount The mount element or ID
     * @private
     */
    #initialize(mount: string | HTMLElement | null) {
        // If mount not provided, create modal and use its body as mount
        if (!mount) {
            const modalResult = this._theme.createModal(this._modalOptions);
            this._modal = modalResult.modal;
            this._mount = modalResult.modalBody;
        } else {
            this._mount = typeof mount === 'string' ? document.getElementById(mount) : mount;
        }

        if (!this._mount) {
            throw new Error('Mount element not found');
        }

        this._form = this.#render();

        // Gather all input DOM elements by name
        const inputNodes = this.collectFormInputs();

        // Call the initialized event AFTER rendering, BEFORE showing modal
        if (typeof this._onInitialized === 'function') {
            // Provide both form instance and form DOM for maximum flexibility
            this._onInitialized(this, this._form, inputNodes);
        }

        // Show modal if we created it and modalOptions.show is true
        if (!mount && this._modal) {
            // Initialize the modal using the theme's initializeModal method
            this._modalInstance = this._theme.initializeModal(this._modal, {
                staticBackdrop: true
            });

            // Listen for the container hidden events (modal/offcanvas)
            if (this._modal) {
                this._modal.addEventListener('modal:hidden', () => {
                    this.destroy();
                });
                this._modal.addEventListener('offcanvas:hidden', () => {
                    this.destroy();
                });
            }

            // Show the modal if modalOptions.show is true
            if (this._modalOptions.show) {
                this._modalInstance.show();
            }

            // Blur active element when modal is hidden
            document.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Escape' && document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }
            });
        }
    }

    /**
     * Get the form element
     * @returns {HTMLFormElement}
     */
    getForm(): HTMLFormElement {
        return this._form;
    }

    /**
     * Get form data
     * @returns {Array<FieldConfig | any>}
     */
    getData(): (FieldConfig | any)[] {
        return this._config;
    }

    /**
     * Get the modal instance
     * @returns {ModalInstance|null}
     */
    getModalInstance(): ModalInstance | null {
        return this._modalInstance;
    }

    /**
     * Collect all form inputs
     * @returns {Record<string, HTMLElement | HTMLElement[]>}
     */
    collectFormInputs(): Record<string, HTMLElement | HTMLElement[]> {
        // Returns a map { fieldName: inputElement }
        const inputNodes: Record<string, HTMLElement | HTMLElement[]> = {};
        if (this._form) {
            // Includes input, select, textarea, radio and checkbox groups
            const fields = this._form.querySelectorAll('input[name], select[name], textarea[name]');
            fields.forEach(el => {
                const name = el.getAttribute('name') || '';
                // For radio/checkbox group, collect as array
                if ((el as HTMLInputElement).type === 'radio' || (el as HTMLInputElement).type === 'checkbox') {
                    if (!inputNodes[name]) inputNodes[name] = [];
                    (inputNodes[name] as HTMLElement[]).push(el as HTMLElement);
                } else {
                    inputNodes[name] = el as HTMLElement;
                }
            });
        }
        return inputNodes;
    }

    /**
     * Destroy the form and clean up resources
     */
    destroy(): void {
        // Cleanup logic, e.g. remove event listeners, null references, etc.
        if (this._ckeditors) {
            this._ckeditors.forEach(field => {
                field.ckeditorInstance?.destroy();
            });
        }
        if (this._modal) {
            this._modal.remove();
        }
    }

    // Private method to render the form
    #render(): HTMLFormElement {
        if (!this._mount) {
            throw new Error('Mount element not found');
        }

        // Cleanup old
        this._mount.innerHTML = '';

        // Form
        const form = document.createElement('form');
        form.className = this._theme.getFormClasses();
        form.noValidate = true;

        this._config.forEach((field: FieldConfig | any, idx: number) => {
            if (field.type === 'submit') {
                const btn = document.createElement('button');
                btn.type = 'submit';
                btn.className = this._theme.getSubmitButtonClasses();
                btn.textContent = field.label || 'Submit';
                form.appendChild(btn);
                return;
            }

            field.inputs = [];

            // Form group
            const group = document.createElement('div');
            group.className = this._theme.getFormGroupClasses();

            // Label
            if (field.type !== 'checkbox' && field.type !== 'radio') {
                const label = document.createElement('label');
                label.textContent = field.label || field.name;
                if (field.type !== 'dropzone') {
                    label.setAttribute('for', field.name || '');
                }
                label.className = this._theme.getLabelClasses();
                group.appendChild(label);
            }

            // Create input element
            let input: HTMLElement | undefined;

            switch (field.type) {
                case 'textarea':
                case 'ckeditor': {
                    input = document.createElement('textarea');
                    input.className = this._theme.getTextareaClasses();
                    (input as HTMLTextAreaElement).name = field.name;
                    (input as HTMLTextAreaElement).id = field.name || `ckeditor_${idx}`;
                    if (field.placeholder) (input as HTMLTextAreaElement).placeholder = field.placeholder;
                    if (field.rows) (input as HTMLTextAreaElement).rows = field.rows;
                    if (field.required) (input as HTMLTextAreaElement).required = true;
                    if (field.value) (input as HTMLTextAreaElement).value = field.value;
                    if (field.readonly) (input as HTMLTextAreaElement).readOnly = true;
                    group.appendChild(input);
                    if (typeof field.onCreate === 'function') {
                        field.onCreate(input, field, idx);
                    }
                    break;
                }
                case 'select2': {
                    input = document.createElement('select');
                    input.className = this._theme.getSelectClasses(field.multiple || false);
                    (input as HTMLSelectElement).id = field.name || '';
                    (input as HTMLSelectElement).multiple = field.multiple || false;
                    (input as HTMLSelectElement).name = (input as HTMLSelectElement).multiple ? `${field.name}[]` : field.name;
                    if (field.required) (input as HTMLSelectElement).required = true;
                    if (field.readonly) (input as HTMLSelectElement).disabled = true;
                    if (Array.isArray(field.options)) {
                        field.options.forEach((opt: string | OptionConfig) => {
                            const option = document.createElement('option');
                            if (typeof opt === 'object') {
                                option.value = String(opt.value);
                                option.textContent = opt.label;
                                option.selected = !!opt.selected;
                            } else {
                                option.value = opt;
                                option.textContent = opt;
                                option.selected = false;
                            }
                            input && (input as HTMLSelectElement).appendChild(option);
                        });
                    }
                    group.appendChild(input);

                    // Delay select2 init until after it's appended to DOM:
                    setTimeout(() => {
                        try {
                            // Check again if select2 is available now - more thorough check
                            const select2Available = !(
                                typeof $ === 'undefined' ||
                                typeof $.fn === 'undefined' ||
                                typeof $.fn.select2 === 'undefined' ||
                                typeof $.fn.select2 !== 'function'
                            );

                            this._hasSelect2 = select2Available;

                            if (input && select2Available) {
                                // Merge custom select2 options if provided
                                const parentElement = input?.parentElement;
                                field.select2Instance = $(input).select2({
                                    width: '100%',
                                    dropdownParent: parentElement || document.body,
                                    ...field.select2Options
                                }).on('change', () => {
                                    this.#clearValidation(field);
                                    this.#validateField(field);
                                });
                                const select2Selection = $(field.select2Instance).data('select2');
                                field.$select2Container = select2Selection.$container.get(0);
                            } else if (input && !select2Available && this._requiredPackages.has('select2')) {
                                // If select2 is not available, try to initialize it again after a delay
                                // This helps with production builds where select2 might be loaded asynchronously
                                console.warn(`DynamicFormBuilder: Select2 not immediately available for field "${field.name}". Retrying...`);

                                // Try again after a longer delay (500ms)
                                setTimeout(() => {
                                    // Final attempt to check if select2 is available
                                    const finalSelect2Available = !(
                                        typeof $ === 'undefined' ||
                                        typeof $.fn === 'undefined' ||
                                        typeof $.fn.select2 === 'undefined' ||
                                        typeof $.fn.select2 !== 'function'
                                    );

                                    if (input && finalSelect2Available) {
                                        // Merge custom select2 options if provided
                                        const parentElement = input?.parentElement;
                                        field.select2Instance = $(input).select2({
                                            width: '100%',
                                            dropdownParent: parentElement || document.body,
                                            ...field.select2Options
                                        }).on('change', () => {
                                            this.#clearValidation(field);
                                            this.#validateField(field);
                                        });
                                        const select2Selection = $(field.select2Instance).data('select2');
                                        field.$select2Container = select2Selection.$container.get(0);
                                    } else {
                                        console.warn(`DynamicFormBuilder: Could not initialize select2 for field "${field.name}" because select2 is not available.`);
                                    }
                                }, 500);
                            }
                        } catch (e) {
                            console.error(`DynamicFormBuilder: Error initializing select2 for field "${field.name}":`, e);
                        }

                        // onCreate event per field:
                        if (typeof field.onCreate === 'function' && input) {
                            field.onCreate(input, field, idx);
                        }
                    });
                    break;
                }
                case 'select': {
                    input = document.createElement('select');
                    input.className = this._theme.getSelectClasses(field.multiple || false);
                    (input as HTMLSelectElement).id = field.name || '';
                    (input as HTMLSelectElement).multiple = field.multiple || false;
                    (input as HTMLSelectElement).name = (input as HTMLSelectElement).multiple ? `${field.name}[]` : field.name;
                    if (field.required) (input as HTMLSelectElement).required = true;
                    if (field.readonly) (input as HTMLSelectElement).disabled = true;
                    if (Array.isArray(field.options)) {
                        field.options.forEach((opt: string | OptionConfig) => {
                            const option = document.createElement('option');
                            if (typeof opt === 'object') {
                                option.value = String(opt.value);
                                option.textContent = opt.label;
                                if (field.value !== undefined) {
                                    if (Array.isArray(field.value)) {
                                        option.selected = field.value.includes(opt.value);
                                    } else {
                                        option.selected = field.value === opt.value || !!field.selected;
                                    }
                                }
                            } else {
                                option.value = opt;
                                option.textContent = opt;
                                if (field.value !== undefined) {
                                    if (Array.isArray(field.value)) {
                                        option.selected = field.value.includes(opt);
                                    } else {
                                        option.selected = field.value === opt || !!field.selected;
                                    }
                                }
                            }
                            input && (input as HTMLSelectElement).appendChild(option);
                        });
                    }
                    group.appendChild(input);
                    if (typeof field.onCreate === 'function') {
                        field.onCreate(input, field, idx);
                    }
                    break;
                }
                case 'checkbox': {
                    input = document.createElement('input');
                    (input as HTMLInputElement).type = 'checkbox';
                    input.className = this._theme.getCheckboxInputClasses();
                    (input as HTMLInputElement).name = field.name;
                    (input as HTMLInputElement).id = field.name || '';
                    if (field.required) (input as HTMLInputElement).required = true;
                    if (field.value) (input as HTMLInputElement).checked = Boolean(field.value);
                    if (field.readonly) (input as HTMLInputElement).disabled = true;

                    // Label after input
                    const cLabel = document.createElement('label');
                    cLabel.className = this._theme.getCheckboxLabelClasses();
                    cLabel.setAttribute('for', field.name || '');
                    cLabel.textContent = field.label || field.name;

                    const cDiv = document.createElement('div');
                    cDiv.className = this._theme.getCheckboxContainerClasses();
                    cDiv.appendChild(input);
                    cDiv.appendChild(cLabel);
                    group.appendChild(cDiv);

                    if (typeof field.onCreate === 'function') {
                        field.onCreate(input, field, idx);
                    }
                    break;
                }
                case 'radio': {
                    if (Array.isArray(field.options)) {
                        field.options.forEach((opt: string | OptionConfig, i: string) => {
                            const radioDiv = document.createElement('div');
                            radioDiv.className = this._theme.getRadioContainerClasses();

                            const radioInput = document.createElement('input') as HTMLInputElement;
                            radioInput.type = 'radio';
                            radioInput.className = this._theme.getRadioInputClasses();
                            radioInput.name = field.name;
                            radioInput.id = field.name + '_' + i;
                            radioInput.value = (typeof opt === 'object') ? String(opt.value) : opt;

                            if (field.required) radioInput.required = true;

                            // Check if this option should be selected
                            if (field.value !== undefined) {
                                if (typeof opt === 'object') {
                                    radioInput.checked = field.value === opt.value;
                                } else {
                                    radioInput.checked = field.value === opt;
                                }
                            }

                            if (field.readonly) radioInput.disabled = true;

                            const radioLabel = document.createElement('label');
                            radioLabel.className = this._theme.getRadioLabelClasses();
                            radioLabel.setAttribute('for', field.name + '_' + i);
                            radioLabel.textContent = (typeof opt === 'object') ? opt.label : opt;

                            radioDiv.appendChild(radioInput);
                            radioDiv.appendChild(radioLabel);
                            (field.inputs = field.inputs || []).push(radioInput);
                            group.appendChild(radioDiv);
                        });

                        if (typeof field.onCreate === 'function') {
                            field.onCreate(field.inputs || [], field, idx);
                        }
                    }
                    break;
                }
                case 'file': {
                    input = document.createElement('input');
                    (input as HTMLInputElement).type = 'file';
                    input.className = this._theme.getInputClasses('file');
                    // Support multiple files
                    (input as HTMLInputElement).multiple = Boolean(field.multiple);
                    (input as HTMLInputElement).name = field.multiple ? `${field.name}[]` : field.name;
                    (input as HTMLInputElement).id = field.name || '';
                    if (field.required) (input as HTMLInputElement).required = true;
                    if (field.accept) (input as HTMLInputElement).accept = field.accept;
                    if (field.readonly) (input as HTMLInputElement).disabled = true;

                    // For preview/info
                    const fileInfo = document.createElement('div');
                    fileInfo.className = this._theme.getFileInfoClasses() + ' d-none';

                    // On file selection
                    if (input) {
                        (input as HTMLElement).addEventListener('change', async (e: Event) => {
                            this.#clearValidation(field);
                            fileInfo.classList.add('d-none');
                            fileInfo.innerHTML = '';

                            const fileInput = e.target as HTMLInputElement;
                            if (!fileInput.files || !fileInput.files.length) return;

                            // Validate accept for all files if provided
                            const validateFile = (f: File): boolean => {
                                if (!field.accept) return true;
                                const acceptArr = field.accept.split(',').map((item: string) => item.trim().toLowerCase());
                                return acceptArr.some((acc: string) => {
                                    if (acc.startsWith('.')) {
                                        return f.name.toLowerCase().endsWith(acc);
                                    }
                                    if (acc.endsWith('/*')) {
                                        return f.type.startsWith(acc.replace('/*', '/'));
                                    }
                                    return f.type === acc;
                                });
                            };

                            const files = Array.from(fileInput.files);
                            if (!files.every(validateFile)) {
                                (input as HTMLInputElement).setCustomValidity('File type not allowed.');
                                (input as HTMLInputElement).classList.add(this._theme.getInvalidInputClasses());
                                const feedback = (input as HTMLInputElement).parentElement?.querySelector('.' + this._theme.getValidationErrorClasses());
                                if (feedback) {
                                    feedback.textContent = 'Selected file type is not permitted.';
                                }
                                return;
                            }

                            // If multiple, do not render images/videos previews
                            if (field.multiple) {
                                const list = document.createElement('ul');
                                list.className = this._theme.getFileInfoTextClasses();
                                files.forEach(f => {
                                    const li = document.createElement('li');
                                    li.textContent = `${f.name} (${(f.size / 1024).toFixed(1)} KB)`;
                                    list.appendChild(li);
                                });
                                fileInfo.innerHTML = '';
                                fileInfo.appendChild(list);
                                fileInfo.classList.remove('d-none');
                                return;
                            }

                            const file = files[0];
                            if (file.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onload = (ev: ProgressEvent<FileReader>) => {
                                    const img = document.createElement('img');
                                    if (ev.target?.result) {
                                        img.src = ev.target.result as string;
                                    }
                                    img.className = this._theme.getFileThumbnailClasses();
                                    (img as HTMLImageElement).style.maxWidth = '150px';
                                    img.onload = function (this: any) {
                                        const self = this as DynamicForm;
                                        if (self && self._theme) {
                                            fileInfo.innerHTML = `
                                                <div class="${self._theme.getFileInfoTextClasses()}">Name: ${file.name}</div>
                                                <div class="${self._theme.getFileInfoTextClasses()}">Size: ${(file.size / 1024).toFixed(1)} KB</div>
                                                <div class="${self._theme.getFileInfoTextClasses()}">Dimensions: ${img.naturalWidth} x ${img.naturalHeight}</div>
                                            `;
                                            fileInfo.prepend(img);
                                            fileInfo.classList.remove('d-none');
                                        }
                                    }.bind(this);
                                };
                                reader.readAsDataURL(file);
                            } else {
                                fileInfo.innerHTML = `
                                    <div class="${this._theme.getFileInfoTextClasses()}">Name: ${file.name}</div>
                                    <div class="${this._theme.getFileInfoTextClasses()}">Size: ${(file.size / 1024).toFixed(1)} KB</div>
                                `;
                                fileInfo.classList.remove('d-none');
                            }
                        });
                    }

                    group.appendChild(input);
                    group.appendChild(fileInfo);

                    if (typeof field.onCreate === 'function') {
                        field.onCreate(input, field, idx);
                    }
                    break;
                }
                case 'dropzone': {
                    // Create a container for Dropzone
                    const dzDiv = document.createElement('div');
                    dzDiv.id = field.name ? `${field.name}_dropzone` : `dropzone_${idx}`;
                    dzDiv.className = 'dropzone';
                    if (field.readonly) dzDiv.classList.add('pointer-events-none', 'opacity-50');
                    group.appendChild(dzDiv);
                    input = dzDiv;

                    // Try to initialize Dropzone if available
                    setTimeout(() => {
                        try {
                            const hasDropzone = typeof (window as any).Dropzone !== 'undefined';
                            if (!hasDropzone) {
                                console.warn(`DynamicFormBuilder: Dropzone not available for field "${field.name}". Make sure to include Dropzone assets.`);
                            } else {
                                // Build options
                                const hasUrl = field.dropzoneOptions && typeof field.dropzoneOptions.url === 'string' && field.dropzoneOptions.url.length > 0;
                                const opts: any = {
                                    url: hasUrl ? field.dropzoneOptions.url : '/',
                                    autoProcessQueue: hasUrl ? (field.dropzoneOptions.autoProcessQueue ?? true) : false,
                                    uploadMultiple: Boolean(field.multiple),
                                    maxFiles: field.multiple ? null : 1,
                                    autoDiscover: false,
                                    paramName: field.name,
                                    addRemoveLinks: true,
                                    clickable: true,
                                    hiddenInputContainer: group,
                                    ...(field.accept ? {acceptedFiles: field.accept} : {}),
                                    ...field.dropzoneOptions
                                };
                                const DZ = (window as any).Dropzone;

                                field.dropzoneInstance = new DZ(dzDiv, opts);
                                field.input = field.dropzoneInstance.hiddenFileInput;
                                field.input.id = field.name;

                                // Basic validation clear on add/remove
                                field.dropzoneInstance.on('addedfile', () => {
                                    this.#clearValidation(field);
                                });
                                field.dropzoneInstance.on('removedfile', () => {
                                    this.#clearValidation(field);
                                });
                            }
                        } catch (e) {
                            console.error(`DynamicFormBuilder: Error initializing Dropzone for field "${field.name}":`, e);
                        }

                        if (typeof field.onCreate === 'function' && input) {
                            field.onCreate(input, field, idx);
                        }
                    });
                    break;
                }
                default: {
                    input = document.createElement('input');
                    (input as HTMLInputElement).type = field.type;
                    input.className = this._theme.getInputClasses(field.type);
                    (input as HTMLInputElement).name = field.name;
                    (input as HTMLInputElement).id = field.name || '';
                    if (field.placeholder) (input as HTMLInputElement).placeholder = field.placeholder;
                    if (field.required) (input as HTMLInputElement).required = true;
                    if ('min' in field) (input as HTMLInputElement).min = String(field.min);
                    if ('max' in field) (input as HTMLInputElement).max = String(field.max);
                    if ('value' in field) (input as HTMLInputElement).value = field.value;
                    if (field.readonly) (input as HTMLInputElement).readOnly = true;

                    if (typeof field.onCreate === 'function') {
                        field.onCreate(input, field, idx);
                    }
                    group.appendChild(input);
                }
            }

            // Add to group (except checkbox/radio already done)
            if (field.type !== 'checkbox' && field.type !== 'radio' && field.type !== 'submit' && field.type !== 'ckeditor' && field.type !== 'select2') {
                // Attach events here for validation
                if (input) {
                    (input as HTMLElement).addEventListener('blur', () => this.#validateField(field));
                    (input as HTMLElement).addEventListener('input', () => this.#clearValidation(field));
                }
            } else {
                if (['radio'].includes(field.type) && field.inputs && field.inputs.length > 0) {
                    field.inputs.forEach((inputElement: HTMLElement) => {
                        if (inputElement) {
                            inputElement.addEventListener('change', () => {
                                this.#clearValidation(field);
                                this.#validateField(field);
                            });
                        }
                    });
                }
            }

            // Validation message
            const invalidFeedback = document.createElement('div');
            invalidFeedback.className = this._theme.getValidationErrorClasses();
            group.appendChild(invalidFeedback);

            // Helper text (if provided)
            if (field.helper) {
                const helperText = document.createElement('div');
                helperText.className = this._theme.getHelperTextClasses();
                helperText.innerHTML = field.helper;
                group.appendChild(helperText);
            }

            form.appendChild(group);

            if (field.type === 'radio' || field.type === 'checkbox') {
                const inputs = group.querySelector('input');
                field.input = (inputs as HTMLElement);
            } else {
                field.input = input;
            }
            field.group = group;

            // Remember CKEditor fields for activation
            if (field.type === 'ckeditor') this._ckeditors.push(field);
        });

        // Submit handler
        form.addEventListener('submit', async (e: Event) => {
            e.preventDefault();
            await this.#handleSubmit();
        });

        this._mount.appendChild(form);

        // Initialize CKEditors if any
        if (window.initializeEditor && this._ckeditors.length > 0) {
            this._ckeditors.forEach(async field => {
                const textarea = field.input as HTMLTextAreaElement;
                if (textarea && !(textarea as any).ckeditorInitialized) {
                    try {
                        // Initialize CKEditor and store the instance on the config field
                        if (window.initializeEditor) {
                            await window.initializeEditor(textarea).then(editor => {
                                // Find the field config and attach the instance
                                const fieldConfig = this._config.find(f => f.name === field.name);
                                if (fieldConfig) {
                                    fieldConfig.ckeditorInstance = editor;
                                }
                                editor.editing.view.document.on('blur', () => this.#validateField(field));
                                editor.editing.view.document.on('input', () => this.#clearValidation(field));
                            });
                        }
                        (textarea as any).ckeditorInitialized = true;
                    } catch (err) {
                        console.error(`Failed to initialize CKEditor for ${field.name}:`, err);
                    }
                }
            });
        }

        return form;
    }

    // Validation logic for a field
    #validateField(field: FieldConfig | any): boolean {
        let value: any;
        let isValid = true;
        let message = '';
        let inputs = field.input;

        // Normalize input collection for grouped fields
        if (field.type === 'radio') {
            if (!Array.isArray(inputs)) {
                inputs = Array.from(this._form.querySelectorAll(`input[name="${field.name}"]`));
            }
            const checkedRadio = (inputs as HTMLInputElement[]).find(r => r.checked);
            value = checkedRadio ? checkedRadio.value : '';
        } else if (field.type === 'checkbox') {
            if (!Array.isArray(inputs)) {
                inputs = Array.from(this._form.querySelectorAll(`input[type="checkbox"][name="${field.name}"]`));
            }
            if (inputs.length > 1) {
                value = (inputs as HTMLInputElement[]).filter(c => c.checked).map(c => c.value);
            } else {
                value = (inputs as HTMLInputElement[])[0]?.checked || false;
            }
        } else if (field.type === 'select2') {
            const select = field.select2Instance;
            if (select) {
                const selectedValue = $(select).val();
                if (field.multiple) {
                    value = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
                } else {
                    value = selectedValue ?? '';
                }
            }
        } else if (field.type === 'select') {
            const select = Array.isArray(inputs) ? inputs[0] : inputs;
            if (select && select instanceof HTMLSelectElement) {
                if (select.multiple) {
                    value = Array.from(select.selectedOptions).map(opt => opt.value);
                } else {
                    value = select.value ?? '';
                }
            }
        } else if (field.type === 'ckeditor') {
            if (field.ckeditorInstance) {
                inputs = field.ckeditorInstance.ui.view.element;
                value = field.ckeditorInstance.getData();
            } else {
                value = '';
            }
        } else if (field.type === 'textarea') {
            const input = Array.isArray(inputs) ? inputs[0] : inputs;
            value = (input as HTMLTextAreaElement)?.value ?? '';
        } else {
            const input = Array.isArray(inputs) ? inputs[0] : inputs;
            value = (input as HTMLInputElement)?.value ?? '';
        }

        // ===== Validation rules =====

        // Required
        if (field.required) {
            let missing = false;
            if (field.type === 'checkbox') {
                if (Array.isArray(value)) {
                    missing = value.length === 0;
                } else {
                    // Single checkbox: required means it must be checked (true)
                    missing = value !== true;
                }
            } else if (field.type === 'select' && Array.isArray(value)) {
                missing = value.length === 0 || value.every(v => !v);
            } else if (field.type === 'radio') {
                missing = !value;
            } else {
                missing = value === undefined || value === null || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && value.length === 0);
            }
            if (missing) {
                isValid = false;
                message = field.validation?.required || `${field.label || field.name} is required`;
            }
        }

        // minLength
        if (isValid && field.validation?.minLength && ((typeof value === 'string' && value.length < field.validation.minLength) || (Array.isArray(value) && value.length < field.validation.minLength))) {
            isValid = false;
            message = field.validation.minLengthMsg || `Minimum length is ${field.validation.minLength}`;
        }

        // maxLength
        if (isValid && field.validation?.maxLength && ((typeof value === 'string' && value.length > field.validation.maxLength) || (Array.isArray(value) && value.length > field.validation.maxLength))) {
            isValid = false;
            message = field.validation.maxLengthMsg || `Maximum length is ${field.validation.maxLength}`;
        }

        // Validate inputs
        if (isValid) {
            const validation = this.#validateInputs(field, value);
            isValid = validation.isValid;
            if (!isValid) {
                message = validation.message;
            }
        }

        // Pattern (only for strings)
        if (isValid && field.validation?.pattern && typeof value === 'string') {
            const pattern = field.validation.pattern instanceof RegExp ? field.validation.pattern : new RegExp(field.validation.pattern);
            if (!pattern.test(value)) {
                isValid = false;
                message = field.validation.patternMsg || 'Invalid format';
            }
        }

        // Custom validator
        if (isValid && typeof field.validation?.custom === 'function') {
            const customResult = field.validation.custom(value, inputs as HTMLElement | HTMLElement[], field);
            if (customResult !== true) {
                isValid = false;
                message = typeof customResult === 'string' ? customResult : 'Invalid';
            }
        }

        // ===== Feedback handling =====
        // For groups (radio/checkbox), use the first input for feedback targeting
        // Normalize feedbackTarget to always be a DOM node
        let feedbackTarget = Array.isArray(inputs) ? inputs[0] : inputs;

        // If it's a jQuery object, extract the first DOM node
        if (feedbackTarget && (feedbackTarget as any).jquery) {
            feedbackTarget = (feedbackTarget as any)[0];
        }

        // Find group container and feedback div
        if (feedbackTarget && typeof (feedbackTarget as HTMLElement).closest === 'function') {
            const group = field.group;

            const feedbackDiv = group?.querySelector('.' + this._theme.getValidationErrorClasses());
            if (field.type === 'select2' && field.$select2Container) {
                const $container = field.$select2Container;
                const select2SelectionElement = $container.querySelector('.select2-selection');
                if (select2SelectionElement) {
                    select2SelectionElement.classList.toggle(this._theme.getInvalidInputClasses(), !isValid);
                }
            } else if (Array.isArray(inputs) && inputs.length > 0) {
                // Set validity classes for all group items (radios/checkboxes)
                inputs.forEach(input => {
                    if (input) {
                        input.classList.toggle(this._theme.getInvalidInputClasses(), !isValid);
                        input.classList.toggle(this._theme.getValidInputClasses(), isValid);
                    }
                });
            } else if (feedbackTarget) {
                (feedbackTarget as HTMLElement).classList.toggle(this._theme.getInvalidInputClasses(), !isValid);
                (feedbackTarget as HTMLElement).classList.toggle(this._theme.getValidInputClasses(), isValid);
            }

            // Set feedback message
            if (feedbackDiv) {
                feedbackDiv.textContent = isValid ? '' : message;
                if (!isValid) {
                    (feedbackDiv as HTMLElement).style.display = 'block';
                } else {
                    (feedbackDiv as HTMLElement).style.display = '';
                }
            }
        }

        return isValid;
    }

    #validateInputs(field: FieldConfig, value: any): { isValid: boolean; message: string } {
        switch (field.type) {
            case 'text':
            case 'password':
            case 'search':
            case 'hidden':
                return {isValid: typeof value === 'string', message: 'Invalid string format.'};

            case 'number':
                if (typeof value === 'string' && value.trim() === '') {
                    // Allow empty number when not required
                    return {isValid: !field.required, message: 'Invalid number format.'};
                }
                if (value === null || typeof value === 'undefined') {
                    return {isValid: !field.required, message: 'Invalid number format.'};
                }
                if (isNaN(Number(value))) {
                    return {isValid: false, message: 'Invalid number format.'};
                }
                return {isValid: true, message: ''};

            case 'email':
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || (value.trim() === '' && !field.required)) {
                    return {isValid: true, message: ''};
                }
                return {isValid: false, message: 'Invalid email format.'};

            case 'url':
                try {
                    new URL(value);
                    return {isValid: true, message: ''};
                } catch {
                    return {isValid: false, message: 'Invalid URL format.'};
                }

            case 'tel':
                if (/^[\d\-\+\(\) ]+$/.test(value)) {
                    return {isValid: true, message: ''};
                }
                return {isValid: false, message: 'Invalid telephone format.'};

            case 'date':
                if (/^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value))) {
                    return {isValid: true, message: ''};
                }
                return {isValid: false, message: 'Invalid date format. Use YYYY-MM-DD.'};

            case 'color':
                if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                    return {isValid: true, message: ''};
                }
                return {isValid: false, message: 'Invalid color format. Use #RRGGBB.'};

            case 'checkbox':
                if (Array.isArray(value)) {
                    if (!field.required) return {isValid: true, message: ''};
                    return {isValid: value.length > 0, message: 'No value selected.'};
                }
                if (typeof value === 'boolean') {
                    if (!field.required) return {isValid: true, message: ''};
                    return {isValid: value === true, message: 'No value selected.'};
                }
                // Fallback for unexpected types
                return {isValid: !field.required, message: 'No value selected.'};

            case 'radio':
                if (!field.required && (value === '' || value === null || typeof value === 'undefined')) {
                    return {isValid: true, message: ''};
                }
                return {isValid: !!value, message: 'No value selected.'};

            default:
                return {isValid: true, message: ''};
        }

    }

    #clearValidation(field: FieldConfig | any): void {
        if (field.type === 'radio') {
            // Get all radios in the group
            const group = field.group;
            if (group) {
                group.classList.remove(this._theme.getInvalidInputClasses());
                // Hide the feedback message
                const invalidFeedback = group.querySelector('.' + this._theme.getValidationErrorClasses());
                if (invalidFeedback) {
                    (invalidFeedback as HTMLElement).style.display = 'none';
                }
            }
        } else {
            let input = field.input as HTMLElement | undefined;
            if (input) {
                input.classList.remove(this._theme.getInvalidInputClasses());
                input.classList.remove(this._theme.getValidInputClasses());

                const feedbackElement = input.parentElement?.querySelector('.' + this._theme.getValidationErrorClasses());
                if (feedbackElement) {
                    feedbackElement.textContent = '';
                }
            }
        }
    }

    #clearAllValidation(): void {
        this._config.filter((field) => field.type !== 'submit').forEach(field => {
            this.#clearValidation(field);
        });
    }

    #validateForm(): boolean {
        // Gather values
        const data: Record<string, any> = {};
        let allValid = true;

        this._config.forEach(field => {
            if (field.type === 'submit') return;

            let val: any;

            // Get field value based on type
            switch (field.type) {
                case 'checkbox': {
                    const checkbox = this._form.querySelector(`[name="${field.name}"]`) as HTMLInputElement;
                    val = checkbox?.checked || false;
                    break;
                }
                case 'radio': {
                    const checked = this._form.querySelector(`input[name="${field.name}"]:checked`) as HTMLInputElement;
                    val = checked ? checked.value : '';
                    break;
                }
                case 'ckeditor': {
                    val = field.ckeditorInstance ? field.ckeditorInstance.getData() : '';
                    break;
                }
                default: {
                    const element = this._form.elements.namedItem(field.name);
                    val = element ? (element as HTMLInputElement).value : '';
                }
            }

            if (Array.isArray(val) && val.length === 0) {
                // Don't add empty arrays
                val = undefined;
            } else if ((typeof val === 'string' && val.trim() === '') || val === null || typeof val === 'undefined') {
                // Don't add empty string, null, or undefined
                val = undefined;
            }

            if (typeof val !== 'undefined') {
                data[field.name] = val;
            }

            // Validate field
            if (!this.#validateField(field)) {
                allValid = false;
            }
        });

        return allValid;
    }

    /**
     * Clears all form inputs and validations, effectively reinitializing the form
     * @returns {DynamicForm} The form instance for chaining
     */
    clearForm(): DynamicForm {
        // Clear all validations
        this.#clearAllValidation();

        // Reset all input values
        this._config.forEach(field => {
            if (field.type === 'submit') return;

            switch (field.type) {
                case 'checkbox': {
                    const checkbox = this._form.querySelector(`[name="${field.name}"]`) as HTMLInputElement;
                    if (checkbox) checkbox.checked = false;
                    break;
                }
                case 'radio': {
                    const radios = this._form.querySelectorAll(`input[name="${field.name}"]`) as NodeListOf<HTMLInputElement>;
                    radios.forEach(radio => radio.checked = false);
                    break;
                }
                case 'select': {
                    const select = this._form.querySelector(`select[name="${field.name}"]`) as HTMLSelectElement;
                    if (select) {
                        if (select.multiple) {
                            Array.from(select.options).forEach(option => option.selected = false);
                        } else {
                            select.selectedIndex = 0;
                        }
                    }
                    break;
                }
                case 'select2': {
                    if (field.select2Instance) {
                        $(field.select2Instance).val(null).trigger('change');
                    }
                    break;
                }
                case 'file': {
                    const fileInput = this._form.querySelector(`input[name="${field.name}"] , input[name="${field.name}[]"]`) as HTMLInputElement;
                    if (fileInput) {
                        fileInput.value = '';
                        // Clear file preview if exists
                        const fileInfo = fileInput.parentElement?.querySelector('.' + this._theme.getFileInfoClasses());
                        if (fileInfo) {
                            fileInfo.classList.add('d-none');
                            fileInfo.innerHTML = '';
                        }
                    }
                    break;
                }
                case 'dropzone': {
                    if (field.dropzoneInstance && typeof field.dropzoneInstance.removeAllFiles === 'function') {
                        field.dropzoneInstance.removeAllFiles(true);
                    }
                    break;
                }
                case 'ckeditor': {
                    if (field.ckeditorInstance) {
                        field.ckeditorInstance.setData('');
                    }
                    break;
                }
                case 'textarea': {
                    const textarea = this._form.querySelector(`textarea[name="${field.name}"]`) as HTMLTextAreaElement;
                    if (textarea) textarea.value = '';
                    break;
                }
                default: {
                    const input = this._form.querySelector(`input[name="${field.name}"]`) as HTMLInputElement;
                    if (input) input.value = '';
                }
            }

            // Clear any custom field state
            if (typeof field.onClear === 'function') {
                field.onClear(field.input, field);
            }
        });

        return this;
    }

    async #handleSubmit(): Promise<void> {
        this.#clearAllValidation();
        let isValid = this.#validateForm();
        if (!isValid) return;

        try {
            const formData = new FormData(this._form);

            // Custom handling for CKEditor if you have it (handle via field.name)
            this._ckeditors.forEach(editorField => {
                if (editorField.readonly) return; // do not include readonly fields
                const ta = editorField.ckeditorInstance;
                if (ta) {
                    formData.set(editorField.name, ta.getData());
                }
            });

            // Append files from Dropzone fields that don't have a URL (defer upload until submit)
            this._config.forEach(field => {
                if (field.readonly) return; // exclude readonly
                if (field.type === 'dropzone') {
                    const hasUrl = field.dropzoneOptions && typeof field.dropzoneOptions.url === 'string' && field.dropzoneOptions.url.length > 0;
                    if (!hasUrl && field.dropzoneInstance && typeof field.dropzoneInstance.getAcceptedFiles === 'function') {
                        const files: File[] = field.dropzoneInstance.getAcceptedFiles();
                        if (files && files.length) {
                            if (field.multiple) {
                                files.forEach(f => formData.append(`${field.name}[]`, f));
                            } else {
                                formData.append(field.name, files[0]);
                            }
                        }
                    }
                }
            });

            // Ensure checkboxes are included even when unchecked
            this._config.forEach(field => {
                if (field.readonly) return; // skip readonly fields
                if (field.type === 'checkbox') {
                    const inputs = this._form.querySelectorAll(`input[type="checkbox"][name="${field.name}"]`) as NodeListOf<HTMLInputElement>;
                    if (inputs.length <= 1) {
                        const input = inputs[0];
                        const checked = !!input?.checked;
                        // Always set explicit boolean string value
                        formData.set(field.name, checked ? 'true' : 'false');
                    } else {
                        // If multiple checkboxes share the same name, preserve checked ones;
                        // when none are checked, still send an empty indicator key.
                        const anyChecked = Array.from(inputs).some(i => i.checked);
                        if (!anyChecked) {
                            // Represent empty selection; since names don't use [] here, send empty string
                            if (!formData.has(field.name)) {
                                formData.set(field.name, '');
                            }
                        }
                    }
                }
            });

            // Remove readonly fields from FormData and enforce allowEmpty/returnNullAsEmpty
            this._config.forEach(field => {
                const isReadonly = !!field.readonly;
                const allowEmpty = (typeof field.allowEmpty === 'boolean') ? field.allowEmpty : this._allowEmptyDefault;
                const returnNullAsEmpty = (typeof field.returnNullAsEmpty === 'boolean') ? field.returnNullAsEmpty : this._returnNullAsEmptyDefault;

                // Utility: delete both plain and [] keys
                const deleteKeys = () => {
                    formData.delete(field.name);
                    formData.delete(`${field.name}[]`);
                };

                if (isReadonly) {
                    deleteKeys();
                    return;
                }

                // Derive current value from DOM to evaluate emptiness
                let value: any = undefined;
                let inputs: any = field.input;
                if (field.type === 'radio') {
                    const radios = Array.from(this._form.querySelectorAll(`input[name="${field.name}"]`)) as HTMLInputElement[];
                    const checkedRadio = radios.find(r => r.checked);
                    value = checkedRadio ? checkedRadio.value : '';
                } else if (field.type === 'checkbox') {
                    const checks = Array.from(this._form.querySelectorAll(`input[type="checkbox"][name="${field.name}"]`)) as HTMLInputElement[];
                    if (checks.length > 1) {
                        value = checks.filter(c => c.checked).map(c => c.value);
                    } else {
                        value = checks[0] ? checks[0].checked : false;
                    }
                } else if (field.type === 'select') {
                    const select = this._form.querySelector(`select[name="${field.name}"]`) as HTMLSelectElement | null;
                    if (select) {
                        value = select.multiple ? Array.from(select.selectedOptions).map(o => o.value) : (select.value ?? '');
                    }
                } else if (field.type === 'select2') {
                    // underlying select element reflects value; rely on it
                    const select = this._form.querySelector(`select[name="${field.multiple ? field.name + '[]' : field.name}"]`) as HTMLSelectElement | null;
                    if (select) {
                        value = select.multiple ? Array.from(select.selectedOptions).map(o => o.value) : (select.value ?? '');
                    }
                } else if (field.type === 'ckeditor') {
                    value = field.ckeditorInstance ? field.ckeditorInstance.getData() : '';
                } else if (field.type === 'textarea') {
                    const ta = this._form.querySelector(`textarea[name="${field.name}"]`) as HTMLTextAreaElement | null;
                    value = ta ? ta.value : '';
                } else if (field.type === 'file' || field.type === 'dropzone') {
                    // Files: if none selected, treat as null
                    value = null;
                } else {
                    const el = this._form.querySelector(`input[name="${field.name}"]`) as HTMLInputElement | null;
                    value = el ? el.value : '';
                }

                const isNull = value === null;
                const isEmptyString = typeof value === 'string' && value.trim() === '';
                const isEmptyArray = Array.isArray(value) && value.length === 0;
                const isEmpty = isNull || isEmptyString || isEmptyArray;

                // Ensure key existence when allowed and remove when not allowed
                const hasKey = formData.has(field.name) || formData.has(`${field.name}[]`);

                if (isEmpty) {
                    if (allowEmpty) {
                        // include as empty
                        const emptyVal = isNull ? (returnNullAsEmpty ? '' : null) : (Array.isArray(value) ? '' : '');
                        // If returnNullAsEmpty is false and value is null, omit it
                        if (isNull && !returnNullAsEmpty) {
                            deleteKeys();
                        } else {
                            // ensure plain key exists with empty string
                            formData.set(field.name, String(emptyVal === null ? '' : emptyVal));
                        }
                    } else {
                        // not allowed: remove any existing keys
                        deleteKeys();
                    }
                } else {
                    // Non-empty: nothing special. But if multiple, ensure keys exist already by browser.
                }
            });

            if (typeof this._onSubmit === 'function') {
                await this._onSubmit(formData, this._form, this);
            }

            // --- AFTER submit: remove modal ---
            if (this._modalInstance) {
                this._modalInstance.hide();
            }
        } catch (e) {
            // Handle submit error, show message, etc.
            // Modal remains open on failure
            console.error('Submission error:', e);
        }
    }

    /**
     * Check for required third-party packages based on field types
     * and display warnings if they're not available
     */
    #checkRequiredPackages(): void {
        // Check if any field requires specific packages
        this._config.forEach(field => {
            if (field.type === 'select2') {
                this._requiredPackages.add('select2');
            } else if (field.type === 'ckeditor') {
                this._requiredPackages.add('ckeditor');
            } else if (field.type === 'dropzone') {
                this._requiredPackages.add('dropzone');
            }
        });

        // If we're using a modal, we need Bootstrap
        if (!this._mount) {
            this._requiredPackages.add('bootstrap');
        }

        // Always check for jQuery as it's a base dependency
        this._requiredPackages.add('jquery');

        // Check if required packages are available and show warnings
        this.#checkPackageAvailability();
    }

    /**
     * Check if required packages are available and show warnings for missing ones
     */
    #checkPackageAvailability(): void {
        if (this._requiredPackages.has('jquery') && (typeof $ === 'undefined' || typeof window?.$ === 'undefined')) {
            console.warn('DynamicFormBuilder: jQuery is required but not available. Some features may not work correctly.');
        }

        // For select2, we'll check if it's available, but we won't show a warning immediately
        // since it might be loaded asynchronously. The warning will be shown when trying to
        // initialize a select2 field if select2 is still not available at that time.
        try {
            // More thorough check for select2 availability
            this._hasSelect2 = !(
                typeof $ === 'undefined' ||
                typeof $.fn === 'undefined' ||
                typeof $.fn.select2 === 'undefined' ||
                typeof $.fn.select2 !== 'function'
            );

            // If jQuery is available but select2 isn't attached to it yet, we'll try to check again after a delay
            // This helps with production builds where select2 might be loaded asynchronously
            if (!this._hasSelect2 && typeof $ !== 'undefined' && typeof $.fn !== 'undefined' && this._requiredPackages.has('select2')) {
                setTimeout(() => {
                    this._hasSelect2 = !(
                        typeof $ === 'undefined' ||
                        typeof $.fn === 'undefined' ||
                        typeof $.fn.select2 === 'undefined' ||
                        typeof $.fn.select2 !== 'function'
                    );
                }, 100);
            }
        } catch (e) {
            console.error('DynamicFormBuilder: Error checking select2 availability:', e);
            this._hasSelect2 = false;
        }

        if (this._requiredPackages.has('bootstrap') && (typeof window?.bootstrap === 'undefined')) {
            console.warn('DynamicFormBuilder: Bootstrap is required for modal functionality but not available. Modals will not function correctly.');
        }

        if (this._requiredPackages.has('ckeditor') && (typeof window?.initializeEditor === 'undefined')) {
            console.warn('DynamicFormBuilder: CKEditor initialization function is required for ckeditor fields but not available. Rich text editing will not function correctly.');
        }

        if (this._requiredPackages.has('dropzone') && (typeof (window as any)?.Dropzone === 'undefined')) {
            console.warn('DynamicFormBuilder: Dropzone is required for dropzone fields but not available. File drag-and-drop will not function.');
        }
    }

    #isBoolean(value: string | boolean | number): boolean {
        return typeof value === 'boolean';
    }
}
