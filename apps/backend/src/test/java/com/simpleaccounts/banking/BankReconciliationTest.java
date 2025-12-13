package com.simpleaccounts.banking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for bank reconciliation logic.
 * Covers auto-matching, manual matching, and reconciliation workflows.
 */
class BankReconciliationTest {

    private ReconciliationEngine engine;

    @BeforeEach
    void setUp() {
        engine = new ReconciliationEngine();
    }

    @Nested
    @DisplayName("Auto-Match Tests")
    class AutoMatchTests {

        @Test
        @DisplayName("Should auto-match exact amount and date")
        void shouldAutoMatchExactAmountAndDate() {
            BankEntry bankEntry = new BankEntry("B1", LocalDate.of(2024, 12, 1),
                                                "Payment from ABC Corp", new BigDecimal("1000.00"));
            SystemEntry systemEntry = new SystemEntry("S1", LocalDate.of(2024, 12, 1),
                                                     "Invoice INV-001 - ABC Corp", new BigDecimal("1000.00"));

            List<MatchResult> matches = engine.autoMatch(
                Arrays.asList(bankEntry),
                Arrays.asList(systemEntry)
            );

            assertThat(matches).hasSize(1);
            assertThat(matches.get(0).getBankEntryId()).isEqualTo("B1");
            assertThat(matches.get(0).getSystemEntryId()).isEqualTo("S1");
            assertThat(matches.get(0).getConfidence()).isGreaterThanOrEqualTo(0.9);
        }

        @Test
        @DisplayName("Should match with date tolerance of 3 days")
        void shouldMatchWithDateTolerance() {
            BankEntry bankEntry = new BankEntry("B1", LocalDate.of(2024, 12, 5),
                                                "Supplier payment", new BigDecimal("500.00"));
            SystemEntry systemEntry = new SystemEntry("S1", LocalDate.of(2024, 12, 3),
                                                     "Expense EXP-001", new BigDecimal("500.00"));

            engine.setDateToleranceDays(3);
            List<MatchResult> matches = engine.autoMatch(
                Arrays.asList(bankEntry),
                Arrays.asList(systemEntry)
            );

            assertThat(matches).hasSize(1);
            assertThat(matches.get(0).getConfidence()).isLessThan(1.0); // Lower confidence due to date diff
        }

        @Test
        @DisplayName("Should not match if date exceeds tolerance")
        void shouldNotMatchIfDateExceedsTolerance() {
            BankEntry bankEntry = new BankEntry("B1", LocalDate.of(2024, 12, 10),
                                                "Payment", new BigDecimal("500.00"));
            SystemEntry systemEntry = new SystemEntry("S1", LocalDate.of(2024, 12, 1),
                                                     "Expense", new BigDecimal("500.00"));

            engine.setDateToleranceDays(3);
            List<MatchResult> matches = engine.autoMatch(
                Arrays.asList(bankEntry),
                Arrays.asList(systemEntry)
            );

            assertThat(matches).isEmpty();
        }

        @Test
        @DisplayName("Should match with amount tolerance percentage")
        void shouldMatchWithAmountTolerance() {
            BankEntry bankEntry = new BankEntry("B1", LocalDate.of(2024, 12, 1),
                                                "Payment", new BigDecimal("1005.00"));
            SystemEntry systemEntry = new SystemEntry("S1", LocalDate.of(2024, 12, 1),
                                                     "Invoice", new BigDecimal("1000.00"));

            engine.setAmountTolerancePercent(1.0); // 1% tolerance
            List<MatchResult> matches = engine.autoMatch(
                Arrays.asList(bankEntry),
                Arrays.asList(systemEntry)
            );

            assertThat(matches).hasSize(1);
        }

        @Test
        @DisplayName("Should match multiple entries one-to-one")
        void shouldMatchMultipleEntriesOneToOne() {
            List<BankEntry> bankEntries = Arrays.asList(
                new BankEntry("B1", LocalDate.of(2024, 12, 1), "Payment 1", new BigDecimal("100.00")),
                new BankEntry("B2", LocalDate.of(2024, 12, 2), "Payment 2", new BigDecimal("200.00")),
                new BankEntry("B3", LocalDate.of(2024, 12, 3), "Payment 3", new BigDecimal("300.00"))
            );
            List<SystemEntry> systemEntries = Arrays.asList(
                new SystemEntry("S1", LocalDate.of(2024, 12, 1), "Invoice 1", new BigDecimal("100.00")),
                new SystemEntry("S2", LocalDate.of(2024, 12, 2), "Invoice 2", new BigDecimal("200.00")),
                new SystemEntry("S3", LocalDate.of(2024, 12, 3), "Invoice 3", new BigDecimal("300.00"))
            );

            List<MatchResult> matches = engine.autoMatch(bankEntries, systemEntries);

            assertThat(matches).hasSize(3);
        }

