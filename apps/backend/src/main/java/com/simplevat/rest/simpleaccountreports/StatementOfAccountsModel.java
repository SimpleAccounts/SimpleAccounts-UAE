package com.simplevat.rest.simpleaccountreports;


import lombok.Data;

import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
@Data

public class StatementOfAccountsModel {

    private String contactName;
    private LocalDate invoiceDate;
    private String type;
    private String invoiceNumber;
    private BigDecimal totalAmount;
    private Date creditNoteDate;
    private Integer contactId;
    private Integer invoiceId;
    private Boolean isCNWithoutProduct;



}
