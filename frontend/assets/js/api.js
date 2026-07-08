/* ========================================
   Agesis AI - API Wrapper
   ======================================== */

const AgesisApi = {
    /**
     * Core request method
     * @param {string} endpoint
     * @param {object} options
     * @returns {Promise<any>}
     */
    async request(endpoint, options = {}) {
        const url = `${AgesisConfig.apiBaseUrl}${endpoint}`;

        // Retrieve auth token automatically
        const token = AgesisUtils.storage.get(AgesisConfig.authTokenKey);

        // Setup headers
        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...options.headers,
        };

        // Attach Authorization header if token exists
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            // Implement timeout manually (AbortController)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), AgesisConfig.apiTimeout);
            config.signal = controller.signal;

            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            // Handle HTTP Errors
            if (!response.ok) {
                // Attempt to parse error message from backend
                const errorData = await response.json().catch(() => ({}));
                const errorMessage =
                    errorData.message || `HTTP Error: ${response.status} ${response.statusText}`;

                // Handle 401 Unauthorized globally (e.g., force logout)
                if (response.status === 401) {
                    AgesisUtils.storage.remove(AgesisConfig.authTokenKey);
                    // Redirect to login if not already there
                    if (window.location.pathname.includes("/login.html")) return;
                    window.location.href = "/pages/login.html";
                }

                throw new Error(errorMessage);
            }

            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            return await response.json();
        } catch (error) {
            // Distinguish between network errors, aborts, and API errors
            if (error.name === "AbortError") {
                throw new Error("Request timed out. Please check your connection.");
            }

            console.error(`[Agesis API] ${error.message}`);
            throw error; // Re-throw to be handled by the specific UI component
        }
    },

    /* --- Convenience Methods --- */

    get(endpoint, params = {}) {
        // Append URL search parameters
        const url = new URL(endpoint, AgesisConfig.apiBaseUrl);
        Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

        // Remove the base URL from the pathname since request() adds it back
        const cleanEndpoint = url.toString().replace(AgesisConfig.apiBaseUrl, "");

        return this.request(cleanEndpoint, {
            method: "GET",
        });
    },

    post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    delete(endpoint) {
        return this.request(endpoint, {
            method: "DELETE",
        });
    },
};
