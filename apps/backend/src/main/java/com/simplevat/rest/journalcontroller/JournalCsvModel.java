package com.simplevat.rest.journalcontroller;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

import lombok.Data;

@Data
public class JournalCsvModel implements Serializable {
	private Date journalDate;
	private String journalReferenceNo;
	private String postingReferenceTypeDisplayName;
	private String description;
	private String transactionCategoryName;
	private BigDecimal debitAmount;
	private BigDecimal creditAmount;
}
