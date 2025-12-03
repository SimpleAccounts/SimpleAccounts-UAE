import { TEMPLATE } from 'constants/types';
import { authApi } from 'utils';

export const updateMailTheme = (id) => {
	return (dispatch) => {
		let data = {
			method: 'Post',
			url: `/rest/templates/updateMailTemplateTheme?templateId=${id}`,
		};
		return authApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const getTemplateList = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/templates/getTemplateDropdown`,
		};

		return authApi(data)
			.then((res) => {
				
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};
 