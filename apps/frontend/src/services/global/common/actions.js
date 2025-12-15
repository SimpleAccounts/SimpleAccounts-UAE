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
export const startRequest = () => (dispatch) => {
  dispatch(startLoading());
};

export const endRequest = () => (dispatch) => {
  dispatch(endLoading());
};
