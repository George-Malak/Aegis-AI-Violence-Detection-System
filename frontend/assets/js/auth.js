/* ========================================
   Agesis AI - Authentication Logic
   ======================================== */

const AgesisAuth = {
    tokenKey: "agesis_auth_token",

    init() {
        const loginForm = document.getElementById("login-form");
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => this.handleLogin(e));
        }

        const signupForm = document.getElementById("signup-form");
        if (signupForm) {
            signupForm.addEventListener("submit", (e) => this.handleSignup(e));
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const form = e.target;
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const submitButton = document.getElementById("login-button");
        const formAlert = document.getElementById("login-form-alert");

        AgesisValidation.clearAllErrors(form);

        let isValid = true;

        if (!emailInput.value) {
            AgesisValidation.showError(emailInput, "Email address is required.");
            isValid = false;
        } else if (!AgesisValidation.isValidEmail(emailInput.value)) {
            // FIXED TYPO HERE
            AgesisValidation.showError(emailInput, "Please enter a valid email address.");
            isValid = false;
        }

        if (!passwordInput.value) {
            AgesisValidation.showError(passwordInput, "Password is required.");
            isValid = false;
        } else if (!AgesisValidation.isValidPassword(passwordInput.value, 6)) {
            AgesisValidation.showError(passwordInput, "Password must be at least 6 characters.");
            isValid = false;
        }

        if (!isValid) return;

        submitButton.classList.add("btn-loading");
        submitButton.innerHTML = '<span style="visibility: hidden;">Sign In</span>';
        submitButton.disabled = true;

        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));

            if (emailInput.value.endsWith(".com")) {
                const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulatedtoken";
                this.saveToken(fakeToken);
                window.location.href = "dashboard.html";
            } else {
                throw new Error("Invalid email or password. Please try again.");
            }
        } catch (error) {
            formAlert.textContent = error.message;
            formAlert.classList.add("visible");
            submitButton.classList.remove("btn-loading");
            submitButton.innerHTML = "Sign In";
            submitButton.disabled = false;
        }
    },

    saveToken(token) {
        localStorage.setItem(this.tokenKey, token);
    },

    getToken() {
        return localStorage.getItem(this.tokenKey);
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    logout() {
        localStorage.removeItem(this.tokenKey);
        window.location.href = "login.html";
    },

    async handleSignup(e) {
        e.preventDefault();
        const form = e.target;
        const firstName = document.getElementById("first-name");
        const lastName = document.getElementById("last-name");
        const email = document.getElementById("email");
        const organization = document.getElementById("organization");
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirm-password");
        const terms = document.getElementById("terms");
        const submitButton = document.getElementById("signup-button");
        const formAlert = document.getElementById("signup-form-alert");

        AgesisValidation.clearAllErrors(form);
        let isValid = true;

        // Validate Names
        if (!AgesisValidation.isRequired(firstName.value)) {
            AgesisValidation.showError(firstName, "First name is required.");
            isValid = false;
        }
        if (!AgesisValidation.isRequired(lastName.value)) {
            AgesisValidation.showError(lastName, "Last name is required.");
            isValid = false;
        }

        // Validate Email & Org
        if (!AgesisValidation.isValidEmail(email.value)) {
            AgesisValidation.showError(email, "A valid company email is required.");
            isValid = false;
        }
        if (!AgesisValidation.isRequired(organization.value)) {
            AgesisValidation.showError(organization, "Organization name is required.");
            isValid = false;
        }

        // Validate Passwords
        if (!AgesisValidation.isValidPassword(password.value, 8)) {
            AgesisValidation.showError(password, "Password must be at least 8 characters.");
            isValid = false;
        } else if (!AgesisValidation.isPasswordMatch(password.value, confirmPassword.value)) {
            AgesisValidation.showError(confirmPassword, "Passwords do not match.");
            isValid = false;
        }

        // Validate Terms
        if (!terms.checked) {
            const termsError = terms.parentElement.parentElement.querySelector(".form-error");
            termsError.textContent = "You must agree to the terms.";
            termsError.classList.add("visible");
            isValid = false;
        }

        if (!isValid) return;

        // Simulate API Call
        submitButton.classList.add("btn-loading");
        submitButton.innerHTML = '<span style="visibility: hidden;">Create Account</span>';
        submitButton.disabled = true;

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulatedtoken";
            this.saveToken(fakeToken);
            window.location.href = "dashboard.html";
        } catch (error) {
            formAlert.textContent = error.message || "Failed to create account. Please try again.";
            formAlert.classList.add("visible");
            submitButton.classList.remove("btn-loading");
            submitButton.innerHTML = "Create Account";
            submitButton.disabled = false;
        }
    },
};

// Initialization handled by main.js
