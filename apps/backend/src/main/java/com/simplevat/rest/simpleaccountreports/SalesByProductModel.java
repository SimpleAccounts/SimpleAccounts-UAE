package com.simplevat.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SalesByProductModel {

    private int productId;
    private String productName;
    private Long quantitySold;
    private BigDecimal totalAmountForAProduct;
    private Double averageAmount;

}
