package com.simpleaccounts.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("InvoiceNumberUtil Tests")
class InvoiceNumberUtilTest {

    @InjectMocks
    private InvoiceNumberUtil invoiceNumberUtil;

    @BeforeEach
    void setUp() {
        invoiceNumberUtil = new InvoiceNumberUtil();
    }

    // Tests for fetchSuffixFromString

    @Test
    @DisplayName("Should extract numeric suffix from invoice number")
    void shouldExtractNumericSuffixFromInvoiceNumber() {
        // given
        String invoiceNumber = "INV-2024-001";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(invoiceNumber);

        // then
        assertThat(suffix).isEqualTo("001");
    }

    @Test
    @DisplayName("Should extract suffix from simple alphanumeric string")
    void shouldExtractSuffixFromSimpleAlphanumericString() {
        // given
        String input = "ABC123";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEqualTo("123");
    }

    @Test
    @DisplayName("Should extract suffix from string with multiple dashes")
    void shouldExtractSuffixFromStringWithMultipleDashes() {
        // given
        String input = "QUOTE-2024-12-9999";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEqualTo("9999");
    }

    @Test
    @DisplayName("Should return empty string when no numeric suffix exists")
    void shouldReturnEmptyStringWhenNoNumericSuffixExists() {
        // given
        String input = "INVOICE";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEmpty();
    }

    @Test
    @DisplayName("Should extract all trailing digits")
    void shouldExtractAllTrailingDigits() {
        // given
        String input = "PO1234567890";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEqualTo("1234567890");
    }

    @Test
    @DisplayName("Should handle string with only numbers")
    void shouldHandleStringWithOnlyNumbers() {
        // given
        String input = "123456";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEqualTo("123456");
    }

    @Test
    @DisplayName("Should handle string with trailing whitespace")
    void shouldHandleStringWithTrailingWhitespace() {
        // given
        String input = "INV-001   ";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEqualTo("001");
    }

    @Test
    @DisplayName("Should handle string with leading whitespace")
    void shouldHandleStringWithLeadingWhitespace() {
        // given
        String input = "   INV-789";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEqualTo("789");
    }

    @Test
    @DisplayName("Should stop at special character before digits")
    void shouldStopAtSpecialCharacterBeforeDigits() {
        // given
        String input = "REF-2024";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEqualTo("2024");
    }

    @Test
    @DisplayName("Should extract suffix from complex format")
    void shouldExtractSuffixFromComplexFormat() {
        // given
        String input = "QUOTE/2024/DEC/12345";

        // when
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(suffix).isEqualTo("12345");
    }

    // Tests for fetchPrefixFromString

    @Test
    @DisplayName("Should extract prefix from invoice number")
    void shouldExtractPrefixFromInvoiceNumber() {
        // given
        String invoiceNumber = "INV-2024-001";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(invoiceNumber);

        // then
        assertThat(prefix).isEqualTo("INV-2024-");
    }

    @Test
    @DisplayName("Should extract prefix from simple alphanumeric string")
    void shouldExtractPrefixFromSimpleAlphanumericString() {
        // given
        String input = "ABC123";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).isEqualTo("ABC");
    }

    @Test
    @DisplayName("Should extract all alphabetic and special characters")
    void shouldExtractAllAlphabeticAndSpecialCharacters() {
        // given
        String input = "QUOTE-2024-12-9999";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).isEqualTo("QUOTE-2024-12-");
    }

    @Test
    @DisplayName("Should return empty prefix when string is only numbers")
    void shouldReturnEmptyPrefixWhenStringIsOnlyNumbers() {
        // given
        String input = "123456";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).isEmpty();
    }

    @Test
    @DisplayName("Should return entire string when no numbers exist")
    void shouldReturnEntireStringWhenNoNumbersExist() {
        // given
        String input = "INVOICE";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).isEqualTo("INVOICE");
    }

    @Test
    @DisplayName("Should include special characters in prefix")
    void shouldIncludeSpecialCharactersInPrefix() {
        // given
        String input = "PO#2024@001";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).contains("#", "@");
    }

    @Test
    @DisplayName("Should handle mixed case letters in prefix")
    void shouldHandleMixedCaseLettersInPrefix() {
        // given
        String input = "QuOtE-123";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).isEqualTo("QuOtE-");
    }

    @Test
    @DisplayName("Should extract prefix with forward slash")
    void shouldExtractPrefixWithForwardSlash() {
        // given
        String input = "INV/2024/001";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).contains("INV/", "/");
    }

    @Test
    @DisplayName("Should handle prefix with dots and underscores")
    void shouldHandlePrefixWithDotsAndUnderscores() {
        // given
        String input = "REF.CODE_2024.001";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).contains("REF.CODE_", ".");
    }

    @Test
    @DisplayName("Should handle consecutive special characters")
    void shouldHandleConsecutiveSpecialCharacters() {
        // given
        String input = "INV--..//123";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);

        // then
        assertThat(prefix).isEqualTo("INV--..//");
    }

    // Combined tests for both methods

    @Test
    @DisplayName("Prefix and suffix should reconstruct original pattern")
    void prefixAndSuffixShouldReconstructOriginalPattern() {
        // given
        String input = "INV-2024-12345";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(prefix).isEqualTo("INV-2024-");
        assertThat(suffix).isEqualTo("12345");
        assertThat(prefix + suffix).isEqualTo(input);
    }

    @Test
    @DisplayName("Should handle edge case with single character")
    void shouldHandleEdgeCaseWithSingleCharacter() {
        // given
        String input = "A";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(prefix).isEqualTo("A");
        assertThat(suffix).isEmpty();
    }

    @Test
    @DisplayName("Should handle edge case with single digit")
    void shouldHandleEdgeCaseWithSingleDigit() {
        // given
        String input = "1";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(prefix).isEmpty();
        assertThat(suffix).isEqualTo("1");
    }

    @Test
    @DisplayName("Should handle empty string gracefully")
    void shouldHandleEmptyStringGracefully() {
        // given
        String input = "";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(prefix).isEmpty();
        assertThat(suffix).isEmpty();
    }

    @Test
    @DisplayName("Should handle string with only special characters")
    void shouldHandleStringWithOnlySpecialCharacters() {
        // given
        String input = "---...///";

        // when
        String prefix = invoiceNumberUtil.fetchPrefixFromString(input);
        String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

        // then
        assertThat(prefix).isEqualTo("---...///");
        assertThat(suffix).isEmpty();
    }
}
