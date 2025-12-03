import { authApi } from 'utils';


export const deleteInvoice = (id, documentTitle, strings) => {
	var URL = '';
	if (documentTitle === strings.TaxInvoice || documentTitle === strings.CustomerInvoice) {
		URL = `/rest/invoice/delete?id=${id}`;
	}
	else if (documentTitle === strings.TaxCreditNote) {
		URL = `/rest/creditNote/delete?id=${id}`;
	} else if (documentTitle === strings.Quotation) {
		URL = `/rest/poquatation/delete?id=${id}`;
	} else if (documentTitle === strings.Expense) {
		URL = `/rest/expense/delete?expenseId=${id}`;
	} else if (documentTitle === strings.SupplierInvoice) {
		URL = `/rest/invoice/delete?id=${id}`;
	} else if (documentTitle === strings.DebitNote) {
		URL = `/rest/creditNote/delete?id=${id}`;
	} else if (documentTitle === strings.PurchaseOrder) {
		URL = `/rest/poquatation/delete?id=${id}`;
	}


	return deleteInvoice(URL);
	// General fuction to send Document
	function deleteInvoice(URL) {
		return async (dispatch) => {
			let data = {
				method: 'DELETE',
				url: URL,
			};
			return authApi(data)
				.then((res) => {
					if (res.status === 200) {
						return res;
					}
				})
				.catch((err) => {
					throw err;
				});
		};
	}
}
