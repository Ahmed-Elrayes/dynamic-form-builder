/**
 * Base Theme class that defines the interface for all themes
 * This serves as a contract that all theme implementations must follow
 */
import { ModalOptions, ModalCreationResult, ModalInstance } from '../types.js';

export default class Theme {
    /**
     * Get form class names
     * @returns {string}
     */
    getFormClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get form group class names
     * @returns {string}
     */
    getFormGroupClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get label class names
     * @returns {string}
     */
    getLabelClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get input class names
     * @param {string} type - Input type (text, email, password, etc.)
     * @returns {string}
     */
    getInputClasses(type: string): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get select class names
     * @param {boolean} multiple - Whether the select is multiple
     * @returns {string}
     */
    getSelectClasses(multiple: boolean = false): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get textarea class names
     * @returns {string}
     */
    getTextareaClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get checkbox container class names
     * @returns {string}
     */
    getCheckboxContainerClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get checkbox input class names
     * @returns {string}
     */
    getCheckboxInputClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get checkbox label class names
     * @returns {string}
     */
    getCheckboxLabelClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get radio container class names
     * @returns {string}
     */
    getRadioContainerClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get radio input class names
     * @returns {string}
     */
    getRadioInputClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get radio label class names
     * @returns {string}
     */
    getRadioLabelClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get submit button class names
     * @returns {string}
     */
    getSubmitButtonClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get validation error message class names
     * @returns {string}
     */
    getValidationErrorClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get helper text class names
     * @returns {string}
     */
    getHelperTextClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get modal class names
     * @returns {string}
     */
    getModalClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get modal dialog class names
     * @returns {string}
     */
    getModalDialogClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get modal content class names
     * @returns {string}
     */
    getModalContentClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get modal header class names
     * @returns {string}
     */
    getModalHeaderClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get modal title class names
     * @returns {string}
     */
    getModalTitleClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get modal close button class names
     * @returns {string}
     */
    getModalCloseButtonClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get modal body class names
     * @returns {string}
     */
    getModalBodyClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get invalid input class names
     * @returns {string}
     */
    getInvalidInputClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get valid input class names
     * @returns {string}
     */
    getValidInputClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get file info container class names
     * @returns {string}
     */
    getFileInfoClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get file thumbnail class names
     * @returns {string}
     */
    getFileThumbnailClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Get file info text class names
     * @returns {string}
     */
    getFileInfoTextClasses(): string {
        throw new Error('Method not implemented');
    }

    /**
     * Creates a modal and returns the modal body element for mounting the form
     * @param {ModalOptions} modalOptions - Modal options (id, title, etc.)
     * @returns {ModalCreationResult} - Object containing the modal element and the modal body element
     */
    createModal(modalOptions: ModalOptions): ModalCreationResult {
        throw new Error('Method not implemented');
    }

    /**
     * Initializes the modal and returns the modal instance
     * @param {HTMLElement} modal - The modal element
     * @param {ModalOptions} options - Modal initialization options
     * @returns {ModalInstance} - The modal instance
     */
    initializeModal(modal: HTMLElement, options?: ModalOptions): ModalInstance {
        throw new Error('Method not implemented');
    }
}
