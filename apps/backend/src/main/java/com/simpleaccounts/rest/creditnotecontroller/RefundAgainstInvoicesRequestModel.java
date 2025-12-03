package com.simpleaccounts.rest.creditnotecontroller;

import lombok.Data;

import java.util.List;

@Data
public class RefundAgainstInvoicesRequestModel {
    private Integer creditNoteId;
    private List<Integer> invoiceIds;
}
