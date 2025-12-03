package com.simpleaccounts.rest.productcontroller;

import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;

@Data
public class ProductRequestFilterModel extends PaginationModel{
    private String name;
    private String productCode;
    private Integer vatPercentage;
    private ProductPriceType productPriceType;

}
