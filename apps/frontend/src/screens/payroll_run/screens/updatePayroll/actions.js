import { EMPLOYEEPAYROLL } from 'constants/types';
import { objectOf } from 'prop-types';
import {
  authApi
} from 'utils'


export const addMultipleEmployees = (payrollId,employeeListIds) => {
	
	return (dispatch) => {
	  let data = {
		method: 'post',
		url: `/rest/payroll/savePayrollEmployeeRelation ?payrollId=${payrollId}&employeeListIds=${employeeListIds}`,
		// data: obj
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
 
  export const getPayrollById = (_id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/payroll/getPayroll?id=${_id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
export const getEmployeesForDropdown = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/employee/getEmployeesForDropdown',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
            type: EMPLOYEEPAYROLL.EMPLOYEE_LIST_DDROPDOWN,
			payload: {
				data: res.data,
			},
						
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getApproversForDropdown = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/payroll/getAproverUsers',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
            type: EMPLOYEEPAYROLL.APPROVER_DROPDOWN,
			payload: {
				data: res.data,
			},
						
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};


// export const getAllPayrollEmployee = (_id) => {
// 	return (dispatch) => {
// 	  let data = {
// 		method: 'GET',
// 		url: `/rest/payroll/getAllPayrollEmployeeForGenerator?payrollid=${_id}`
// 	  }
  
// 	  return authApi(data).then((res) => {
// 		return res
// 	  }).catch((err) => {
// 		throw err
// 	  })
// 	}
// }
export const getAllPayrollEmployee = () => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/employee/getAllActiveCompleteEmployee`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
}

export const createPayroll = (object) => {

	return (dispatch) => {
	  let data = {
		method: 'post',
		url:`/rest/payroll/createPayroll `,
		 data: object
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
// export const createPayroll = (employeeListIds,payrollSubject,payPeriod,generatePayrollString,salaryDate) => {
//     return (dispatch) => {
//       let data = {
//         method: 'post',
//          url:`/rest/payroll/createPayroll`,
//         // url:`/rest/payroll/createPayroll ?employeeListIds=${employeeListIds}&payrollSubject=${payrollSubject}&payPeriod=${payPeriod}&generatePayrollString=${generatePayrollString}&salaryDate=${salaryDate}`
//       }
//       return authApi(data).then((res) => {
//         return res
//       }).catch((err) => {
//         throw err
//       })
//     }
//   }
export const removeEmployee = (ids) => {
	return (dispatch) => {
	  let data = {
		method: 'DELETE',
		url: `/rest/payroll/removeEmployee?payEmpListIds=${ids}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
}

export const getAllPayrollEmployee2 = (_id,payrollDate) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/payroll/getAllPayrollEmployee?payrollid=${_id}&payrollDate=${payrollDate}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
}

export const generatePayroll = (string) => {
	
	let  generatePayrollString=string;
	return (dispatch) => {
	  let data = {
		method: 'post',
		url: `/rest/payroll/generatePayroll`,
		 data: generatePayrollString
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
 
  export const submitPayroll = (payrollId,approverId) => {
	
	return (dispatch) => {
	  let data = {
		method: 'post',
		url: `/rest/payroll/changePayrollStatus ?payrollId=${payrollId}&approverId=${approverId}`,
		// data: obj
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }


export const createAndSubmitPayroll = (object) => {
	return (dispatch) => {
	  let data = {
		method: 'post',
		url:`/rest/payroll/createAndSubmitPayroll`,
		 data: object
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const updatePayroll = (object) => {

	return (dispatch) => {
	  let data = {
		method: 'post',
		url:`/rest/payroll/updatePayroll `,
		 data: object
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const updateAndSubmitPayroll = (object) => {
	return (dispatch) => {
	  let data = {
		method: 'post',
		url:`/rest/payroll/updateAndSubmitPayroll`,
		 data: object
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  
export const deletePayroll = (id) => {
	return (dispatch) => {
	  let data = {
		method: 'DELETE',
		url: `/rest/payroll/deletePayroll?payrollId=${id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const getAllPayrollEmployeeForApprover = (_id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/payroll/getAllPayrollEmployeeForApprover?payrollid=${_id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
}