import { QUOTATION } from 'constants/types';

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
	quotation_list: [],
	excise_list: [],
};

const RequestForQuotationReducer = (state = initState, action) => {
	const { type, payload } = action;

	switch (type) {
		case QUOTATION.PROJECT_LIST:
			return {
				...state,
				project_list: Object.assign([], payload.data),
			};

		case QUOTATION.CONTACT_LIST:
			return {
				...state,
				contact_list: Object.assign([], payload.data),
			};

		case QUOTATION.STATUS_LIST:
			return {
				...state,
				status_list: Object.assign([], payload.data),
			};

		case QUOTATION.CURRENCY_LIST:
			return {
				...state,
				currency_list: Object.assign([], payload.data),
			};

		case QUOTATION.SUPPLIER_LIST:
			return {
				...state,
				supplier_list: Object.assign([], payload.data),
			};

		case QUOTATION.VAT_LIST:
			return {
				...state,
				vat_list: Object.assign([], payload.data),
			};
		case QUOTATION.EXCISE_LIST:
			return {
				...state,
				excise_list: Object.assign([], payload.data),
			};
		case QUOTATION.PAY_MODE:
			return {
				...state,
				pay_mode: Object.assign([], payload.data),
			};

		case QUOTATION.PRODUCT_LIST:
			return {
				...state,
				product_list: Object.assign([], payload.data),
			};

		case QUOTATION.DEPOSIT_LIST:
			return {
				...state,
				deposit_list: Object.assign([], payload.data),
			};

		case QUOTATION.COUNTRY_LIST:
			return {
				...state,
				country_list: Object.assign([], payload),
			};

		case QUOTATION.QUOTATION_LIST:
			return{
				...state,
				quotation_list: Object.assign([], payload),
			};
		default:
			return state;
	}
};

export default RequestForQuotationReducer;
