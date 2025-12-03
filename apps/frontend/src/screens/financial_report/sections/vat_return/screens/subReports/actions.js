import { EMPLOYEEPAYROLL } from 'constants/types';
import {
  authApi, authFileUploadApi
} from 'utils'


export const getAmountDetailsByPlaceOfSupply = (postData) => {
	const { startDate, endDate,placeOfSupplyId } = postData;
	let url = `/rest/invoice/getAmountDetails?startDate=${startDate}&endDate=${endDate}&placeOfSyply=${placeOfSupplyId}`;
	return (dispatch) => {
		let data = {
			method: 'get',
			url,
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