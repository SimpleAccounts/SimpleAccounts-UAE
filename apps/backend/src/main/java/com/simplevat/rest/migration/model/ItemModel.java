package com.simplevat.rest.migration.model;


import lombok.Data;

@Data
public class ItemModel {

	String itemID;
	String itemName;
	String description;
	String rate;
	String productType;
	String account;
	String taxPercentage;
	String itemType;
	String purchaseAccount;
	String stockOnHand;
	String purchaseRate;
	String vendor;
	String inventoryAccountCode;
	String initialStock;
	String reorderPoint;
	
}
