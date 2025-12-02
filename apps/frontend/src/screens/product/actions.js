import { PRODUCT } from 'constants/types';
import { authApi } from 'utils';

export const getProductList = (obj) => {
	let name = obj.name ? obj.name : '';
	let productCode = obj.productCode ? obj.productCode : '';
	let vatPercentage = obj.vatPercentage ? obj.vatPercentage.value : '';
	let pageNo = obj.pageNo ? obj.pageNo : '';
	let pageSize = obj.pageSize ? obj.pageSize : '';
	let order = obj.order ? obj.order : '';
	let sortingCol = obj.sortingCol ? obj.sortingCol : '';
	let paginationDisable = obj.paginationDisable ? obj.paginationDisable : false;

	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/product/getList?name=${name}&productCode=${productCode}&vatPercentage=${vatPercentage}&pageNo=${pageNo}&pageSize=${pageSize}&order=${order}&sortingCol=${sortingCol}&paginationDisable=${paginationDisable}`,
		};
		return authApi(data)
			.then((res) => {
				if (!obj.paginationDisable) {
					dispatch({
						type: PRODUCT.PRODUCT_LIST,
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

// Get Product By ID

// Create & Save Product
export const createAndSaveProduct = (product) => {
	return (dispatch) => {
		let data = {
			method: 'POST',
			url: `/rest/product/save`,
			data: product,
		};

		return authApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

// Create Warehouse
export const createWarehouse = (warehouse) => {
	let data = {
		method: 'POST',
		url: `/rest/productwarehouse/saveWareHouse`,
		data: warehouse,
	};

	return authApi(data)
		.then((res) => {
			return res;
		})
		.catch((err) => {
			throw err;
		});
};

// Get Product Warehouse
export const getProductWareHouseList = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/productwarehouse/getWareHouse',
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: PRODUCT.PRODUCT_WHARE_HOUSE,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

// Get Product VatCategory
export const getProductVatCategoryList = () => {
	return (dispatch, getState) => {
		// const state = getState();
		let data = {
			method: 'GET',
			url: '/rest/datalist/vatCategory',
		};
			return authApi(data)
				.then((res) => {
					let array=[]
					res.data.map((item)=>{if(item.id!=4 && item.id!=10 )	array.push(item)})

					dispatch({
						type: PRODUCT.PRODUCT_VAT_CATEGORY,
						payload: array,
					});
					return res;
				})
				.catch((err) => {
					throw err;
				});
	};
};

// Get Product exciseTax
export const getExciseTaxList = () => {
	return (dispatch, getState) => {

		let data = {
			method: 'GET',
			url: '/rest/datalist/exciseTax',
		};
			return authApi(data)
				.then((res) => {
					return res;
				})
				.catch((err) => {
					throw err;
				});
	};
};

export const getTransactionCategoryListForInventory = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/product/getTransactionCategoryListForInventory',
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
// Get Parent Product
export const getProductCategoryList = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: '/rest/datalist/getProductCategoryList',
		};

		return authApi(data)
			.then((res) => {
				dispatch({
					type: PRODUCT.PRODUCT_CATEGORY,
					payload: res.data,
				});
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};

export const removeBulk = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'delete',
			url: '/rest/product/deletes',
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

export const getInventoryByProductId = (id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/inventory/getInventoryByProductId?id=${id}`
	  }
  
	  return authApi(data)
			  .then((res) => {
				  
					  dispatch({
						  type: PRODUCT.INVENTORY_LIST,
						  payload: res.data,
					  });
				  return res;
	  }).catch((err) => {
		throw err
	  })
	}
  }
  export const getInventoryHistory = (obj) => {
	  let pid=obj?.p_id;
	  let sid=obj?.s_id;
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/inventory/getInventoryHistoryByProductIdAndSupplierId?productId=${pid}&supplierId=${sid}`
		
	  }
  
	  return authApi(data)
			  .then((res) => {
				  
					  dispatch({
						  type: PRODUCT.INVENTORY_HISTORY_LIST,
						  payload: res.data,
					  });
				  return res;
	  }).catch((err) => {
		throw err
	  })
	}
  }

export const getTransactionCategoryListForSalesProduct = (id) => {
	console.log(id);
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/product/getTransactionCategoryListForSalesProduct`,
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

export const getTransactionCategoryListForPurchaseProduct = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/product/getTransactionCategoryListForPurchaseProduct`,
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

export const checkValidation = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/validation/validate?name=${obj.name}&moduleType=${obj.moduleType}`,
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

export const checkProductNameValidation = (obj) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/validation/validate?moduleType=${obj.moduleType}&productCode=${obj.productCode}`,
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

export const getInvoicesCountProduct = (id) => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: `/rest/product/getInvoicesCountForProduct/?productId=${id}`,
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

export const getInventoryById = (id) => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/inventory/getInventoryById?id=${id}`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const updateInventory = (obj) => {
	return (dispatch) => {
	  let data = {
		method: 'POST',
		url: `/rest/inventory/update`,
		data: obj
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }

  export const getProductCode = () => {
	return (dispatch) => {
		let data = {
			method: 'GET',
			url: `/rest/customizeinvoiceprefixsuffix/getNextInvoiceNo?invoiceType=9`,
		};

		return authApi(data)
			.then((res) => {
				return res;
			})
			.catch((err) => {
				throw err;
			});
	};
};
export const getProductCodePrefix = () => {
	return (dispatch) => {
		let data = {
			method: 'get',
			url: '/rest/customizeinvoiceprefixsuffix/getListForInvoicePrefixAndSuffix?invoiceType=9',
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

export const getCompanyDetails = () => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/company/getCompanyDetails`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }
  export const getUnitTypeList = () => {
	return (dispatch) => {
	  let data = {
		method: 'GET',
		url: `/rest/datalist/getUnitTypeList`
	  }
  
	  return authApi(data).then((res) => {
		return res
	  }).catch((err) => {
		throw err
	  })
	}
  }