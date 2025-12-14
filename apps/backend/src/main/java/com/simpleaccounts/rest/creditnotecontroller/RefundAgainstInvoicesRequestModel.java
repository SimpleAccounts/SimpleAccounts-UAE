package com.simpleaccounts.rest.creditnotecontroller;

import java.util.List;
import lombok.Data;

@Data
public class RefundAgainstInvoicesRequestModel {
    private Integer creditNoteId;
    private List<Integer> invoiceIds;
}
