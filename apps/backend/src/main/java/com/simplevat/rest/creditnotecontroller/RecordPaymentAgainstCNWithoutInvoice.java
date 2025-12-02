package com.simplevat.rest.creditnotecontroller;

import com.simplevat.constant.PayMode;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

@Data
public class RecordPaymentAgainstCNWithoutInvoice {
    private Integer creditNoteId;
    private Date paymentDate;
    private PayMode payMode;
    private Integer depositeTo;// transaction category Id
    private Integer contactId; // customer details
    private BigDecimal amountReceived;
    private String notes;
    private Boolean isCNWithoutProduct;
    private String type;
}
