package com.simpleaccounts.uae;

import static org.junit.Assert.assertEquals;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.junit.Test;

public class LocaleFormatTest {

    @Test
    public void shouldFormatDatesInDayMonthYearOrder() {
        String formatted = LocaleFormatUtil.formatDate(LocalDate.of(2025, 1, 7));
        assertEquals("07/01/2025", formatted);
    }

    @Test
    public void shouldFormatAmountsInAed() {
        String formatted = LocaleFormatUtil.formatCurrency(BigDecimal.valueOf(1234.56));
        assertEquals("AED 1,234.56", formatted);
    }

    @Test
    public void shouldFormatNumbersWithGrouping() {
        String formatted = LocaleFormatUtil.formatNumber(BigDecimal.valueOf(9876543.2));
        assertEquals("9,876,543.20", formatted);
    }
}



