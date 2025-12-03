package com.simpleaccounts.rest.invoice.dto;

import java.math.BigDecimal;

public interface InvoiceAmoutResultSet {
	
	Integer getId();
	BigDecimal getTotalAmount();
	BigDecimal getTotalVatAmount();
	String  getPlaceOfSupply();
	String  getReferenceNumber();
	String  getInvoiceDate();
	String getCurrency();
	Boolean getExclusiveVat();


}
