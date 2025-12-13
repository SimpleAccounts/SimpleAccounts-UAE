package com.simpleaccounts.rest.productcategorycontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class ProductCategoryFilterModel extends PaginationModel {

	private Integer id;
	private String productCategoryCode;
	private String productCategoryName;
	private boolean delete;
	private Integer userId;

}
