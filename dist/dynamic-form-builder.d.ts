import { DynamicFormOptions, FieldConfig, ModalInstance } from './types.js';
declare global {
    interface Window {
        $: any;
        bootstrap: any;
        initializeEditor?: (element: HTMLElement) => Promise<any>;
    }
}
export default class DynamicForm {
    #private;
    private _config;
    private _mount;
    private _onSubmit;
    private _onInitialized?;
    private _ckeditors;
    private _theme;
    private _modalOptions;
    private _modalInstance;
    private _modal;
    private _form;
    private _requiredPackages;
    private _hasSelect2;
    /**
     * @param {DynamicFormOptions} options
     */
    constructor({ config, mount, modalOptions, onSubmit, onInitialized, theme, waitForDOMReady }: DynamicFormOptions);
    /**
     * Get the form element
     * @returns {HTMLFormElement}
     */
    getForm(): HTMLFormElement;
    /**
     * Get form data
     * @returns {Array<FieldConfig | any>}
     */
    getData(): (FieldConfig | any)[];
    /**
     * Get the modal instance
     * @returns {ModalInstance|null}
     */
    getModalInstance(): ModalInstance | null;
    /**
     * Collect all form inputs
     * @returns {Record<string, HTMLElement | HTMLElement[]>}
     */
    collectFormInputs(): Record<string, HTMLElement | HTMLElement[]>;
    /**
     * Destroy the form and clean up resources
     */
    destroy(): void;
    /**
     * Clears all form inputs and validations, effectively reinitializing the form
     * @returns {DynamicForm} The form instance for chaining
     */
    clearForm(): DynamicForm;
}
