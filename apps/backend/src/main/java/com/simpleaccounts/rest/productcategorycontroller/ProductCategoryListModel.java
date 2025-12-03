package com.simpleaccounts.rest.productcategorycontroller;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductCategoryListModel {

	private Integer id;
	private String productCategoryName;
	private String productCategoryDescription;
	private String productCategoryCode;
	private Integer createdBy = 0;
	private LocalDateTime createdDate;
	private Integer lastUpdateBy;
	private LocalDateTime lastUpdateDate;
	private Boolean deleteFlag = Boolean.FALSE;
	private Integer versionNumber = 1;

}
