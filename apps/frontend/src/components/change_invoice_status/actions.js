import { authApi } from 'utils';


export const changeStatus = (id, status, documentTitle, strings) => {
    var URL = '';
    if (documentTitle === strings.Quotation) {
        URL = `/rest/poquatation/changeStatus?id=${id}&status=${status}`;
    }else if (documentTitle === strings.PurchaseOrder) {
        URL = `/rest/poquatation/changeStatus?id=${id}&status=${status}`;
    }


    return changeStatus(URL);
    // General fuction to change Document status
    function changeStatus(URL) {
        return async (dispatch) => {
            let data = {
                method: 'post',
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

