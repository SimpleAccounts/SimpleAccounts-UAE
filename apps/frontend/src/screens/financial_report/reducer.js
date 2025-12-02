import { REPORTS } from 'constants/types';

const initState = {
  sales_by_customer: [],
  sales_by_item: [],
  purchase_by_vendor: [],
  purchase_by_item: [],
  company_profile: [],
  receivable_invoice: [],
  payable_invoice: [],
  creditnote_details: [],
  setting_list: [],
  payment_history: [],
  ctReport_list: [],
}

const ReportsReducer = (state = initState, action) => {
  const { type, payload } = action;

  switch (type) {
    case REPORTS.COMPANY_PROFILE:
      return {
        ...state,
        company_profile: Object.assign([], payload.data),
      };
    case REPORTS.SALES_BY_CUSTOMER:
      return {
        ...state,
        sales_by_customer: Object.assign([], payload.data),
      };
    case REPORTS.SALES_BY_ITEM:
      return {
        ...state,
        sales_by_item: Object.assign([], payload.data),
      };

    case REPORTS.PURCHASE_BY_VENDOR:
      return {
        ...state,
        purchase_by_vendor: Object.assign([], payload.data),
      };
    case REPORTS.PURCHASE_BY_ITEM:
      return {
        ...state,
        purchase_by_item: Object.assign([], payload.data),
      };
    case REPORTS.RECEIVABLE_INVOICE:
      return {
        ...state,
        receivable_invoice: Object.assign([], payload.data),
      };
    case REPORTS.PAYABLE_INVOICE:
      return {
        ...state,
        payable_invoice: Object.assign([], payload.data),
      };

    case REPORTS.CREDITNOTE_DETAILS:
      return {
        ...state,
        creditnote_details: Object.assign([], payload.data),
      };
    case REPORTS.SETTING_LIST:
      return {
        ...state,
        setting_list: Object.assign([], payload.data),
      };
    case REPORTS.PAYMENT_HISTORY:
      return {
        ...state,
        payment_history: Object.assign([], payload.data),
      };
    case REPORTS.CTREPORT_LIST:
      return {
        ...state,
        ctReport_list: Object.assign([], payload.data),
      };
    default:
      return state
  }
}

export default ReportsReducer