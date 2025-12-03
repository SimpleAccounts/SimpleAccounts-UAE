import { authApi, authFileUploadApi } from 'utils';

export const getNoteSettingsInfo = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getNoteSettingsInfo',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const saveNoteSettingsInfo = (formData) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/datalist/saveNoteSettingsInfo`,
			data:formData
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
				return res;
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};
