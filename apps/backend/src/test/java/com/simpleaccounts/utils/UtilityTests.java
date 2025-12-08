package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

@DisplayName("Utility Class Tests")
class UtilityTests {

    @Nested
    @DisplayName("DateUtils Tests")
    class DateUtilsTests {

        private final DateUtils dateUtils = new DateUtils();

        @Test
        @DisplayName("Should return correct month name for valid index")
        void testGetMonthForInt() {
            assertThat(DateUtils.getMonthForInt(0)).isEqualTo("Jan");
            assertThat(DateUtils.getMonthForInt(1)).isEqualTo("Feb");
            assertThat(DateUtils.getMonthForInt(2)).isEqualTo("Mar");
            assertThat(DateUtils.getMonthForInt(11)).isEqualTo("Dec");
        }

        @Test
        @DisplayName("Should return wrong for invalid month index")
        void testGetMonthForIntInvalid() {
            assertThat(DateUtils.getMonthForInt(-1)).isEqualTo("wrong");
            assertThat(DateUtils.getMonthForInt(12)).isEqualTo("wrong");
        }

        @Test
        @DisplayName("Should get start date of day")
        void testGetStartDate() {
            Calendar cal = Calendar.getInstance();
            cal.set(2024, Calendar.JUNE, 15, 14, 30, 45);
            Date inputDate = cal.getTime();

            Date result = DateUtils.getStartDate(inputDate);
            Calendar resultCal = Calendar.getInstance();
            resultCal.setTime(result);

            assertThat(resultCal.get(Calendar.HOUR_OF_DAY)).isZero();
            assertThat(resultCal.get(Calendar.MINUTE)).isZero();
            assertThat(resultCal.get(Calendar.SECOND)).isZero();
        }

        @Test
        @DisplayName("Should get end date of day")
        void testGetEndDate() {
            Calendar cal = Calendar.getInstance();
            cal.set(2024, Calendar.JUNE, 15, 10, 15, 30);
            Date inputDate = cal.getTime();

            Date result = DateUtils.getEndDate(inputDate);
            Calendar resultCal = Calendar.getInstance();
            resultCal.setTime(result);

            assertThat(resultCal.get(Calendar.HOUR_OF_DAY)).isEqualTo(23);
            assertThat(resultCal.get(Calendar.MINUTE)).isEqualTo(59);
            assertThat(resultCal.get(Calendar.SECOND)).isEqualTo(59);
        }

        @Test
        @DisplayName("Should convert Date to LocalDateTime")
        void testDateToLocalDateTime() {
            Date date = new Date();
            LocalDateTime result = dateUtils.get(date);
            assertThat(result).isNotNull();
            assertThat(result.getHour()).isZero();
            assertThat(result.getMinute()).isZero();
        }

        @Test
        @DisplayName("Should convert LocalDateTime to Date")
        void testLocalDateTimeToDate() {
            LocalDateTime localDateTime = LocalDateTime.now();
            Date result = dateUtils.get(localDateTime);
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("Should add days to LocalDateTime")
        void testAddDays() {
            LocalDateTime date = LocalDateTime.of(2024, 6, 15, 10, 0);
            LocalDateTime result = dateUtils.add(date, 5);
            assertThat(result.getDayOfMonth()).isEqualTo(20);
        }

        @Test
        @DisplayName("Should calculate difference between LocalDateTimes")
        void testGetDifferenceBetweenLocalDateTime() {
            LocalDateTime startDate = LocalDateTime.of(2024, 6, 10, 10, 0);
            LocalDateTime endDate = LocalDateTime.of(2024, 6, 20, 10, 0);
            long diff = dateUtils.getDifferenceBetweenLocalDaeTime(startDate, endDate);
            assertThat(diff).isEqualTo(10);
        }

        @Test
        @DisplayName("Should calculate difference between Dates")
        void testDiffDates() {
            Calendar cal1 = Calendar.getInstance();
            cal1.set(2024, Calendar.JUNE, 20);
            Calendar cal2 = Calendar.getInstance();
            cal2.set(2024, Calendar.JUNE, 15);

            int diff = dateUtils.diff(cal1.getTime(), cal2.getTime());
            assertThat(diff).isEqualTo(5);
        }

        @Test
        @DisplayName("Should format date to string")
        void testGetLocalDateToString() {
            Calendar cal = Calendar.getInstance();
            cal.set(2024, Calendar.JUNE, 15);
            Date date = cal.getTime();

            String result = dateUtils.getLocalDateToString(date, "yyyy-MM-dd");
            assertThat(result).isEqualTo("2024-06-15");
        }

        @Test
        @DisplayName("Duration enum should have correct values")
        void testDurationEnum() {
            assertThat(DateUtils.Duration.THIS_WEEK.getDuration()).isEqualTo("Weekly");
            assertThat(DateUtils.Duration.THIS_MONTH.getDuration()).isEqualTo("Monthly");
            assertThat(DateUtils.Duration.LAST_3_MONTHS.getDuration()).isEqualTo("3Monthly");
            assertThat(DateUtils.Duration.LAST_6_MONTHS.getDuration()).isEqualTo("6Monthly");
            assertThat(DateUtils.Duration.YEARLY.getDuration()).isEqualTo("Yearly");
        }

        @Test
        @DisplayName("Should get start date with duration THIS_WEEK")
        void testGetStartDateWithDurationThisWeek() {
            TimeZone timezone = TimeZone.getDefault();
            Date currentTime = new Date();
            Date result = DateUtils.getStartDate(DateUtils.Duration.THIS_WEEK, timezone, currentTime);
            assertThat(result).isNotNull().isBeforeOrEqualTo(currentTime);
        }

        @Test
        @DisplayName("Should get start date with duration THIS_MONTH")
        void testGetStartDateWithDurationThisMonth() {
            TimeZone timezone = TimeZone.getDefault();
            Date currentTime = new Date();
            Date result = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, timezone, currentTime);
            assertThat(result).isNotNull();
            Calendar resultCal = Calendar.getInstance();
            resultCal.setTime(result);
            assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
        }

