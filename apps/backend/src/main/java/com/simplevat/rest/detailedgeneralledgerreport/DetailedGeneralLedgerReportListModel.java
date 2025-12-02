package com.simplevat.rest.detailedgeneralledgerreport;

import java.math.BigDecimal;

import com.simplevat.constant.PostingReferenceTypeEnum;

import lombok.Data;

@Data
public class DetailedGeneralLedgerReportListModel {

	private String date;
	private String transactionTypeName;
	private String name;
	private String postingReferenceTypeEnum;
	private PostingReferenceTypeEnum postingReferenceType;
	private String transactonRefNo;
	private String referenceNo;
	private BigDecimal debitAmount;
	private BigDecimal creditAmount;
	private BigDecimal amount;
	private Integer referenceId;
	private Integer invoiceType;
}
