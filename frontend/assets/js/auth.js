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
};

// Initialization handled by main.js
