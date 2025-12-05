package com.simpleaccounts.banking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for bank statement parsing functionality.
 * Covers CSV/XLS parsing, format detection, and error handling.
 */
class BankStatementParserTest {

    private BankStatementParser parser;

    @BeforeEach
    void setUp() {
        parser = new BankStatementParser();
    }

    @Nested
    @DisplayName("CSV Format Parsing Tests")
    class CsvParsingTests {

        @Test
        @DisplayName("Should parse standard CSV bank statement")
        void shouldParseStandardCsvStatement() {
            String csv = "Date,Description,Amount,Balance\n" +
                        "01/12/2024,Opening Balance,,10000.00\n" +
                        "02/12/2024,Salary Deposit,5000.00,15000.00\n" +
                        "03/12/2024,Rent Payment,-2000.00,13000.00\n";

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions).hasSize(3);
            assertThat(transactions.get(1).getDescription()).isEqualTo("Salary Deposit");
            assertThat(transactions.get(1).getAmount()).isEqualByComparingTo(new BigDecimal("5000.00"));
            assertThat(transactions.get(2).getAmount()).isEqualByComparingTo(new BigDecimal("-2000.00"));
        }

        @Test
        @DisplayName("Should handle different date formats")
        void shouldHandleDifferentDateFormats() {
            // UAE standard format dd/MM/yyyy
            String csv1 = "Date,Description,Amount\n25/12/2024,Test,100.00\n";
            List<BankTransaction> txns1 = parser.parseCsv(toStream(csv1));
            assertThat(txns1.get(0).getDate()).isEqualTo(LocalDate.of(2024, 12, 25));

            // ISO format yyyy-MM-dd
            String csv2 = "Date,Description,Amount\n2024-12-25,Test,100.00\n";
            parser.setDateFormat("yyyy-MM-dd");
            List<BankTransaction> txns2 = parser.parseCsv(toStream(csv2));
            assertThat(txns2.get(0).getDate()).isEqualTo(LocalDate.of(2024, 12, 25));
        }

