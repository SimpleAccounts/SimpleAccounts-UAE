import { INVENTORY } from 'constants/types';
import { authApi } from 'utils';

export const getProductInventoryList = (obj) => {
	// let name = obj.name ? obj.name : '';
	// let productCode = obj.productCode ? obj.productCode : '';
	// let quantityOrdered = obj.quantityOrdered ? obj.quantityOrdered : '';
	// let quantityIn = obj.quantityIn ? obj.quantityIn : '';
	// let quantityOut = obj.quantityOut ? obj.quantityOut : '';
	// let stockInHand = obj.stockInHand ? obj.stockInHand : '';
	// let reOrderLevel = obj.reOrderLevel ? obj.reOrderLevel : '';
	let pageNo = obj.pageNo ? obj.pageNo : '';
	let pageSize = obj.pageSize ? obj.pageSize : '';
	let order = obj.order ? obj.order : '';
	let sortingCol = obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/inventory/getInventoryProductList?pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`,
		};
		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: INVENTORY.SUMMARY_LIST,
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

export const getAllProductCount = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getProductCountForInventory',
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

export const getTotalInventoryValue = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getTotalInventoryValue',
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
export const getQuantityAvailable = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getTotalStockOnHand',
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

export const getOutOfStockCountOfInventory = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getOutOfStockCountOfInventory',
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

export const getTopSellingProductsForInventory = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getTopSellingProductsForInventory',
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

export const getLowSellingProductsForInventory = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getLowSellingProductsForInventory',
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

export const getTopProfitGeneratingProductsForInventory = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getTopProfitGeneratingProductsForInventory',
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

export const getTotalRevenueOfInventory = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/inventory/getTotalRevenueOfInventory',
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