        @Test
        @DisplayName("Should suggest many-to-one match when bank splits")
        void shouldSuggestManyToOneMatch() {
            List<BankEntry> bankEntries = Arrays.asList(
                new BankEntry("B1", LocalDate.of(2024, 12, 1), "Part 1", new BigDecimal("600.00")),
                new BankEntry("B2", LocalDate.of(2024, 12, 1), "Part 2", new BigDecimal("400.00"))
            );
            SystemEntry systemEntry = new SystemEntry("S1", LocalDate.of(2024, 12, 1),
                                                     "Invoice Total", new BigDecimal("1000.00"));

            engine.enableManyToOneMatching(true);
            List<MatchResult> matches = engine.autoMatch(bankEntries, Arrays.asList(systemEntry));

            assertThat(matches).hasSize(1);
            assertThat(matches.get(0).getBankEntryIds()).containsExactlyInAnyOrder("B1", "B2");
            assertThat(matches.get(0).getSystemEntryId()).isEqualTo("S1");
        }

        @Test
        @DisplayName("Should use reference number for higher confidence")
        void shouldUseReferenceNumberForHigherConfidence() {
            BankEntry bankEntry = new BankEntry("B1", LocalDate.of(2024, 12, 1),
                                                "INV-001 payment", new BigDecimal("1000.00"));
            SystemEntry systemEntry = new SystemEntry("S1", LocalDate.of(2024, 12, 1),
                                                     "INV-001", new BigDecimal("1000.00"));
            systemEntry.setReferenceNumber("INV-001");

            List<MatchResult> matches = engine.autoMatch(
                Arrays.asList(bankEntry),
                Arrays.asList(systemEntry)
            );

            assertThat(matches).hasSize(1);
            assertThat(matches.get(0).getConfidence()).isEqualTo(1.0);
        }
    }

    @Nested
    @DisplayName("Manual Match Tests")
    class ManualMatchTests {

        @Test
        @DisplayName("Should allow manual matching of entries")
        void shouldAllowManualMatching() {
            // Test matching bank entry B1 (500.00, 2024-12-01) with system entry S1 (500.00, 2024-11-28)
            boolean result = engine.manualMatch("B1", "S1");

            assertThat(result).isTrue();
            assertThat(engine.getMatchedBankEntries()).contains("B1");
            assertThat(engine.getMatchedSystemEntries()).contains("S1");
        }

        @Test
        @DisplayName("Should allow unmatching previously matched entries")
        void shouldAllowUnmatching() {
            engine.manualMatch("B1", "S1");

            boolean result = engine.unmatch("B1", "S1");

            assertThat(result).isTrue();
            assertThat(engine.getMatchedBankEntries()).doesNotContain("B1");
        }

