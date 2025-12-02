package com.simplevat.rest.migration.model;


import lombok.Data;

@Data
public class InvoiceModel {

	String  invoiceDate;
	String invoiceID;
	String  invoiceNumber;
	String  dueDate;
	String discount;
	String total;
	String notes;
	String customerName;
	String discountAmount;
	String itemTaxAmount;
	String balance;
	String paymentTermsLabel;
	String invoiceStatus;
	String exchangeRate;
	String currencyCode;
	String itemDesc;
	String quantity;
	String subTotal;
	String itemPrice;
	String account;
	String itemTax;
	String itemName;
	
}
