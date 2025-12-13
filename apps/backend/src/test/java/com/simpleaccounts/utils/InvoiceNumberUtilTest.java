package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("InvoiceNumberUtil Tests")
class InvoiceNumberUtilTest {

    private InvoiceNumberUtil invoiceNumberUtil;

    @BeforeEach
    void setUp() {
        invoiceNumberUtil = new InvoiceNumberUtil();
    }

    @Nested
    @DisplayName("fetchSuffixFromString Tests")
    class FetchSuffixFromStringTests {

        @ParameterizedTest(name = "Input '{0}' should return suffix '{1}'")
        @CsvSource({
            "INV-001, 001",
            "INV-12345, 12345",
            "ABC123, 123",
            "PREFIX456SUFFIX789, 789",
            "INVOICE2024, 2024",
            "PO-2024-001, 001"
        })
        @DisplayName("Should extract trailing digits as suffix")
        void shouldExtractTrailingDigitsAsSuffix(String input, String expected) {
            // when
            String result = invoiceNumberUtil.fetchSuffixFromString(input);

            // then
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("Should return empty string when no trailing digits")
        void shouldReturnEmptyStringWhenNoTrailingDigits() {
            // when
            String result = invoiceNumberUtil.fetchSuffixFromString("INVOICE-ABC");

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should return entire string when all digits")
        void shouldReturnEntireStringWhenAllDigits() {
            // when
            String result = invoiceNumberUtil.fetchSuffixFromString("12345");

            // then
            assertThat(result).isEqualTo("12345");
        }

        @Test
        @DisplayName("Should stop at special characters")
        void shouldStopAtSpecialCharacters() {
            // when
            String result = invoiceNumberUtil.fetchSuffixFromString("INV-123/456");

            // then - should stop at '/' and return only trailing digits after it
            assertThat(result).isEqualTo("456");
        }

        @ParameterizedTest(name = "Special char '{0}' should stop suffix extraction")
        @ValueSource(strings = {"INV!123", "INV@123", "INV#123", "INV$123", "INV%123", "INV&123", "INV*123"})
        @DisplayName("Should stop extraction at special characters")
        void shouldStopExtractionAtSpecialCharacters(String input) {
            // when
            String result = invoiceNumberUtil.fetchSuffixFromString(input);

            // then
            assertThat(result).isEqualTo("123");
        }

        @Test
        @DisplayName("Should handle whitespace by trimming")
        void shouldHandleWhitespaceByTrimming() {
            // when
            String result = invoiceNumberUtil.fetchSuffixFromString("  INV-001  ");

            // then
            assertThat(result).isEqualTo("001");
        }
    }

    @Nested
    @DisplayName("fetchPrefixFromString Tests")
    class FetchPrefixFromStringTests {

        @ParameterizedTest(name = "Input '{0}' should return prefix '{1}'")
        @CsvSource({
            "INV-001, INV-",
            "INV-12345, INV-",
            "ABC123, ABC",
            "PREFIX456SUFFIX789, PREFIXSUFFIX",
            "INVOICE2024, INVOICE",
            "PO-2024-001, PO--"
        })
        @DisplayName("Should extract alphabetic and special characters as prefix")
        void shouldExtractAlphabeticAndSpecialCharsAsPrefix(String input, String expected) {
            // when
            String result = invoiceNumberUtil.fetchPrefixFromString(input);

            // then
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("Should return empty string when all digits")
        void shouldReturnEmptyStringWhenAllDigits() {
            // when
            String result = invoiceNumberUtil.fetchPrefixFromString("12345");

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should return entire string when no digits")
        void shouldReturnEntireStringWhenNoDigits() {
            // when
            String result = invoiceNumberUtil.fetchPrefixFromString("INVOICE-ABC");

            // then
            assertThat(result).isEqualTo("INVOICE-ABC");
        }

        @Test
        @DisplayName("Should include special characters in prefix")
        void shouldIncludeSpecialCharactersInPrefix() {
            // when
            String result = invoiceNumberUtil.fetchPrefixFromString("INV/2024/001");

            // then
            assertThat(result).isEqualTo("INV//");
        }

        @ParameterizedTest(name = "Special char '{0}' should be included in prefix from '{1}'")
        @CsvSource({
            "!, TEST!123, TEST!",
            "@, TEST@123, TEST@",
            "#, TEST#123, TEST#",
            "$, TEST$123, TEST$",
            "%, TEST%123, TEST%",
            "&, TEST&123, TEST&",
            "*, TEST*123, TEST*",
            "+, TEST+123, TEST+",
            "-, TEST-123, TEST-",
            "., TEST.123, TEST.",
            "/, TEST/123, TEST/",
            ":, TEST:123, TEST:",
            ";, TEST;123, TEST;",
            "=, TEST=123, TEST=",
            "?, TEST?123, TEST?",
            "^, TEST^123, TEST^",
            "_, TEST_123, TEST_",
            "`, TEST`123, TEST`",
            "|, TEST|123, TEST|"
        })
        @DisplayName("Should include all allowed special characters in prefix")
        void shouldIncludeAllAllowedSpecialCharsInPrefix(String specialChar, String input, String expected) {
            // when
            String result = invoiceNumberUtil.fetchPrefixFromString(input);

            // then
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("Should handle whitespace by trimming")
        void shouldHandleWhitespaceByTrimming() {
            // when
            String result = invoiceNumberUtil.fetchPrefixFromString("  INV-001  ");

            // then
            assertThat(result).isEqualTo("INV-");
        }

        @Test
        @DisplayName("Should handle mixed case letters")
        void shouldHandleMixedCaseLetters() {
            // when
            String result = invoiceNumberUtil.fetchPrefixFromString("InVoIcE2024");

            // then
            assertThat(result).isEqualTo("InVoIcE");
        }
    }

    @Nested
    @DisplayName("Combined Prefix and Suffix Tests")
    class CombinedTests {

        @ParameterizedTest(name = "For input '{0}', prefix + suffix should reconstruct similar pattern")
        @CsvSource({
            "INV-001",
            "PO-2024-123",
            "ABC123DEF456",
            "QUOTE-2024"
        })
        @DisplayName("Should extract prefix and suffix from same string")
        void shouldExtractPrefixAndSuffixFromSameString(String input) {
            // when
            String prefix = invoiceNumberUtil.fetchPrefixFromString(input);
            String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

            // then
            assertThat(prefix).isNotNull();
            assertThat(suffix).isNotNull();
            // Combined length should not exceed input length
            assertThat(prefix.length() + suffix.length()).isLessThanOrEqualTo(input.trim().length());
        }

        @Test
        @DisplayName("Should handle simple invoice number")
        void shouldHandleSimpleInvoiceNumber() {
            // given
            String invoiceNumber = "INV-2024-00123";

            // when
            String prefix = invoiceNumberUtil.fetchPrefixFromString(invoiceNumber);
            String suffix = invoiceNumberUtil.fetchSuffixFromString(invoiceNumber);

            // then
            assertThat(prefix).isEqualTo("INV--");
            assertThat(suffix).isEqualTo("00123");
        }

        @Test
        @DisplayName("Should handle complex invoice pattern")
        void shouldHandleComplexInvoicePattern() {
            // given
            String invoiceNumber = "SA/INV/2024/Q1/001";

            // when
            String prefix = invoiceNumberUtil.fetchPrefixFromString(invoiceNumber);
            String suffix = invoiceNumberUtil.fetchSuffixFromString(invoiceNumber);

            // then
            assertThat(prefix).isEqualTo("SA/INV//Q/");
            assertThat(suffix).isEqualTo("001");
        }
    }

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle single digit")
        void shouldHandleSingleDigit() {
            // when
            String prefix = invoiceNumberUtil.fetchPrefixFromString("1");
            String suffix = invoiceNumberUtil.fetchSuffixFromString("1");

            // then
            assertThat(prefix).isEmpty();
            assertThat(suffix).isEqualTo("1");
        }

        @Test
        @DisplayName("Should handle single letter")
        void shouldHandleSingleLetter() {
            // when
            String prefix = invoiceNumberUtil.fetchPrefixFromString("A");
            String suffix = invoiceNumberUtil.fetchSuffixFromString("A");

            // then
            assertThat(prefix).isEqualTo("A");
            assertThat(suffix).isEmpty();
        }

        @Test
        @DisplayName("Should handle comma in number")
        void shouldHandleCommaInNumber() {
            // given - comma is in special characters list
            String input = "INV,001";

            // when
            String prefix = invoiceNumberUtil.fetchPrefixFromString(input);
            String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

            // then
            assertThat(prefix).isEqualTo("INV,");
            assertThat(suffix).isEqualTo("001");
        }

        @Test
        @DisplayName("Should handle apostrophe")
        void shouldHandleApostrophe() {
            // given - apostrophe/single quote is in special characters list
            String input = "INV'001";

            // when
            String prefix = invoiceNumberUtil.fetchPrefixFromString(input);
            String suffix = invoiceNumberUtil.fetchSuffixFromString(input);

            // then
            assertThat(prefix).isEqualTo("INV'");
            assertThat(suffix).isEqualTo("001");
        }
    }
}
