package com.simpleaccounts.rest.journalcontroller;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class JournalLineItemRequestModel implements Serializable  {

	private Integer id;
	private String description;
	private Integer transactionCategoryId;
	private String transactionCategoryName;
	private String journalTransactionCategoryLabel;
	private Integer contactId;
	private Integer vatCategoryId;
	private BigDecimal debitAmount;
	private BigDecimal creditAmount;
	private PostingReferenceTypeEnum postingReferenceType;
}
