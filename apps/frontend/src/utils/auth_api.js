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
    console.log('[authApi] Interceptor called for URL:', config.url);
    const accessToken = window['localStorage']?.getItem('accessToken');
    console.log(
      '[authApi] AccessToken from localStorage:',
      accessToken ? `${accessToken.substring(0, 20)}... (length: ${accessToken.length})` : 'NULL'
    );

    // Only add Authorization header if token exists and is not empty
    if (accessToken && accessToken.trim().length > 0) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log(
        '[authApi] Authorization header set:',
        config.headers.Authorization ? 'YES' : 'NO'
      );
      console.log('[authApi] Full headers:', JSON.stringify(config.headers));
    } else {
      console.warn('[authApi] No valid access token found for request:', config.url);
    }
    return config;
  },
  error => {
    console.error('[authApi] Request interceptor error:', error);
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
