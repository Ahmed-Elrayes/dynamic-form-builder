/**
 * Bootstrap 5.2 theme implementation
 */
import Theme from './Theme.js';
import { ModalOptions, ModalCreationResult, ModalInstance } from '../types.js';

// Define the bootstrap global variable for TypeScript
declare global {
    interface Window {
        bootstrap: any; // Import * as Bootstrap from 'bootstrap'
    }
}

export default class Bootstrap5Theme extends Theme {
    /**
     * Get form class names
     * @returns {string}
     */
    getFormClasses(): string {
        return '';
    }

    /**
     * Get form group class names
     * @returns {string}
     */
    getFormGroupClasses(): string {
        return 'mb-3';
    }

    /**
     * Get label class names
     * @returns {string}
     */
    getLabelClasses(): string {
        return 'form-label';
    }

    /**
     * Get input class names
     * @param {string} type - Input type (text, email, password, etc.)
     * @returns {string}
     */
    getInputClasses(type: string): string {
        return 'form-control';
    }

    /**
     * Get select class names
     * @param {boolean} multiple - Whether the select is multiple
     * @returns {string}
     */
    getSelectClasses(multiple: boolean = false): string {
        return 'form-select';
    }

    /**
     * Get textarea class names
     * @returns {string}
     */
    getTextareaClasses(): string {
        return 'form-control';
    }

    /**
     * Get checkbox container class names
     * @returns {string}
     */
    getCheckboxContainerClasses(): string {
        return 'form-check';
    }

    /**
     * Get checkbox input class names
     * @returns {string}
     */
    getCheckboxInputClasses(): string {
        return 'form-check-input';
    }

    /**
     * Get checkbox label class names
     * @returns {string}
     */
    getCheckboxLabelClasses(): string {
        return 'form-check-label ms-2';
    }

    /**
     * Get radio container class names
     * @returns {string}
     */
    getRadioContainerClasses(): string {
        return 'form-check form-check-inline';
    }

    /**
     * Get radio input class names
     * @returns {string}
     */
    getRadioInputClasses(): string {
        return 'form-check-input';
    }

    /**
     * Get radio label class names
     * @returns {string}
     */
    getRadioLabelClasses(): string {
        return 'form-check-label';
    }

    /**
     * Get submit button class names
     * @returns {string}
     */
    getSubmitButtonClasses(): string {
        return 'btn btn-primary mt-3';
    }

    /**
     * Get validation error message class names
     * @returns {string}
     */
    getValidationErrorClasses(): string {
        return 'invalid-feedback';
    }

    /**
     * Get helper text class names
     * @returns {string}
     */
    getHelperTextClasses(): string {
        return 'form-text text-muted small mt-1';
    }

    /**
     * Get modal class names
     * @returns {string}
     */
    getModalClasses(): string {
        return 'modal fade';
    }

    /**
     * Get modal dialog class names
     * @returns {string}
     */
    getModalDialogClasses(): string {
        return 'modal-dialog';
    }

    /**
     * Get modal content class names
     * @returns {string}
     */
    getModalContentClasses(): string {
        return 'modal-content';
    }

    /**
     * Get modal header class names
     * @returns {string}
     */
    getModalHeaderClasses(): string {
        return 'modal-header';
    }

    /**
     * Get modal title class names
     * @returns {string}
     */
    getModalTitleClasses(): string {
        return 'modal-title';
    }

    /**
     * Get modal close button class names
     * @returns {string}
     */
    getModalCloseButtonClasses(): string {
        return 'btn-close';
    }

    /**
     * Get modal body class names
     * @returns {string}
     */
    getModalBodyClasses(): string {
        return 'modal-body';
    }

    /**
     * Get invalid input class names
     * @returns {string}
     */
    getInvalidInputClasses(): string {
        return 'is-invalid';
    }

    /**
     * Get valid input class names
     * @returns {string}
     */
    getValidInputClasses(): string {
        return 'is-valid';
    }

    /**
     * Get file info container class names
     * @returns {string}
     */
    getFileInfoClasses(): string {
        return 'mt-2';
    }

    /**
     * Get file thumbnail class names
     * @returns {string}
     */
    getFileThumbnailClasses(): string {
        return 'img-thumbnail';
    }

    /**
     * Get file info text class names
     * @returns {string}
     */
    getFileInfoTextClasses(): string {
        return 'small text-muted';
    }

