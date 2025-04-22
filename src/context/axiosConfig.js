import axios from 'axios';

// Configure axios defaults globally
axios.defaults.baseURL = 'https://admin.onlybigcars.com';
axios.defaults.validateStatus = (status) => {
    return status >= 200 && status < 300;
};

// Add request interceptor to handle self-signed certificate
axios.interceptors.request.use((config) => {
    config.validateStatus = (status) => {
        return status >= 200 && status < 300;
    };
    return config;
});

export default axios;