/**
 * Tailwind CSS theme implementation
 */
import Theme from './Theme.js';
import { ModalOptions, ModalCreationResult, ModalInstance } from '../types.js';
export default class TailwindTheme extends Theme {
    /**
     * Get form class names
     * @returns {string}
     */
    getFormClasses(): string;
    /**
     * Get form group class names
     * @returns {string}
     */
    getFormGroupClasses(): string;
    /**
     * Get label class names
     * @returns {string}
     */
    getLabelClasses(): string;
    /**
     * Get input class names
     * @param {string} type - Input type (text, email, password, etc.)
     * @returns {string}
     */
    getInputClasses(type: string): string;
    /**
     * Get select class names
     * @param {boolean} multiple - Whether the select is multiple
     * @returns {string}
     */
    getSelectClasses(multiple?: boolean): string;
    /**
     * Get textarea class names
     * @returns {string}
     */
    getTextareaClasses(): string;
    /**
     * Get checkbox container class names
     * @returns {string}
     */
    getCheckboxContainerClasses(): string;
    /**
     * Get checkbox input class names
     * @returns {string}
     */
    getCheckboxInputClasses(): string;
    /**
     * Get checkbox label class names
     * @returns {string}
     */
    getCheckboxLabelClasses(): string;
    /**
     * Get radio container class names
     * @returns {string}
     */
    getRadioContainerClasses(): string;
    /**
     * Get radio input class names
     * @returns {string}
     */
    getRadioInputClasses(): string;
    /**
     * Get radio label class names
     * @returns {string}
     */
    getRadioLabelClasses(): string;
    /**
     * Get submit button class names
     * @returns {string}
     */
    getSubmitButtonClasses(): string;
    /**
     * Get validation error message class names
     * @returns {string}
     */
    getValidationErrorClasses(): string;
    /**
     * Get helper text class names
     * @returns {string}
     */
    getHelperTextClasses(): string;
    /**
     * Get modal class names
     * @returns {string}
     */
    getModalClasses(): string;
    /**
     * Get modal dialog class names
     * @returns {string}
     */
    getModalDialogClasses(): string;
    /**
     * Get modal content class names
     * @returns {string}
     */
    getModalContentClasses(): string;
    /**
     * Get modal header class names
     * @returns {string}
     */
    getModalHeaderClasses(): string;
    /**
     * Get modal title class names
     * @returns {string}
     */
    getModalTitleClasses(): string;
    /**
     * Get modal close button class names
     * @returns {string}
     */
    getModalCloseButtonClasses(): string;
    /**
     * Get modal body class names
     * @returns {string}
     */
    getModalBodyClasses(): string;
    /**
     * Get invalid input class names
     * @returns {string}
     */
    getInvalidInputClasses(): string;
    /**
     * Get valid input class names
     * @returns {string}
     */
    getValidInputClasses(): string;
    /**
     * Get file info container class names
     * @returns {string}
     */
    getFileInfoClasses(): string;
    /**
     * Get file thumbnail class names
     * @returns {string}
     */
    getFileThumbnailClasses(): string;
    /**
     * Get file info text class names
     * @returns {string}
     */
    getFileInfoTextClasses(): string;
    /**
     * Creates a modal and returns the modal body element for mounting the form
     * @param {ModalOptions} modalOptions - Modal options (id, title, etc.)
     * @returns {ModalCreationResult} - Object containing the modal element and the modal body element
     */
    createModal(modalOptions: ModalOptions): ModalCreationResult;
    /**
     * Initializes the modal and returns the modal instance
     * @param {HTMLElement} modal - The modal element
     * @param {ModalOptions} options - Modal initialization options
     * @returns {ModalInstance} - The modal instance
     */
    initializeModal(modal: HTMLElement, options?: ModalOptions): ModalInstance;
    showModal(modal: HTMLElement): void;
    hideModal(modal: HTMLElement): void;
}
