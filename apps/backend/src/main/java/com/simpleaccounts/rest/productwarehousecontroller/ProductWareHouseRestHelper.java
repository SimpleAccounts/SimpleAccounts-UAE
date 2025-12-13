package com.simpleaccounts.rest.productwarehousecontroller;

import com.simpleaccounts.entity.ProductWarehouse;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

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
