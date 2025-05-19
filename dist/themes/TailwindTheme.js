/**
 * Tailwind CSS theme implementation
 */
import Theme from './Theme.js';
export default class TailwindTheme extends Theme {
    /**
     * Get form class names
     * @returns {string}
     */
    getFormClasses() {
        return '';
    }
    /**
     * Get form group class names
     * @returns {string}
     */
    getFormGroupClasses() {
        return 'mb-4';
    }
    /**
     * Get label class names
     * @returns {string}
     */
    getLabelClasses() {
        return 'block text-sm font-medium text-gray-700 mb-1';
    }
    /**
     * Get input class names
     * @param {string} type - Input type (text, email, password, etc.)
     * @returns {string}
     */
    getInputClasses(type) {
        return 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
    }
    /**
     * Get select class names
     * @param {boolean} multiple - Whether the select is multiple
     * @returns {string}
     */
    getSelectClasses(multiple = false) {
        return 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
    }
    /**
     * Get textarea class names
     * @returns {string}
     */
    getTextareaClasses() {
        return 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
    }
    /**
     * Get checkbox container class names
     * @returns {string}
     */
    getCheckboxContainerClasses() {
        return 'flex items-start';
    }
    /**
     * Get checkbox input class names
     * @returns {string}
     */
    getCheckboxInputClasses() {
        return 'h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500';
    }
    /**
     * Get checkbox label class names
     * @returns {string}
     */
    getCheckboxLabelClasses() {
        return 'ml-2 block text-sm text-gray-700';
    }
    /**
     * Get radio container class names
     * @returns {string}
     */
    getRadioContainerClasses() {
        return 'flex items-center mr-4';
    }
    /**
     * Get radio input class names
     * @returns {string}
     */
    getRadioInputClasses() {
        return 'h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500';
    }
    /**
     * Get radio label class names
     * @returns {string}
     */
    getRadioLabelClasses() {
        return 'ml-2 block text-sm text-gray-700';
    }
    /**
     * Get submit button class names
     * @returns {string}
     */
    getSubmitButtonClasses() {
        return 'inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-4';
    }
    /**
     * Get validation error message class names
     * @returns {string}
     */
    getValidationErrorClasses() {
        return 'mt-2 text-sm text-red-600';
    }
    /**
     * Get helper text class names
     * @returns {string}
     */
    getHelperTextClasses() {
        return 'mt-1 text-sm text-gray-500';
    }
    /**
     * Get modal class names
     * @returns {string}
     */
    getModalClasses() {
        return 'fixed inset-0 z-10 overflow-y-auto';
    }
    /**
     * Get modal dialog class names
     * @returns {string}
     */
    getModalDialogClasses() {
        return 'flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0';
    }
    /**
     * Get modal content class names
     * @returns {string}
     */
    getModalContentClasses() {
        return 'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg';
    }
    /**
     * Get modal header class names
     * @returns {string}
     */
    getModalHeaderClasses() {
        return 'bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4';
    }
    /**
     * Get modal title class names
     * @returns {string}
     */
    getModalTitleClasses() {
        return 'text-lg font-medium leading-6 text-gray-900';
    }
    /**
     * Get modal close button class names
     * @returns {string}
     */
    getModalCloseButtonClasses() {
        return 'absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center';
    }
    /**
     * Get modal body class names
     * @returns {string}
     */
    getModalBodyClasses() {
        return 'bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4';
    }
    /**
     * Get invalid input class names
     * @returns {string}
     */
    getInvalidInputClasses() {
        return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    }
    /**
     * Get valid input class names
     * @returns {string}
     */
    getValidInputClasses() {
        return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    }
    /**
     * Get file info container class names
     * @returns {string}
     */
    getFileInfoClasses() {
        return 'mt-2';
    }
    /**
     * Get file thumbnail class names
     * @returns {string}
     */
    getFileThumbnailClasses() {
        return 'max-w-[150px] rounded-md border border-gray-300';
    }
    /**
     * Get file info text class names
     * @returns {string}
     */
    getFileInfoTextClasses() {
        return 'text-sm text-gray-500';
    }
    /**
     * Creates a modal and returns the modal body element for mounting the form
     * @param {ModalOptions} modalOptions - Modal options (id, title, etc.)
     * @returns {ModalCreationResult} - Object containing the modal element and the modal body element
     */
    createModal(modalOptions) {
        // Generate modal structure with Tailwind CSS classes
        const modal = document.createElement('div');
        modal.className = this.getModalClasses();
        modal.id = modalOptions.id || '';
        modal.tabIndex = -1;
        if (modalOptions.title) {
            modal.ariaLabel = modalOptions.title;
        }
        modal.ariaHidden = "true";
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity';
        modal.appendChild(backdrop);
        // Create dialog container
        const dialogContainer = document.createElement('div');
        dialogContainer.className = this.getModalDialogClasses();
        modal.appendChild(dialogContainer);
        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = this.getModalContentClasses();
        dialogContainer.appendChild(contentContainer);
        // Create header
        const header = document.createElement('div');
        header.className = this.getModalHeaderClasses();
        contentContainer.appendChild(header);
        // Create title
        const title = document.createElement('h3');
        title.className = this.getModalTitleClasses();
        title.textContent = modalOptions.title || '';
        header.appendChild(title);
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = this.getModalCloseButtonClasses();
        closeButton.setAttribute('data-dismiss', 'modal');
        header.appendChild(closeButton);
        // Add close icon
        closeButton.innerHTML = `
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        `;
        // Create body
        const body = document.createElement('div');
        body.className = this.getModalBodyClasses();
        contentContainer.appendChild(body);
        document.body.appendChild(modal);
        return {
            modal: modal,
            modalBody: body
        };
    }
    /**
     * Initializes the modal and returns the modal instance
     * @param {HTMLElement} modal - The modal element
     * @param {ModalOptions} options - Modal initialization options
     * @returns {ModalInstance} - The modal instance
     */
    initializeModal(modal, options) {
        // Tailwind doesn't have built-in modal functionality, so we implement it ourselves
        // Add event listener to close button
        const closeButton = modal.querySelector('button[data-dismiss="modal"]');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideModal(modal);
            });
        }
        // Add event listener for ESC key to close modal
        const escKeyHandler = (e) => {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                this.hideModal(modal);
            }
        };
        document.addEventListener('keydown', escKeyHandler);
        // Add event listener for backdrop click to close modal
        const backdrop = modal.querySelector('.fixed.inset-0');
        if (backdrop && !options?.staticBackdrop) {
            backdrop.addEventListener('click', (e) => {
                if (e.target === backdrop) {
                    this.hideModal(modal);
                }
            });
        }
        // Return an object with show/hide methods
        return {
            show: () => this.showModal(modal),
            hide: () => this.hideModal(modal),
            toggle: () => modal.classList.contains('hidden') ? this.showModal(modal) : this.hideModal(modal),
            dispose: () => {
                modal.remove();
            },
            getInstance: () => null // No instance in Tailwind
        };
    }
    // Helper methods for Tailwind modal
    showModal(modal) {
        if (!modal)
            return;
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        // Trigger animation
        setTimeout(() => {
            const backdrop = modal.querySelector('.fixed.inset-0');
            if (backdrop) {
                backdrop.classList.remove('opacity-0');
                backdrop.classList.add('opacity-100');
            }
            const dialog = modal.querySelector('.' + this.getModalDialogClasses().split(' ')[0]);
            if (dialog) {
                dialog.classList.remove('opacity-0', 'translate-y-4', 'sm:translate-y-0', 'sm:scale-95');
                dialog.classList.add('opacity-100', 'translate-y-0', 'sm:scale-100');
            }
        }, 10);
        modal.dispatchEvent(new CustomEvent('modal:shown'));
    }
    hideModal(modal) {
        if (!modal)
            return;
        // Trigger animation
        const backdrop = modal.querySelector('.fixed.inset-0');
        if (backdrop) {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0');
        }
        const dialog = modal.querySelector('.' + this.getModalDialogClasses().split(' ')[0]);
        if (dialog) {
            dialog.classList.remove('opacity-100', 'translate-y-0', 'sm:scale-100');
            dialog.classList.add('opacity-0', 'translate-y-4', 'sm:translate-y-0', 'sm:scale-95');
        }
        // Hide after animation
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            modal.dispatchEvent(new CustomEvent('modal:hidden'));
        }, 300);
    }
}
//# sourceMappingURL=TailwindTheme.js.map