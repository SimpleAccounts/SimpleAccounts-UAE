package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreditNoteSummaryModel {

    private String creditNoteNumber;
    private String customerName;
    private LocalDate creditNoteDate;
    private String status;
    private BigDecimal balance;
    private BigDecimal creditNoteTotalAmount;
    private Integer type;
    private String invoiceNumber;
    private Boolean isCNWithoutProduct;
    private Integer id;
    private Integer creditNoteId;
    private Integer invoiceId;
    private String invoiceStatus;

}