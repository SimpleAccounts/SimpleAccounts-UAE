import { authApi, authFileUploadApi } from 'utils';

export const getTemplateList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/transactionParsing/selectModelList',
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

export const parseFile = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/transactionimport/parse',
			data: obj,
		};
		return authFileUploadApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const importTransaction = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/transactionimport/save',
			data: obj,
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

export const downloadcsv = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/transactionimport/downloadcsv',
			data: obj,
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