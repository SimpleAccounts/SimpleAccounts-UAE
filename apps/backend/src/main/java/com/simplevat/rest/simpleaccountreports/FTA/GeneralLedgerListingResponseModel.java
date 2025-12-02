package com.simplevat.rest.simpleaccountreports.FTA;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class GeneralLedgerListingResponseModel {

    private LocalDateTime transactionDate;
    private Integer accountID;
    private String accountName;
    private String transactionDescription;
    private String name;
    private Integer transactionID;
    private String sourceDocumentID;
    private String sourceType;
    private BigDecimal Debit;
    private BigDecimal Credit;
    private BigDecimal balance;
}
