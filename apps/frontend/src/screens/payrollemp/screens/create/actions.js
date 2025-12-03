import { EMPLOYEEPAYROLL } from 'constants/types'
import {
	authApi
} from 'utils'

export const createEmployee = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/employee/save',
			data: obj
		}
		return authApi(data).then((res) => {
			return res
		}).catch((err) => {
			throw err
		})
	}
}

export const getEmployeeCode = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=8`,
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
export const getEmployeeCodePrefix = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=8',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const checkValidation = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/validation/validate?name=${obj.name}&moduleType=${obj.moduleType}`,
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const saveEmployment = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/payroll/saveEmployment',
			data: obj
		}
		return authApi(data).then((res) => {
			return res
		}).catch((err) => {
			throw err
		})
	}
}

export const saveEmployeeBankDetails = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/payroll/saveEmployeeBankDetails',
			data: obj
		}
		return authApi(data).then((res) => {
			return res
		}).catch((err) => {
			throw err
		})
	}
}

export const getEmployeeById = (_id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/employee/getById?id=${_id}`
		}

		return authApi(data).then((res) => {
			return res
		}).catch((err) => {
			throw err
		})
	}
}
export const getEmployeeDesignationForDropdown = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/employeeDesignation/getEmployeeDesignationForDropdown`,
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: EMPLOYEEPAYROLL.DESIGNATION_DROPDOWN,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};


export const createEmployeeDesignation = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/employeeDesignation/saveEmployeeDesignation',
			data: obj
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


export const getCountryList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getcountry',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EMPLOYEEPAYROLL.COUNTRY_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getSalaryComponentByEmployeeId = (_id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/payroll/getSalaryComponentByEmployeeId?id=${_id}`
		}

		return authApi(data).then((res) => {
			return res
		}).catch((err) => {
			throw err
		})
	}
}

export const getStateList = (countryCode) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/getstate?countryCode=' + countryCode,
		};
		if (countryCode) {
			return authApi(data)
				.then((res) => {
					if (res.status === 200) {
						dispatch({
							type: EMPLOYEEPAYROLL.STATE_LIST,
							payload: res.data,
						});
					}
				})
				.catch((err) => {
					throw err;
				});
		} else {
			dispatch({
				type: EMPLOYEEPAYROLL.STATE_LIST,
				payload: [],
			});
		}
	};
};


export const getSalaryRolesForDropdown = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/payroll/getSalaryRolesForDropdown',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EMPLOYEEPAYROLL.SALARY_ROLE_DROPDOWN,
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

export const getSalaryComponentForDropdownFixed = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/payroll/getSalaryComponentForDropdown?id=1`
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EMPLOYEEPAYROLL.SALARY_COMPONENT_FIXED_DROPDOWN,
						payload: {
							data: res.data,
						},
					});
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const getSalaryComponentForDropdownVariable = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/payroll/getSalaryComponentForDropdown?id=2`
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EMPLOYEEPAYROLL.SALARY_COMPONENT_VARAIBLE_DROPDOWN,
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
export const getSalaryComponentForDropdownDeduction = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/payroll/getSalaryComponentForDropdown?id=3`
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EMPLOYEEPAYROLL.SALARY_COMPONENT_DEDUCTION_DROPDOWN,
						payload: {
							data: res.data,
						},
					});
					return res;
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const saveSalaryComponent = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/payroll/saveSalaryComponent',
			data: obj
		}
		return authApi(data).then((res) => {
			return res
		}).catch((err) => {
			throw err
		})
	}
}

export const getBankListForEmployees = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/bank/getBankNameList`,
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

export const getCompanyById = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/company/getCompanyDetails`
		}

		return authApi(data).then((res) => {
			return res
		}).catch((err) => {
			throw err
		})
	}
}

export const getSalaryComponentById = (_id) => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/payroll/getSalaryComponentById?id=${_id}`
		}

		return authApi(data).then((res) => {
			return res
		}).catch((err) => {
			throw err
		})
	}
}