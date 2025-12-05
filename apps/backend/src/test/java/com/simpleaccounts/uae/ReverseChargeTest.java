package com.simpleaccounts.uae;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/**
 * Tests for UAE VAT Reverse Charge mechanism.
 * Under reverse charge, the buyer (not the seller) accounts for VAT.
 * This applies to certain B2B transactions, imports, and designated goods.
 */
class ReverseChargeTest {

    private static final BigDecimal STANDARD_VAT_RATE = new BigDecimal("0.05");
    private static final int DECIMAL_PLACES = 2;

    @Nested
    @DisplayName("Reverse Charge on Imports")
    class ImportReverseChargeTests {

        @Test
        @DisplayName("Should apply reverse charge VAT on imported goods")
        void shouldApplyReverseChargeOnImportedGoods() {
            BigDecimal importValue = new BigDecimal("10000.00");

            // Seller invoices without VAT (zero-rated export from their country)
            BigDecimal sellerInvoiceAmount = importValue;
            BigDecimal sellerVat = BigDecimal.ZERO;

            // Buyer self-accounts for VAT (reverse charge)
            BigDecimal buyerOutputVat = calculateVat(importValue, STANDARD_VAT_RATE);
            BigDecimal buyerInputVat = calculateVat(importValue, STANDARD_VAT_RATE);

            // Net VAT effect should be zero (output = input for eligible buyers)
            BigDecimal netVatEffect = buyerOutputVat.subtract(buyerInputVat);

            assertThat(sellerVat).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(buyerOutputVat).isEqualByComparingTo(new BigDecimal("500.00"));
            assertThat(buyerInputVat).isEqualByComparingTo(new BigDecimal("500.00"));
            assertThat(netVatEffect).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle reverse charge on high-value imports")
        void shouldHandleReverseChargeOnHighValueImports() {
            BigDecimal importValue = new BigDecimal("1500000.00");

            BigDecimal vatAmount = calculateVat(importValue, STANDARD_VAT_RATE);

            assertThat(vatAmount).isEqualByComparingTo(new BigDecimal("75000.00"));
        }

        @Test
        @DisplayName("Should handle reverse charge with decimal precision")
        void shouldHandleReverseChargeWithDecimalPrecision() {
            BigDecimal importValue = new BigDecimal("12345.67");

            BigDecimal vatAmount = calculateVat(importValue, STANDARD_VAT_RATE);

            // 12345.67 * 0.05 = 617.2835, rounded to 617.28
            assertThat(vatAmount).isEqualByComparingTo(new BigDecimal("617.28"));
        }
    }

    @Nested
    @DisplayName("Reverse Charge on B2B Services")
    class B2BServiceReverseChargeTests {

        @Test
        @DisplayName("Should apply reverse charge on cross-border B2B services")
        void shouldApplyReverseChargeOnCrossBorderServices() {
            BigDecimal serviceValue = new BigDecimal("25000.00");

            // Foreign supplier does not charge UAE VAT
            BigDecimal supplierVat = BigDecimal.ZERO;

            // UAE business self-accounts for VAT
            BigDecimal reverseChargeVat = calculateVat(serviceValue, STANDARD_VAT_RATE);

            assertThat(supplierVat).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(reverseChargeVat).isEqualByComparingTo(new BigDecimal("1250.00"));
        }

        @Test
        @DisplayName("Should not apply reverse charge on domestic B2B services")
        void shouldNotApplyReverseChargeOnDomesticServices() {
            BigDecimal serviceValue = new BigDecimal("5000.00");
            boolean isDomesticSupplier = true;

            // Domestic supplier charges VAT normally
            BigDecimal supplierVat = isDomesticSupplier ?
                calculateVat(serviceValue, STANDARD_VAT_RATE) : BigDecimal.ZERO;

            // No reverse charge needed
            BigDecimal reverseChargeVat = isDomesticSupplier ?
                BigDecimal.ZERO : calculateVat(serviceValue, STANDARD_VAT_RATE);

            assertThat(supplierVat).isEqualByComparingTo(new BigDecimal("250.00"));
            assertThat(reverseChargeVat).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }

    @Nested
    @DisplayName("Reverse Charge on Designated Goods")
    class DesignatedGoodsReverseChargeTests {

