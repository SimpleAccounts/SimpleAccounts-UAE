import axios from 'axios';
import config from 'constants/config';

const api = axios.create({
  baseURL: config.API_ROOT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header and handle FormData
api.interceptors.request.use(
  config => {
    // Add Authorization header if accessToken exists
    const accessToken = window['localStorage']?.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // If data is FormData, remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    return Promise.reject(error.response);
  }
);

export default api;
