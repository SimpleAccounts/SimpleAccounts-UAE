package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseByProductModel {

    private int productId;
    private String productName;
    private Long quantityPurchased;
    private BigDecimal totalAmountForAProduct;
    private Double averageAmount;

}
