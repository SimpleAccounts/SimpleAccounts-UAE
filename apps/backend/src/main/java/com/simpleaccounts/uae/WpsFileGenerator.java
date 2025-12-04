package com.simpleaccounts.uae;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/**
 * Generates CSV compliant with UAE Wage Protection System expectations.
 */
public class WpsFileGenerator {

    private static final Pattern EMPLOYEE_ID_PATTERN = Pattern.compile("^[0-9]{6,}$");
    private static final Pattern BANK_CODE_PATTERN = Pattern.compile("^[A-Z]{3}$");
    private static final Pattern IBAN_PATTERN = Pattern.compile("^AE[0-9A-Z]{21}$");
    private static final DecimalFormat AMOUNT_FORMAT;

    static {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols(Locale.US);
        symbols.setDecimalSeparator('.');
        symbols.setGroupingSeparator(',');
        AMOUNT_FORMAT = new DecimalFormat("#0.00", symbols);
    }

    public String generate(List<WpsRecord> records) {
        Objects.requireNonNull(records, "WPS records list is required");
        if (records.isEmpty()) {
            throw new IllegalArgumentException("At least one WPS record is required");
        }

        StringBuilder builder = new StringBuilder();
        for (WpsRecord record : records) {
            validate(record);
            if (builder.length() > 0) {
                builder.append(System.lineSeparator());
            }
            builder.append(record.getEmployeeId()).append(',')
                .append(escape(record.getEmployeeName())).append(',')
                .append(record.getBankCode()).append(',')
                .append(record.getIban()).append(',')
                .append(AMOUNT_FORMAT.format(record.getAmount()));
        }
        return builder.toString();
    }

    private void validate(WpsRecord record) {
        if (!EMPLOYEE_ID_PATTERN.matcher(record.getEmployeeId()).matches()) {
            throw new IllegalArgumentException("Employee ID must be numeric and at least 6 digits");
        }
        if (!BANK_CODE_PATTERN.matcher(record.getBankCode()).matches()) {
            throw new IllegalArgumentException("Bank code must be three uppercase letters");
        }
        if (!IBAN_PATTERN.matcher(record.getIban()).matches()) {
            throw new IllegalArgumentException("IBAN must be UAE compliant");
        }
        if (record.getAmount() == null || record.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
    }

    private String escape(String input) {
        if (input == null) {
            return "";
        }
        return input.replace(",", " ").trim();
    }
}