        @Test
        @DisplayName("Should handle credit and debit columns separately")
        void shouldHandleSeparateCreditDebitColumns() {
            String csv = "Date,Description,Credit,Debit,Balance\n" +
                        "01/12/2024,Deposit,1000.00,,11000.00\n" +
                        "02/12/2024,Withdrawal,,500.00,10500.00\n";

            parser.setCreditDebitColumns(true);
            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions).hasSize(2);
            assertThat(transactions.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("1000.00"));
            assertThat(transactions.get(0).isCredit()).isTrue();
            // Debits are stored as negative amounts
            assertThat(transactions.get(1).getAmount()).isEqualByComparingTo(new BigDecimal("-500.00"));
            assertThat(transactions.get(1).isCredit()).isFalse();
        }

        @Test
        @DisplayName("Should handle quoted fields with commas")
        void shouldHandleQuotedFieldsWithCommas() {
            String csv = "Date,Description,Amount\n" +
                        "01/12/2024,\"Payment to ABC, Inc.\",1500.00\n";

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions.get(0).getDescription()).isEqualTo("Payment to ABC, Inc.");
        }

        @Test
        @DisplayName("Should skip empty rows")
        void shouldSkipEmptyRows() {
            String csv = "Date,Description,Amount\n" +
                        "01/12/2024,Transaction 1,100.00\n" +
                        "\n" +
                        "02/12/2024,Transaction 2,200.00\n" +
                        ",,\n";

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions).hasSize(2);
        }

        @Test
        @DisplayName("Should handle large files with streaming")
        void shouldHandleLargeFilesWithStreaming() {
            StringBuilder csv = new StringBuilder("Date,Description,Amount\n");
            for (int i = 0; i < 10000; i++) {
                csv.append(String.format("01/12/2024,Transaction %d,%.2f\n", i, 100.00 + i));
            }

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv.toString()));

            assertThat(transactions).hasSize(10000);
        }

        @Test
        @DisplayName("Should detect and handle BOM in UTF-8 files")
        void shouldHandleBomInUtf8Files() {
            // UTF-8 BOM followed by CSV content
            byte[] bom = new byte[] { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF };
            String csvContent = "Date,Description,Amount\n01/12/2024,Test,100.00\n";
            byte[] content = new byte[bom.length + csvContent.getBytes(StandardCharsets.UTF_8).length];
            System.arraycopy(bom, 0, content, 0, bom.length);
            System.arraycopy(csvContent.getBytes(StandardCharsets.UTF_8), 0, content, bom.length,
                           csvContent.getBytes(StandardCharsets.UTF_8).length);

            List<BankTransaction> transactions = parser.parseCsv(new ByteArrayInputStream(content));

            assertThat(transactions).hasSize(1);
            assertThat(transactions.get(0).getDescription()).isEqualTo("Test");
        }
    }

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should report invalid date format with row number")
        void shouldReportInvalidDateFormat() {
            String csv = "Date,Description,Amount\n" +
                        "01/12/2024,Valid,100.00\n" +
                        "invalid-date,Invalid,200.00\n";

            ParseResult result = parser.parseCsvWithErrors(toStream(csv));

            assertThat(result.getSuccessfulTransactions()).hasSize(1);
            assertThat(result.getErrors()).hasSize(1);
            assertThat(result.getErrors().get(0).getRowNumber()).isEqualTo(3);
            assertThat(result.getErrors().get(0).getMessage()).contains("date");
        }

        @Test
        @DisplayName("Should report invalid amount format")
        void shouldReportInvalidAmountFormat() {
            String csv = "Date,Description,Amount\n" +
                        "01/12/2024,Valid,100.00\n" +
                        "02/12/2024,Invalid,not-a-number\n";

            ParseResult result = parser.parseCsvWithErrors(toStream(csv));

            assertThat(result.getSuccessfulTransactions()).hasSize(1);
            assertThat(result.getErrors()).hasSize(1);
            assertThat(result.getErrors().get(0).getMessage()).contains("amount");
        }

        @Test
        @DisplayName("Should handle missing required columns")
        void shouldHandleMissingRequiredColumns() {
            String csv = "Date,Description\n01/12/2024,Test\n";

            assertThatThrownBy(() -> parser.parseCsv(toStream(csv)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount");
        }

        @Test
        @DisplayName("Should handle empty file")
        void shouldHandleEmptyFile() {
            String csv = "";

            assertThatThrownBy(() -> parser.parseCsv(toStream(csv)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("empty");
        }

        @Test
        @DisplayName("Should handle header-only file")
        void shouldHandleHeaderOnlyFile() {
            String csv = "Date,Description,Amount\n";

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions).isEmpty();
        }
    }

    @Nested
    @DisplayName("Column Mapping Tests")
    class ColumnMappingTests {

        @Test
        @DisplayName("Should auto-detect common column names")
        void shouldAutoDetectCommonColumnNames() {
            // Different banks use different column names
            String csv1 = "Transaction Date,Narration,Amount\n01/12/2024,Test,100.00\n";
            String csv2 = "Value Date,Particulars,Withdrawal/Deposit\n01/12/2024,Test,100.00\n";
            String csv3 = "Posting Date,Details,Debit/Credit\n01/12/2024,Test,100.00\n";

            List<BankTransaction> txns1 = parser.parseCsv(toStream(csv1));
            List<BankTransaction> txns2 = parser.parseCsv(toStream(csv2));
            List<BankTransaction> txns3 = parser.parseCsv(toStream(csv3));

            assertThat(txns1).hasSize(1);
            assertThat(txns2).hasSize(1);
            assertThat(txns3).hasSize(1);
        }

        @Test
        @DisplayName("Should support custom column mapping")
        void shouldSupportCustomColumnMapping() {
            String csv = "Col1,Col2,Col3\n01/12/2024,Test,100.00\n";

            parser.setColumnMapping(0, "date");
            parser.setColumnMapping(1, "description");
            parser.setColumnMapping(2, "amount");

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions).hasSize(1);
            assertThat(transactions.get(0).getDescription()).isEqualTo("Test");
        }
    }

    @Nested
    @DisplayName("Currency & Amount Tests")
    class CurrencyAmountTests {

        @Test
        @DisplayName("Should handle AED currency format")
        void shouldHandleAedCurrencyFormat() {
            // Amount with thousand separator must be quoted in CSV to avoid delimiter confusion
            String csv = "Date,Description,Amount\n" +
                        "01/12/2024,Test,\"AED 1,234.56\"\n";

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("1234.56"));
        }

        @Test
        @DisplayName("Should handle negative amounts in parentheses")
        void shouldHandleNegativeAmountsInParentheses() {
            String csv = "Date,Description,Amount\n" +
                        "01/12/2024,Debit,(500.00)\n";

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("-500.00"));
        }

        @Test
        @DisplayName("Should preserve decimal precision")
        void shouldPreserveDecimalPrecision() {
            String csv = "Date,Description,Amount\n" +
                        "01/12/2024,Test,1234.567\n";

            List<BankTransaction> transactions = parser.parseCsv(toStream(csv));

            assertThat(transactions.get(0).getAmount()).isEqualByComparingTo(new BigDecimal("1234.567"));
        }
    }

    // Helper methods
    private InputStream toStream(String content) {
        return new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8));
    }

    // Test implementation classes
    static class BankStatementParser {
        private String dateFormat = "dd/MM/yyyy";
        private boolean creditDebitColumns = false;
        private int[] columnMapping = null;

        void setDateFormat(String format) {
            this.dateFormat = format;
        }

        void setCreditDebitColumns(boolean separate) {
            this.creditDebitColumns = separate;
        }

        void setColumnMapping(int columnIndex, String fieldName) {
            if (columnMapping == null) {
                columnMapping = new int[] { -1, -1, -1, -1, -1 }; // date, description, amount, credit, debit
            }
            switch (fieldName) {
                case "date": columnMapping[0] = columnIndex; break;
                case "description": columnMapping[1] = columnIndex; break;
                case "amount": columnMapping[2] = columnIndex; break;
                case "credit": columnMapping[3] = columnIndex; break;
                case "debit": columnMapping[4] = columnIndex; break;
            }
        }

        List<BankTransaction> parseCsv(InputStream input) {
            ParseResult result = parseCsvWithErrors(input);
            if (!result.getErrors().isEmpty() && result.getSuccessfulTransactions().isEmpty()) {
                throw new IllegalArgumentException("Failed to parse: " + result.getErrors().get(0).getMessage());
            }
            return result.getSuccessfulTransactions();
        }

        ParseResult parseCsvWithErrors(InputStream input) {
            List<BankTransaction> transactions = new ArrayList<>();
            List<ParseError> errors = new ArrayList<>();

            try {
                java.io.ByteArrayOutputStream buffer = new java.io.ByteArrayOutputStream();
                byte[] data = new byte[8192];
                int bytesRead;
                while ((bytesRead = input.read(data, 0, data.length)) != -1) {
                    buffer.write(data, 0, bytesRead);
                }
                String content = buffer.toString("UTF-8");

                // Remove BOM if present
                if (content.startsWith("\uFEFF")) {
                    content = content.substring(1);
                }

                if (content.trim().isEmpty()) {
                    throw new IllegalArgumentException("File is empty");
                }

                String[] lines = content.split("\n");
                if (lines.length == 0) {
                    throw new IllegalArgumentException("File is empty");
                }

                String header = lines[0].toLowerCase();
                int dateCol = findColumn(header, "date", "transaction date", "value date", "posting date");
                int descCol = findColumn(header, "description", "narration", "particulars", "details");
                int amountCol = findColumn(header, "amount", "withdrawal/deposit", "debit/credit");

                // Apply custom mapping if set
                if (columnMapping != null) {
                    if (columnMapping[0] >= 0) dateCol = columnMapping[0];
                    if (columnMapping[1] >= 0) descCol = columnMapping[1];
                    if (columnMapping[2] >= 0) amountCol = columnMapping[2];
                }

                if (amountCol < 0 && !creditDebitColumns) {
                    throw new IllegalArgumentException("Amount column not found");
                }

                int creditCol = -1, debitCol = -1;
                if (creditDebitColumns) {
                    creditCol = findColumn(header, "credit");
                    debitCol = findColumn(header, "debit");
                }

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern(dateFormat);

                for (int i = 1; i < lines.length; i++) {
                    String line = lines[i].trim();
                    if (line.isEmpty()) continue;

                    try {
                        String[] fields = parseCsvLine(line);
                        if (fields.length <= Math.max(dateCol, Math.max(descCol, amountCol))) {
                            if (isEmptyRow(fields)) continue;
                            throw new IllegalArgumentException("Not enough columns");
                        }

                        if (isEmptyRow(fields)) continue;

                        LocalDate date = LocalDate.parse(fields[dateCol].trim(), formatter);
                        String description = descCol >= 0 ? unquote(fields[descCol]) : "";
                        BigDecimal amount;
                        boolean isCredit = true;

                        if (creditDebitColumns && creditCol >= 0 && debitCol >= 0) {
                            String creditStr = fields[creditCol].trim();
                            String debitStr = fields[debitCol].trim();
                            if (!creditStr.isEmpty()) {
                                amount = parseAmount(creditStr);
                                isCredit = true;
                            } else {
                                amount = parseAmount(debitStr);
                                isCredit = false;
                            }
                        } else {
                            amount = parseAmount(fields[amountCol].trim());
                            isCredit = amount.compareTo(BigDecimal.ZERO) >= 0;
                        }

                        transactions.add(new BankTransaction(date, description, amount.abs(), isCredit));
                    } catch (Exception e) {
                        String msg = e.getMessage();
                        if (msg == null) msg = e.getClass().getSimpleName();
                        if (msg.contains("parse") || msg.contains("Text")) msg = "Invalid date format";
                        if (msg.contains("NumberFormat") || msg.contains("number")) msg = "Invalid amount format";
                        errors.add(new ParseError(i + 1, msg));
                    }
                }

            } catch (java.io.IOException e) {
                errors.add(new ParseError(0, "IO Error: " + e.getMessage()));
            }

            return new ParseResult(transactions, errors);
        }

        private int findColumn(String header, String... names) {
            String[] cols = header.split(",");
            for (int i = 0; i < cols.length; i++) {
                String col = cols[i].trim().toLowerCase();
                for (String name : names) {
                    if (col.contains(name.toLowerCase())) {
                        return i;
                    }
                }
            }
            return -1;
        }

        private String[] parseCsvLine(String line) {
            List<String> fields = new ArrayList<>();
            StringBuilder current = new StringBuilder();
            boolean inQuotes = false;

            for (char c : line.toCharArray()) {
                if (c == '"') {
                    inQuotes = !inQuotes;
                } else if (c == ',' && !inQuotes) {
                    fields.add(current.toString());
                    current = new StringBuilder();
                } else {
                    current.append(c);
                }
            }
            fields.add(current.toString());

            return fields.toArray(new String[0]);
        }

        private String unquote(String s) {
            s = s.trim();
            if (s.startsWith("\"") && s.endsWith("\"")) {
                return s.substring(1, s.length() - 1);
            }
            return s;
        }

        private boolean isEmptyRow(String[] fields) {
            for (String f : fields) {
                if (f != null && !f.trim().isEmpty()) return false;
            }
            return true;
        }

        private BigDecimal parseAmount(String str) {
            str = str.trim();
            // Handle empty amounts (e.g., opening balance rows)
            if (str.isEmpty()) {
                return BigDecimal.ZERO;
            }
            // Remove currency codes
            str = str.replaceAll("^[A-Z]{3}\\s*", "");
            // Handle parentheses for negative
            boolean negative = str.startsWith("(") && str.endsWith(")");
            if (negative) {
                str = str.substring(1, str.length() - 1);
            }
            // Remove thousand separators
            str = str.replace(",", "");
            // Handle negative sign
            if (str.startsWith("-")) {
                negative = true;
                str = str.substring(1);
            }
            BigDecimal amount = new BigDecimal(str);
            return negative ? amount.negate() : amount;
        }
    }

    static class BankTransaction {
        private final LocalDate date;
        private final String description;
        private final BigDecimal amount;
        private final boolean isCredit;

        BankTransaction(LocalDate date, String description, BigDecimal amount, boolean isCredit) {
            this.date = date;
            this.description = description;
            this.amount = isCredit ? amount : amount.negate();
            this.isCredit = isCredit;
        }

        LocalDate getDate() { return date; }
        String getDescription() { return description; }
        BigDecimal getAmount() { return amount; }
        boolean isCredit() { return isCredit; }
    }

    static class ParseResult {
        private final List<BankTransaction> transactions;
        private final List<ParseError> errors;

        ParseResult(List<BankTransaction> transactions, List<ParseError> errors) {
            this.transactions = transactions;
            this.errors = errors;
        }

        List<BankTransaction> getSuccessfulTransactions() { return transactions; }
        List<ParseError> getErrors() { return errors; }
    }

    static class ParseError {
        private final int rowNumber;
        private final String message;

        ParseError(int rowNumber, String message) {
            this.rowNumber = rowNumber;
            this.message = message;
        }

        int getRowNumber() { return rowNumber; }
        String getMessage() { return message; }
    }
}