    /**
     * Creates a modal and returns the modal body element for mounting the form
     * @param {ModalOptions} modalOptions - Modal options (id, title, etc.)
     * @returns {ModalCreationResult} - Object containing the modal element and the modal body element
     */
    createModal(modalOptions: ModalOptions): ModalCreationResult {
        const type = modalOptions.type || 'modal';

        // Offcanvas (Bootstrap 5.2) support
        if (type === 'offcanvas') {
            const offcanvas = document.createElement('div');
            offcanvas.className = 'offcanvas offcanvas-end';
            offcanvas.id = modalOptions.id || '';
            offcanvas.tabIndex = -1;
            if (modalOptions.title) {
                offcanvas.ariaLabel = modalOptions.title;
            }
            offcanvas.ariaHidden = 'true';
            offcanvas.innerHTML = `
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title">${modalOptions.title || ''}</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body"></div>
            `;
            document.body.appendChild(offcanvas);
            const body = offcanvas.querySelector('.offcanvas-body');
            if (!body) throw new Error('Offcanvas body element not found');
            return { modal: offcanvas, modalBody: body as HTMLElement };
        }

        // Default: Modal
        const modal = document.createElement('div');
        modal.className = this.getModalClasses();
        modal.id = modalOptions.id || '';
        modal.tabIndex = -1;
        if (modalOptions.title) {
            modal.ariaLabel = modalOptions.title;
        }
        modal.ariaHidden = 'true';
        modal.innerHTML = `
            <div class="${this.getModalDialogClasses()}">
                <div class="${this.getModalContentClasses()}">
                    <div class="${this.getModalHeaderClasses()}">
                        <h5 class="${this.getModalTitleClasses()}">${modalOptions.title || ''}</h5>
                        <button type="button" class="${this.getModalCloseButtonClasses()}" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="${this.getModalBodyClasses()}"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const modalBody = modal.querySelector('.' + this.getModalBodyClasses().split(' ')[0]);
        if (!modalBody) {
            throw new Error('Modal body element not found');
        }

        return {
            modal: modal,
            modalBody: modalBody as HTMLElement
        };
    }

    /**
     * Initializes the modal and returns the modal instance
     * @param {HTMLElement} modal - The modal element
     * @param {ModalOptions} options - Modal initialization options
     * @returns {ModalInstance} - The modal instance
     */
    initializeModal(modal: HTMLElement, options?: ModalOptions): ModalInstance {
        if (!window.bootstrap) {
            console.warn('Bootstrap not found. Make sure Bootstrap is loaded.');
            return { show: () => {}, hide: () => {}, toggle: () => {}, dispose: () => {}, getInstance: () => null };
        }

        // Offcanvas case
        if (modal.classList.contains('offcanvas')) {
            const Offcanvas = (window.bootstrap as any).Offcanvas;
            if (!Offcanvas) {
                console.warn('Bootstrap Offcanvas not found.');
                return { show: () => {}, hide: () => {}, toggle: () => {}, dispose: () => {}, getInstance: () => null };
            }
            const offcanvasInstance = new Offcanvas(modal, { backdrop: options?.staticBackdrop ? true : true });

            modal.addEventListener('hidden.bs.offcanvas', () => {
                modal.dispatchEvent(new CustomEvent('offcanvas:hidden'));
            });

            return {
                show: () => offcanvasInstance.show(),
                hide: () => offcanvasInstance.hide(),
                toggle: () => offcanvasInstance.toggle(),
                dispose: () => offcanvasInstance.dispose(),
                getInstance: () => offcanvasInstance
            };
        }

        // Default modal case
        if (!(window.bootstrap as any).Modal) {
            console.warn('Bootstrap Modal not found. Make sure Bootstrap is loaded.');
            return { show: () => {}, hide: () => {}, toggle: () => {}, dispose: () => {}, getInstance: () => null };
        }
        const modalInstance = new (window.bootstrap as any).Modal(modal, { backdrop: 'static', ...options });

        window.addEventListener('hide.bs.modal', () => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
        });

        modal.addEventListener('hidden.bs.modal', () => {
            modal.dispatchEvent(new CustomEvent('modal:hidden'));
        });

        return {
            show: () => modalInstance.show(),
            hide: () => modalInstance.hide(),
            toggle: () => modalInstance.toggle(),
            dispose: () => modalInstance.dispose(),
            getInstance: () => modalInstance
        };
    }
}
