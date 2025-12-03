package com.simpleaccounts.rest.migration.model;

import lombok.Data;

@Data
public class BillModel {
	
	 String date;
	 String id;
     String billNumber;
     String status;
     String discount;
     String discountAmount;
     String total;
     String taxAmount;
     String balance;
     String vendorNotes;
     String dueDate;
     String currencyCode;
     String exchangeRate;
     String discountType;
     String paymentTermsLabel;
     String vendorName;
     String description;
     String quantity;
     String rate;
     String subTotal;
     String taxPercentage;
     String account;
}
