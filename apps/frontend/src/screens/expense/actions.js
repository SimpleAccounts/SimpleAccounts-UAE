import { EXPENSE } from 'constants/types';
import { authApi } from 'utils';
import moment from 'moment';

export const getExpenseList = (obj) => {
	let payee = obj.payee ? obj.payee.value : '';
	let expenseDate = obj.expenseDate ? obj.expenseDate : '';
	let transactionCategoryId = obj.transactionCategoryId    
		? obj.transactionCategoryId.value
		: '';
	let pageNo = obj?.pageNo ? obj.pageNo : '';
	let pageSize = obj?.pageSize ? obj.pageSize : '';
	let order = obj?.order ? obj.order : '';
	let sortingCol = obj?.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj?.paginationDisable ? obj.paginationDisable : false;

	return (dispatch) => {
		let param = `/rest/expense/getList?payee=${payee}&transactionCategoryId=${transactionCategoryId}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`;
		if (expenseDate) {
			let date = moment(expenseDate).format('YYYY-MM-DD');
			param = param + `&expenseDate=${date}`;
		}
		let data = {
			method: 'GET',
			url: param,
		};
		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: EXPENSE.EXPENSE_LIST,
						payload: res.data,
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getSupplierList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/contact/getContactsForDropdown?contactType=1',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.SUPPLIER_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getCurrencyList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/currency/getactivecurrencies',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.CURRENCY_LIST,
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

export const getProjectList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/project/getProjectsForDropdown',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.PROJECT_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const removeBulkExpenses = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: '/rest/expense/deletes',
			data: obj,
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

export const getBankAccountList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/bank/getbanklist',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.BANK_ACCOUNT_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getCustomerList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/contact/contactcustomerlist',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.CUSTOMER_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getPaymentList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/payment/getlist',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.PAYMENT_LIST,
						payload: res.data,
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getExpenseCategoriesList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/transactioncategory/getForExpenses',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.EXPENSE_CATEGORIES_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getVatList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/vat/getList',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.VAT_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getEmployeeList = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/employee/getEmployeesForDropdown',
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: EXPENSE.EMPLOYEE_LIST,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getBankList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/bank/list',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.BANK_LIST,
						payload: res,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getUserForDropdown = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/user/getUserForDropdown',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.USER_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const postExpense = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/expense/posting',
			data: obj,
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

export const deleteExpense = (id) => {
	return (dispatch) => {
		let data = {
			method: 'DELETE',
			url: `/rest/expense/delete?expenseId=${id}`,
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

export const getPaymentMode = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/datalist/payMode',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.PAY_MODE,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const unPostExpense = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'post',
			url: '/rest/invoice/undoPosting',
			data: obj,
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

export const getPaytoList = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/reconsile/getChildrenTransactionCategoryList?id=91',
		};
		return authApi(data)
			.then((res) => {
				if (res.status === 200) {
					dispatch({
						type: EXPENSE.USER_LIST,
						payload: res.data,
					});
				}
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const getTaxTreatment = () => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/datalist/getTaxTreatment`
	  }
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  };

  export const getCompanyDetails = () => {
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