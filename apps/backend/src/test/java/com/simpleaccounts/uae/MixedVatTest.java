package com.simpleaccounts.uae;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for mixed VAT basket calculations.
 * Invoices may contain items with different VAT treatments:
 * - Standard rate (5%)
 * - Zero-rated
 * - Exempt
 */
class MixedVatTest {

    private static final BigDecimal STANDARD_RATE = new BigDecimal("0.05");
    private static final BigDecimal ZERO_RATE = BigDecimal.ZERO;
    private static final int DECIMAL_PLACES = 2;

    @Nested
    @DisplayName("Mixed Standard and Zero-Rated Items")
    class MixedStandardAndZeroRatedTests {

        @Test
        @DisplayName("Should calculate VAT correctly for mixed basket")
        void shouldCalculateVatForMixedBasket() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Office Supplies", new BigDecimal("500.00"), STANDARD_RATE));
            items.add(new LineItem("Exported Goods", new BigDecimal("1000.00"), ZERO_RATE));
            items.add(new LineItem("Computer Equipment", new BigDecimal("2000.00"), STANDARD_RATE));

            BigDecimal totalNet = calculateTotalNet(items);
            BigDecimal totalVat = calculateTotalVat(items);
            BigDecimal totalGross = totalNet.add(totalVat);

            assertThat(totalNet).isEqualByComparingTo(new BigDecimal("3500.00"));
            // VAT: (500 * 0.05) + (1000 * 0) + (2000 * 0.05) = 25 + 0 + 100 = 125
            assertThat(totalVat).isEqualByComparingTo(new BigDecimal("125.00"));
            assertThat(totalGross).isEqualByComparingTo(new BigDecimal("3625.00"));
        }

        @Test
        @DisplayName("Should handle all zero-rated items")
        void shouldHandleAllZeroRatedItems() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Export Item 1", new BigDecimal("5000.00"), ZERO_RATE));
            items.add(new LineItem("Export Item 2", new BigDecimal("3000.00"), ZERO_RATE));

            BigDecimal totalVat = calculateTotalVat(items);

            assertThat(totalVat).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle all standard-rated items")
        void shouldHandleAllStandardRatedItems() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Item 1", new BigDecimal("1000.00"), STANDARD_RATE));
            items.add(new LineItem("Item 2", new BigDecimal("2000.00"), STANDARD_RATE));
            items.add(new LineItem("Item 3", new BigDecimal("3000.00"), STANDARD_RATE));

            BigDecimal totalVat = calculateTotalVat(items);

