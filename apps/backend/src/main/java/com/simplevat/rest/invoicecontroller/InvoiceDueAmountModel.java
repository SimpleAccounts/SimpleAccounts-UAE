package com.simplevat.rest.invoicecontroller;

import java.math.BigDecimal;
import java.util.Date;

import lombok.Data;

@Data
public class InvoiceDueAmountModel {

	private Integer id;
	private Date date;
	private Date dueDate;
	private String referenceNo;
	private BigDecimal totalAount;
	private BigDecimal dueAmount;
	private BigDecimal paidAmount;
}
