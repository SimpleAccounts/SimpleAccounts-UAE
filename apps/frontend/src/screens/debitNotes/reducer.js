import { DEBIT_NOTE } from 'constants/types';

const initState = {
	debit_note_list: [],
	customer_list: [],
	currency_list: [],
	deposit_list: [],
	country_list: [],
	place_of_supply: [],
	status_list: [],
	pay_mode: [],
	invoice_list: [],
};

const CustomerInvoiceReducer = (state = initState, action) => {
	const { type, payload } = action;

	switch (type) {
		case DEBIT_NOTE.DEBIT_NOTE_LIST:
			return {
				...state,
				debit_note_list: Object.assign([], payload.data),
			};

		case DEBIT_NOTE.STATUS_LIST:
			return {
				...state,
				status_list: Object.assign([], payload.data),
			};

		case DEBIT_NOTE.CURRENCY_LIST:
			return {
				...state,
				currency_list: Object.assign([], payload.data),
			};
		case DEBIT_NOTE.DEPOSIT_LIST:
			return {
				...state,
				deposit_list: Object.assign([], payload.data),
			};

		case DEBIT_NOTE.PAY_MODE:
			return {
				...state,
				pay_mode: Object.assign([], payload.data),
			};

		case DEBIT_NOTE.COUNTRY_LIST:
			return {
				...state,
				country_list: Object.assign([], payload),
			};
		case DEBIT_NOTE.PLACE_OF_SUPPLY:
			return {
				...state,
				place_of_supply: Object.assign([], payload),
			};
		case DEBIT_NOTE.INVOICE_LIST_FOR_DROPDOWN:
			return {
				...state,
				invoice_list: Object.assign([], payload),
			};

		default:
			return state;
	}
};

export default CustomerInvoiceReducer;
