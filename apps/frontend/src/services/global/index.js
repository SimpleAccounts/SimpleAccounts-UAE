// New RTK slices
import authReducer from './auth/authSlice'
import commonReducer from './common/commonSlice'

// Export actions from slices (selective to avoid conflicts)
export {
  // Auth actions
  checkAuthStatus,
  logIn,
  register,
  registerStrapiUser,
  registerStrapiCompany,
  getUserSubscription,
  getCompanyCount,
  getTimeZoneList,
  getSimpleAccountsreleasenumber,
  logOut,
  signedIn,
  signedOut,
  setUserProfile,
  setCompanyCount,
  clearError as clearAuthError,
} from './auth/authSlice'

export {
  // Common actions
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
} from './common/commonSlice'

// Legacy exports for backward compatibility during migration
import AuthReducer from './auth/reducer'
import CommonReducer from './common/reducer'
import * as AuthActions from './auth/actions'
import * as CommonActions from './common/actions'

export {
  // New RTK slices (primary)
  authReducer as AuthReducer,
  commonReducer as CommonReducer,
  // Legacy exports (for components still using old actions)
  AuthActions,
  CommonActions
}