package com.simplevat.rest.vatcontroller;

import com.simplevat.rest.PaginationModel;

import lombok.Data;

@Data
public class VatCategoryRequestFilterModel extends PaginationModel{

	private String name;
	private String vatPercentage;

}
