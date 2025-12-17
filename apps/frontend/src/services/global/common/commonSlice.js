import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { api, authApi } from 'utils';
import axios from 'axios';
import config from 'constants/config';
import { COMMON } from 'constants/types';

// ============ Async Thunks ============

export const getSimpleAccountsVersion = createAsyncThunk(
  'common/getSimpleAccountsVersion',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${config.API_ROOT_URL}/rest/config/getreleasenumber`);
      return res.data.simpleAccountsRelease;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getRoleList = createAsyncThunk(
  'common/getRoleList',
  async (id, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: `/rest/roleModule/getModuleListByRoleCode?roleCode=${id}`,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCompanyCurrency = createAsyncThunk(
  'common/getCompanyCurrency',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/company/getCompanyCurrency',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get company currency');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCurrencyConversionList = createAsyncThunk(
  'common/getCurrencyConversionList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: `/rest/currencyConversion/getActiveCurrencyConversionList`,
      };
      const res = await authApi(data);
      // Return only the data, not the full response object with config
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getStateList = createAsyncThunk(
  'common/getStateList',
  async (countryCode, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/company/getState?countryCode=' + 229,
      };
      if (229) {
        const res = await api(data);
        if (res.status === 200) {
          return res.data;
        }
      }
      return [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCountryList = createAsyncThunk(
  'common/getCountryList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/company/getCountry',
      };
      const res = await api(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get country list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCompanyTypeListRegister = createAsyncThunk(
  'common/getCompanyTypeListRegister',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: `/rest/company/getCompanyType`,
      };
      const res = await api(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get company type list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCurrencyList = createAsyncThunk(
  'common/getCurrencyList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/currency/getCompanyCurrencies',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get currency list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCurrencylist = createAsyncThunk(
  'common/getCurrencylist',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/currency/getcurrency',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get currency list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCompany = createAsyncThunk(
  'common/getCompany',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: 'rest/company/getById?id=10000',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get company');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getTaxTreatmentList = createAsyncThunk(
  'common/getTaxTreatmentList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: `/rest/datalist/getTaxTreatment`,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getVatList = createAsyncThunk(
  'common/getVatList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/datalist/vatCategory',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get VAT list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getProductList = createAsyncThunk(
  'common/getProductList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: `/rest/datalist/product?priceType=SALES`,
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get product list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getExciseList = createAsyncThunk(
  'common/getExciseList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/datalist/exciseTax',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get excise list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCustomerList = createAsyncThunk(
  'common/getCustomerList',
  async (nameCode, { rejectWithValue }) => {
    try {
      const contactType = nameCode || '';
      const data = {
        method: 'get',
        url: `/rest/contact/getContactsForDropdown?contactType=${contactType}`,
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get customer list');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getPaymentMode = createAsyncThunk(
  'common/getPaymentMode',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'get',
        url: '/rest/datalist/payMode',
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get payment mode');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getCompanyDetails = createAsyncThunk(
  'common/getCompanyDetails',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: `/rest/company/getCompanyDetails`,
      };
      const res = await authApi(data);
      if (res.status === 200) {
        return res.data;
      }
      return rejectWithValue('Failed to get company details');
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const getSalaryComponentList = createAsyncThunk(
  'common/getSalaryComponentList',
  async (_, { rejectWithValue }) => {
    try {
      const data = {
        method: 'GET',
        url: `/rest/payroll/getSalaryList`,
      };
      const res = await authApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Non-thunk actions (utility functions that don't need state updates)
export const getNoteSettingsInfo = () => {
  return (dispatch) => {
    const data = {
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

export const fillManDatoryDetails = () => {
  return () => {
    toast.error('Please Fill All Mandatory Details', {
      position: 'top-center',
      draggable: true,
      autoClose: 2000,
      progress: undefined,
      hideProgressBar: true,
    });
  };
};

export const checkValidation = (obj) => {
  return (dispatch) => {
    const data = {
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

export const getByNoteListByInvoiceId = (id) => {
  return (dispatch) => {
    const data = {
      method: 'GET',
      url: `/rest/creditNote/getCreditNoteByInvoiceId?id=${id}`,
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

// ============ Slice ============

const initialState = {
  is_loading: false,
  version: '',
  tostifyAlertFunc: null,
  tostifyAlert: {},
  universal_currency_list: [],
  currency_list: [],
  user_role_list: [],
  company_profile: [],
  country_list: [],
  state_list: [],
  company_type_list: [],
  tax_treatment_list: [],
  vat_list: [],
  product_list: [],
  excise_list: [],
  customer_list: [],
  pay_mode: [],
  company_details: [],
  salary_component_list: [],
  companyCurrency: [],
  currency_convert_list: [],
  error: null,
};

const commonSlice = createSlice({
  name: 'common',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.is_loading = true;
    },
    endLoading: (state) => {
      state.is_loading = false;
    },
    setTostifyAlertFunc: (state, action) => {
      state.tostifyAlertFunc = action.payload;
    },
    tostifyAlert: (state, action) => {
      if (state.tostifyAlertFunc) {
        state.tostifyAlertFunc(action.payload.status, action.payload.message);
      }
      state.tostifyAlert = {
        status: action.payload.status,
        message: action.payload.message,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getSimpleAccountsVersion
      .addCase(getSimpleAccountsVersion.fulfilled, (state, action) => {
        state.version = action.payload;
      })
      // getRoleList
      .addCase(getRoleList.fulfilled, (state, action) => {
        state.user_role_list = action.payload;
      })
      // getCompanyCurrency
      .addCase(getCompanyCurrency.fulfilled, (state, action) => {
        state.companyCurrency = action.payload;
      })
      // getCurrencyConversionList
      .addCase(getCurrencyConversionList.fulfilled, (state, action) => {
        state.currency_convert_list = action.payload.data;
      })
      // getStateList
      .addCase(getStateList.fulfilled, (state, action) => {
        state.state_list = action.payload;
      })
      // getCountryList
      .addCase(getCountryList.fulfilled, (state, action) => {
        state.country_list = action.payload;
      })
      // getCompanyTypeListRegister
      .addCase(getCompanyTypeListRegister.fulfilled, (state, action) => {
        state.company_type_list = action.payload;
      })
      // getCurrencyList
      .addCase(getCurrencyList.fulfilled, (state, action) => {
        state.universal_currency_list = action.payload;
      })
      // getCurrencylist
      .addCase(getCurrencylist.fulfilled, (state, action) => {
        state.currency_list = action.payload;
      })
      // getCompany
      .addCase(getCompany.fulfilled, (state, action) => {
        state.company_profile = action.payload;
      })
      // getTaxTreatmentList
      .addCase(getTaxTreatmentList.fulfilled, (state, action) => {
        state.tax_treatment_list = action.payload;
      })
      // getVatList
      .addCase(getVatList.fulfilled, (state, action) => {
        state.vat_list = action.payload;
      })
      // getProductList
      .addCase(getProductList.fulfilled, (state, action) => {
        state.product_list = action.payload;
      })
      // getExciseList
      .addCase(getExciseList.fulfilled, (state, action) => {
        state.excise_list = action.payload;
      })
      // getCustomerList
      .addCase(getCustomerList.fulfilled, (state, action) => {
        state.customer_list = action.payload;
      })
      // getPaymentMode
      .addCase(getPaymentMode.fulfilled, (state, action) => {
        state.pay_mode = action.payload;
      })
      // getCompanyDetails
      .addCase(getCompanyDetails.fulfilled, (state, action) => {
        state.company_details = action.payload;
      })
      // getSalaryComponentList
      .addCase(getSalaryComponentList.fulfilled, (state, action) => {
        state.salary_component_list = action.payload;
      })
      // Backward compatibility with old action types
      .addCase(COMMON.START_LOADING, (state) => {
        state.is_loading = true;
      })
      .addCase(COMMON.END_LOADING, (state) => {
        state.is_loading = false;
      })
      .addCase(COMMON.GET_SIMPLE_ACCOUNTS_RELEASE, (state, action) => {
        state.version = action.payload?.data || action.payload;
      })
      .addCase(COMMON.TOSTIFY_ALERT_FUNC, (state, action) => {
        state.tostifyAlertFunc = action.payload?.data || action.payload;
      })
      .addCase(COMMON.TOSTIFY_ALERT, (state, action) => {
        if (state.tostifyAlertFunc) {
          state.tostifyAlertFunc(action.payload.status, action.payload.message);
        }
        state.tostifyAlert = {
          status: action.payload.status,
          message: action.payload.message,
        };
      })
      .addCase(COMMON.UNIVERSAL_CURRENCY_LIST, (state, action) => {
        state.universal_currency_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.CURRENCY_LIST, (state, action) => {
        state.currency_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.USER_ROLE_LIST, (state, action) => {
        state.user_role_list = action.payload || [];
      })
      .addCase(COMMON.COMPANY_PROFILE, (state, action) => {
        state.company_profile = action.payload?.data || action.payload;
      })
      .addCase(COMMON.COUNTRY_LIST, (state, action) => {
        state.country_list = action.payload || [];
      })
      .addCase(COMMON.STATE_LIST, (state, action) => {
        state.state_list = action.payload || [];
      })
      .addCase(COMMON.COMPANY_TYPE, (state, action) => {
        state.company_type_list = action.payload || [];
      })
      .addCase(COMMON.CURRENCY_CONVERT_LIST, (state, action) => {
        state.currency_convert_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.TAX_TREATMENT_LIST, (state, action) => {
        state.tax_treatment_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.VAT_LIST, (state, action) => {
        state.vat_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.PRODUCT_LIST, (state, action) => {
        state.product_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.EXCISE_LIST, (state, action) => {
        state.excise_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.CUSTOMER_LIST, (state, action) => {
        state.customer_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.PAY_MODE, (state, action) => {
        state.pay_mode = action.payload?.data || action.payload;
      })
      .addCase(COMMON.COMPANY_DETAILS, (state, action) => {
        state.company_details = action.payload?.data || action.payload;
      })
      .addCase(COMMON.SALARY_COMPONENT_LIST, (state, action) => {
        state.salary_component_list = action.payload?.data || action.payload;
      })
      .addCase(COMMON.COMPANY_CURRENCY, (state, action) => {
        state.companyCurrency = action.payload || [];
      });
  },
});

export const {
  startLoading,
  endLoading,
  setTostifyAlertFunc,
  tostifyAlert,
  clearError,
} = commonSlice.actions;
export default commonSlice.reducer;

