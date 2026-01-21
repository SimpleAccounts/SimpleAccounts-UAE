import { EMPLOYEEPAYROLL } from 'constants/types';
import { authApi } from 'utils';

export const addMultipleEmployees = (payrollId, employeeListIds) => {
  return async dispatch => {
    let data = {
      method: 'post',
      url: `/rest/payroll/savePayrollEmployeeRelation ?payrollId=${payrollId}&employeeListIds=${employeeListIds}`,
      // data: obj
    };
    return authApi(data);
  };
};

export const getPayrollById = _id => {
  return async dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/payroll/getPayroll?id=${_id}`,
    };
    return authApi(data);
  };
};
export const getEmployeesForDropdown = () => {
  return async dispatch => {
    let data = {
      method: 'get',
      url: '/rest/employee/getEmployeesForDropdown',
    };
    const res = await authApi(data);
    if (res.status === 200) {
      dispatch({
        type: EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN,
        payload: res.data,
      });
    }
  };
};

export const getApproversForDropdown = () => {
  return async dispatch => {
    let data = {
      method: 'get',
      url: '/rest/payroll/getAproverUsers',
    };
    const res = await authApi(data);
    if (res.status === 200) {
      dispatch({
        type: EMPLOYEEPAYROLL.APPROVER_DROPDOWN,
        payload: res.data,
      });
    }
  };
};

export const getAllPayrollEmployee = _id => {
  return async dispatch => {
    let data = {
      method: 'GET',
      url: `/rest/payroll/getAllPayrollEmployeeForApprover?payrollid=${_id}`,
    };
    return authApi(data);
  };
};
export const removeEmployee = ids => {
  return async dispatch => {
    let data = {
      method: 'DELETE',
      url: `/rest/payroll/removeEmployee?payEmpListIds=${ids}`,
    };
    return authApi(data);
  };
};

export const generatePayroll = (payrollId, string, date) => {
  return async dispatch => {
    let data = {
      method: 'post',
      url: `/rest/payroll/generatePayroll?generatePayrollString=${string}&payrollId=${payrollId}&salaryDate=${date}`,
      // data: obj
    };
    return authApi(data);
  };
};
export const approveAndRunPayroll = postObj => {
  let payrollId = postObj.payrollId;
  let startDate = postObj.startDate;
  let endDate = postObj.endDate;
  let payrollEmployeesIdsListToSendMail = postObj.payrollEmployeesIdsListToSendMail;
  return async dispatch => {
    let data = {
      method: 'post',
      url: `/rest/payroll/approveRunPayroll?payrollId=${payrollId}&startDate=${startDate}&endDate=${endDate}&payrollEmployeesIdsListToSendMail=${payrollEmployeesIdsListToSendMail}`,
    };
    return authApi(data);
  };
};
export const rejectPayroll = (payrollId, comment) => {
  return async dispatch => {
    let data = {
      method: 'post',
      url: `/rest/payroll/rejectPayroll?payrollId=${payrollId}&comment=${comment}`,
    };
    return authApi(data);
  };
};

export const generateSifFile = (payrollId, ids, time) => {
  return async dispatch => {
    let data = {
      method: 'get',
      url: `/rest/payroll/generteSifFile?payrollId=${payrollId}&id=${ids}&currentTime=${time}`,
      // data: obj
    };
    return authApi(data);
  };
};

export const voidPayroll = obj => {
  return async dispatch => {
    let data = {
      method: 'post',
      url: `/rest/payroll/voidJournalEntry`,
      data: obj,
    };
    return authApi(data);
  };
};
