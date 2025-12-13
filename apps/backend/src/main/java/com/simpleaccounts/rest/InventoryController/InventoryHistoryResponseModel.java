package com.simpleaccounts.rest.InventoryController;

import java.util.Date;
import lombok.Data;

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
