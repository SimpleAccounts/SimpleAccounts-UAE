package com.simplevat.rest.productcontroller;

import com.simplevat.constant.ProductPriceType;
import com.simplevat.rest.PaginationModel;
import lombok.Data;

@Data
public class ProductRequestFilterModel extends PaginationModel{
    private String name;
    private String productCode;
    private Integer vatPercentage;
    private ProductPriceType productPriceType;

}
