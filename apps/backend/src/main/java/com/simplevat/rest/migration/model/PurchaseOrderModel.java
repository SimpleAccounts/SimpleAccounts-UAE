package com.simplevat.rest.migration.model;

import lombok.Data;

@Data
public class PurchaseOrderModel {

	String referenceNo;
	String itemTaxAmount;
	String total;
	String purchaseOrderNumber;
	String purchaseOrderStatus;
	String vendorName;
	String currencyCode;
	String productID;
	String itemDesc;
	String quantityOrdered;

}
