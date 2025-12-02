import { BANK_ACCOUNT } from "constants/types";
import {
  // api,
  authApi,
} from "utils";
import moment from "moment";

export const getTransactionList = (obj) => {
  let id = obj.id ? obj.id : "";
  let chartOfAccountId = obj.chartOfAccountId ? obj.chartOfAccountId.value : "";
  let transactionDate = obj.transactionDate ? obj.transactionDate : "";
  let pageNo = obj.pageNo ? obj.pageNo : "";
  let pageSize = obj.pageSize ? obj.pageSize : "";
  let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;
  let transactionType = obj.transactionType ? obj.transactionType : "";

  let param = `/rest/transaction/list?bankId=${id}&transactionType=${transactionType}&chartOfAccountId=${chartOfAccountId}&pageNo=${pageNo}&pageSize=${pageSize}&paginationDisable=${paginationDisable}`;
  if (transactionDate !== "") {
    let date = moment(transactionDate).format("DD-MM-YYYY");
    param = param + `&transactionDate=${date}`;
  }
  return (dispatch) => {
    let data = {
      method: "get",
      url: param,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          if (!obj.paginationDisable) {
            dispatch({
              type: BANK_ACCOUNT.BANK_TRANSACTION_LIST,
              payload: {
                data: res.data,
              },
            });
          }
          return res;
        }
      })
      .catch((err) => {
        throw err;
      });
  };
};

export const getTransactionCategoryList = () => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/transactioncategory/getList",
    };
    return authApi(data)
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.TRANSACTION_CATEGORY_LIST,
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

export const getTransactionTypeList = () => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/datalist/getTransactionTypes",
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.TRANSACTION_TYPE_LIST,
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

export const getProjectList = () => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/project/getProjectsForDropdown",
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.PROJECT_LIST,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        throw err;
      });
  };
};

export const getCustomerInvoiceList = (param) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/invoice/getSuggestionInvoicesFotCust?amount=${param.amount}&currency=${param.currency}&id=${param.id}&bankId=${param.bankId}`,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.CUSTOMER_INVOICE_LIST,
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

export const getCustomerExplainedInvoiceList = (param) => {
  console.log(param);
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/invoice/getSuggestionExplainedForCust?amount=${param.amount}&currency=${param.currency}&id=${param.id}&bankId=${param.bankId}`,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.CUSTOMER_INVOICE_LIST,
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

export const getCurrencyList = () => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/currency/getactivecurrencies",
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.CURRENCY_LIST,
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

export const getVendorList = (bankId) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/contact/getContactsForDropdownForVendor?bankId=${bankId}`,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.VENDOR_LIST,
            payload: res,
          });
        }
      })
      .catch((err) => {
        throw err;
      });
  };
};

export const getVendorInvoiceList = (param) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/invoice/getSuggestionInvoicesFotVend?amount=${param.amount}&currency=${param.currency}&id=${param.id}&bankId=${param.bankId}`,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.VENDOR_INVOICE_LIST,
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

export const getVendorExplainedInvoiceList = (param) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/invoice/getSuggestionExplainedForVend?amount=${param.amount}&currency=${param.currency}&id=${param.id}&bankId=${param.bankId}`,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.VENDOR_INVOICE_LIST,
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

export const getExpensesList = (param) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/invoice/getSuggestionExpenses?amount=${param.amount}`,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.EXPENSE_LIST,
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

export const getExpensesCategoriesList = () => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/transactioncategory/getForExpenses",
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.EXPENSE_CATEGORIES_LIST,
            payload: res.data,
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
      method: "get",
      url: "/rest/user/getUserForDropdown",
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.USER_LIST,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        throw err;
      });
  };
};

export const getMoneyCategoryList = (id) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/reconsile/getChildrenTransactionCategoryList?id=${id}`,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          return res;
        }
      })
      .catch((err) => {
        alert("error" + err);
        throw err;
      });
  };
};

export const deleteTransactionById = (id) => {
  return (dispatch) => {
    let data = {
      method: "DELETE",
      url: `/rest/transaction/delete?id=${id}`,
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

export const getChartOfCategoryList = (type) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/datalist/reconsileCategories?debitCreditFlag=${type}`,
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

export const getTransactionCategoryListForExplain = (id, bankId) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/reconsile/getTransactionCat?chartOfAccountCategoryId=${id}&bankId=${bankId}`,
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

export const getCategoryListForReconcile = (code) => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/reconsile/getByReconcilationCatCode?reconcilationCatCode=${code}`,
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

export const reconcileTransaction = (obj) => {
  return (dispatch) => {
    let data = {
      method: "POST",
      url: `/rest/reconsile/reconcile`,
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

export const getVatList = () => {
  return (dispatch) => {
    let data = {
      method: "get",
      url: "/rest/vat/getList",
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.VAT_LIST,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        throw err;
      });
  };
};

export const changeTransaction = (obj) => {
  return (dispatch) => {
    let data = {
      method: "post",
      url: "/rest/transaction/changestatus",
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
export const getUnPaidPayrollsList = () => {
  console.log("getUnPaidPayrollsList");
  return (dispatch) => {
    let data = {
      method: "get",
      url: `/rest/payroll/getUnpaidPayrollList`,
    };
    return authApi(data)
      .then((res) => {
        if (res.status === 200) {
          dispatch({
            type: BANK_ACCOUNT.UNPAID_PAYROLLS,
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
// data: [{
//   transaction_type: 'Debit',
//   amount: 3453246,
//   status: 'Explained',
//   reference_number: 'KDF3920342',
//   description: 'This is description',
//   transaction_date: 'Oct 28th, 2019'
// }, {
//   transaction_type: 'Debit',
//   amount: 3453246,
//   status: 'Explained',
//   reference_number: 'KDF3929865',
//   description: 'This is description',
//   transaction_date: 'Oct 28th, 2019'
// }, {
//   transaction_type: 'Debit',
//   amount: 3453246,
//   status: 'Unexplained',
//   reference_number: 'KDF39206574',
//   description: 'This is description',
//   transaction_date: 'Oct 28th, 2019'
// }, {
//   transaction_type: 'Debit',
//   amount: 3453246,
//   status: 'Explained',
//   reference_number: 'KDF392394',
//   description: 'This is description',
//   transaction_date: 'Oct 28th, 2019'
// }, {
//   transaction_type: 'Debit',
//   amount: 3453246,
//   status: 'Unexplained',
//   reference_number: 'KDF3920923',
//   description: 'This is description',
//   transaction_date: 'Oct 28th, 2019'
// }]

export const getVatReportListForBank = (id) => {
  return (dispatch) => {
    let data = {
      method: "GET",
      url: `/rest/vatReport/getVatReportListForBank?id=${id}`,
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
export const getCorporateTaxList = (id) => {
  return (dispatch) => {
    let data = {
      method: "GET",
      url: `/rest/corporate/tax/Corporate/list?paginationDisable=true`,
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

export const getCOACList = () => {
  return (dispatch) => {
    let data = {
      method: "GET",
      url: `/rest/reconsile/getCOACList`,
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
