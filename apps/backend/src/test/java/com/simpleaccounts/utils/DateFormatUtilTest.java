package com.simpleaccounts.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.text.SimpleDateFormat;
import java.time.*;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DateFormatUtil Tests")
class DateFormatUtilTest {

    @InjectMocks
    private DateFormatUtil dateFormatUtil;

    @BeforeEach
    void setUp() {
        dateFormatUtil = new DateFormatUtil();
    }

    @Test
    @DisplayName("Should return list of date formats")
    void shouldReturnListOfDateFormats() {
        // when
        List<String> formats = DateFormatUtil.dateFormatList();

        // then
        assertThat(formats)
                .isNotNull()
                .hasSize(8)
                .contains("dd/MM/yyyy", "yyyy/MM/dd", "dd-MM-yyyy", "MM-dd-yyyy", "yyyy-MM-dd");
    }

    @Test
    @DisplayName("Should include all expected date formats")
    void shouldIncludeAllExpectedDateFormats() {
        // when
        List<String> formats = DateFormatUtil.dateFormatList();

        // then
        assertThat(formats).containsExactly(
                "dd/MM/yyyy",
                "yyyy/MM/dd",
                "dd-MM-yyyy",
                "dd-M-yyyy",
                "MM-dd-yyyy",
                "yyyy-MM-dd",
                "dd MMMM yyyy",
                "MM/dd/yyyy"
        );
    }

    @Test
    @DisplayName("Should convert LocalDateTime to string with dd/MM/yyyy format")
    void shouldConvertLocalDateTimeToStringWithSlashFormat() {
        // given
        LocalDateTime dateTime = LocalDateTime.of(2024, 3, 15, 10, 30);
        String format = "dd/MM/yyyy";

        // when
        String result = dateFormatUtil.getLocalDateTimeAsString(dateTime, format);

        // then
        assertThat(result).isEqualTo("15/03/2024");
    }

    @Test
    @DisplayName("Should convert LocalDateTime to string with yyyy-MM-dd format")
    void shouldConvertLocalDateTimeToStringWithDashFormat() {
        // given
        LocalDateTime dateTime = LocalDateTime.of(2024, 12, 25, 14, 45);
        String format = "yyyy-MM-dd";

        // when
        String result = dateFormatUtil.getLocalDateTimeAsString(dateTime, format);

        // then
        assertThat(result).isEqualTo("2024-12-25");
    }

    @Test
    @DisplayName("Should convert LocalDateTime to string with time components")
    void shouldConvertLocalDateTimeToStringWithTimeComponents() {
        // given
        LocalDateTime dateTime = LocalDateTime.of(2024, 6, 10, 9, 15, 30);
        String format = "dd/MM/yyyy HH:mm:ss";

        // when
        String result = dateFormatUtil.getLocalDateTimeAsString(dateTime, format);

        // then
        assertThat(result).contains("10/06/2024");
    }

