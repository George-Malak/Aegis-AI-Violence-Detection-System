/* ========================================
   Agesis AI - Form Validation Utilities
   ======================================== */

const AgesisValidation = {
    // Email regex pattern
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    /**
     * Validates an email string
     * @param {string} email
     * @returns {boolean}
     */
    isValidEmail(email) {
        return this.emailRegex.test(email);
    },

    /**
     * Validates password length
     * @param {string} password
     * @param {number} minLength
     * @returns {boolean}
     */
    isValidPassword(password, minLength = 6) {
        return password && password.length >= minLength;
    },

    /**
     * Shows error state on an input field
     * @param {HTMLElement} input
     * @param {string} message
     */
    showError(input, message) {
        input.classList.add("error");
        const errorContainer = input.parentElement.querySelector(".form-error");
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.add("visible");
        }
    },

    /**
     * Clears error state on an input field
     * @param {HTMLElement} input
     */
    clearError(input) {
        input.classList.remove("error");
        const errorContainer = input.parentElement.querySelector(".form-error");
        if (errorContainer) {
            errorContainer.textContent = "";
            errorContainer.classList.remove("visible");
        }
    },

    /**
     * Clears all errors in a form
     * @param {HTMLFormElement} form
     */
    clearAllErrors(form) {
        const inputs = form.querySelectorAll(".form-input");
        inputs.forEach((input) => this.clearError(input));
        const formAlert = form.querySelector(".form-alert");
        if (formAlert) formAlert.classList.remove("visible");
    },
};

/* ========================================
   Agesis AI - Form Validation Utilities
   ======================================== */

const AgesisValidation = {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    isValidEmail(email) {
        return this.emailRegex.test(email);
    },

    isValidPassword(password, minLength = 8) {
        // Increased to 8 chars for signup security
        return password && password.length >= minLength;
    },

    // NEW: Check if passwords match
    isPasswordMatch(password, confirmPassword) {
        return password === confirmPassword;
    },

    // NEW: Check if a field is just empty
    isRequired(value) {
        return value && value.trim().length > 0;
    },

    showError(input, message) {
        input.classList.add("error");
        const errorContainer = input.parentElement.querySelector(".form-error");
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.add("visible");
        }
    },

    clearError(input) {
        input.classList.remove("error");
        const errorContainer = input.parentElement.querySelector(".form-error");
        if (errorContainer) {
            errorContainer.textContent = "";
            errorContainer.classList.remove("visible");
        }
    },

    clearAllErrors(form) {
        const inputs = form.querySelectorAll(".form-input");
        inputs.forEach((input) => this.clearError(input));
        const formAlert = form.querySelector(".form-alert");
        if (formAlert) formAlert.classList.remove("visible");
    },

    // NEW: Check if a field is just empty
    isRequired(value) {
        return value && value.trim().length > 0;
    },

    // NEW: Check if passwords match
    isPasswordMatch(password, confirmPassword) {
        return password === confirmPassword;
    },
};
