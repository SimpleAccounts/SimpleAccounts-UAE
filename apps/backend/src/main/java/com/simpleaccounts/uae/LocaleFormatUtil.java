package com.simpleaccounts.uae;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Objects;

/**
 * Utility methods for UAE-specific formatting.
 */
public final class LocaleFormatUtil {

    private static final DateTimeFormatter DATE_FORMATTER =
        DateTimeFormatter.ofPattern("dd/MM/yyyy").withLocale(Locale.UK);

    private static final DecimalFormat NUMBER_FORMAT;

    static {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        symbols.setGroupingSeparator(',');
        symbols.setDecimalSeparator('.');
        NUMBER_FORMAT = new DecimalFormat("#,##0.00", symbols);
    }

    private LocaleFormatUtil() {
    }

    public static String formatDate(LocalDate date) {
        Objects.requireNonNull(date, "Date is required");
        return DATE_FORMATTER.format(date);
    }

    public static String formatCurrency(BigDecimal amount) {
        return "AED " + formatNumber(amount);
    }

    public static String formatNumber(BigDecimal number) {
        Objects.requireNonNull(number, "Number is required");
        return NUMBER_FORMAT.format(number);
    }
}
