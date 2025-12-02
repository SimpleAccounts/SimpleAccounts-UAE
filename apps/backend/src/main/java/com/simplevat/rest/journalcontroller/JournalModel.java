package com.simplevat.rest.journalcontroller;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import com.simplevat.constant.PostingReferenceTypeEnum;

import lombok.Data;

@Data
public class JournalModel implements Serializable{

    private Integer journalId;
    private String description;
    private Date journalDate;
    private String journalTransactionCategoryLabel;
    private String journalReferenceNo;
    private BigDecimal subTotalDebitAmount;
    private BigDecimal subTotalCreditAmount;
    private BigDecimal totalCreditAmount;
    private BigDecimal totalDebitAmount;
    private String createdByName;
    private Integer currencyCode;
    private PostingReferenceTypeEnum postingReferenceType;
    private String postingReferenceTypeDisplayName;
    private List<JournalLineItemRequestModel> journalLineItems;
}
