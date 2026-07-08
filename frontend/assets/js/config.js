/* ========================================
   Agesis AI - Application Configuration
   ======================================== */

const AgesisConfig = {
    // API Base URL - Update this when the backend is ready
    apiBaseUrl: "https://api.agesis.ai/v1",

    // Application Environment
    env: "development", // 'development' | 'staging' | 'production'

    // Authentication Keys
    authTokenKey: "agesis_auth_token",
    refreshTokenKey: "agesis_refresh_token",

    // Timeouts & Limits
    apiTimeout: 10000, // 10 seconds

    // Date Format Preferences
    dateFormat: "MM/DD/YYYY",
    timeFormat: "HH:mm:ss",

    // Pagination Defaults
    defaultPageSize: 25,
};
