/* ========================================
   Agesis AI - Utility Functions
   ======================================== */

const AgesisUtils = {
    /* --- DOM Helpers --- */
    /**
     * Shorthand for querySelector
     * @param {string} selector
     * @param {HTMLElement} parent
     * @returns {HTMLElement|null}
     */
    $(selector, parent = document) {
        return parent.querySelector(selector);
    },

    /**
     * Shorthand for querySelectorAll (returns real Array, not NodeList)
     * @param {string} selector
     * @param {HTMLElement} parent
     * @returns {Array<HTMLElement>}
     */
    $$(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    },

    /* --- Storage Helpers --- */
    storage: {
        get(key) {
            const value = localStorage.getItem(key);
            try {
                return JSON.parse(value);
            } catch (e) {
                return value; // Return raw string if not JSON
            }
        },
        set(key, value) {
            if (typeof value === "object") {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                localStorage.setItem(key, value);
            }
        },
        remove(key) {
            localStorage.removeItem(key);
        },
        clear() {
            localStorage.clear();
        },
    },

    /* --- Date & Time Formatting --- */
    /**
     * Formats a date string or timestamp
     * @param {string|number} dateStr
     * @returns {string}
     */
    formatDate(dateStr) {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    },

    formatTime(dateStr) {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    },

    formatDateTime(dateStr) {
        return `${this.formatDate(dateStr)} ${this.formatTime(dateStr)}`;
    },

    /* --- Performance Helpers --- */
    /**
     * Debounce function execution
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    debounce(func, wait = 300) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * Throttle function execution
     * @param {Function} func
     * @param {number} limit
     * @returns {Function}
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    },

    /* --- Formatting --- */
    /**
     * Format numbers with commas (e.g., 1500 -> 1,500)
     * @param {number} num
     * @returns {string}
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    /**
     * Capitalize first letter of a string
     * @param {string} str
     * @returns {string}
     */
    capitalize(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
};
