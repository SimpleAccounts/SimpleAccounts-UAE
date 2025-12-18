// Import actions that need to be used locally
import { startLoading as startLoadingAction, endLoading as endLoadingAction } from './commonSlice';

// Re-export new RTK slice actions for backward compatibility
export {
  getSimpleAccountsVersion,
  getRoleList,
  getCompanyCurrency,
  getCurrencyConversionList,
  getStateList,
  getCountryList,
  getCompanyTypeListRegister,
  getCurrencyList,
  getCurrencylist,
  getCompany,
  getTaxTreatmentList,
  getVatList,
  getProductList,
  getExciseList,
  getCustomerList,
  getPaymentMode,
  getCompanyDetails,
  getSalaryComponentList,
  getNoteSettingsInfo,
  fillManDatoryDetails,
  checkValidation,
  getByNoteListByInvoiceId,
  startLoading,
  endLoading,
  setTostifyAlertFunc,
  tostifyAlert,
  clearError,
} from './commonSlice';

// Legacy wrapper functions for backward compatibility
export const startRequest = () => dispatch => {
  dispatch(startLoadingAction());
};

export const endRequest = () => dispatch => {
  dispatch(endLoadingAction());
};
