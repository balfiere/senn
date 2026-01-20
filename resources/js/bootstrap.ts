import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// Function to get CSRF token from meta tag
function getCsrfToken(): string | null {
    const tokenElement = document.head.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    return tokenElement ? tokenElement.getAttribute('content') : null;
}

// Add CSRF token to all requests if available
const csrfToken = getCsrfToken();
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

// Add request interceptor to ensure CSRF token is always included
window.axios.interceptors.request.use(
    (config) => {
        const token = getCsrfToken();
        if (token && !config.headers['X-CSRF-TOKEN']) {
            config.headers['X-CSRF-TOKEN'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);