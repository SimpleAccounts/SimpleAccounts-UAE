package com.simpleaccounts.rest.productwarehousecontroller;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import com.simpleaccounts.entity.ProductWarehouse;

@Component
public class ProductWareHouseRestHelper {

	public ProductWarehouse getEntity(ProductWareHousePersistModel model) {

		if (model != null) {
			ProductWarehouse productWarehouse = new ProductWarehouse();
			BeanUtils.copyProperties(model, productWarehouse);
			return productWarehouse;
		}
		return null;
	}
}
