import { EMPLOYEEPAYROLL } from 'constants/types';
import {
	authApi
} from 'utils'


export const addMultipleEmployees = (payrollId, employeeListIds) => {

	return async (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/payroll/savePayrollEmployeeRelation ?payrollId=${payrollId}&employeeListIds=${employeeListIds}`,
			// data: obj
		}
		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}

export const getPayrollById = (_id) => {
	return async (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/payroll/getPayroll?id=${_id}`
		}

		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}
export const getEmployeesForDropdown = () => {
	return async (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/employee/getEmployeesForDropdown',
		};
		try {
			const res = await authApi(data);
			if (res.status === 200) {
				dispatch({
					type: EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN,
					payload: {
						data: res.data,
					},
				});
			}
		} catch (err) {
			throw err;
		}
	};
};

export const getApproversForDropdown = () => {
	return async (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/payroll/getAproverUsers',
		};
		try {
			const res = await authApi(data);
			if (res.status === 200) {
				dispatch({
					type: EMPLOYEEPAYROLL.APPROVER_DROPDOWN,
					payload: {
						data: res.data,
					},
				});
			}
		} catch (err) {
			throw err;
		}
	};
};


export const getAllPayrollEmployee = (_id) => {
	return async (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/payroll/getAllPayrollEmployeeForApprover?payrollid=${_id}`
		}

		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}
export const removeEmployee = (ids) => {
	return async (dispatch) => {
		let data = {
			method: 'DELETE',
			url: `/rest/payroll/removeEmployee?payEmpListIds=${ids}`
		}

		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}


export const generatePayroll = (payrollId, string, date) => {

	return async (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/payroll/generatePayroll?generatePayrollString=${string}&payrollId=${payrollId}&salaryDate=${date}`,
			// data: obj
		}
		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}
export const approveAndRunPayroll = (postObj) => {
	let payrollId = postObj.payrollId
	let startDate = postObj.startDate
	let endDate = postObj.endDate
	let payrollEmployeesIdsListToSendMail = postObj.payrollEmployeesIdsListToSendMail
	return async (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/payroll/approveRunPayroll?payrollId=${payrollId}&startDate=${startDate}&endDate=${endDate}&payrollEmployeesIdsListToSendMail=${payrollEmployeesIdsListToSendMail}`,
		}
		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}
export const rejectPayroll = (payrollId, comment) => {

	return async (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/payroll/rejectPayroll?payrollId=${payrollId}&comment=${comment}`,
		}
		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}

export const generateSifFile = (payrollId, ids, time) => {

	return async (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/payroll/generteSifFile?payrollId=${payrollId}&id=${ids}&currentTime=${time}`,
			// data: obj
		}
		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}

export const voidPayroll = (obj) => {
	return async (dispatch) => {
		let data = {
			method: 'post',
			url: `/rest/payroll/voidJournalEntry`,
			data: obj
		}
		try {
			const res = await authApi(data);
			return res;
		} catch (err) {
			throw err;
		}
	}
}