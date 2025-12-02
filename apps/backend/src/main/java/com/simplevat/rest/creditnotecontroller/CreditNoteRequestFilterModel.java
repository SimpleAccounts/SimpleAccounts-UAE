package com.simplevat.rest.creditnotecontroller;

import com.simplevat.rest.PaginationModel;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Created By Zain Khan
 */
@Data
public class CreditNoteRequestFilterModel extends PaginationModel {
    private Integer contact;
    private String CreditNoteNumber;
    private BigDecimal amount;
    private Integer status;
    private Integer type;
    private Integer currencyCode;
}
