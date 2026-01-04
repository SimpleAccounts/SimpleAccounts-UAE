package com.simpleaccounts.rest.creditnotecontroller;

import com.simpleaccounts.rest.PaginationModel;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Created By Zain Khan
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class CreditNoteRequestFilterModel extends PaginationModel {
    private Integer contact;
    private String CreditNoteNumber;
    private BigDecimal amount;
    private Integer status;
    private Integer type;
    private Integer currencyCode;
}
