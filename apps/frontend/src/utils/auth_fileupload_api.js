import axios from 'axios';
import config from 'constants/config';
import { toast } from 'react-toastify';

const authFileUploadApi = axios.create({
	baseURL: config.API_ROOT_URL,
});

authFileUploadApi.interceptors.request.use(
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

authFileUploadApi.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (
			error.response &&
			error.response.status &&
			error.response.status === 401
		) {
			toast.error("Session Ended. Log in Again !")
			window['localStorage'].clear();
			window['location'] = '/login';
		} else {
			return Promise.reject(error.response);
		}
	},
);

export default authFileUploadApi;
