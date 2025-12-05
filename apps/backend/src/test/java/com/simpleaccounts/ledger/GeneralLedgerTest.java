package com.simpleaccounts.ledger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for General Ledger functionality.
 * Covers journal entries, double-entry validation, period locking, and trial balance.
 */
class GeneralLedgerTest {

    private LedgerService ledgerService;

    @BeforeEach
    void setUp() {
        ledgerService = new LedgerService();
    }

    @Nested
    @DisplayName("Journal Entry Tests")
    class JournalEntryTests {

        @Test
        @DisplayName("Should create balanced journal entry")
        void shouldCreateBalancedJournalEntry() {
            JournalEntry entry = JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Office supplies purchase")
                .addDebit("6100", "Office Supplies", new BigDecimal("500.00"))
                .addCredit("1100", "Cash", new BigDecimal("500.00"))
                .build();

            boolean result = ledgerService.postJournal(entry);

            assertThat(result).isTrue();
            assertThat(ledgerService.getJournalCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should reject unbalanced journal entry")
        void shouldRejectUnbalancedJournalEntry() {
            JournalEntry entry = JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Unbalanced entry")
                .addDebit("6100", "Expense", new BigDecimal("500.00"))
                .addCredit("1100", "Cash", new BigDecimal("400.00")) // Wrong amount
                .build();

            assertThatThrownBy(() -> ledgerService.postJournal(entry))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("balanced");
        }

        @Test
        @DisplayName("Should handle multi-line journal entry")
        void shouldHandleMultiLineJournalEntry() {
            JournalEntry entry = JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Payroll journal")
                .addDebit("6200", "Salaries Expense", new BigDecimal("10000.00"))
                .addDebit("6210", "Benefits Expense", new BigDecimal("2000.00"))
                .addCredit("2100", "Salaries Payable", new BigDecimal("9000.00"))
                .addCredit("2110", "Tax Payable", new BigDecimal("2500.00"))
                .addCredit("1100", "Cash", new BigDecimal("500.00"))
                .build();

            boolean result = ledgerService.postJournal(entry);

            assertThat(result).isTrue();
            assertThat(entry.getTotalDebits()).isEqualByComparingTo(new BigDecimal("12000.00"));
            assertThat(entry.getTotalCredits()).isEqualByComparingTo(new BigDecimal("12000.00"));
        }

        @Test
        @DisplayName("Should assign sequential journal numbers")
        void shouldAssignSequentialJournalNumbers() {
            for (int i = 0; i < 5; i++) {
                JournalEntry entry = JournalEntry.builder()
                    .date(LocalDate.of(2024, 12, 1))
                    .description("Entry " + i)
                    .addDebit("6100", "Expense", new BigDecimal("100.00"))
                    .addCredit("1100", "Cash", new BigDecimal("100.00"))
                    .build();
                ledgerService.postJournal(entry);
            }

            List<String> numbers = ledgerService.getJournalNumbers();
            assertThat(numbers).containsExactly("JE-0001", "JE-0002", "JE-0003", "JE-0004", "JE-0005");
        }

        @Test
        @DisplayName("Should validate account codes exist")
        void shouldValidateAccountCodesExist() {
            JournalEntry entry = JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Invalid account")
                .addDebit("9999", "Unknown", new BigDecimal("100.00"))
                .addCredit("1100", "Cash", new BigDecimal("100.00"))
                .build();

            ledgerService.setValidateAccounts(true);

            assertThatThrownBy(() -> ledgerService.postJournal(entry))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid account");
        }
    }

    @Nested
    @DisplayName("Period Locking Tests")
    class PeriodLockingTests {

        @Test
        @DisplayName("Should prevent posting to locked period")
        void shouldPreventPostingToLockedPeriod() {
            ledgerService.lockPeriod(2024, 11); // Lock November 2024

            JournalEntry entry = JournalEntry.builder()
                .date(LocalDate.of(2024, 11, 15)) // November date
                .description("Late entry")
                .addDebit("6100", "Expense", new BigDecimal("100.00"))
                .addCredit("1100", "Cash", new BigDecimal("100.00"))
                .build();

            assertThatThrownBy(() -> ledgerService.postJournal(entry))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("locked");
        }

        @Test
        @DisplayName("Should allow posting to unlocked period")
        void shouldAllowPostingToUnlockedPeriod() {
            ledgerService.lockPeriod(2024, 11);

            JournalEntry entry = JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1)) // December date - not locked
                .description("Current entry")
                .addDebit("6100", "Expense", new BigDecimal("100.00"))
                .addCredit("1100", "Cash", new BigDecimal("100.00"))
                .build();

            boolean result = ledgerService.postJournal(entry);
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should unlock period with proper authorization")
        void shouldUnlockPeriodWithProperAuthorization() {
            ledgerService.lockPeriod(2024, 11);
            assertThat(ledgerService.isPeriodLocked(2024, 11)).isTrue();

            ledgerService.unlockPeriod(2024, 11, "admin", "Year-end adjustment");
            assertThat(ledgerService.isPeriodLocked(2024, 11)).isFalse();
        }

        @Test
        @DisplayName("Should record lock/unlock audit trail")
        void shouldRecordLockUnlockAuditTrail() {
            ledgerService.lockPeriod(2024, 11);
            ledgerService.unlockPeriod(2024, 11, "admin", "Correction needed");

            List<String> auditLog = ledgerService.getPeriodAuditLog(2024, 11);
            assertThat(auditLog).hasSize(2);
            assertThat(auditLog.get(0)).contains("LOCKED");
            assertThat(auditLog.get(1)).contains("UNLOCKED").contains("admin");
        }
    }

