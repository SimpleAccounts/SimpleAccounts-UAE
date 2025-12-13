package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("DateUtils Tests")
class DateUtilsTest {

    private DateUtils dateUtils;
    private TimeZone dubaiTimezone;
    private Date fixedDate;

    @BeforeEach
    void setUp() {
        dateUtils = new DateUtils();
        dubaiTimezone = TimeZone.getTimeZone("Asia/Dubai");

        // Create a fixed date: March 15, 2024
        Calendar cal = Calendar.getInstance(dubaiTimezone);
        cal.set(2024, Calendar.MARCH, 15, 10, 30, 0);
        cal.set(Calendar.MILLISECOND, 0);
        fixedDate = cal.getTime();
    }

    @Nested
    @DisplayName("getStartDate with Duration Tests")
    class GetStartDateWithDurationTests {

        @Test
        @DisplayName("Should return start of current week for THIS_WEEK duration")
        void shouldReturnStartOfWeekForThisWeekDuration() {
            // when
            Date result = DateUtils.getStartDate(DateUtils.Duration.THIS_WEEK, dubaiTimezone, fixedDate);

            // then
            Calendar cal = Calendar.getInstance(dubaiTimezone);
            cal.setTime(result);
            assertThat(cal.get(Calendar.DAY_OF_WEEK)).isEqualTo(Calendar.SUNDAY);
            assertThat(cal.get(Calendar.HOUR)).isEqualTo(0);
            assertThat(cal.get(Calendar.MINUTE)).isEqualTo(0);
            assertThat(cal.get(Calendar.SECOND)).isEqualTo(0);
        }

        @Test
        @DisplayName("Should return first day of month for THIS_MONTH duration")
        void shouldReturnFirstDayOfMonthForThisMonthDuration() {
            // when
            Date result = DateUtils.getStartDate(DateUtils.Duration.THIS_MONTH, dubaiTimezone, fixedDate);

            // then
            Calendar cal = Calendar.getInstance(dubaiTimezone);
            cal.setTime(result);
            assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
            assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.MARCH);
            assertThat(cal.get(Calendar.HOUR_OF_DAY)).isEqualTo(0);
        }

