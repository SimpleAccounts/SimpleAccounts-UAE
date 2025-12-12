package com.simpleaccounts.rest.productcontroller;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryListModel {
    private Integer inventoryId;
    private Integer productId;
    private String productName;
    private String productCode;
    private Integer purchaseOrder;
    private Integer quantitySold;
    private Integer stockInHand;
    private String supplierName;
    private Integer supplierId;
    private Integer reOrderLevel;
}