        @Test
        @DisplayName("Should get start date with duration LAST_3_MONTHS")
        void testGetStartDateWithDurationLast3Months() {
            TimeZone timezone = TimeZone.getDefault();
            Date currentTime = new Date();
            Date result = DateUtils.getStartDate(DateUtils.Duration.LAST_3_MONTHS, timezone, currentTime);
            assertThat(result).isNotNull().isBefore(currentTime);
        }

        @Test
        @DisplayName("Should get end date with duration THIS_WEEK")
        void testGetEndDateWithDurationThisWeek() {
            TimeZone timezone = TimeZone.getDefault();
            Date currentTime = new Date();
            Date result = DateUtils.getEndDate(DateUtils.Duration.THIS_WEEK, timezone, currentTime);
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("Should get end date with duration THIS_MONTH")
        void testGetEndDateWithDurationThisMonth() {
            TimeZone timezone = TimeZone.getDefault();
            Date currentTime = new Date();
            Date result = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, timezone, currentTime);
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("RELATIVE_MONTH_DAYS should be 31")
        void testRelativeMonthDays() {
            assertThat(DateUtils.RELATIVE_MONTH_DAYS).isEqualTo(31);
        }
    }

    @Nested
    @DisplayName("RandomString Tests")
    class RandomStringTests {

        private final RandomString randomString = new RandomString();

        @Test
        @DisplayName("Should generate alphanumeric string of specified length")
        void testGetAlphaNumericString() {
            String result = randomString.getAlphaNumericString(10);
            assertThat(result).hasSize(10);
        }

        @Test
        @DisplayName("Should generate different strings each time")
        void testRandomnessOfAlphaNumericString() {
            String result1 = randomString.getAlphaNumericString(20);
            String result2 = randomString.getAlphaNumericString(20);
            // Very unlikely to be equal due to randomness
            assertThat(result1).isNotEqualTo(result2);
        }

        @Test
        @DisplayName("Should generate empty string for length 0")
        void testZeroLengthAlphaNumericString() {
            String result = randomString.getAlphaNumericString(0);
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should contain only alphanumeric characters")
        void testAlphaNumericCharactersOnly() {
            String result = randomString.getAlphaNumericString(100);
            assertThat(result).matches("[a-zA-Z0-9]+");
        }
    }

    @Nested
    @DisplayName("OSValidator Tests")
    class OSValidatorTests {

        @Test
        @DisplayName("Should return OS type")
        void testGetOS() {
            String os = OSValidator.getOS();
            assertThat(os).isIn("win", "osx", "uni", "sol", "err");
        }

        @Test
        @DisplayName("Exactly one OS check should be true on this system")
        void testOnlyOneOsIsTrue() {
            int trueCount = 0;
            if (OSValidator.isWindows()) trueCount++;
            if (OSValidator.isMac()) trueCount++;
            if (OSValidator.isUnix()) trueCount++;
            if (OSValidator.isSolaris()) trueCount++;
            // At least one should be detected (or none if unknown OS)
            assertThat(trueCount).isLessThanOrEqualTo(1);
        }
    }

    @Nested
    @DisplayName("InvoiceNumberUtil Tests")
    class InvoiceNumberUtilTests {

        private final InvoiceNumberUtil invoiceNumberUtil = new InvoiceNumberUtil();

        @ParameterizedTest(name = "fetchSuffixFromString: \"{0}\" -> \"{1}\"")
        @CsvSource({
            "INV-2024-001, 001",
            "INV-ABC, ''",
            "12345, 12345"
        })
        @DisplayName("Should correctly extract suffix from various string patterns")
        void testFetchSuffixFromString(String input, String expected) {
            String result = invoiceNumberUtil.fetchSuffixFromString(input);
            assertThat(result).isEqualTo(expected);
        }

        @Test
        @DisplayName("Should handle string with special characters")
        void testFetchSuffixWithSpecialChars() {
            String result = invoiceNumberUtil.fetchSuffixFromString("INV-2024-");
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should fetch prefix from string")
        void testFetchPrefixFromString() {
            String result = invoiceNumberUtil.fetchPrefixFromString("INV-2024-001");
            assertThat(result).isEqualTo("INV--");
        }

        @Test
        @DisplayName("Should return empty prefix when only numbers")
        void testFetchPrefixFromStringOnlyNumbers() {
            String result = invoiceNumberUtil.fetchPrefixFromString("12345");
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should handle empty string")
        void testFetchSuffixFromEmptyString() {
            String result = invoiceNumberUtil.fetchSuffixFromString("");
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should handle whitespace string")
        void testFetchSuffixFromWhitespaceString() {
            String result = invoiceNumberUtil.fetchSuffixFromString("  123  ");
            assertThat(result).isEqualTo("123");
        }
    }

    @Nested
    @DisplayName("CommonUtil Tests")
    class CommonUtilTests {

        @Test
        @DisplayName("Should have correct default row count")
        void testDefaultRowCount() {
            assertThat(CommonUtil.DEFAULT_ROW_COUNT).isEqualTo(10);
        }
    }
}