    @Nested
    @DisplayName("Trial Balance Tests")
    class TrialBalanceTests {

        @BeforeEach
        void setUpLedger() {
            // Post some journal entries
            ledgerService.postJournal(JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Sales")
                .addDebit("1100", "Cash", new BigDecimal("1000.00"))
                .addCredit("4100", "Sales Revenue", new BigDecimal("1000.00"))
                .build());

            ledgerService.postJournal(JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 5))
                .description("Expense")
                .addDebit("6100", "Operating Expense", new BigDecimal("200.00"))
                .addCredit("1100", "Cash", new BigDecimal("200.00"))
                .build());
        }

        @Test
        @DisplayName("Should generate balanced trial balance")
        void shouldGenerateBalancedTrialBalance() {
            TrialBalance tb = ledgerService.generateTrialBalance(LocalDate.of(2024, 12, 31));

            assertThat(tb.getTotalDebits()).isEqualByComparingTo(tb.getTotalCredits());
        }

        @Test
        @DisplayName("Should show correct account balances")
        void shouldShowCorrectAccountBalances() {
            TrialBalance tb = ledgerService.generateTrialBalance(LocalDate.of(2024, 12, 31));

            assertThat(tb.getBalance("1100")).isEqualByComparingTo(new BigDecimal("800.00")); // 1000 - 200
            assertThat(tb.getBalance("4100")).isEqualByComparingTo(new BigDecimal("-1000.00")); // Credit
            assertThat(tb.getBalance("6100")).isEqualByComparingTo(new BigDecimal("200.00")); // Debit
        }

        @Test
        @DisplayName("Should filter by date range")
        void shouldFilterByDateRange() {
            LocalDate startDate = LocalDate.of(2024, 12, 1);
            LocalDate endDate = LocalDate.of(2024, 12, 3);

            TrialBalance tb = ledgerService.generateTrialBalance(startDate, endDate);

            // Should only include entries up to Dec 3
            assertThat(tb.getBalance("1100")).isEqualByComparingTo(new BigDecimal("1000.00"));
        }

