package com.simpleaccounts.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionReportRestModel implements Serializable {

    private Integer transactionId;
    private LocalDateTime transactionDate;
    private String transactionDescription;
    private BigDecimal transactionAmount;
    private String transactionType;
    private String transactionCategory;
    private String bankAccount;

}