        @Test
        @DisplayName("Should return date 3 months ago for LAST_3_MONTHS duration")
        void shouldReturnThreeMonthsAgoForLast3MonthsDuration() {
            // when
            Date result = DateUtils.getStartDate(DateUtils.Duration.LAST_3_MONTHS, dubaiTimezone, fixedDate);

            // then
            Calendar cal = Calendar.getInstance(dubaiTimezone);
            cal.setTime(result);
            assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.DECEMBER);
            assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
        }

        @Test
        @DisplayName("Should return date 6 months ago for LAST_6_MONTHS duration")
        void shouldReturnSixMonthsAgoForLast6MonthsDuration() {
            // when
            Date result = DateUtils.getStartDate(DateUtils.Duration.LAST_6_MONTHS, dubaiTimezone, fixedDate);

            // then
            Calendar cal = Calendar.getInstance(dubaiTimezone);
            cal.setTime(result);
            assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.SEPTEMBER);
            assertThat(cal.get(Calendar.YEAR)).isEqualTo(2023);
        }

        @Test
        @DisplayName("Should return date 12 months ago for YEARLY duration")
        void shouldReturnYearAgoForYearlyDuration() {
            // when
            Date result = DateUtils.getStartDate(DateUtils.Duration.YEARLY, dubaiTimezone, fixedDate);

            // then
            Calendar cal = Calendar.getInstance(dubaiTimezone);
            cal.setTime(result);
            assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.MARCH);
            assertThat(cal.get(Calendar.YEAR)).isEqualTo(2023);
        }
    }

    @Nested
    @DisplayName("getEndDate with Duration Tests")
    class GetEndDateWithDurationTests {

        @Test
        @DisplayName("Should return end of current week for THIS_WEEK duration")
        void shouldReturnEndOfWeekForThisWeekDuration() {
            // when
            Date result = DateUtils.getEndDate(DateUtils.Duration.THIS_WEEK, dubaiTimezone, fixedDate);

            // then
            Calendar cal = Calendar.getInstance(dubaiTimezone);
            cal.setTime(result);
            assertThat(cal.get(Calendar.DAY_OF_WEEK)).isEqualTo(Calendar.SUNDAY);
            assertThat(result.after(fixedDate)).isTrue();
        }

        @Test
        @DisplayName("Should return last day of month for THIS_MONTH duration")
        void shouldReturnLastDayOfMonthForThisMonthDuration() {
            // when
            Date result = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, dubaiTimezone, fixedDate);

            // then
            Calendar cal = Calendar.getInstance(dubaiTimezone);
            cal.setTime(result);
            assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(31); // March has 31 days
            assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.MARCH);
        }

        @Test
        @DisplayName("Should handle February correctly for THIS_MONTH duration")
        void shouldHandleFebruaryCorrectlyForThisMonthDuration() {
            // given - February 15, 2024 (leap year)
            Calendar febCal = Calendar.getInstance(dubaiTimezone);
            febCal.set(2024, Calendar.FEBRUARY, 15, 10, 0, 0);
            Date febDate = febCal.getTime();

            // when
            Date result = DateUtils.getEndDate(DateUtils.Duration.THIS_MONTH, dubaiTimezone, febDate);

            // then
            Calendar cal = Calendar.getInstance(dubaiTimezone);
            cal.setTime(result);
            assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(29); // Leap year February has 29 days
            assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.FEBRUARY);
        }
    }

    @Nested
    @DisplayName("getMonthForInt Tests")
    class GetMonthForIntTests {

        @ParameterizedTest(name = "Month index {0} should return {1}")
        @CsvSource({
            "0, Jan",
            "1, Feb",
            "2, Mar",
            "3, Apr",
            "4, May",
            "5, Jun",
            "6, Jul",
            "7, Aug",
            "8, Sep",
            "9, Oct",
            "10, Nov",
            "11, Dec"
        })
        @DisplayName("Should return correct month name for valid index")
        void shouldReturnCorrectMonthNameForValidIndex(int index, String expected) {
            // when
            String result = DateUtils.getMonthForInt(index);

            // then
            assertThat(result).isEqualTo(expected);
        }

        @ParameterizedTest(name = "Invalid month index {0} should return 'wrong'")
        @ValueSource(ints = {-1, 12, 13, 100})
        @DisplayName("Should return 'wrong' for invalid month index")
        void shouldReturnWrongForInvalidMonthIndex(int invalidIndex) {
            // when
            String result = DateUtils.getMonthForInt(invalidIndex);

            // then
            assertThat(result).isEqualTo("wrong");
        }
    }

    @Nested
    @DisplayName("getStartDate and getEndDate for Date Tests")
    class GetStartEndDateTests {

        @Test
        @DisplayName("Should return date at start of day (00:00:00.000)")
        void shouldReturnDateAtStartOfDay() {
            // when
            Date result = DateUtils.getStartDate(fixedDate);

            // then
            Calendar cal = Calendar.getInstance();
            cal.setTime(result);
            assertThat(cal.get(Calendar.HOUR_OF_DAY)).isEqualTo(0);
            assertThat(cal.get(Calendar.MINUTE)).isEqualTo(0);
            assertThat(cal.get(Calendar.SECOND)).isEqualTo(0);
            assertThat(cal.get(Calendar.MILLISECOND)).isEqualTo(0);
        }

        @Test
        @DisplayName("Should return date at end of day (23:59:59.999)")
        void shouldReturnDateAtEndOfDay() {
            // when
            Date result = DateUtils.getEndDate(fixedDate);

            // then
            Calendar cal = Calendar.getInstance();
            cal.setTime(result);
            assertThat(cal.get(Calendar.HOUR_OF_DAY)).isEqualTo(23);
            assertThat(cal.get(Calendar.MINUTE)).isEqualTo(59);
            assertThat(cal.get(Calendar.SECOND)).isEqualTo(59);
            assertThat(cal.get(Calendar.MILLISECOND)).isEqualTo(999);
        }
    }

    @Nested
    @DisplayName("Date Conversion Tests")
    class DateConversionTests {

        @Test
        @DisplayName("Should convert Date to LocalDateTime at midnight")
        void shouldConvertDateToLocalDateTimeAtMidnight() {
            // when
            LocalDateTime result = dateUtils.get(fixedDate);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getHour()).isEqualTo(0);
            assertThat(result.getMinute()).isEqualTo(0);
            assertThat(result.getSecond()).isEqualTo(0);
            assertThat(result.getDayOfMonth()).isEqualTo(15);
            assertThat(result.getMonthValue()).isEqualTo(3);
        }

        @Test
        @DisplayName("Should convert LocalDateTime to Date")
        void shouldConvertLocalDateTimeToDate() {
            // given
            LocalDateTime localDateTime = LocalDateTime.of(2024, 3, 15, 10, 30, 0);

            // when
            Date result = dateUtils.get(localDateTime);

            // then
            assertThat(result).isNotNull();
            Calendar cal = Calendar.getInstance();
            cal.setTime(result);
            assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(15);
            assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.MARCH);
        }

        @Test
        @DisplayName("Should format date to string")
        void shouldFormatDateToString() {
            // when
            String result = dateUtils.getLocalDateToString(fixedDate, "dd/MM/yyyy");

            // then
            assertThat(result).isEqualTo("15/03/2024");
        }
    }

    @Nested
    @DisplayName("Date Arithmetic Tests")
    class DateArithmeticTests {

        @Test
        @DisplayName("Should add days to LocalDateTime")
        void shouldAddDaysToLocalDateTime() {
            // given
            LocalDateTime date = LocalDateTime.of(2024, 3, 15, 0, 0, 0);

            // when
            LocalDateTime result = dateUtils.add(date, 5);

            // then
            assertThat(result.getDayOfMonth()).isEqualTo(20);
        }

        @Test
        @DisplayName("Should handle month boundary when adding days")
        void shouldHandleMonthBoundaryWhenAddingDays() {
            // given - March 30, 2024
            LocalDateTime date = LocalDateTime.of(2024, 3, 30, 0, 0, 0);

            // when
            LocalDateTime result = dateUtils.add(date, 5);

            // then
            assertThat(result.getMonthValue()).isEqualTo(4); // April
            assertThat(result.getDayOfMonth()).isEqualTo(4);
        }
    }

    @Nested
    @DisplayName("Date Difference Tests")
    class DateDifferenceTests {

        @Test
        @DisplayName("Should calculate difference between LocalDateTime objects")
        void shouldCalculateDifferenceBetweenLocalDateTimes() {
            // given
            LocalDateTime start = LocalDateTime.of(2024, 3, 1, 0, 0);
            LocalDateTime end = LocalDateTime.of(2024, 3, 15, 0, 0);

            // when
            long result = dateUtils.getDifferenceBetweenLocalDaeTime(start, end);

            // then
            assertThat(result).isEqualTo(14);
        }

        @Test
        @DisplayName("Should calculate difference between Date objects")
        void shouldCalculateDifferenceBetweenDates() {
            // given
            Calendar cal1 = Calendar.getInstance();
            cal1.set(2024, Calendar.MARCH, 15, 0, 0, 0);
            Date date1 = cal1.getTime();

            Calendar cal2 = Calendar.getInstance();
            cal2.set(2024, Calendar.MARCH, 1, 0, 0, 0);
            Date date2 = cal2.getTime();

            // when
            int result = dateUtils.diff(date1, date2);

            // then
            assertThat(result).isEqualTo(14);
        }

        @Test
        @DisplayName("Should return negative for reversed dates")
        void shouldReturnNegativeForReversedDates() {
            // given
            Calendar cal1 = Calendar.getInstance();
            cal1.set(2024, Calendar.MARCH, 1, 0, 0, 0);
            Date date1 = cal1.getTime();

            Calendar cal2 = Calendar.getInstance();
            cal2.set(2024, Calendar.MARCH, 15, 0, 0, 0);
            Date date2 = cal2.getTime();

            // when
            int result = dateUtils.diff(date1, date2);

            // then
            assertThat(result).isEqualTo(-14);
        }
    }

    @Nested
    @DisplayName("Duration Enum Tests")
    class DurationEnumTests {

        @Test
        @DisplayName("Should have correct duration strings")
        void shouldHaveCorrectDurationStrings() {
            assertThat(DateUtils.Duration.THIS_WEEK.getDuration()).isEqualTo("Weekly");
            assertThat(DateUtils.Duration.THIS_MONTH.getDuration()).isEqualTo("Monthly");
            assertThat(DateUtils.Duration.LAST_3_MONTHS.getDuration()).isEqualTo("3Monthly");
            assertThat(DateUtils.Duration.LAST_6_MONTHS.getDuration()).isEqualTo("6Monthly");
            assertThat(DateUtils.Duration.YEARLY.getDuration()).isEqualTo("Yearly");
        }
    }

    @Test
    @DisplayName("Should have correct RELATIVE_MONTH_DAYS constant")
    void shouldHaveCorrectRelativeMonthDaysConstant() {
        assertThat(DateUtils.RELATIVE_MONTH_DAYS).isEqualTo(31);
    }
}