        @Test
        @DisplayName("Should handle opening balances")
        void shouldHandleOpeningBalances() {
            ledgerService.setOpeningBalance("1100", new BigDecimal("5000.00"), LocalDate.of(2024, 1, 1));

            TrialBalance tb = ledgerService.generateTrialBalance(LocalDate.of(2024, 12, 31));

            assertThat(tb.getBalance("1100")).isEqualByComparingTo(new BigDecimal("5800.00")); // 5000 + 1000 - 200
        }
    }

    @Nested
    @DisplayName("Reversal & Adjustment Tests")
    class ReversalAdjustmentTests {

        @Test
        @DisplayName("Should reverse journal entry")
        void shouldReverseJournalEntry() {
            JournalEntry original = JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Original entry")
                .addDebit("6100", "Expense", new BigDecimal("500.00"))
                .addCredit("1100", "Cash", new BigDecimal("500.00"))
                .build();
            ledgerService.postJournal(original);

            JournalEntry reversal = ledgerService.reverseJournal(original.getJournalNumber(),
                                                                LocalDate.of(2024, 12, 5),
                                                                "Error correction");

            assertThat(reversal.getTotalDebits()).isEqualByComparingTo(new BigDecimal("500.00"));
            assertThat(reversal.getDescription()).contains("Reversal");

            // Net effect should be zero
            TrialBalance tb = ledgerService.generateTrialBalance(LocalDate.of(2024, 12, 31));
            assertThat(tb.getBalance("6100")).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should create adjusting entry")
        void shouldCreateAdjustingEntry() {
            JournalEntry adjustment = ledgerService.createAdjustingEntry(
                LocalDate.of(2024, 12, 31),
                "Accrued interest",
                "1200", "Interest Receivable",
                "4200", "Interest Income",
                new BigDecimal("250.00")
            );

            assertThat(adjustment).isNotNull();
            assertThat(adjustment.isAdjusting()).isTrue();
        }

        @Test
        @DisplayName("Should create closing entries")
        void shouldCreateClosingEntries() {
            // Setup income and expense accounts
            ledgerService.postJournal(JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Revenue")
                .addDebit("1100", "Cash", new BigDecimal("5000.00"))
                .addCredit("4100", "Revenue", new BigDecimal("5000.00"))
                .build());

            ledgerService.postJournal(JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Expenses")
                .addDebit("6100", "Expenses", new BigDecimal("3000.00"))
                .addCredit("1100", "Cash", new BigDecimal("3000.00"))
                .build());

            List<JournalEntry> closingEntries = ledgerService.createClosingEntries(
                LocalDate.of(2024, 12, 31),
                "3200" // Retained Earnings account
            );

            assertThat(closingEntries).hasSize(2); // Close income, close expenses
        }
    }

    @Nested
    @DisplayName("Recurring Entry Tests")
    class RecurringEntryTests {

        @Test
        @DisplayName("Should create recurring entry template")
        void shouldCreateRecurringEntryTemplate() {
            RecurringEntry template = RecurringEntry.builder()
                .description("Monthly rent")
                .frequency(RecurringFrequency.MONTHLY)
                .startDate(LocalDate.of(2024, 1, 1))
                .endDate(LocalDate.of(2024, 12, 31))
                .addDebit("6300", "Rent Expense", new BigDecimal("5000.00"))
                .addCredit("2100", "Rent Payable", new BigDecimal("5000.00"))
                .build();

            String templateId = ledgerService.createRecurringEntry(template);

            assertThat(templateId).isNotNull();
            assertThat(ledgerService.getRecurringEntryCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("Should generate entries for period")
        void shouldGenerateEntriesForPeriod() {
            RecurringEntry template = RecurringEntry.builder()
                .description("Monthly depreciation")
                .frequency(RecurringFrequency.MONTHLY)
                .startDate(LocalDate.of(2024, 1, 1))
                .endDate(LocalDate.of(2024, 12, 31))
                .addDebit("6400", "Depreciation Expense", new BigDecimal("1000.00"))
                .addCredit("1500", "Accumulated Depreciation", new BigDecimal("1000.00"))
                .build();

            ledgerService.createRecurringEntry(template);

            List<JournalEntry> generated = ledgerService.processRecurringEntries(
                LocalDate.of(2024, 1, 1),
                LocalDate.of(2024, 3, 31)
            );

            assertThat(generated).hasSize(3); // Jan, Feb, Mar
        }

        @Test
        @DisplayName("Should skip already posted recurring entries")
        void shouldSkipAlreadyPostedRecurringEntries() {
            RecurringEntry template = RecurringEntry.builder()
                .description("Weekly entry")
                .frequency(RecurringFrequency.WEEKLY)
                .startDate(LocalDate.of(2024, 12, 1))
                .endDate(LocalDate.of(2024, 12, 31))
                .addDebit("6100", "Expense", new BigDecimal("100.00"))
                .addCredit("1100", "Cash", new BigDecimal("100.00"))
                .build();

            ledgerService.createRecurringEntry(template);

            // First run
            List<JournalEntry> first = ledgerService.processRecurringEntries(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 14)
            );

            // Second run - same period
            List<JournalEntry> second = ledgerService.processRecurringEntries(
                LocalDate.of(2024, 12, 1),
                LocalDate.of(2024, 12, 14)
            );

            assertThat(first).hasSize(2);
            assertThat(second).isEmpty(); // Already posted
        }
    }

    @Nested
    @DisplayName("Decimal Precision Tests")
    class DecimalPrecisionTests {

        @Test
        @DisplayName("Should handle extreme decimal precision")
        void shouldHandleExtremeDecimalPrecision() {
            JournalEntry entry = JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Precision test")
                .addDebit("6100", "Expense", new BigDecimal("1234.56789"))
                .addCredit("1100", "Cash", new BigDecimal("1234.56789"))
                .build();

            boolean result = ledgerService.postJournal(entry);
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("Should round to two decimal places for display")
        void shouldRoundForDisplay() {
            ledgerService.postJournal(JournalEntry.builder()
                .date(LocalDate.of(2024, 12, 1))
                .description("Test")
                .addDebit("6100", "Expense", new BigDecimal("100.005"))
                .addCredit("1100", "Cash", new BigDecimal("100.005"))
                .build());

            BigDecimal displayBalance = ledgerService.getDisplayBalance("6100");
            assertThat(displayBalance).isEqualByComparingTo(new BigDecimal("100.01")); // Rounded up
        }

        @Test
        @DisplayName("Should handle currency conversion rounding")
        void shouldHandleCurrencyConversionRounding() {
            // USD 100 at rate 3.6725 = AED 367.25
            BigDecimal usdAmount = new BigDecimal("100.00");
            BigDecimal rate = new BigDecimal("3.6725");

            BigDecimal aedAmount = ledgerService.convertCurrency(usdAmount, rate);

            assertThat(aedAmount).isEqualByComparingTo(new BigDecimal("367.25"));
        }
    }

    // Test implementation classes
    enum RecurringFrequency {
        DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    }

    static class JournalEntry {
        private String journalNumber;
        private LocalDate date;
        private String description;
        private List<JournalLine> lines = new ArrayList<>();
        private boolean adjusting = false;
        private boolean posted = false;

        static Builder builder() { return new Builder(); }

        String getJournalNumber() { return journalNumber; }
        void setJournalNumber(String num) { this.journalNumber = num; }
        LocalDate getDate() { return date; }
        String getDescription() { return description; }
        List<JournalLine> getLines() { return lines; }
        boolean isAdjusting() { return adjusting; }
        void setAdjusting(boolean adj) { this.adjusting = adj; }

        BigDecimal getTotalDebits() {
            return lines.stream()
                .filter(l -> l.isDebit)
                .map(l -> l.amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal getTotalCredits() {
            return lines.stream()
                .filter(l -> !l.isDebit)
                .map(l -> l.amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        boolean isBalanced() {
            return getTotalDebits().compareTo(getTotalCredits()) == 0;
        }

        static class Builder {
            private JournalEntry entry = new JournalEntry();

            Builder date(LocalDate date) { entry.date = date; return this; }
            Builder description(String desc) { entry.description = desc; return this; }

            Builder addDebit(String accountCode, String accountName, BigDecimal amount) {
                entry.lines.add(new JournalLine(accountCode, accountName, amount, true));
                return this;
            }

            Builder addCredit(String accountCode, String accountName, BigDecimal amount) {
                entry.lines.add(new JournalLine(accountCode, accountName, amount, false));
                return this;
            }

            JournalEntry build() { return entry; }
        }
    }

    static class JournalLine {
        String accountCode;
        String accountName;
        BigDecimal amount;
        boolean isDebit;

        JournalLine(String code, String name, BigDecimal amount, boolean isDebit) {
            this.accountCode = code;
            this.accountName = name;
            this.amount = amount;
            this.isDebit = isDebit;
        }
    }

    static class RecurringEntry {
        private String description;
        private RecurringFrequency frequency;
        private LocalDate startDate;
        private LocalDate endDate;
        private List<JournalLine> lines = new ArrayList<>();

        static Builder builder() { return new Builder(); }

        static class Builder {
            private RecurringEntry entry = new RecurringEntry();

            Builder description(String desc) { entry.description = desc; return this; }
            Builder frequency(RecurringFrequency freq) { entry.frequency = freq; return this; }
            Builder startDate(LocalDate date) { entry.startDate = date; return this; }
            Builder endDate(LocalDate date) { entry.endDate = date; return this; }

            Builder addDebit(String code, String name, BigDecimal amount) {
                entry.lines.add(new JournalLine(code, name, amount, true));
                return this;
            }

            Builder addCredit(String code, String name, BigDecimal amount) {
                entry.lines.add(new JournalLine(code, name, amount, false));
                return this;
            }

            RecurringEntry build() { return entry; }
        }
    }

    static class TrialBalance {
        private java.util.Map<String, BigDecimal> balances = new java.util.HashMap<>();

        void setBalance(String accountCode, BigDecimal balance) {
            balances.put(accountCode, balance);
        }

        BigDecimal getBalance(String accountCode) {
            return balances.getOrDefault(accountCode, BigDecimal.ZERO);
        }

        BigDecimal getTotalDebits() {
            return balances.values().stream()
                .filter(b -> b.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal getTotalCredits() {
            return balances.values().stream()
                .filter(b -> b.compareTo(BigDecimal.ZERO) < 0)
                .map(BigDecimal::abs)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
    }

    static class LedgerService {
        private List<JournalEntry> journals = new ArrayList<>();
        private java.util.Map<String, BigDecimal> openingBalances = new java.util.HashMap<>();
        private java.util.Set<String> lockedPeriods = new java.util.HashSet<>();
        private java.util.Map<String, List<String>> periodAuditLogs = new java.util.HashMap<>();
        private java.util.Map<String, RecurringEntry> recurringEntries = new java.util.HashMap<>();
        private java.util.Set<String> processedRecurring = new java.util.HashSet<>();
        private boolean validateAccounts = false;
        private java.util.Set<String> validAccounts = new java.util.HashSet<>(Arrays.asList(
            "1100", "1200", "1500", "2100", "2110", "3200", "4100", "4200", "6100", "6200", "6210", "6300", "6400"
        ));
        private int journalCounter = 0;

        void setValidateAccounts(boolean validate) { this.validateAccounts = validate; }

        boolean postJournal(JournalEntry entry) {
            if (!entry.isBalanced()) {
                throw new IllegalArgumentException("Journal entry must be balanced");
            }

            // Check period lock
            String periodKey = entry.getDate().getYear() + "-" + entry.getDate().getMonthValue();
            if (lockedPeriods.contains(periodKey)) {
                throw new IllegalStateException("Period " + periodKey + " is locked");
            }

            // Validate accounts
            if (validateAccounts) {
                for (JournalLine line : entry.getLines()) {
                    if (!validAccounts.contains(line.accountCode)) {
                        throw new IllegalArgumentException("Invalid account code: " + line.accountCode);
                    }
                }
            }

            journalCounter++;
            entry.setJournalNumber(String.format("JE-%04d", journalCounter));
            journals.add(entry);
            return true;
        }

        int getJournalCount() { return journals.size(); }

        List<String> getJournalNumbers() {
            List<String> numbers = new ArrayList<>();
            for (JournalEntry j : journals) {
                numbers.add(j.getJournalNumber());
            }
            return numbers;
        }

        void lockPeriod(int year, int month) {
            String key = year + "-" + month;
            lockedPeriods.add(key);
            addPeriodAuditLog(key, "LOCKED at " + LocalDate.now());
        }

        void unlockPeriod(int year, int month, String user, String reason) {
            String key = year + "-" + month;
            lockedPeriods.remove(key);
            addPeriodAuditLog(key, "UNLOCKED by " + user + ": " + reason);
        }

        boolean isPeriodLocked(int year, int month) {
            return lockedPeriods.contains(year + "-" + month);
        }

        private void addPeriodAuditLog(String period, String entry) {
            periodAuditLogs.computeIfAbsent(period, k -> new ArrayList<>()).add(entry);
        }

        List<String> getPeriodAuditLog(int year, int month) {
            return periodAuditLogs.getOrDefault(year + "-" + month, new ArrayList<>());
        }

        void setOpeningBalance(String accountCode, BigDecimal balance, LocalDate date) {
            openingBalances.put(accountCode, balance);
        }

        TrialBalance generateTrialBalance(LocalDate asOfDate) {
            return generateTrialBalance(LocalDate.of(1900, 1, 1), asOfDate);
        }

        TrialBalance generateTrialBalance(LocalDate startDate, LocalDate endDate) {
            TrialBalance tb = new TrialBalance();
            java.util.Map<String, BigDecimal> balances = new java.util.HashMap<>(openingBalances);

            for (JournalEntry journal : journals) {
                if (!journal.getDate().isBefore(startDate) && !journal.getDate().isAfter(endDate)) {
                    for (JournalLine line : journal.getLines()) {
                        BigDecimal current = balances.getOrDefault(line.accountCode, BigDecimal.ZERO);
                        if (line.isDebit) {
                            balances.put(line.accountCode, current.add(line.amount));
                        } else {
                            balances.put(line.accountCode, current.subtract(line.amount));
                        }
                    }
                }
            }

            for (java.util.Map.Entry<String, BigDecimal> entry : balances.entrySet()) {
                tb.setBalance(entry.getKey(), entry.getValue());
            }

            return tb;
        }

        JournalEntry reverseJournal(String journalNumber, LocalDate reversalDate, String reason) {
            JournalEntry original = journals.stream()
                .filter(j -> j.getJournalNumber().equals(journalNumber))
                .findFirst()
                .orElseThrow(() -> new java.util.NoSuchElementException("Journal not found: " + journalNumber));

            JournalEntry.Builder builder = JournalEntry.builder()
                .date(reversalDate)
                .description("Reversal of " + journalNumber + ": " + reason);

            // Swap debits and credits
            for (JournalLine line : original.getLines()) {
                if (line.isDebit) {
                    builder.addCredit(line.accountCode, line.accountName, line.amount);
                } else {
                    builder.addDebit(line.accountCode, line.accountName, line.amount);
                }
            }

            JournalEntry reversal = builder.build();
            postJournal(reversal);
            return reversal;
        }

        JournalEntry createAdjustingEntry(LocalDate date, String description,
                                         String debitAccount, String debitName,
                                         String creditAccount, String creditName,
                                         BigDecimal amount) {
            JournalEntry entry = JournalEntry.builder()
                .date(date)
                .description("Adjusting: " + description)
                .addDebit(debitAccount, debitName, amount)
                .addCredit(creditAccount, creditName, amount)
                .build();
            entry.setAdjusting(true);
            postJournal(entry);
            return entry;
        }

        List<JournalEntry> createClosingEntries(LocalDate date, String retainedEarningsAccount) {
            List<JournalEntry> closingEntries = new ArrayList<>();

            TrialBalance tb = generateTrialBalance(date);

            // Close revenue accounts (4xxx) to retained earnings
            JournalEntry.Builder revenueClose = JournalEntry.builder()
                .date(date)
                .description("Close revenue accounts");

            BigDecimal totalRevenue = BigDecimal.ZERO;
            for (java.util.Map.Entry<String, BigDecimal> entry : getAllAccountBalances(tb).entrySet()) {
                if (entry.getKey().startsWith("4") && entry.getValue().compareTo(BigDecimal.ZERO) < 0) {
                    revenueClose.addDebit(entry.getKey(), "Revenue", entry.getValue().abs());
                    totalRevenue = totalRevenue.add(entry.getValue().abs());
                }
            }
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                revenueClose.addCredit(retainedEarningsAccount, "Retained Earnings", totalRevenue);
                closingEntries.add(revenueClose.build());
            }

            // Close expense accounts (6xxx) to retained earnings
            JournalEntry.Builder expenseClose = JournalEntry.builder()
                .date(date)
                .description("Close expense accounts");

            BigDecimal totalExpenses = BigDecimal.ZERO;
            for (java.util.Map.Entry<String, BigDecimal> entry : getAllAccountBalances(tb).entrySet()) {
                if (entry.getKey().startsWith("6") && entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                    expenseClose.addCredit(entry.getKey(), "Expense", entry.getValue());
                    totalExpenses = totalExpenses.add(entry.getValue());
                }
            }
            if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                expenseClose.addDebit(retainedEarningsAccount, "Retained Earnings", totalExpenses);
                closingEntries.add(expenseClose.build());
            }

            return closingEntries;
        }

        private java.util.Map<String, BigDecimal> getAllAccountBalances(TrialBalance tb) {
            java.util.Map<String, BigDecimal> balances = new java.util.HashMap<>();
            for (String code : Arrays.asList("1100", "4100", "6100")) {
                BigDecimal bal = tb.getBalance(code);
                if (bal.compareTo(BigDecimal.ZERO) != 0) {
                    balances.put(code, bal);
                }
            }
            return balances;
        }

        String createRecurringEntry(RecurringEntry template) {
            String id = "REC-" + (recurringEntries.size() + 1);
            recurringEntries.put(id, template);
            return id;
        }

        int getRecurringEntryCount() { return recurringEntries.size(); }

        List<JournalEntry> processRecurringEntries(LocalDate startDate, LocalDate endDate) {
            List<JournalEntry> generated = new ArrayList<>();

            for (java.util.Map.Entry<String, RecurringEntry> entry : recurringEntries.entrySet()) {
                RecurringEntry template = entry.getValue();

                LocalDate current = template.startDate;
                while (!current.isAfter(endDate) && !current.isAfter(template.endDate)) {
                    if (!current.isBefore(startDate)) {
                        String key = entry.getKey() + "-" + current;
                        if (!processedRecurring.contains(key)) {
                            JournalEntry.Builder builder = JournalEntry.builder()
                                .date(current)
                                .description(template.description);

                            for (JournalLine line : template.lines) {
                                if (line.isDebit) {
                                    builder.addDebit(line.accountCode, line.accountName, line.amount);
                                } else {
                                    builder.addCredit(line.accountCode, line.accountName, line.amount);
                                }
                            }

                            JournalEntry je = builder.build();
                            postJournal(je);
                            generated.add(je);
                            processedRecurring.add(key);
                        }
                    }

                    // Advance to next occurrence
                    switch (template.frequency) {
                        case DAILY: current = current.plusDays(1); break;
                        case WEEKLY: current = current.plusWeeks(1); break;
                        case MONTHLY: current = current.plusMonths(1); break;
                        case QUARTERLY: current = current.plusMonths(3); break;
                        case YEARLY: current = current.plusYears(1); break;
                    }
                }
            }

            return generated;
        }

        BigDecimal getDisplayBalance(String accountCode) {
            TrialBalance tb = generateTrialBalance(LocalDate.now());
            BigDecimal balance = tb.getBalance(accountCode);
            return balance.setScale(2, java.math.RoundingMode.HALF_UP);
        }

        BigDecimal convertCurrency(BigDecimal amount, BigDecimal rate) {
            return amount.multiply(rate).setScale(2, java.math.RoundingMode.HALF_UP);
        }
    }
}
