package com.simpleaccounts.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DateUtils Tests")
class DateUtilsTest {

    @InjectMocks
    private DateUtils dateUtils;

    private TimeZone defaultTimeZone;
    private Date currentTime;

    @BeforeEach
    void setUp() {
        dateUtils = new DateUtils();
        defaultTimeZone = TimeZone.getTimeZone("UTC");
        currentTime = new Date();
    }

    // Tests for getStartDate with Duration

    @Test
    @DisplayName("Should get start date for THIS_WEEK duration")
    void shouldGetStartDateForThisWeek() {
        // given
        DateUtils.Duration duration = DateUtils.Duration.THIS_WEEK;

        // when
        Date result = DateUtils.getStartDate(duration, defaultTimeZone, currentTime);

        // then
        assertThat(result).isNotNull();
        Calendar cal = Calendar.getInstance(defaultTimeZone);
        cal.setTime(result);
        assertThat(cal.get(Calendar.DAY_OF_WEEK)).isEqualTo(Calendar.SUNDAY);
    }

    @Test
    @DisplayName("Should get start date for THIS_MONTH duration")
    void shouldGetStartDateForThisMonth() {
        // given
        DateUtils.Duration duration = DateUtils.Duration.THIS_MONTH;

        // when
        Date result = DateUtils.getStartDate(duration, defaultTimeZone, currentTime);

        // then
        assertThat(result).isNotNull();
        Calendar cal = Calendar.getInstance(defaultTimeZone);
        cal.setTime(result);
        assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
        assertThat(cal.get(Calendar.HOUR_OF_DAY)).isEqualTo(0);
        assertThat(cal.get(Calendar.MINUTE)).isEqualTo(0);
        assertThat(cal.get(Calendar.SECOND)).isEqualTo(0);
    }

    @Test
    @DisplayName("Should get start date for LAST_3_MONTHS duration")
    void shouldGetStartDateForLast3Months() {
        // given
        DateUtils.Duration duration = DateUtils.Duration.LAST_3_MONTHS;
        Calendar current = Calendar.getInstance(defaultTimeZone);

        // when
        Date result = DateUtils.getStartDate(duration, defaultTimeZone, current.getTime());

        // then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance(defaultTimeZone);
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
        assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(current.get(Calendar.MONTH) - 3);
    }

    @Test
    @DisplayName("Should get start date for LAST_6_MONTHS duration")
    void shouldGetStartDateForLast6Months() {
        // given
        DateUtils.Duration duration = DateUtils.Duration.LAST_6_MONTHS;
        Calendar current = Calendar.getInstance(defaultTimeZone);

        // when
        Date result = DateUtils.getStartDate(duration, defaultTimeZone, current.getTime());

        // then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance(defaultTimeZone);
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
        assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(current.get(Calendar.MONTH) - 6);
    }

    @Test
    @DisplayName("Should get start date for YEARLY duration")
    void shouldGetStartDateForYearly() {
        // given
        DateUtils.Duration duration = DateUtils.Duration.YEARLY;
        Calendar current = Calendar.getInstance(defaultTimeZone);

        // when
        Date result = DateUtils.getStartDate(duration, defaultTimeZone, current.getTime());

        // then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance(defaultTimeZone);
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
        assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(current.get(Calendar.MONTH) - 12);
    }

    // Tests for getEndDate with Duration

    @Test
    @DisplayName("Should get end date for THIS_WEEK duration")
    void shouldGetEndDateForThisWeek() {
        // given
        DateUtils.Duration duration = DateUtils.Duration.THIS_WEEK;

        // when
        Date result = DateUtils.getEndDate(duration, defaultTimeZone, currentTime);

        // then
        assertThat(result).isNotNull();
        Calendar cal = Calendar.getInstance(defaultTimeZone);
        cal.setTime(result);
        assertThat(cal.get(Calendar.DAY_OF_WEEK)).isEqualTo(Calendar.SUNDAY);
    }

    @Test
    @DisplayName("Should get end date for THIS_MONTH duration")
    void shouldGetEndDateForThisMonth() {
        // given
        DateUtils.Duration duration = DateUtils.Duration.THIS_MONTH;
        Calendar current = Calendar.getInstance(defaultTimeZone);

        // when
        Date result = DateUtils.getEndDate(duration, defaultTimeZone, current.getTime());

        // then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance(defaultTimeZone);
        resultCal.setTime(result);
        int maxDayOfMonth = resultCal.getActualMaximum(Calendar.DAY_OF_MONTH);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isLessThanOrEqualTo(maxDayOfMonth);
    }

    // Tests for getMonthForInt

