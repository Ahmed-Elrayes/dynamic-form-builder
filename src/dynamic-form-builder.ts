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
        bootstrap: any; // Import * as Bootstrap from 'bootstrap'
        initializeEditor?: (element: HTMLElement) => Promise<any>;
    }
}

export default class DynamicForm {
    private _config: (FieldConfig | any)[];
    private _mount: HTMLElement | null;
    private _onSubmit: (formData: FormData, form: HTMLFormElement) => Promise<any> | any;
    private _onInitialized?: (instance: DynamicForm, form: HTMLFormElement, inputs: Record<string, HTMLElement | HTMLElement[]>) => void;
    private _ckeditors: (FieldConfig | any)[] = []; // Hold field configs for CKEditor
    private _theme: Theme;
    private _modalOptions: ModalOptions;
    private _modalInstance: ModalInstance | null = null;
    private _modal: HTMLElement | null = null;
    private _form: HTMLFormElement;

    /**
     * @param {DynamicFormOptions} options
     */
    constructor({
                    config,
                    mount = null,
                    modalOptions = {},
                    onSubmit,
                    onInitialized = undefined,
                    theme = null
                }: DynamicFormOptions) {
        this._config = config;
        this._mount = typeof mount === 'string' ? document.getElementById(mount) : mount;
        this._onSubmit = onSubmit;
        this._onInitialized = onInitialized;

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
            show: true
        }, modalOptions);

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

            // Listen for the modal:hidden event
            if (this._modal) {
                this._modal.addEventListener('modal:hidden', () => {
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
                label.setAttribute('for', field.name || '');
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
                    if (Array.isArray(field.options)) {
                        field.options.forEach((opt: string | OptionConfig) => {
                            const option = document.createElement('option');
                            if (typeof opt === 'object') {
                                option.value = String(opt.value);
                                option.textContent = opt.label;
                                option.selected = opt.selected || false;
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
                        if (input && $(input).select2) {
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
                                        option.selected = field.value === opt.value;
                                    }
                                }
                            } else {
                                option.value = opt;
                                option.textContent = opt;
                                if (field.value !== undefined) {
                                    if (Array.isArray(field.value)) {
                                        option.selected = field.value.includes(opt);
                                    } else {
                                        option.selected = field.value === opt;
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
                    (input as HTMLInputElement).name = field.name;
                    (input as HTMLInputElement).id = field.name || '';
                    if (field.required) (input as HTMLInputElement).required = true;
                    if (field.accept) (input as HTMLInputElement).accept = field.accept;

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
                            const file = fileInput.files[0];

                            // Check accept MIME/file-extension validation
                            let allowed = true;
                            if (field.accept) {
                                // Accept can be a comma sep list: .jpg,.png,image/* etc
                                const acceptArr = field.accept.split(',')
                                    .map((item: string) => item.trim().toLowerCase());
                                // If any accept matches (either extension or mime)
                                allowed = acceptArr.some((acc: string) => {
                                    if (acc.startsWith('.')) {
                                        return file.name.toLowerCase().endsWith(acc);
                                    }
                                    if (acc.endsWith('/*')) {
                                        return file.type.startsWith(acc.replace('/*', '/'));
                                    }
                                    return file.type === acc;
                                });
                            }

                            if (!allowed) {
                                (input as HTMLInputElement).setCustomValidity('File type not allowed.');
                                (input as HTMLInputElement).classList.add(this._theme.getInvalidInputClasses());
                                const feedback = (input as HTMLInputElement).parentElement?.querySelector('.' + this._theme.getValidationErrorClasses());
                                if (feedback) {
                                    feedback.textContent = 'Selected file type is not permitted.';
                                }
                                return;
                            }

                            // If image, show preview + dimension
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
                                // Show only name/size for non-images
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
            if (field.type === 'checkbox' && Array.isArray(value)) {
                missing = value.length === 0;
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
            const validation =  this.#validateInputs(field, value);
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
                if (value.trim() === '' || isNaN(Number(value))) {
                    return {isValid: false, message: 'Invalid number format.'};
                }
                return {isValid: true, message: ''};

            case 'email':
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
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
            case 'radio':
                if (value.length > 0) {
                    return {isValid: true, message: ''};
                }
                return {isValid: false, message: 'No value selected.'};

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

    async #handleSubmit(): Promise<void> {
        this.#clearAllValidation();
        let isValid = this.#validateForm();
        if (!isValid) return;

        try {
            const formData = new FormData(this._form);

            // Custom handling for CKEditor if you have it (handle via field.name)
            this._ckeditors.forEach(editorField => {
                const ta = editorField.ckeditorInstance;
                if (ta) {
                    formData.set(editorField.name, ta.getData());
                }
            });

            if (typeof this._onSubmit === 'function') {
                await this._onSubmit(formData, this._form);
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
}
