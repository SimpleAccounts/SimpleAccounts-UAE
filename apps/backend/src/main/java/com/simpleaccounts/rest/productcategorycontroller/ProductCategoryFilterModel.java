package com.simpleaccounts.rest.productcategorycontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class ProductCategoryFilterModel extends PaginationModel {

	private Integer id;
	private String productCategoryCode;
	private String productCategoryName;
	private boolean delete;
	private Integer userId;

}
