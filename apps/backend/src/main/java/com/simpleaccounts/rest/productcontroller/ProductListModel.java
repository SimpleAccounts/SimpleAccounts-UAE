package com.simpleaccounts.rest.productcontroller;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductListModel {

    private Integer id;
    private String name;
    private String description;
    private String productCode;
    private String vatPercentage;
	private BigDecimal unitPrice;
    private Integer vatCategoryId;
    private Integer productCategoryId;
    private Integer productWarehouseId;
	private Boolean vatIncluded = Boolean.FALSE;
	private Boolean isActive;
    private String productType;
    private Boolean isInventoryEnabled;
    private Integer exciseTaxId;
    private String exciseTax;

    
}
