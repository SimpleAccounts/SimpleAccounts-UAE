package com.simpleaccounts.rest.productwarehousecontroller;

import lombok.Data;

@Data
public class ProductWareHousePersistModel {
	
	private Integer warehouseId;

	private String warehouseName;

	private Boolean deleteFlag;

	private Integer versionNumber = 1;
}
