import { COMMON } from 'constants/types';

const initState = {
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
};

const CommonReducer = (state = initState, action) => {
	const { type, payload } = action;

	switch (type) {
		case COMMON.START_LOADING:
			return {
				...state,
				is_loading: true,
			};
		case COMMON.COMPANY_CURRENCY:
			return {
				...state,
				companyCurrency: Object.assign([], payload),
			};


		case COMMON.END_LOADING:
			return {
				...state,
				is_loading: false,
			};

		case COMMON.USER_ROLE_LIST:
			return {
				...state,
				user_role_list: Object.assign([], payload),
			};

		case COMMON.TOSTIFY_ALERT_FUNC:
			return {
				...state,
				tostifyAlertFunc: payload.data,
			};

		case COMMON.TOSTIFY_ALERT:
			if (state.tostifyAlertFunc) {
				state.tostifyAlertFunc(payload.status, payload.message);
			}
			return {
				...state,
				tostifyAlert: { status: payload.status, message: payload.message },
			};
		// break;

		case COMMON.VAT_VERSION:
			return {
				...state,
				version: payload.data,
			};

		case COMMON.UNIVERSAL_CURRENCY_LIST:
			return {
				...state,
				universal_currency_list: Object.assign([], payload.data),
			};
		case COMMON.COUNTRY_LIST:

			return {

				...state,
				country_list: Object.assign([], payload),
			};
		case COMMON.STATE_LIST:
			return {
				...state,
				state_list: Object.assign([], payload),
			};
		case COMMON.CURRENCY_CONVERT_LIST:
			return {
				...state,
				currency_convert_list: Object.assign([], payload.data),
			};

		case COMMON.COMPANY_TYPE:
			return {
				...state,
				company_type_list: Object.assign([], payload),
			};
		case COMMON.CURRENCY_LIST:
			return {
				...state,
				currency_list: Object.assign([], payload.data),
			};
		case COMMON.COMPANY_PROFILE:
			return {
				...state,
				company_profile: Object.assign([], payload.data),
			};
		case COMMON.TAX_TREATMENT_LIST:
			return {
				...state,
				tax_treatment_list: Object.assign([], payload.data),
			};
		case COMMON.VAT_LIST:
			return {
				...state,
				vat_list: Object.assign([], payload.data),
			};
		case COMMON.PRODUCT_LIST:
			return {
				...state,
				product_list: Object.assign([], payload.data),
			};
		case COMMON.EXCISE_LIST:
			return {
				...state,
				excise_list: Object.assign([], payload.data),
			};
		case COMMON.CUSTOMER_LIST:
			return {
				...state,
				customer_list: Object.assign([], payload.data),
			};
		case COMMON.PAY_MODE:
			return {
				...state,
				pay_mode: Object.assign([], payload.data),
			};

		case COMMON.COMPANY_DETAILS:
			return {
				...state,
				company_details: Object.assign([], payload.data),
			};
		case COMMON.SALARY_COMPONENT_LIST:
			return {
				...state,
				salary_component_list: Object.assign([], payload.data),
			};
		default:
			return state;
	}
};

export default CommonReducer;
