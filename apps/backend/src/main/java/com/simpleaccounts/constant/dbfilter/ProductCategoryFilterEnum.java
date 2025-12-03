package com.simpleaccounts.constant.dbfilter;

import lombok.Getter;

public enum ProductCategoryFilterEnum {

    ID("id", " = :id"),
    PRODUCT_CATEGORY_CODE("productCategoryCode" ," like CONCAT('%',:productCategoryCode,'%')"),
    PRODUCT_CATEGORY_NAME("productCategoryName", " like CONCAT('%',:productCategoryName,'%')"),
    DELETE_FLAG("deleteFlag", " = :deleteFlag"),
	ORDER_BY("id"," =:id"),
    USER_ID("createdBy", "= :createdBy");

    @Getter
    String dbColumnName;

    @Getter
    String condition;

	private ProductCategoryFilterEnum(String dbColumnName, String condition) {
		this.dbColumnName = dbColumnName;
		this.condition = condition;
	}

}
