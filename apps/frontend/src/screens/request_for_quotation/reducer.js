import { REQUEST_FOR_QUOTATION } from 'constants/types';

const initState = {
	project_list: [],
	contact_list: [],
	status_list: [],
	currency_list: [],
	vat_list: [],
	product_list: [],
	supplier_list: [],
	country_list: [],
	deposit_list: [],
	pay_mode: [],
	request_for_quotation_list: [],
	excise_list: [],
};

const RequestForQuotationReducer = (state = initState, action) => {
	const { type, payload } = action;

	switch (type) {
		case REQUEST_FOR_QUOTATION.PROJECT_LIST:
			return {
				...state,
				project_list: Object.assign([], payload.data),
			};

		case REQUEST_FOR_QUOTATION.CONTACT_LIST:
			return {
				...state,
				contact_list: Object.assign([], payload.data),
			};

		case REQUEST_FOR_QUOTATION.STATUS_LIST:
			return {
				...state,
				status_list: Object.assign([], payload.data),
			};

		case REQUEST_FOR_QUOTATION.CURRENCY_LIST:
			return {
				...state,
				currency_list: Object.assign([], payload.data),
			};

		case REQUEST_FOR_QUOTATION.SUPPLIER_LIST:
			return {
				...state,
				supplier_list: Object.assign([], payload.data),
			};

		case REQUEST_FOR_QUOTATION.VAT_LIST:
			return {
				...state,
				vat_list: Object.assign([], payload.data),
			};

		case REQUEST_FOR_QUOTATION.PAY_MODE:
			return {
				...state,
				pay_mode: Object.assign([], payload.data),
			};
		case REQUEST_FOR_QUOTATION.EXCISE_LIST:
			return {
				...state,
				excise_list:  Object.assign([], payload.data),
			};
		case REQUEST_FOR_QUOTATION.PRODUCT_LIST:
			return {
				...state,
				product_list: Object.assign([], payload.data),
			};

		case REQUEST_FOR_QUOTATION.DEPOSIT_LIST:
			return {
				...state,
				deposit_list: Object.assign([], payload.data),
			};

		case REQUEST_FOR_QUOTATION.COUNTRY_LIST:
			return {
				...state,
				country_list: Object.assign([], payload),
			};

		case REQUEST_FOR_QUOTATION.REQUEST_FOR_QUOTATION_LIST:
			return{
				...state,
				request_for_quotation_list: Object.assign([], payload),
			};
		default:
			return state;
	}
};

export default RequestForQuotationReducer;
