package com.simpleaccounts.rest.creditnotecontroller;

import com.simpleaccounts.constant.PayMode;
import java.math.BigDecimal;
import java.util.Date;
import lombok.Data;

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
