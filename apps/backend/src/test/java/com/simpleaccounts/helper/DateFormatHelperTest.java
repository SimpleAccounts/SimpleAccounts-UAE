package com.simpleaccounts.helper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.Month;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.Date;

import static org.assertj.core.api.Assertions.*;

@DisplayName("DateFormatHelper Tests")
class DateFormatHelperTest {

    private DateFormatHelper dateFormatHelper;

    @BeforeEach
    void setUp() {
        dateFormatHelper = new DateFormatHelper();
    }

    @Test
    @DisplayName("Should convert Date to LocalDate successfully")
    void testConvertToLocalDateViaSqlDate_ValidDate() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.JANUARY, 15, 10, 30, 45);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getYear()).isEqualTo(2024);
        assertThat(result.getMonth()).isEqualTo(Month.JANUARY);
        assertThat(result.getDayOfMonth()).isEqualTo(15);
    }

    @Test
    @DisplayName("Should convert current date to LocalDate")
    void testConvertToLocalDateViaSqlDate_CurrentDate() {
        // Given
        Date now = new Date();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(now);

        // Then
        assertThat(result).isNotNull();
        LocalDate expected = now.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        assertThat(result).isEqualTo(expected);
    }

    @Test
    @DisplayName("Should convert first day of month correctly")
    void testConvertToLocalDateViaSqlDate_FirstDayOfMonth() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.MARCH, 1, 0, 0, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(1);
        assertThat(result.getMonth()).isEqualTo(Month.MARCH);
    }

    @Test
    @DisplayName("Should convert last day of month correctly")
    void testConvertToLocalDateViaSqlDate_LastDayOfMonth() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.DECEMBER, 31, 23, 59, 59);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(31);
        assertThat(result.getMonth()).isEqualTo(Month.DECEMBER);
        assertThat(result.getYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should handle leap year date conversion")
    void testConvertToLocalDateViaSqlDate_LeapYearDate() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.FEBRUARY, 29, 12, 0, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(29);
        assertThat(result.getMonth()).isEqualTo(Month.FEBRUARY);
        assertThat(result.getYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should convert date from year 2000")
    void testConvertToLocalDateViaSqlDate_Year2000() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2000, Calendar.JUNE, 15, 10, 30, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getYear()).isEqualTo(2000);
        assertThat(result.getMonth()).isEqualTo(Month.JUNE);
        assertThat(result.getDayOfMonth()).isEqualTo(15);
    }

    @Test
    @DisplayName("Should convert date from year 2050")
    void testConvertToLocalDateViaSqlDate_FutureDate() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2050, Calendar.SEPTEMBER, 20, 14, 45, 30);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getYear()).isEqualTo(2050);
        assertThat(result.getMonth()).isEqualTo(Month.SEPTEMBER);
        assertThat(result.getDayOfMonth()).isEqualTo(20);
    }

    @Test
    @DisplayName("Should ignore time component when converting to LocalDate")
    void testConvertToLocalDateViaSqlDate_IgnoresTime() {
        // Given
        Calendar cal1 = Calendar.getInstance();
        cal1.set(2024, Calendar.JULY, 10, 1, 15, 30);
        Date date1 = cal1.getTime();

        Calendar cal2 = Calendar.getInstance();
        cal2.set(2024, Calendar.JULY, 10, 23, 45, 59);
        Date date2 = cal2.getTime();

        // When
        LocalDate result1 = dateFormatHelper.convertToLocalDateViaSqlDate(date1);
        LocalDate result2 = dateFormatHelper.convertToLocalDateViaSqlDate(date2);

        // Then
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should convert January 1st correctly")
    void testConvertToLocalDateViaSqlDate_NewYearsDay() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.JANUARY, 1, 0, 0, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMonth()).isEqualTo(Month.JANUARY);
        assertThat(result.getDayOfMonth()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should handle mid-month dates")
    void testConvertToLocalDateViaSqlDate_MidMonth() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.MAY, 15, 12, 0, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(15);
        assertThat(result.getMonth()).isEqualTo(Month.MAY);
    }

    @Test
    @DisplayName("Should convert October date correctly")
    void testConvertToLocalDateViaSqlDate_October() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2023, Calendar.OCTOBER, 25, 8, 30, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMonth()).isEqualTo(Month.OCTOBER);
        assertThat(result.getDayOfMonth()).isEqualTo(25);
        assertThat(result.getYear()).isEqualTo(2023);
    }

    @Test
    @DisplayName("Should convert April date correctly")
    void testConvertToLocalDateViaSqlDate_April() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.APRIL, 10, 16, 20, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMonth()).isEqualTo(Month.APRIL);
        assertThat(result.getDayOfMonth()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should convert November date correctly")
    void testConvertToLocalDateViaSqlDate_November() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.NOVEMBER, 5, 9, 0, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMonth()).isEqualTo(Month.NOVEMBER);
        assertThat(result.getDayOfMonth()).isEqualTo(5);
    }

    @Test
    @DisplayName("Should handle date at midnight")
    void testConvertToLocalDateViaSqlDate_Midnight() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.AUGUST, 12, 0, 0, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(12);
        assertThat(result.getMonth()).isEqualTo(Month.AUGUST);
    }

    @Test
    @DisplayName("Should handle date at end of day")
    void testConvertToLocalDateViaSqlDate_EndOfDay() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.AUGUST, 12, 23, 59, 59);
        cal.set(Calendar.MILLISECOND, 999);
        Date date = cal.getTime();

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(12);
        assertThat(result.getMonth()).isEqualTo(Month.AUGUST);
    }

    @Test
    @DisplayName("Should be consistent for same date different times")
    void testConvertToLocalDateViaSqlDate_Consistency() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.MARCH, 20, 0, 0, 0);
        Date morning = cal.getTime();

        cal.set(Calendar.HOUR_OF_DAY, 12);
        Date noon = cal.getTime();

        cal.set(Calendar.HOUR_OF_DAY, 23);
        Date night = cal.getTime();

        // When
        LocalDate morningResult = dateFormatHelper.convertToLocalDateViaSqlDate(morning);
        LocalDate noonResult = dateFormatHelper.convertToLocalDateViaSqlDate(noon);
        LocalDate nightResult = dateFormatHelper.convertToLocalDateViaSqlDate(night);

        // Then
        assertThat(morningResult).isEqualTo(noonResult);
        assertThat(noonResult).isEqualTo(nightResult);
    }

    @Test
    @DisplayName("Should convert date from 1970 epoch start")
    void testConvertToLocalDateViaSqlDate_Epoch() {
        // Given
        Date date = new Date(0L); // Unix epoch start

        // When
        LocalDate result = dateFormatHelper.convertToLocalDateViaSqlDate(date);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getYear()).isEqualTo(1970);
    }

    @Test
    @DisplayName("Should handle dates in different centuries")
    void testConvertToLocalDateViaSqlDate_DifferentCenturies() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(1999, Calendar.DECEMBER, 31, 12, 0, 0);
        Date date1999 = cal.getTime();

        cal.set(2001, Calendar.JANUARY, 1, 12, 0, 0);
        Date date2001 = cal.getTime();

        // When
        LocalDate result1999 = dateFormatHelper.convertToLocalDateViaSqlDate(date1999);
        LocalDate result2001 = dateFormatHelper.convertToLocalDateViaSqlDate(date2001);

        // Then
        assertThat(result1999.getYear()).isEqualTo(1999);
        assertThat(result2001.getYear()).isEqualTo(2001);
        assertThat(result1999).isBefore(result2001);
    }

    @Test
    @DisplayName("Should verify component annotation is present")
    void testDateFormatHelperIsComponent() {
        // Then
        assertThat(DateFormatHelper.class.isAnnotationPresent(
            org.springframework.stereotype.Component.class)).isTrue();
    }
}