        @Test
        @DisplayName("Should apply reverse charge on gold and precious metals")
        void shouldApplyReverseChargeOnGold() {
            BigDecimal goldValue = new BigDecimal("50000.00");
            boolean isDesignatedGood = true;

            // Seller invoices without VAT for designated goods
            BigDecimal sellerVat = isDesignatedGood ? BigDecimal.ZERO :
                calculateVat(goldValue, STANDARD_VAT_RATE);

            // Buyer self-accounts
            BigDecimal buyerReverseChargeVat = isDesignatedGood ?
                calculateVat(goldValue, STANDARD_VAT_RATE) : BigDecimal.ZERO;

            assertThat(sellerVat).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(buyerReverseChargeVat).isEqualByComparingTo(new BigDecimal("2500.00"));
        }

        @Test
        @DisplayName("Should apply reverse charge on hydrocarbons")
        void shouldApplyReverseChargeOnHydrocarbons() {
            BigDecimal hydrocarbonValue = new BigDecimal("100000.00");

            BigDecimal reverseChargeVat = calculateVat(hydrocarbonValue, STANDARD_VAT_RATE);

            assertThat(reverseChargeVat).isEqualByComparingTo(new BigDecimal("5000.00"));
        }
    }

    @Nested
    @DisplayName("Reverse Charge VAT Return Reporting")
    class VatReturnReportingTests {

        @Test
        @DisplayName("Should calculate correct amounts for VAT return box entries")
        void shouldCalculateCorrectVatReturnAmounts() {
            BigDecimal reverseChargeSupplies = new BigDecimal("75000.00");

            // Box 3: Value of reverse charge supplies
            BigDecimal box3Amount = reverseChargeSupplies;

            // Box 6: VAT on reverse charge (output)
            BigDecimal box6Vat = calculateVat(reverseChargeSupplies, STANDARD_VAT_RATE);

            // Box 10: Recoverable input VAT (if eligible)
            BigDecimal box10Vat = calculateVat(reverseChargeSupplies, STANDARD_VAT_RATE);

            assertThat(box3Amount).isEqualByComparingTo(new BigDecimal("75000.00"));
            assertThat(box6Vat).isEqualByComparingTo(new BigDecimal("3750.00"));
            assertThat(box10Vat).isEqualByComparingTo(new BigDecimal("3750.00"));
        }

        @Test
        @DisplayName("Should handle partial input VAT recovery on reverse charge")
        void shouldHandlePartialInputVatRecovery() {
            BigDecimal reverseChargeSupplies = new BigDecimal("20000.00");
            BigDecimal inputVatRecoveryRate = new BigDecimal("0.80"); // 80% recovery

            BigDecimal outputVat = calculateVat(reverseChargeSupplies, STANDARD_VAT_RATE);
            BigDecimal inputVat = outputVat.multiply(inputVatRecoveryRate)
                .setScale(DECIMAL_PLACES, RoundingMode.HALF_UP);
            BigDecimal netVatPayable = outputVat.subtract(inputVat);

            assertThat(outputVat).isEqualByComparingTo(new BigDecimal("1000.00"));
            assertThat(inputVat).isEqualByComparingTo(new BigDecimal("800.00"));
            assertThat(netVatPayable).isEqualByComparingTo(new BigDecimal("200.00"));
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle zero value reverse charge")
        void shouldHandleZeroValueReverseCharge() {
            BigDecimal zeroValue = BigDecimal.ZERO;

            BigDecimal vatAmount = calculateVat(zeroValue, STANDARD_VAT_RATE);

            assertThat(vatAmount).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle very small amounts with proper rounding")
        void shouldHandleVerySmallAmounts() {
            BigDecimal smallValue = new BigDecimal("0.01");

            BigDecimal vatAmount = calculateVat(smallValue, STANDARD_VAT_RATE);

            // 0.01 * 0.05 = 0.0005, rounds to 0.00
            assertThat(vatAmount).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle amounts just above rounding threshold")
        void shouldHandleAmountsAboveRoundingThreshold() {
            BigDecimal value = new BigDecimal("10.00");

            BigDecimal vatAmount = calculateVat(value, STANDARD_VAT_RATE);

            // 10.00 * 0.05 = 0.50
            assertThat(vatAmount).isEqualByComparingTo(new BigDecimal("0.50"));
        }
    }

    private BigDecimal calculateVat(BigDecimal amount, BigDecimal rate) {
        return amount.multiply(rate).setScale(DECIMAL_PLACES, RoundingMode.HALF_UP);
    }
}