    @Test
    @DisplayName("Should parse date string to LocalDateTime")
    void shouldParseDateStringToLocalDateTime() {
        // given
        String dateStr = "15/03/2024";
        String format = "dd/MM/yyyy";

        // when
        LocalDateTime result = dateFormatUtil.getDateStrAsLocalDateTime(dateStr, format);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(15);
        assertThat(result.getMonthValue()).isEqualTo(3);
        assertThat(result.getYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should parse date string with different format")
    void shouldParseDateStringWithDifferentFormat() {
        // given
        String dateStr = "2024-12-25";
        String format = "yyyy-MM-dd";

        // when
        LocalDateTime result = dateFormatUtil.getDateStrAsLocalDateTime(dateStr, format);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getYear()).isEqualTo(2024);
        assertThat(result.getMonthValue()).isEqualTo(12);
        assertThat(result.getDayOfMonth()).isEqualTo(25);
    }

    @Test
    @DisplayName("Should return current date when parsing fails")
    void shouldReturnCurrentDateWhenParsingFails() {
        // given
        String invalidDateStr = "invalid-date";
        String format = "dd/MM/yyyy";

        // when
        LocalDateTime result = dateFormatUtil.getDateStrAsLocalDateTime(invalidDateStr, format);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("Should convert Date to LocalDateTime")
    void shouldConvertDateToLocalDateTime() {
        // given
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.MARCH, 15, 0, 0, 0);
        Date date = calendar.getTime();
        String format = "dd/MM/yyyy";

        // when
        LocalDateTime result = dateFormatUtil.getDateStrAsLocalDateTime(date, format);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(15);
        assertThat(result.getMonthValue()).isEqualTo(3);
        assertThat(result.getYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should convert Date to OffsetDateTime")
    void shouldConvertDateToOffsetDateTime() {
        // given
        Date date = new Date();

        // when
        OffsetDateTime result = dateFormatUtil.convertToOffsetDateTime(date);

        // then
        assertThat(result).isNotNull();
        assertThat(result.toInstant()).isEqualTo(date.toInstant());
    }

    @Test
    @DisplayName("Should parse date string to Date object")
    void shouldParseDateStringToDateObject() {
        // given
        String dateStr = "15/03/2024";
        String format = "dd/MM/yyyy";

        // when
        Date result = dateFormatUtil.getDateStrAsDate(dateStr, format);

        // then
        assertThat(result).isNotNull();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(result);
        assertThat(calendar.get(Calendar.DAY_OF_MONTH)).isEqualTo(15);
        assertThat(calendar.get(Calendar.MONTH)).isEqualTo(Calendar.MARCH);
        assertThat(calendar.get(Calendar.YEAR)).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should return current date when parsing to Date fails")
    void shouldReturnCurrentDateWhenParsingToDateFails() {
        // given
        String invalidDateStr = "not-a-date";
        String format = "dd/MM/yyyy";

        // when
        Date result = dateFormatUtil.getDateStrAsDate(invalidDateStr, format);

        // then
        assertThat(result).isNotNull();
        assertThat(result).isBeforeOrEqualTo(new Date());
    }

    @Test
    @DisplayName("Should convert Date to formatted string")
    void shouldConvertDateToFormattedString() {
        // given
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.MARCH, 15, 0, 0, 0);
        Date date = calendar.getTime();
        String format = "dd/MM/yyyy";

        // when
        String result = dateFormatUtil.getDateAsString(date, format);

        // then
        assertThat(result).isEqualTo("15/03/2024");
    }

    @Test
    @DisplayName("Should get current date as string in default format")
    void shouldGetCurrentDateAsStringInDefaultFormat() {
        // when
        String result = dateFormatUtil.getDateAsString();

        // then
        assertThat(result).isNotNull();
        assertThat(result).matches("\\d{2}/\\d{2}/\\d{4}");
    }

    @Test
    @DisplayName("Should get current date without time")
    void shouldGetCurrentDateWithoutTime() {
        // when
        Date result = dateFormatUtil.getDate();

        // then
        assertThat(result).isNotNull();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(result);
        assertThat(calendar.get(Calendar.HOUR_OF_DAY)).isLessThanOrEqualTo(0);
        assertThat(calendar.get(Calendar.MINUTE)).isLessThanOrEqualTo(0);
        assertThat(calendar.get(Calendar.SECOND)).isLessThanOrEqualTo(0);
    }

    @Test
    @DisplayName("Should handle leap year date correctly")
    void shouldHandleLeapYearDateCorrectly() {
        // given
        String dateStr = "29/02/2024";
        String format = "dd/MM/yyyy";

        // when
        LocalDateTime result = dateFormatUtil.getDateStrAsLocalDateTime(dateStr, format);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(29);
        assertThat(result.getMonthValue()).isEqualTo(2);
        assertThat(result.getYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should handle end of year date")
    void shouldHandleEndOfYearDate() {
        // given
        String dateStr = "31/12/2024";
        String format = "dd/MM/yyyy";

        // when
        LocalDateTime result = dateFormatUtil.getDateStrAsLocalDateTime(dateStr, format);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(31);
        assertThat(result.getMonthValue()).isEqualTo(12);
        assertThat(result.getYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should handle beginning of year date")
    void shouldHandleBeginningOfYearDate() {
        // given
        String dateStr = "01/01/2024";
        String format = "dd/MM/yyyy";

        // when
        LocalDateTime result = dateFormatUtil.getDateStrAsLocalDateTime(dateStr, format);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getDayOfMonth()).isEqualTo(1);
        assertThat(result.getMonthValue()).isEqualTo(1);
        assertThat(result.getYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should convert with custom format pattern")
    void shouldConvertWithCustomFormatPattern() {
        // given
        LocalDateTime dateTime = LocalDateTime.of(2024, 7, 4, 0, 0);
        String format = "MMMM dd, yyyy";

        // when
        String result = dateFormatUtil.getLocalDateTimeAsString(dateTime, format);

        // then
        assertThat(result).contains("July");
        assertThat(result).contains("04");
        assertThat(result).contains("2024");
    }

    @Test
    @DisplayName("Should handle null check for OffsetDateTime conversion")
    void shouldHandleOffsetDateTimeConversion() {
        // given
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.JUNE, 15, 12, 30, 0);
        Date date = calendar.getTime();

        // when
        OffsetDateTime result = dateFormatUtil.convertToOffsetDateTime(date);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getOffset()).isNotNull();
    }
}