    @Test
    @DisplayName("Should get month name for valid month number")
    void shouldGetMonthNameForValidMonthNumber() {
        // when
        String january = DateUtils.getMonthForInt(0);
        String december = DateUtils.getMonthForInt(11);

        // then
        assertThat(january).isEqualTo("Jan");
        assertThat(december).isEqualTo("Dec");
    }

    @Test
    @DisplayName("Should get all month names correctly")
    void shouldGetAllMonthNamesCorrectly() {
        // when & then
        String[] expectedMonths = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        for (int i = 0; i < 12; i++) {
            assertThat(DateUtils.getMonthForInt(i)).isEqualTo(expectedMonths[i]);
        }
    }

    @Test
    @DisplayName("Should return wrong for invalid month number")
    void shouldReturnWrongForInvalidMonthNumber() {
        // when
        String result1 = DateUtils.getMonthForInt(-1);
        String result2 = DateUtils.getMonthForInt(12);
        String result3 = DateUtils.getMonthForInt(100);

        // then
        assertThat(result1).isEqualTo("wrong");
        assertThat(result2).isEqualTo("wrong");
        assertThat(result3).isEqualTo("wrong");
    }

    // Tests for getStartDate(Date)

    @Test
    @DisplayName("Should get start of day from date")
    void shouldGetStartOfDayFromDate() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.MARCH, 15, 14, 30, 45);
        Date date = cal.getTime();

        // when
        Date result = DateUtils.getStartDate(date);

        // then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance();
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.HOUR_OF_DAY)).isEqualTo(0);
        assertThat(resultCal.get(Calendar.MINUTE)).isEqualTo(0);
        assertThat(resultCal.get(Calendar.SECOND)).isEqualTo(0);
        assertThat(resultCal.get(Calendar.MILLISECOND)).isEqualTo(0);
    }

    @Test
    @DisplayName("Should preserve date when getting start of day")
    void shouldPreserveDateWhenGettingStartOfDay() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.JUNE, 10, 23, 59, 59);
        Date date = cal.getTime();

        // when
        Date result = DateUtils.getStartDate(date);

        // then
        Calendar resultCal = Calendar.getInstance();
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.YEAR)).isEqualTo(2024);
        assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(Calendar.JUNE);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(10);
    }

    // Tests for getEndDate(Date)

    @Test
    @DisplayName("Should get end of day from date")
    void shouldGetEndOfDayFromDate() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.MARCH, 15, 10, 20, 30);
        Date date = cal.getTime();

        // when
        Date result = DateUtils.getEndDate(date);

        // then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance();
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.HOUR_OF_DAY)).isEqualTo(23);
        assertThat(resultCal.get(Calendar.MINUTE)).isEqualTo(59);
        assertThat(resultCal.get(Calendar.SECOND)).isEqualTo(59);
        assertThat(resultCal.get(Calendar.MILLISECOND)).isEqualTo(999);
    }

    @Test
    @DisplayName("Should preserve date when getting end of day")
    void shouldPreserveDateWhenGettingEndOfDay() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.DECEMBER, 25, 0, 0, 0);
        Date date = cal.getTime();

        // when
        Date result = DateUtils.getEndDate(date);

        // then
        Calendar resultCal = Calendar.getInstance();
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.YEAR)).isEqualTo(2024);
        assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(Calendar.DECEMBER);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(25);
    }

    // Tests for get(Date) - Date to LocalDateTime

    @Test
    @DisplayName("Should convert Date to LocalDateTime")
    void shouldConvertDateToLocalDateTime() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.MARCH, 15, 12, 30, 45);
        Date date = cal.getTime();

        // when
        LocalDateTime result = dateUtils.get(date);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getHour()).isEqualTo(0);
        assertThat(result.getMinute()).isEqualTo(0);
        assertThat(result.getSecond()).isEqualTo(0);
        assertThat(result.getNano()).isEqualTo(0);
    }

    // Tests for getLocalDateToString

    @Test
    @DisplayName("Should convert date to string with specified format")
    void shouldConvertDateToStringWithSpecifiedFormat() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.MARCH, 15, 0, 0, 0);
        Date date = cal.getTime();
        String format = "dd/MM/yyyy";

        // when
        String result = dateUtils.getLocalDateToString(date, format);

        // then
        assertThat(result).isEqualTo("15/03/2024");
    }

    @Test
    @DisplayName("Should format date with different pattern")
    void shouldFormatDateWithDifferentPattern() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.DECEMBER, 25, 0, 0, 0);
        Date date = cal.getTime();
        String format = "yyyy-MM-dd";

        // when
        String result = dateUtils.getLocalDateToString(date, format);

        // then
        assertThat(result).isEqualTo("2024-12-25");
    }

    // Tests for get(LocalDateTime) - LocalDateTime to Date

    @Test
    @DisplayName("Should convert LocalDateTime to Date")
    void shouldConvertLocalDateTimeToDate() {
        // given
        LocalDateTime localDateTime = LocalDateTime.of(2024, 3, 15, 12, 30);

        // when
        Date result = dateUtils.get(localDateTime);

        // then
        assertThat(result).isNotNull();
        Calendar cal = Calendar.getInstance();
        cal.setTime(result);
        assertThat(cal.get(Calendar.YEAR)).isEqualTo(2024);
        assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.MARCH);
        assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(15);
    }

    // Tests for add

    @Test
    @DisplayName("Should add days to LocalDateTime")
    void shouldAddDaysToLocalDateTime() {
        // given
        LocalDateTime startDate = LocalDateTime.of(2024, 3, 15, 0, 0);
        int daysToAdd = 10;

        // when
        LocalDateTime result = dateUtils.add(startDate, daysToAdd);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(25);
    }

    @Test
    @DisplayName("Should subtract days from LocalDateTime using negative number")
    void shouldSubtractDaysFromLocalDateTimeUsingNegativeNumber() {
        // given
        LocalDateTime startDate = LocalDateTime.of(2024, 3, 15, 0, 0);
        int daysToSubtract = -5;

        // when
        LocalDateTime result = dateUtils.add(startDate, daysToSubtract);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(10);
    }

    // Tests for getDifferenceBetweenLocalDaeTime

    @Test
    @DisplayName("Should calculate difference between LocalDateTime objects")
    void shouldCalculateDifferenceBetweenLocalDateTimeObjects() {
        // given
        LocalDateTime startDate = LocalDateTime.of(2024, 3, 1, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2024, 3, 15, 0, 0);

        // when
        long days = dateUtils.getDifferenceBetweenLocalDaeTime(startDate, endDate);

        // then
        assertThat(days).isEqualTo(14);
    }

    @Test
    @DisplayName("Should calculate negative difference for reverse dates")
    void shouldCalculateNegativeDifferenceForReverseDates() {
        // given
        LocalDateTime startDate = LocalDateTime.of(2024, 3, 15, 0, 0);
        LocalDateTime endDate = LocalDateTime.of(2024, 3, 1, 0, 0);

        // when
        long days = dateUtils.getDifferenceBetweenLocalDaeTime(startDate, endDate);

        // then
        assertThat(days).isEqualTo(-14);
    }

    @Test
    @DisplayName("Should return zero for same LocalDateTime")
    void shouldReturnZeroForSameLocalDateTime() {
        // given
        LocalDateTime date = LocalDateTime.of(2024, 3, 15, 12, 30);

        // when
        long days = dateUtils.getDifferenceBetweenLocalDaeTime(date, date);

        // then
        assertThat(days).isEqualTo(0);
    }

    // Tests for diff(Date, Date)

    @Test
    @DisplayName("Should calculate difference between Date objects")
    void shouldCalculateDifferenceBetweenDateObjects() {
        // given
        Calendar cal1 = Calendar.getInstance();
        cal1.set(2024, Calendar.MARCH, 15, 0, 0, 0);
        Date startDate = cal1.getTime();

        Calendar cal2 = Calendar.getInstance();
        cal2.set(2024, Calendar.MARCH, 10, 0, 0, 0);
        Date endDate = cal2.getTime();

        // when
        int days = dateUtils.diff(startDate, endDate);

        // then
        assertThat(days).isGreaterThanOrEqualTo(4);
        assertThat(days).isLessThanOrEqualTo(5);
    }

    @Test
    @DisplayName("Should handle same date difference")
    void shouldHandleSameDateDifference() {
        // given
        Date date = new Date();

        // when
        int days = dateUtils.diff(date, date);

        // then
        assertThat(days).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle leap year correctly")
    void shouldHandleLeapYearCorrectly() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.FEBRUARY, 29, 0, 0, 0);
        Date leapDate = cal.getTime();

        // when
        Date result = DateUtils.getStartDate(leapDate);

        // then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance();
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(29);
        assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(Calendar.FEBRUARY);
    }

    @Test
    @DisplayName("Should handle year boundary correctly")
    void shouldHandleYearBoundaryCorrectly() {
        // given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.DECEMBER, 31, 23, 59, 59);
        Date endOfYear = cal.getTime();

        // when
        Date result = DateUtils.getEndDate(endOfYear);

        // then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance();
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(31);
        assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(Calendar.DECEMBER);
    }
}
