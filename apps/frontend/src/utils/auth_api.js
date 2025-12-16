import axios from 'axios';
import config from 'constants/config';
import { toast } from 'react-toastify';

const authApi = axios.create({
	baseURL: config.API_ROOT_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

authApi.interceptors.request.use(
	(config) => {
		config.headers.Authorization = `Bearer ${window['localStorage'].getItem(
			'accessToken',
		)}`;
		return config;
	},
	(error) => {
		return Promise.reject(error.response);
	},
);

authApi.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response && error.response.status === 401) {
			toast.error("Session Ended. Log in Again!", {
				position: 'top-right',
			});
			window['localStorage'].clear();
			window['location'] = '/login';
			// Return rejected promise to properly handle the error in calling code
			return Promise.reject(error.response);
		} else {
			return Promise.reject(error.response);
		}
	},
);

export default authApi;
