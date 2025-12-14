package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class PurchaseByProductModel {

    private int productId;
    private String productName;
    private Long quantityPurchased;
    private BigDecimal totalAmountForAProduct;
    private Double averageAmount;

}
