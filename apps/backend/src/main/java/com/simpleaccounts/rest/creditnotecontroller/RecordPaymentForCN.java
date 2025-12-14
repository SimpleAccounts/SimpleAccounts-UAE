package com.simpleaccounts.rest.creditnotecontroller;

import com.simpleaccounts.constant.PayMode;
import java.math.BigDecimal;
import java.util.Date;
import lombok.Data;

@Data
public class RecordPaymentForCN {

    private Integer creditNoteId;
    private Integer invoiceId;
    private Date paymentDate;
    private PayMode payMode;
    private Integer depositTo;// transaction category Id
    private Integer contactId; // customer details
    private BigDecimal amountReceived;
    private String notes;
    private Boolean isCreatedWithoutInvoice;
    private String type;
}