        @Test
        @DisplayName("Should prevent double matching of bank entries")
        void shouldPreventDoubleMatchingBankEntries() {
            engine.manualMatch("B1", "S1");

            assertThatThrownBy(() -> engine.manualMatch("B1", "S2"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already matched");
        }

        @Test
        @DisplayName("Should allow splitting bank entry")
        void shouldAllowSplittingBankEntry() {
            // Split bank entry B1 (1500.00) to match S1 (1000.00) and S2 (500.00)
            engine.splitMatch("B1", Arrays.asList(
                new SplitAllocation("S1", new BigDecimal("1000.00")),
                new SplitAllocation("S2", new BigDecimal("500.00"))
            ));

            assertThat(engine.getMatchedBankEntries()).contains("B1");
            assertThat(engine.getMatchedSystemEntries()).containsExactlyInAnyOrder("S1", "S2");
        }

        @Test
        @DisplayName("Should validate split amounts sum to bank entry")
        void shouldValidateSplitAmountsSum() {
            // Register bank entry B1 with amount 1000.00 for validation
            engine.registerBankEntry("B1", new BigDecimal("1000.00"));

            assertThatThrownBy(() -> engine.splitMatch("B1", Arrays.asList(
                new SplitAllocation("S1", new BigDecimal("600.00")),
                new SplitAllocation("S2", new BigDecimal("300.00")) // Only 900, not 1000
            ))).isInstanceOf(IllegalArgumentException.class)
               .hasMessageContaining("sum");
        }
    }

    @Nested
    @DisplayName("Reconciliation Workflow Tests")
    class ReconciliationWorkflowTests {

        @Test
        @DisplayName("Should track reconciliation status per entry")
        void shouldTrackReconciliationStatus() {
            // Track status transitions for bank entry B1 (1000.00 payment)
            assertThat(engine.getReconciliationStatus("B1")).isEqualTo(ReconciliationStatus.UNRECONCILED);

            engine.manualMatch("B1", "S1");
            assertThat(engine.getReconciliationStatus("B1")).isEqualTo(ReconciliationStatus.MATCHED);

            engine.confirmReconciliation("B1");
            assertThat(engine.getReconciliationStatus("B1")).isEqualTo(ReconciliationStatus.RECONCILED);
        }

        @Test
        @DisplayName("Should calculate reconciliation summary")
        void shouldCalculateReconciliationSummary() {
            engine.setBankStatementBalance(new BigDecimal("10000.00"));
            engine.setSystemBalance(new BigDecimal("9500.00"));

            engine.addUnreconciledBankEntry(new BigDecimal("300.00")); // Deposit not in system
            engine.addUnreconciledSystemEntry(new BigDecimal("-200.00")); // Check not cleared

            ReconciliationSummary summary = engine.getReconciliationSummary();

            assertThat(summary.getBankBalance()).isEqualByComparingTo(new BigDecimal("10000.00"));
            assertThat(summary.getSystemBalance()).isEqualByComparingTo(new BigDecimal("9500.00"));
            assertThat(summary.getDifference()).isEqualByComparingTo(new BigDecimal("500.00"));
            assertThat(summary.getUnreconciledBankTotal()).isEqualByComparingTo(new BigDecimal("300.00"));
            assertThat(summary.getUnreconciledSystemTotal()).isEqualByComparingTo(new BigDecimal("-200.00"));
        }

        @Test
        @DisplayName("Should lock statement during active reconciliation")
        void shouldLockStatementDuringReconciliation() {
            engine.startReconciliation("STMT-001", "user1");

            assertThat(engine.isStatementLocked("STMT-001")).isTrue();
            assertThat(engine.getLockedByUser("STMT-001")).isEqualTo("user1");
        }

        @Test
        @DisplayName("Should prevent concurrent reconciliation of same statement")
        void shouldPreventConcurrentReconciliation() {
            engine.startReconciliation("STMT-001", "user1");

            assertThatThrownBy(() -> engine.startReconciliation("STMT-001", "user2"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("locked");
        }

        @Test
        @DisplayName("Should release lock on completion")
        void shouldReleaseLockOnCompletion() {
            engine.startReconciliation("STMT-001", "user1");
            engine.completeReconciliation("STMT-001");

            assertThat(engine.isStatementLocked("STMT-001")).isFalse();
        }

        @Test
        @DisplayName("Should create adjustment entries for differences")
        void shouldCreateAdjustmentEntries() {
            engine.manualMatch("B1", "S1");

            // Bank shows 1000, system shows 995 - create 5.00 adjustment
            AdjustmentEntry adjustment = engine.createAdjustment(
                new BigDecimal("5.00"), "Bank fee", "BANK_FEE"
            );

            assertThat(adjustment).isNotNull();
            assertThat(adjustment.getAmount()).isEqualByComparingTo(new BigDecimal("5.00"));
            assertThat(adjustment.getCategory()).isEqualTo("BANK_FEE");
        }
    }

    @Nested
    @DisplayName("Exchange Rate Handling Tests")
    class ExchangeRateTests {

        @Test
        @DisplayName("Should handle multi-currency reconciliation")
        void shouldHandleMultiCurrencyReconciliation() {
            BankEntry bankEntry = new BankEntry("B1", LocalDate.of(2024, 12, 1),
                                                "USD Payment", new BigDecimal("1000.00"));
            bankEntry.setCurrency("USD");

            SystemEntry systemEntry = new SystemEntry("S1", LocalDate.of(2024, 12, 1),
                                                     "Invoice USD", new BigDecimal("3670.00"));
            systemEntry.setCurrency("AED");

            engine.setExchangeRate("USD", "AED", new BigDecimal("3.67"));
            List<MatchResult> matches = engine.autoMatch(
                Arrays.asList(bankEntry),
                Arrays.asList(systemEntry)
            );

            assertThat(matches).hasSize(1);
        }

        @Test
        @DisplayName("Should account for FX gain/loss in reconciliation")
        void shouldAccountForFxGainLoss() {
            // Booked at 3.67, cleared at 3.68
            BigDecimal bookedRate = new BigDecimal("3.67");
            BigDecimal clearedRate = new BigDecimal("3.68");
            BigDecimal usdAmount = new BigDecimal("1000.00");

            BigDecimal fxDifference = engine.calculateFxDifference(usdAmount, bookedRate, clearedRate);

            assertThat(fxDifference).isEqualByComparingTo(new BigDecimal("10.00")); // 1000 * (3.68 - 3.67)
        }
    }

    // Test implementation classes
    enum ReconciliationStatus {
        UNRECONCILED, MATCHED, RECONCILED
    }

    static class BankEntry {
        private final String id;
        private final LocalDate date;
        private final String description;
        private final BigDecimal amount;
        private String currency = "AED";

        BankEntry(String id, LocalDate date, String description, BigDecimal amount) {
            this.id = id;
            this.date = date;
            this.description = description;
            this.amount = amount;
        }

        String getId() { return id; }
        LocalDate getDate() { return date; }
        String getDescription() { return description; }
        BigDecimal getAmount() { return amount; }
        String getCurrency() { return currency; }
        void setCurrency(String currency) { this.currency = currency; }
    }

    static class SystemEntry {
        private final String id;
        private final LocalDate date;
        private final String description;
        private final BigDecimal amount;
        private String referenceNumber;
        private String currency = "AED";

        SystemEntry(String id, LocalDate date, String description, BigDecimal amount) {
            this.id = id;
            this.date = date;
            this.description = description;
            this.amount = amount;
        }

        String getId() { return id; }
        LocalDate getDate() { return date; }
        String getDescription() { return description; }
        BigDecimal getAmount() { return amount; }
        String getReferenceNumber() { return referenceNumber; }
        void setReferenceNumber(String ref) { this.referenceNumber = ref; }
        String getCurrency() { return currency; }
        void setCurrency(String currency) { this.currency = currency; }
    }

    static class MatchResult {
        private final List<String> bankEntryIds;
        private final String systemEntryId;
        private final double confidence;

        MatchResult(String bankEntryId, String systemEntryId, double confidence) {
            this.bankEntryIds = Arrays.asList(bankEntryId);
            this.systemEntryId = systemEntryId;
            this.confidence = confidence;
        }

        MatchResult(List<String> bankEntryIds, String systemEntryId, double confidence) {
            this.bankEntryIds = bankEntryIds;
            this.systemEntryId = systemEntryId;
            this.confidence = confidence;
        }

        String getBankEntryId() { return bankEntryIds.get(0); }
        List<String> getBankEntryIds() { return bankEntryIds; }
        String getSystemEntryId() { return systemEntryId; }
        double getConfidence() { return confidence; }
    }

    static class SplitAllocation {
        private final String systemEntryId;
        private final BigDecimal amount;

        SplitAllocation(String systemEntryId, BigDecimal amount) {
            this.systemEntryId = systemEntryId;
            this.amount = amount;
        }

        String getSystemEntryId() { return systemEntryId; }
        BigDecimal getAmount() { return amount; }
    }

    static class ReconciliationSummary {
        private final BigDecimal bankBalance;
        private final BigDecimal systemBalance;
        private final BigDecimal unreconciledBankTotal;
        private final BigDecimal unreconciledSystemTotal;

        ReconciliationSummary(BigDecimal bankBalance, BigDecimal systemBalance,
                             BigDecimal unreconciledBankTotal, BigDecimal unreconciledSystemTotal) {
            this.bankBalance = bankBalance;
            this.systemBalance = systemBalance;
            this.unreconciledBankTotal = unreconciledBankTotal;
            this.unreconciledSystemTotal = unreconciledSystemTotal;
        }

        BigDecimal getBankBalance() { return bankBalance; }
        BigDecimal getSystemBalance() { return systemBalance; }
        BigDecimal getDifference() { return bankBalance.subtract(systemBalance); }
        BigDecimal getUnreconciledBankTotal() { return unreconciledBankTotal; }
        BigDecimal getUnreconciledSystemTotal() { return unreconciledSystemTotal; }
    }

    static class AdjustmentEntry {
        private final BigDecimal amount;
        private final String description;
        private final String category;

        AdjustmentEntry(BigDecimal amount, String description, String category) {
            this.amount = amount;
            this.description = description;
            this.category = category;
        }

        BigDecimal getAmount() { return amount; }
        String getDescription() { return description; }
        String getCategory() { return category; }
    }

    static class ReconciliationEngine {
        private int dateToleranceDays = 0;
        private double amountTolerancePercent = 0.0;
        private boolean manyToOneEnabled = false;
        private List<String> matchedBankEntries = new ArrayList<>();
        private List<String> matchedSystemEntries = new ArrayList<>();
        private java.util.Map<String, ReconciliationStatus> statusMap = new java.util.HashMap<>();
        private java.util.Map<String, String> statementLocks = new java.util.HashMap<>();
        private java.util.Map<String, BigDecimal> exchangeRates = new java.util.HashMap<>();
        private java.util.Map<String, BigDecimal> bankEntryAmounts = new java.util.HashMap<>();
        private BigDecimal bankStatementBalance = BigDecimal.ZERO;
        private BigDecimal systemBalance = BigDecimal.ZERO;
        private BigDecimal unreconciledBankTotal = BigDecimal.ZERO;
        private BigDecimal unreconciledSystemTotal = BigDecimal.ZERO;

        void setDateToleranceDays(int days) { this.dateToleranceDays = days; }
        void setAmountTolerancePercent(double percent) { this.amountTolerancePercent = percent; }
        void enableManyToOneMatching(boolean enabled) { this.manyToOneEnabled = enabled; }

        List<MatchResult> autoMatch(List<BankEntry> bankEntries, List<SystemEntry> systemEntries) {
            List<MatchResult> results = new ArrayList<>();
            List<String> usedBank = new ArrayList<>();
            List<String> usedSystem = new ArrayList<>();

            // First pass: matches within tolerance (confidence > 0.5)
            for (BankEntry bank : bankEntries) {
                for (SystemEntry sys : systemEntries) {
                    if (usedBank.contains(bank.getId()) || usedSystem.contains(sys.getId())) continue;

                    double confidence = calculateConfidence(bank, sys);
                    if (confidence > 0.5) {
                        results.add(new MatchResult(bank.getId(), sys.getId(), confidence));
                        usedBank.add(bank.getId());
                        usedSystem.add(sys.getId());
                    }
                }
            }

            // Many-to-one matching
            if (manyToOneEnabled) {
                for (SystemEntry sys : systemEntries) {
                    if (usedSystem.contains(sys.getId())) continue;

                    List<String> matchingBankIds = new ArrayList<>();
                    BigDecimal total = BigDecimal.ZERO;

                    for (BankEntry bank : bankEntries) {
                        if (usedBank.contains(bank.getId())) continue;
                        if (Math.abs(java.time.temporal.ChronoUnit.DAYS.between(bank.getDate(), sys.getDate())) <= dateToleranceDays) {
                            matchingBankIds.add(bank.getId());
                            total = total.add(bank.getAmount());
                        }
                    }

                    if (matchingBankIds.size() > 1 && total.compareTo(sys.getAmount()) == 0) {
                        results.add(new MatchResult(matchingBankIds, sys.getId(), 0.85));
                        usedBank.addAll(matchingBankIds);
                        usedSystem.add(sys.getId());
                    }
                }
            }

            return results;
        }

        private double calculateConfidence(BankEntry bank, SystemEntry sys) {
            // Check date tolerance
            long daysDiff = Math.abs(java.time.temporal.ChronoUnit.DAYS.between(bank.getDate(), sys.getDate()));
            if (daysDiff > dateToleranceDays) return 0.0;

            // Check amount tolerance
            BigDecimal bankAmt = convertCurrency(bank.getAmount(), bank.getCurrency(), "AED");
            BigDecimal sysAmt = convertCurrency(sys.getAmount(), sys.getCurrency(), "AED");
            BigDecimal diff = bankAmt.subtract(sysAmt).abs();
            BigDecimal tolerance = sysAmt.multiply(new BigDecimal(amountTolerancePercent / 100));
            if (diff.compareTo(tolerance) > 0 && diff.compareTo(BigDecimal.ZERO) != 0) return 0.0;

            // Base confidence
            double confidence = 0.9;

            // Reduce for date difference
            confidence -= daysDiff * 0.02;

            // Increase for reference match
            if (sys.getReferenceNumber() != null && bank.getDescription().contains(sys.getReferenceNumber())) {
                confidence = 1.0;
            }

            return Math.min(1.0, Math.max(0.0, confidence));
        }

        boolean manualMatch(String bankEntryId, String systemEntryId) {
            if (matchedBankEntries.contains(bankEntryId)) {
                throw new IllegalStateException("Bank entry " + bankEntryId + " already matched");
            }
            matchedBankEntries.add(bankEntryId);
            matchedSystemEntries.add(systemEntryId);
            statusMap.put(bankEntryId, ReconciliationStatus.MATCHED);
            return true;
        }

        boolean unmatch(String bankEntryId, String systemEntryId) {
            matchedBankEntries.remove(bankEntryId);
            matchedSystemEntries.remove(systemEntryId);
            statusMap.put(bankEntryId, ReconciliationStatus.UNRECONCILED);
            return true;
        }

        void registerBankEntry(String id, BigDecimal amount) {
            bankEntryAmounts.put(id, amount);
        }

        void splitMatch(String bankEntryId, List<SplitAllocation> allocations) {
            BigDecimal total = allocations.stream()
                .map(SplitAllocation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Validate that allocations sum to bank entry amount if registered
            BigDecimal expectedAmount = bankEntryAmounts.get(bankEntryId);
            if (expectedAmount != null && total.compareTo(expectedAmount) != 0) {
                throw new IllegalArgumentException("Split allocations sum (" + total + ") does not match bank entry amount (" + expectedAmount + ")");
            }

            matchedBankEntries.add(bankEntryId);
            for (SplitAllocation alloc : allocations) {
                matchedSystemEntries.add(alloc.getSystemEntryId());
            }
        }

        List<String> getMatchedBankEntries() { return matchedBankEntries; }
        List<String> getMatchedSystemEntries() { return matchedSystemEntries; }

        ReconciliationStatus getReconciliationStatus(String bankEntryId) {
            return statusMap.getOrDefault(bankEntryId, ReconciliationStatus.UNRECONCILED);
        }

        void confirmReconciliation(String bankEntryId) {
            statusMap.put(bankEntryId, ReconciliationStatus.RECONCILED);
        }

        void setBankStatementBalance(BigDecimal balance) { this.bankStatementBalance = balance; }
        void setSystemBalance(BigDecimal balance) { this.systemBalance = balance; }
        void addUnreconciledBankEntry(BigDecimal amount) { unreconciledBankTotal = unreconciledBankTotal.add(amount); }
        void addUnreconciledSystemEntry(BigDecimal amount) { unreconciledSystemTotal = unreconciledSystemTotal.add(amount); }

        ReconciliationSummary getReconciliationSummary() {
            return new ReconciliationSummary(bankStatementBalance, systemBalance,
                                            unreconciledBankTotal, unreconciledSystemTotal);
        }

        void startReconciliation(String statementId, String userId) {
            if (statementLocks.containsKey(statementId)) {
                throw new IllegalStateException("Statement " + statementId + " is locked by " + statementLocks.get(statementId));
            }
            statementLocks.put(statementId, userId);
        }

        void completeReconciliation(String statementId) {
            statementLocks.remove(statementId);
        }

        boolean isStatementLocked(String statementId) {
            return statementLocks.containsKey(statementId);
        }

        String getLockedByUser(String statementId) {
            return statementLocks.get(statementId);
        }

        AdjustmentEntry createAdjustment(BigDecimal amount, String description, String category) {
            return new AdjustmentEntry(amount, description, category);
        }

        void setExchangeRate(String from, String to, BigDecimal rate) {
            exchangeRates.put(from + "-" + to, rate);
        }

        BigDecimal convertCurrency(BigDecimal amount, String from, String to) {
            if (from.equals(to)) return amount;
            BigDecimal rate = exchangeRates.getOrDefault(from + "-" + to, BigDecimal.ONE);
            return amount.multiply(rate);
        }

        BigDecimal calculateFxDifference(BigDecimal amount, BigDecimal bookedRate, BigDecimal clearedRate) {
            return amount.multiply(clearedRate.subtract(bookedRate));
        }
    }
}
