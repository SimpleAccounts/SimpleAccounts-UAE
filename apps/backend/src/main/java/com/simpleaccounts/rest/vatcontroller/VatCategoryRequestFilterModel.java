package com.simpleaccounts.rest.vatcontroller;

import com.simpleaccounts.rest.PaginationModel;

import lombok.Data;

@Data
public class VatCategoryRequestFilterModel extends PaginationModel{

	private String name;
	private String vatPercentage;

}
