import { VAT_TRANSACTIONS } from 'constants/types';

const initState = {
	vat_transaction_list: [],
};

const VatTransactionsReducer = (state = initState, action) => {
	const { type, payload } = action;

	switch (type) {
		case VAT_TRANSACTIONS.VAT_TRANSACTION_LIST:
			return {
				...state,
				vat_transaction_list: Object.assign([], payload.data),
			};
		default:
			return state;
	}
};

export default VatTransactionsReducer;
