package com.simpleaccounts.rest.InventoryController;

import lombok.Data;

import java.util.Date;

@Data
public class InventoryHistoryResponseModel {
    private Integer supplierId;
    private String supplierName;
    private Integer customerId;
    private String transactionType;
    private Date date;
    private String customerName;
    private Integer productId;
    private String productCode;
    private String productname;
    private String invoiceNumber;
    private Float unitCost;
    private Float unitSellingPrice;
    private Float quantity;
    private Float quantitySold;
    private Float stockOnHand;

}
