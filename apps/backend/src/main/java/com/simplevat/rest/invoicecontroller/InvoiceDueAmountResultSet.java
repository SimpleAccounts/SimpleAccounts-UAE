package com.simplevat.rest.invoicecontroller;

import java.math.BigDecimal;

public interface InvoiceDueAmountResultSet {
    BigDecimal getTotalOverdue();
    BigDecimal getThisWeekOverdue();
    BigDecimal getThisMonthOverdue();
}
