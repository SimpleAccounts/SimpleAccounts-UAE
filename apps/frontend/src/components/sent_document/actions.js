import { authApi } from 'utils';

export const postInvoice = (obj, documentTitle, strings) => {
    var URL = '';
    if (documentTitle === strings.CustomerInvoice) {
        URL = '/rest/invoice/posting';
    } else if (documentTitle === strings.TaxCreditNote) {
        URL = '/rest/creditNote/creditNotePosting';
    } else if (documentTitle === strings.Quotation) {
        URL = `/rest/poquatation/sendQuotation`;
    } else if (documentTitle === strings.Expense) {
        URL = `/rest/expense/posting`;
    } else if (documentTitle === strings.SupplierInvoice) {
        URL = `/rest/invoice/posting`;
    } else if (documentTitle === strings.DebitNote) {
        URL = `/rest/creditNote/creditNotePosting`;
    } else if (documentTitle === strings.PurchaseOrder) {
        URL = `/rest/poquatation/sendPO`;
    }

    return sendInvoice(URL);
    // General fuction to send Document
    function sendInvoice(URL) {
        return async (dispatch) => {
            let data = {
                method: 'post',
                url: URL,
                data: obj,
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

export const unPostInvoice = (obj, documentTitle, strings) => {
    var URL = '';
    URL = `/rest/invoice/undoPosting`;


    return sendInvoice(URL);
    // General fuction to send Document
    function sendInvoice(URL) {
        return async (dispatch) => {
            let data = {
                method: 'post',
                url: URL,
                data: obj,
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

export const getEmailContentById = (payload) => {
    return async (dispatch) => {
        let data = {
            method: 'post',
            url: `/rest/mail/emailContent/getById`,
            data: payload
        }
        try {
            const res = await authApi(data);
            return res;
        } catch (err) {
            throw err;
        }
    }
}

export const sendCustomEmail = (obj) => {
    return async (dispatch) => {
        let data = {
            method: 'post',
            url: '/rest/mail/send/mail',
            data: obj,
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
};

