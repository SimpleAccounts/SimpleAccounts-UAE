package com.simpleaccounts.rest.creditnotecontroller;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class CreditNoteListModel {
    private Integer id;
    private String creditNoteNumber;
    private String customerName;
    private String status;
    private Date creditNoteDate;
    private String currencyName;
    private String currencySymbol;
    private BigDecimal exchangeRate;
    private String statusEnum;
    private Integer contactId;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private BigDecimal dueAmount;
    private Boolean isCNWithoutProduct;
    private String invNumber;
}
