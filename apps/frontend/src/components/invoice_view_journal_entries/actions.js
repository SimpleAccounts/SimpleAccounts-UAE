import { INVOICE_VIEW_JOURNAL } from 'constants/types';
import { authApi } from 'utils';

export const getJournalList = (obj) => {
	let invoiceId = obj?.invoiceId ?? '';
	let invoiceType = obj?.invoiceType ?? '';

	let url = `/rest/journal/getJournalsByInvoiceId?id=${invoiceId}&type=${invoiceType}`;

	return (dispatch) => {
		let data = {
			method: 'GET',
			url,
		};

		return authApi(data)
			.then((res) => {
				if (!obj?.paginationDisable) {
					dispatch({
						type: INVOICE_VIEW_JOURNAL.JOURNAL_LIST,
						payload: res.data,
					});
				}
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};
