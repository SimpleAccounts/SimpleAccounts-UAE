import axios from 'axios';
import config from 'constants/config';
import { toast } from 'sonner';

const authApi = axios.create({
  baseURL: config.API_ROOT_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authApi.interceptors.request.use(
  config => {
    const accessToken = window['localStorage']?.getItem('accessToken');
    // Only add Authorization header if token exists and is not empty
    if (accessToken && accessToken.trim().length > 0) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn('[authApi] No valid access token found for request:', config.url);
    }
    return config;
  },
  error => {
    return Promise.reject(error.response);
  }
);

authApi.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      toast.error('Session Ended. Log in Again!', {
        position: 'top-right',
      });
      window['localStorage'].clear();
      window['location'] = '/login';
      // Return rejected promise to properly handle the error in calling code
      return Promise.reject(error.response);
    } else {
      return Promise.reject(error.response);
    }
  }
);

export default authApi;
