import { PURCHASE_ORDER } from 'constants/types';

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
	purchase_order_list: [],
	rfq_list: [],
};

const RequestForQuotationReducer = (state = initState, action) => {
	const { type, payload } = action;

	switch (type) {
		case PURCHASE_ORDER.PROJECT_LIST:
			return {
				...state,
				project_list: Object.assign([], payload.data),
			};

		case PURCHASE_ORDER.CONTACT_LIST:
			return {
				...state,
				contact_list: Object.assign([], payload.data),
			};

		case PURCHASE_ORDER.STATUS_LIST:
			return {
				...state,
				status_list: Object.assign([], payload.data),
			};

		case PURCHASE_ORDER.CURRENCY_LIST:
			return {
				...state,
				currency_list: Object.assign([], payload.data),
			};

		case PURCHASE_ORDER.SUPPLIER_LIST:
			return {
				...state,
				supplier_list: Object.assign([], payload.data),
			};

		case PURCHASE_ORDER.VAT_LIST:
			return {
				...state,
				vat_list: Object.assign([], payload.data),
			};

		case PURCHASE_ORDER.PAY_MODE:
			return {
				...state,
				pay_mode: Object.assign([], payload.data),
			};
		case PURCHASE_ORDER.EXCISE_LIST:
			return {
				...state,
				excise_list: Object.assign([], payload.data),
			}
		case PURCHASE_ORDER.PRODUCT_LIST:
			return {
				...state,
				product_list: Object.assign([], payload.data),
			};

		case PURCHASE_ORDER.DEPOSIT_LIST:
			return {
				...state,
				deposit_list: Object.assign([], payload.data),
			};

		case PURCHASE_ORDER.COUNTRY_LIST:
			return {
				...state,
				country_list: Object.assign([], payload),
			};

		case PURCHASE_ORDER.PURCHASE_ORDER_LIST:
			return{
				...state,
				purchase_order_list: Object.assign([], payload),
			};
		case PURCHASE_ORDER.RFQ_LIST:
			return{
				...state,
				rfq_list:Object.assign([],payload),
			};	
		default:
			return state;
	}
};

export default RequestForQuotationReducer;
