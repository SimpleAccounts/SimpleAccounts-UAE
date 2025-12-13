package com.simpleaccounts.rest.receiptcontroller;

import java.math.BigDecimal;
import java.util.Date;
import lombok.Data;

@Data
public class ReceiptModel {

	private Integer receiptId;
	private Date receiptDate;
	private String referenceCode;
	private String receiptNo;
	private String customerName;
	private Integer contactId;
	private BigDecimal amount;
	private BigDecimal unusedAmount;
	private String invoiceNumber;
	private String currencyIsoCode;
	private String currencySymbol;
	private BigDecimal convertedAmount;
}
