package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class SalesByProductModel {

    private int productId;
    private String productName;
    private Long quantitySold;
    private BigDecimal totalAmountForAProduct;
    private Double averageAmount;

}
