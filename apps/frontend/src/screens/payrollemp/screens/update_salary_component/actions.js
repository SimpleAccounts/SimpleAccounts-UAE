import {
	authApi
} from 'utils'


export const getSalaryComponentByEmployeeId = (_id) => {
	return async (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/payroll/getSalaryComponentByEmployeeId?id=${_id}`
		}

		try {
			const res = await authApi(data)
			return res
		} catch (err) {
			throw err
		}
	}
}

export const updateEmployeeBank = (obj) => {
	return async (dispatch) => {
		let data = {
			method: 'POST',
			url: `/rest/payroll/updateSalaryComponent`,
			data: obj
		}

		try {
			const res = await authApi(data)
			return res
		} catch (err) {
			throw err
		}
	}
}


export const deleteSalaryComponentRow = (id, componentId) => {
	return async (dispatch) => {
		let data = {
			method: 'DELETE',
			url: `/rest/payroll/deleteSalaryComponentRow?id=${id}&componentId=${componentId}`,
		};
		try {
			const res = await authApi(data)
			return res
		} catch (err) {
			throw err
		}
	};
};