            // (1000 + 2000 + 3000) * 0.05 = 300
            assertThat(totalVat).isEqualByComparingTo(new BigDecimal("300.00"));
        }
    }

    @Nested
    @DisplayName("Mixed with Exempt Items")
    class MixedWithExemptItemsTests {

        @Test
        @DisplayName("Should exclude exempt items from VAT calculation")
        void shouldExcludeExemptItemsFromVat() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Standard Item", new BigDecimal("1000.00"), STANDARD_RATE));
            items.add(new LineItem("Financial Service", new BigDecimal("5000.00"), null)); // Exempt
            items.add(new LineItem("Zero-Rated Item", new BigDecimal("2000.00"), ZERO_RATE));

            BigDecimal totalVat = calculateTotalVat(items);

            // Only standard item contributes: 1000 * 0.05 = 50
            assertThat(totalVat).isEqualByComparingTo(new BigDecimal("50.00"));
        }

        @Test
        @DisplayName("Should calculate correct totals with all three types")
        void shouldCalculateTotalsWithAllThreeTypes() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Taxable Goods", new BigDecimal("10000.00"), STANDARD_RATE));
            items.add(new LineItem("Insurance Premium", new BigDecimal("2000.00"), null)); // Exempt
            items.add(new LineItem("Medical Equipment Export", new BigDecimal("5000.00"), ZERO_RATE));

            BigDecimal totalNet = calculateTotalNet(items);
            BigDecimal totalVat = calculateTotalVat(items);
            BigDecimal taxableAmount = calculateTaxableAmount(items);
            BigDecimal exemptAmount = calculateExemptAmount(items);
            BigDecimal zeroRatedAmount = calculateZeroRatedAmount(items);

            assertThat(totalNet).isEqualByComparingTo(new BigDecimal("17000.00"));
            assertThat(totalVat).isEqualByComparingTo(new BigDecimal("500.00")); // 10000 * 0.05
            assertThat(taxableAmount).isEqualByComparingTo(new BigDecimal("10000.00"));
            assertThat(exemptAmount).isEqualByComparingTo(new BigDecimal("2000.00"));
            assertThat(zeroRatedAmount).isEqualByComparingTo(new BigDecimal("5000.00"));
        }
    }

    @Nested
    @DisplayName("Per-Line VAT Calculation")
    class PerLineVatCalculationTests {

        @Test
        @DisplayName("Should calculate VAT per line item correctly")
        void shouldCalculateVatPerLineItem() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Item A", new BigDecimal("123.45"), STANDARD_RATE));
            items.add(new LineItem("Item B", new BigDecimal("67.89"), STANDARD_RATE));
            items.add(new LineItem("Item C", new BigDecimal("999.99"), ZERO_RATE));

            BigDecimal vatItemA = items.get(0).calculateVat();
            BigDecimal vatItemB = items.get(1).calculateVat();
            BigDecimal vatItemC = items.get(2).calculateVat();
            BigDecimal totalVat = calculateTotalVat(items);

            assertThat(vatItemA).isEqualByComparingTo(new BigDecimal("6.17")); // 123.45 * 0.05 = 6.1725 -> 6.17
            assertThat(vatItemB).isEqualByComparingTo(new BigDecimal("3.39")); // 67.89 * 0.05 = 3.3945 -> 3.39
            assertThat(vatItemC).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(totalVat).isEqualByComparingTo(new BigDecimal("9.56")); // 6.17 + 3.39 + 0
        }

        @Test
        @DisplayName("Should handle rounding differences when summing per-line VAT")
        void shouldHandleRoundingDifferencesInPerLineVat() {
            List<LineItem> items = new ArrayList<>();
            // Create items that will have rounding in per-line calculation
            items.add(new LineItem("Item 1", new BigDecimal("33.33"), STANDARD_RATE));
            items.add(new LineItem("Item 2", new BigDecimal("33.33"), STANDARD_RATE));
            items.add(new LineItem("Item 3", new BigDecimal("33.34"), STANDARD_RATE));

            BigDecimal perLineTotal = items.stream()
                .map(LineItem::calculateVat)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Per-line: 1.67 + 1.67 + 1.67 = 5.01
            // Aggregate: 100.00 * 0.05 = 5.00
            // This demonstrates potential 1 cent rounding difference
            assertThat(perLineTotal).isEqualByComparingTo(new BigDecimal("5.01"));
        }
    }

    @Nested
    @DisplayName("Discount on Mixed Basket")
    class DiscountOnMixedBasketTests {

        @Test
        @DisplayName("Should apply discount proportionally across VAT categories")
        void shouldApplyDiscountProportionally() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Standard Item", new BigDecimal("800.00"), STANDARD_RATE));
            items.add(new LineItem("Zero-Rated Item", new BigDecimal("200.00"), ZERO_RATE));

            BigDecimal totalBeforeDiscount = calculateTotalNet(items);
            BigDecimal discountPercent = new BigDecimal("0.10"); // 10% discount

            // Apply discount proportionally
            BigDecimal standardAfterDiscount = new BigDecimal("800.00")
                .multiply(BigDecimal.ONE.subtract(discountPercent))
                .setScale(DECIMAL_PLACES, RoundingMode.HALF_UP);
            BigDecimal zeroRatedAfterDiscount = new BigDecimal("200.00")
                .multiply(BigDecimal.ONE.subtract(discountPercent))
                .setScale(DECIMAL_PLACES, RoundingMode.HALF_UP);

            BigDecimal vatAfterDiscount = standardAfterDiscount.multiply(STANDARD_RATE)
                .setScale(DECIMAL_PLACES, RoundingMode.HALF_UP);

            assertThat(totalBeforeDiscount).isEqualByComparingTo(new BigDecimal("1000.00"));
            assertThat(standardAfterDiscount).isEqualByComparingTo(new BigDecimal("720.00"));
            assertThat(zeroRatedAfterDiscount).isEqualByComparingTo(new BigDecimal("180.00"));
            assertThat(vatAfterDiscount).isEqualByComparingTo(new BigDecimal("36.00"));
        }

        @Test
        @DisplayName("Should handle line-level discounts before VAT")
        void shouldHandleLineLevelDiscountsBeforeVat() {
            BigDecimal lineAmount = new BigDecimal("500.00");
            BigDecimal lineDiscount = new BigDecimal("50.00");
            BigDecimal netAmount = lineAmount.subtract(lineDiscount);
            BigDecimal vatAmount = netAmount.multiply(STANDARD_RATE)
                .setScale(DECIMAL_PLACES, RoundingMode.HALF_UP);

            assertThat(netAmount).isEqualByComparingTo(new BigDecimal("450.00"));
            assertThat(vatAmount).isEqualByComparingTo(new BigDecimal("22.50"));
        }
    }

    @Nested
    @DisplayName("Invoice Summary by VAT Category")
    class InvoiceSummaryTests {

        @Test
        @DisplayName("Should generate correct VAT summary breakdown")
        void shouldGenerateVatSummaryBreakdown() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Std 1", new BigDecimal("1000.00"), STANDARD_RATE));
            items.add(new LineItem("Std 2", new BigDecimal("500.00"), STANDARD_RATE));
            items.add(new LineItem("Zero 1", new BigDecimal("2000.00"), ZERO_RATE));
            items.add(new LineItem("Exempt 1", new BigDecimal("800.00"), null));

            VatSummary summary = calculateVatSummary(items);

            assertThat(summary.standardRatedAmount).isEqualByComparingTo(new BigDecimal("1500.00"));
            assertThat(summary.standardRatedVat).isEqualByComparingTo(new BigDecimal("75.00"));
            assertThat(summary.zeroRatedAmount).isEqualByComparingTo(new BigDecimal("2000.00"));
            assertThat(summary.exemptAmount).isEqualByComparingTo(new BigDecimal("800.00"));
            assertThat(summary.totalNet).isEqualByComparingTo(new BigDecimal("4300.00"));
            assertThat(summary.totalVat).isEqualByComparingTo(new BigDecimal("75.00"));
            assertThat(summary.totalGross).isEqualByComparingTo(new BigDecimal("4375.00"));
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle empty basket")
        void shouldHandleEmptyBasket() {
            List<LineItem> items = new ArrayList<>();

            BigDecimal totalVat = calculateTotalVat(items);
            BigDecimal totalNet = calculateTotalNet(items);

            assertThat(totalVat).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(totalNet).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle single item basket")
        void shouldHandleSingleItemBasket() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Single Item", new BigDecimal("100.00"), STANDARD_RATE));

            BigDecimal totalVat = calculateTotalVat(items);

            assertThat(totalVat).isEqualByComparingTo(new BigDecimal("5.00"));
        }

        @Test
        @DisplayName("Should handle negative amounts (returns/credits)")
        void shouldHandleNegativeAmounts() {
            List<LineItem> items = new ArrayList<>();
            items.add(new LineItem("Sale", new BigDecimal("1000.00"), STANDARD_RATE));
            items.add(new LineItem("Return", new BigDecimal("-200.00"), STANDARD_RATE));

            BigDecimal totalNet = calculateTotalNet(items);
            BigDecimal totalVat = calculateTotalVat(items);

            assertThat(totalNet).isEqualByComparingTo(new BigDecimal("800.00"));
            assertThat(totalVat).isEqualByComparingTo(new BigDecimal("40.00")); // 50 - 10
        }
    }

    // Helper class for line items
    private static class LineItem {
        String description;
        BigDecimal amount;
        BigDecimal vatRate; // null = exempt

        LineItem(String description, BigDecimal amount, BigDecimal vatRate) {
            this.description = description;
            this.amount = amount;
            this.vatRate = vatRate;
        }

        BigDecimal calculateVat() {
            if (vatRate == null) {
                return BigDecimal.ZERO;
            }
            return amount.multiply(vatRate).setScale(DECIMAL_PLACES, RoundingMode.HALF_UP);
        }

        boolean isExempt() {
            return vatRate == null;
        }

        boolean isZeroRated() {
            return vatRate != null && vatRate.compareTo(BigDecimal.ZERO) == 0;
        }

        boolean isStandardRated() {
            return vatRate != null && vatRate.compareTo(BigDecimal.ZERO) > 0;
        }
    }

    // Helper class for VAT summary
    private static class VatSummary {
        BigDecimal standardRatedAmount = BigDecimal.ZERO;
        BigDecimal standardRatedVat = BigDecimal.ZERO;
        BigDecimal zeroRatedAmount = BigDecimal.ZERO;
        BigDecimal exemptAmount = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;
        BigDecimal totalVat = BigDecimal.ZERO;
        BigDecimal totalGross = BigDecimal.ZERO;
    }

    private BigDecimal calculateTotalNet(List<LineItem> items) {
        return items.stream()
            .map(item -> item.amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTotalVat(List<LineItem> items) {
        return items.stream()
            .map(LineItem::calculateVat)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTaxableAmount(List<LineItem> items) {
        return items.stream()
            .filter(LineItem::isStandardRated)
            .map(item -> item.amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateExemptAmount(List<LineItem> items) {
        return items.stream()
            .filter(LineItem::isExempt)
            .map(item -> item.amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateZeroRatedAmount(List<LineItem> items) {
        return items.stream()
            .filter(LineItem::isZeroRated)
            .map(item -> item.amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private VatSummary calculateVatSummary(List<LineItem> items) {
        VatSummary summary = new VatSummary();

        for (LineItem item : items) {
            if (item.isStandardRated()) {
                summary.standardRatedAmount = summary.standardRatedAmount.add(item.amount);
                summary.standardRatedVat = summary.standardRatedVat.add(item.calculateVat());
            } else if (item.isZeroRated()) {
                summary.zeroRatedAmount = summary.zeroRatedAmount.add(item.amount);
            } else if (item.isExempt()) {
                summary.exemptAmount = summary.exemptAmount.add(item.amount);
            }
        }

        summary.totalNet = calculateTotalNet(items);
        summary.totalVat = summary.standardRatedVat;
        summary.totalGross = summary.totalNet.add(summary.totalVat);

        return summary;
    }
}
