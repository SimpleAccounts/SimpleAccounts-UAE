package com.simplevat.rest.productcategorycontroller;

import com.simplevat.rest.PaginationModel;

import lombok.Data;

@Data
public class ProductCategoryFilterModel extends PaginationModel {

	private Integer id;
	private String productCategoryCode;
	private String productCategoryName;
	private boolean delete;
	private Integer userId;

}
