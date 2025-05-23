var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _DynamicForm_instances, _DynamicForm_render, _DynamicForm_validateField, _DynamicForm_validateInputs, _DynamicForm_clearValidation, _DynamicForm_clearAllValidation, _DynamicForm_validateForm, _DynamicForm_handleSubmit;
// IMPORTANT: CKEditor must be globally available (e.g. via CDN in your Blade, see below)
// You may also use CKEditor 5/4 npm but for simplicity, CDN is often easier for use in forms
import $ from 'jquery';
import ThemeManager from './themes/ThemeManager.js';
import Theme from './themes/Theme.js';
class DynamicForm {
    /**
     * @param {DynamicFormOptions} options
     */
    constructor({ config, mount = null, modalOptions = {}, onSubmit, onInitialized = undefined, theme = null }) {
        _DynamicForm_instances.add(this);
        this._ckeditors = []; // Hold field configs for CKEditor
        this._modalInstance = null;
        this._modal = null;
        this._config = config;
        this._mount = typeof mount === 'string' ? document.getElementById(mount) : mount;
        this._onSubmit = onSubmit;
        this._onInitialized = onInitialized;
        // Initialize theme
        if (theme instanceof Theme) {
            this._theme = theme;
        }
        else if (typeof theme === 'string') {
            this._theme = ThemeManager.get(theme);
        }
        else {
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
        }
        else {
            this._mount = typeof mount === 'string' ? document.getElementById(mount) : mount;
        }
        if (!this._mount) {
            throw new Error('Mount element not found');
        }
        this._form = __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_render).call(this);
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
            document.addEventListener('keydown', (e) => {
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
    getForm() {
        return this._form;
    }
    /**
     * Get form data
     * @returns {Array<FieldConfig | any>}
     */
    getData() {
        return this._config;
    }
    /**
     * Get the modal instance
     * @returns {ModalInstance|null}
     */
    getModalInstance() {
        return this._modalInstance;
    }
    /**
     * Collect all form inputs
     * @returns {Record<string, HTMLElement | HTMLElement[]>}
     */
    collectFormInputs() {
        // Returns a map { fieldName: inputElement }
        const inputNodes = {};
        if (this._form) {
            // Includes input, select, textarea, radio and checkbox groups
            const fields = this._form.querySelectorAll('input[name], select[name], textarea[name]');
            fields.forEach(el => {
                const name = el.getAttribute('name') || '';
                // For radio/checkbox group, collect as array
                if (el.type === 'radio' || el.type === 'checkbox') {
                    if (!inputNodes[name])
                        inputNodes[name] = [];
                    inputNodes[name].push(el);
                }
                else {
                    inputNodes[name] = el;
                }
            });
        }
        return inputNodes;
    }
    /**
     * Destroy the form and clean up resources
     */
    destroy() {
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
}
_DynamicForm_instances = new WeakSet(), _DynamicForm_render = function _DynamicForm_render() {
    if (!this._mount) {
        throw new Error('Mount element not found');
    }
    // Cleanup old
    this._mount.innerHTML = '';
    // Form
    const form = document.createElement('form');
    form.className = this._theme.getFormClasses();
    form.noValidate = true;
    this._config.forEach((field, idx) => {
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
        let input;
        switch (field.type) {
            case 'textarea':
            case 'ckeditor': {
                input = document.createElement('textarea');
                input.className = this._theme.getTextareaClasses();
                input.name = field.name;
                input.id = field.name || `ckeditor_${idx}`;
                if (field.placeholder)
                    input.placeholder = field.placeholder;
                if (field.rows)
                    input.rows = field.rows;
                if (field.required)
                    input.required = true;
                if (field.value)
                    input.value = field.value;
                group.appendChild(input);
                if (typeof field.onCreate === 'function') {
                    field.onCreate(input, field, idx);
                }
                break;
            }
            case 'select2': {
                input = document.createElement('select');
                input.className = this._theme.getSelectClasses(field.multiple || false);
                input.id = field.name || '';
                input.multiple = field.multiple || false;
                input.name = input.multiple ? `${field.name}[]` : field.name;
                if (field.required)
                    input.required = true;
                if (Array.isArray(field.options)) {
                    field.options.forEach((opt) => {
                        const option = document.createElement('option');
                        if (typeof opt === 'object') {
                            option.value = String(opt.value);
                            option.textContent = opt.label;
                            option.selected = opt.selected || false;
                        }
                        else {
                            option.value = opt;
                            option.textContent = opt;
                            option.selected = false;
                        }
                        input && input.appendChild(option);
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
                            __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_clearValidation).call(this, field);
                            __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_validateField).call(this, field);
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
                input.id = field.name || '';
                input.multiple = field.multiple || false;
                input.name = input.multiple ? `${field.name}[]` : field.name;
                if (field.required)
                    input.required = true;
                if (Array.isArray(field.options)) {
                    field.options.forEach((opt) => {
                        const option = document.createElement('option');
                        if (typeof opt === 'object') {
                            option.value = String(opt.value);
                            option.textContent = opt.label;
                            if (field.value !== undefined) {
                                if (Array.isArray(field.value)) {
                                    option.selected = field.value.includes(opt.value);
                                }
                                else {
                                    option.selected = field.value === opt.value;
                                }
                            }
                        }
                        else {
                            option.value = opt;
                            option.textContent = opt;
                            if (field.value !== undefined) {
                                if (Array.isArray(field.value)) {
                                    option.selected = field.value.includes(opt);
                                }
                                else {
                                    option.selected = field.value === opt;
                                }
                            }
                        }
                        input && input.appendChild(option);
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
                input.type = 'checkbox';
                input.className = this._theme.getCheckboxInputClasses();
                input.name = field.name;
                input.id = field.name || '';
                if (field.required)
                    input.required = true;
                if (field.value)
                    input.checked = Boolean(field.value);
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
                    field.options.forEach((opt, i) => {
                        const radioDiv = document.createElement('div');
                        radioDiv.className = this._theme.getRadioContainerClasses();
                        const radioInput = document.createElement('input');
                        radioInput.type = 'radio';
                        radioInput.className = this._theme.getRadioInputClasses();
                        radioInput.name = field.name;
                        radioInput.id = field.name + '_' + i;
                        radioInput.value = (typeof opt === 'object') ? String(opt.value) : opt;
                        if (field.required)
                            radioInput.required = true;
                        // Check if this option should be selected
                        if (field.value !== undefined) {
                            if (typeof opt === 'object') {
                                radioInput.checked = field.value === opt.value;
                            }
                            else {
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
                input.type = 'file';
                input.className = this._theme.getInputClasses('file');
                input.name = field.name;
                input.id = field.name || '';
                if (field.required)
                    input.required = true;
                if (field.accept)
                    input.accept = field.accept;
                // For preview/info
                const fileInfo = document.createElement('div');
                fileInfo.className = this._theme.getFileInfoClasses() + ' d-none';
                // On file selection
                if (input) {
                    input.addEventListener('change', async (e) => {
                        __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_clearValidation).call(this, field);
                        fileInfo.classList.add('d-none');
                        fileInfo.innerHTML = '';
                        const fileInput = e.target;
                        if (!fileInput.files || !fileInput.files.length)
                            return;
                        const file = fileInput.files[0];
                        // Check accept MIME/file-extension validation
                        let allowed = true;
                        if (field.accept) {
                            // Accept can be a comma sep list: .jpg,.png,image/* etc
                            const acceptArr = field.accept.split(',')
                                .map((item) => item.trim().toLowerCase());
                            // If any accept matches (either extension or mime)
                            allowed = acceptArr.some((acc) => {
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
                            input.setCustomValidity('File type not allowed.');
                            input.classList.add(this._theme.getInvalidInputClasses());
                            const feedback = input.parentElement?.querySelector('.' + this._theme.getValidationErrorClasses());
                            if (feedback) {
                                feedback.textContent = 'Selected file type is not permitted.';
                            }
                            return;
                        }
                        // If image, show preview + dimension
                        if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                const img = document.createElement('img');
                                if (ev.target?.result) {
                                    img.src = ev.target.result;
                                }
                                img.className = this._theme.getFileThumbnailClasses();
                                img.style.maxWidth = '150px';
                                img.onload = function () {
                                    const self = this;
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
                        }
                        else {
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
                input.type = field.type;
                input.className = this._theme.getInputClasses(field.type);
                input.name = field.name;
                input.id = field.name || '';
                if (field.placeholder)
                    input.placeholder = field.placeholder;
                if (field.required)
                    input.required = true;
                if ('min' in field)
                    input.min = String(field.min);
                if ('max' in field)
                    input.max = String(field.max);
                if ('value' in field)
                    input.value = field.value;
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
                input.addEventListener('blur', () => __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_validateField).call(this, field));
                input.addEventListener('input', () => __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_clearValidation).call(this, field));
            }
        }
        else {
            if (['radio'].includes(field.type) && field.inputs && field.inputs.length > 0) {
                field.inputs.forEach((inputElement) => {
                    if (inputElement) {
                        inputElement.addEventListener('change', () => {
                            __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_clearValidation).call(this, field);
                            __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_validateField).call(this, field);
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
            field.input = inputs;
        }
        else {
            field.input = input;
        }
        field.group = group;
        // Remember CKEditor fields for activation
        if (field.type === 'ckeditor')
            this._ckeditors.push(field);
    });
    // Submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_handleSubmit).call(this);
    });
    this._mount.appendChild(form);
    // Initialize CKEditors if any
    if (window.initializeEditor && this._ckeditors.length > 0) {
        this._ckeditors.forEach(async (field) => {
            const textarea = field.input;
            if (textarea && !textarea.ckeditorInitialized) {
                try {
                    // Initialize CKEditor and store the instance on the config field
                    if (window.initializeEditor) {
                        await window.initializeEditor(textarea).then(editor => {
                            // Find the field config and attach the instance
                            const fieldConfig = this._config.find(f => f.name === field.name);
                            if (fieldConfig) {
                                fieldConfig.ckeditorInstance = editor;
                            }
                            editor.editing.view.document.on('blur', () => __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_validateField).call(this, field));
                            editor.editing.view.document.on('input', () => __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_clearValidation).call(this, field));
                        });
                    }
                    textarea.ckeditorInitialized = true;
                }
                catch (err) {
                    console.error(`Failed to initialize CKEditor for ${field.name}:`, err);
                }
            }
        });
    }
    return form;
}, _DynamicForm_validateField = function _DynamicForm_validateField(field) {
    let value;
    let isValid = true;
    let message = '';
    let inputs = field.input;
    // Normalize input collection for grouped fields
    if (field.type === 'radio') {
        if (!Array.isArray(inputs)) {
            inputs = Array.from(this._form.querySelectorAll(`input[name="${field.name}"]`));
        }
        const checkedRadio = inputs.find(r => r.checked);
        value = checkedRadio ? checkedRadio.value : '';
    }
    else if (field.type === 'checkbox') {
        if (!Array.isArray(inputs)) {
            inputs = Array.from(this._form.querySelectorAll(`input[type="checkbox"][name="${field.name}"]`));
        }
        if (inputs.length > 1) {
            value = inputs.filter(c => c.checked).map(c => c.value);
        }
        else {
            value = inputs[0]?.checked || false;
        }
    }
    else if (field.type === 'select2') {
        const select = field.select2Instance;
        if (select) {
            const selectedValue = $(select).val();
            if (field.multiple) {
                value = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
            }
            else {
                value = selectedValue ?? '';
            }
        }
    }
    else if (field.type === 'select') {
        const select = Array.isArray(inputs) ? inputs[0] : inputs;
        if (select && select instanceof HTMLSelectElement) {
            if (select.multiple) {
                value = Array.from(select.selectedOptions).map(opt => opt.value);
            }
            else {
                value = select.value ?? '';
            }
        }
    }
    else if (field.type === 'ckeditor') {
        if (field.ckeditorInstance) {
            inputs = field.ckeditorInstance.ui.view.element;
            value = field.ckeditorInstance.getData();
        }
        else {
            value = '';
        }
    }
    else if (field.type === 'textarea') {
        const input = Array.isArray(inputs) ? inputs[0] : inputs;
        value = input?.value ?? '';
    }
    else {
        const input = Array.isArray(inputs) ? inputs[0] : inputs;
        value = input?.value ?? '';
    }
    // ===== Validation rules =====
    // Required
    if (field.required) {
        let missing = false;
        if (field.type === 'checkbox' && Array.isArray(value)) {
            missing = value.length === 0;
        }
        else if (field.type === 'select' && Array.isArray(value)) {
            missing = value.length === 0 || value.every(v => !v);
        }
        else if (field.type === 'radio') {
            missing = !value;
        }
        else {
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
        const validation = __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_validateInputs).call(this, field, value);
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
        const customResult = field.validation.custom(value, inputs, field);
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
    if (feedbackTarget && feedbackTarget.jquery) {
        feedbackTarget = feedbackTarget[0];
    }
    // Find group container and feedback div
    if (feedbackTarget && typeof feedbackTarget.closest === 'function') {
        const group = field.group;
        const feedbackDiv = group?.querySelector('.' + this._theme.getValidationErrorClasses());
        if (field.type === 'select2' && field.$select2Container) {
            const $container = field.$select2Container;
            const select2SelectionElement = $container.querySelector('.select2-selection');
            if (select2SelectionElement) {
                select2SelectionElement.classList.toggle(this._theme.getInvalidInputClasses(), !isValid);
            }
        }
        else if (Array.isArray(inputs) && inputs.length > 0) {
            // Set validity classes for all group items (radios/checkboxes)
            inputs.forEach(input => {
                if (input) {
                    input.classList.toggle(this._theme.getInvalidInputClasses(), !isValid);
                    input.classList.toggle(this._theme.getValidInputClasses(), isValid);
                }
            });
        }
        else if (feedbackTarget) {
            feedbackTarget.classList.toggle(this._theme.getInvalidInputClasses(), !isValid);
            feedbackTarget.classList.toggle(this._theme.getValidInputClasses(), isValid);
        }
        // Set feedback message
        if (feedbackDiv) {
            feedbackDiv.textContent = isValid ? '' : message;
            if (!isValid) {
                feedbackDiv.style.display = 'block';
            }
            else {
                feedbackDiv.style.display = '';
            }
        }
    }
    return isValid;
}, _DynamicForm_validateInputs = function _DynamicForm_validateInputs(field, value) {
    switch (field.type) {
        case 'text':
        case 'password':
        case 'search':
        case 'hidden':
            return { isValid: typeof value === 'string', message: 'Invalid string format.' };
        case 'number':
            if (value.trim() === '' || isNaN(Number(value))) {
                return { isValid: false, message: 'Invalid number format.' };
            }
            return { isValid: true, message: '' };
        case 'email':
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return { isValid: true, message: '' };
            }
            return { isValid: false, message: 'Invalid email format.' };
        case 'url':
            try {
                new URL(value);
                return { isValid: true, message: '' };
            }
            catch {
                return { isValid: false, message: 'Invalid URL format.' };
            }
        case 'tel':
            if (/^[\d\-\+\(\) ]+$/.test(value)) {
                return { isValid: true, message: '' };
            }
            return { isValid: false, message: 'Invalid telephone format.' };
        case 'date':
            if (/^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value))) {
                return { isValid: true, message: '' };
            }
            return { isValid: false, message: 'Invalid date format. Use YYYY-MM-DD.' };
        case 'color':
            if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                return { isValid: true, message: '' };
            }
            return { isValid: false, message: 'Invalid color format. Use #RRGGBB.' };
        case 'checkbox':
        case 'radio':
            if (value.length > 0) {
                return { isValid: true, message: '' };
            }
            return { isValid: false, message: 'No value selected.' };
        default:
            return { isValid: true, message: '' };
    }
}, _DynamicForm_clearValidation = function _DynamicForm_clearValidation(field) {
    if (field.type === 'radio') {
        // Get all radios in the group
        const group = field.group;
        if (group) {
            group.classList.remove(this._theme.getInvalidInputClasses());
            // Hide the feedback message
            const invalidFeedback = group.querySelector('.' + this._theme.getValidationErrorClasses());
            if (invalidFeedback) {
                invalidFeedback.style.display = 'none';
            }
        }
    }
    else {
        let input = field.input;
        if (input) {
            input.classList.remove(this._theme.getInvalidInputClasses());
            input.classList.remove(this._theme.getValidInputClasses());
            const feedbackElement = input.parentElement?.querySelector('.' + this._theme.getValidationErrorClasses());
            if (feedbackElement) {
                feedbackElement.textContent = '';
            }
        }
    }
}, _DynamicForm_clearAllValidation = function _DynamicForm_clearAllValidation() {
    this._config.filter((field) => field.type !== 'submit').forEach(field => {
        __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_clearValidation).call(this, field);
    });
}, _DynamicForm_validateForm = function _DynamicForm_validateForm() {
    // Gather values
    const data = {};
    let allValid = true;
    this._config.forEach(field => {
        if (field.type === 'submit')
            return;
        let val;
        // Get field value based on type
        switch (field.type) {
            case 'checkbox': {
                const checkbox = this._form.querySelector(`[name="${field.name}"]`);
                val = checkbox?.checked || false;
                break;
            }
            case 'radio': {
                const checked = this._form.querySelector(`input[name="${field.name}"]:checked`);
                val = checked ? checked.value : '';
                break;
            }
            case 'ckeditor': {
                val = field.ckeditorInstance ? field.ckeditorInstance.getData() : '';
                break;
            }
            default: {
                const element = this._form.elements.namedItem(field.name);
                val = element ? element.value : '';
            }
        }
        if (Array.isArray(val) && val.length === 0) {
            // Don't add empty arrays
            val = undefined;
        }
        else if ((typeof val === 'string' && val.trim() === '') || val === null || typeof val === 'undefined') {
            // Don't add empty string, null, or undefined
            val = undefined;
        }
        if (typeof val !== 'undefined') {
            data[field.name] = val;
        }
        // Validate field
        if (!__classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_validateField).call(this, field)) {
            allValid = false;
        }
    });
    return allValid;
}, _DynamicForm_handleSubmit = async function _DynamicForm_handleSubmit() {
    __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_clearAllValidation).call(this);
    let isValid = __classPrivateFieldGet(this, _DynamicForm_instances, "m", _DynamicForm_validateForm).call(this);
    if (!isValid)
        return;
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
    }
    catch (e) {
        // Handle submit error, show message, etc.
        // Modal remains open on failure
        console.error('Submission error:', e);
    }
};
export default DynamicForm;
//# sourceMappingURL=dynamic-form-builder.js.map