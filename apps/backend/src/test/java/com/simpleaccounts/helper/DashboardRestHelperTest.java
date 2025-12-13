package com.simpleaccounts.helper;

import com.simpleaccounts.rest.dashboardcontroller.DateRequestModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("DashboardRestHelper Tests")
class DashboardRestHelperTest {

    private DashboardRestHelper helper;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @BeforeEach
    void setUp() {
        helper = new DashboardRestHelper();
    }

    @Nested
    @DisplayName("getStartDateEndDateForEveryMonth Tests")
    class GetStartDateEndDateForEveryMonthTests {

        @Test
        @DisplayName("Should return requested month count")
        void shouldReturnRequestedMonthCount() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(3);

            // then
            assertThat(ranges).hasSize(3);
        }

        @ParameterizedTest(name = "Requesting {0} months should return {0} ranges")
        @ValueSource(ints = {1, 3, 6, 12})
        @DisplayName("Should return correct number of date ranges for valid month counts")
        void shouldReturnCorrectNumberOfDateRangesForValidMonthCounts(int monthCount) {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(monthCount);

            // then
            assertThat(ranges).hasSize(monthCount);
        }

        @Test
        @DisplayName("Should clamp month count between one and twelve")
        void shouldClampMonthCountBetweenOneAndTwelve() {
            // then
            assertThat(helper.getStartDateEndDateForEveryMonth(null)).hasSize(12);
            assertThat(helper.getStartDateEndDateForEveryMonth(24)).hasSize(12);
            assertThat(helper.getStartDateEndDateForEveryMonth(-5)).hasSize(1);
        }

        @Test
        @DisplayName("Should return 12 months for null input")
        void shouldReturn12MonthsForNullInput() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(null);

            // then
            assertThat(ranges).hasSize(12);
        }

        @ParameterizedTest(name = "Exceeding max value {0} should be capped to 12")
        @ValueSource(ints = {13, 24, 100, 1000})
        @DisplayName("Should cap month count to 12 for values exceeding max")
        void shouldCapMonthCountTo12ForValuesExceedingMax(int exceedingValue) {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(exceedingValue);

            // then
            assertThat(ranges).hasSize(12);
        }

        @ParameterizedTest(name = "Negative value {0} should be normalized to 1")
        @ValueSource(ints = {-1, -5, -10, -100})
        @DisplayName("Should normalize negative values to 1")
        void shouldNormalizeNegativeValuesToOne(int negativeValue) {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(negativeValue);

            // then
            assertThat(ranges).hasSize(1);
        }

        @Test
        @DisplayName("Should normalize zero to 1")
        void shouldNormalizeZeroToOne() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(0);

            // then
            assertThat(ranges).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Date Range Ordering Tests")
    class DateRangeOrderingTests {

        @Test
        @DisplayName("Should return date ranges ordered from past to present")
        void shouldReturnDateRangesOrderedFromPastToPresent() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(3);

            // then
            assertThat(ranges).hasSize(3);

            // Parse start dates and verify ordering
            LocalDate firstStart = LocalDate.parse(ranges.get(0).getStartDate(), DATE_FORMATTER);
            LocalDate secondStart = LocalDate.parse(ranges.get(1).getStartDate(), DATE_FORMATTER);
            LocalDate thirdStart = LocalDate.parse(ranges.get(2).getStartDate(), DATE_FORMATTER);

            assertThat(firstStart).isBefore(secondStart);
            assertThat(secondStart).isBefore(thirdStart);
        }

        @Test
        @DisplayName("Should have last range ending in current month")
        void shouldHaveLastRangeEndingInCurrentMonth() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(6);

            // then
            DateRequestModel lastRange = ranges.get(ranges.size() - 1);
            LocalDate endDate = LocalDate.parse(lastRange.getEndDate(), DATE_FORMATTER);
            LocalDate now = LocalDate.now();

            assertThat(endDate.getMonth()).isEqualTo(now.getMonth());
            assertThat(endDate.getYear()).isEqualTo(now.getYear());
        }
    }

    @Nested
    @DisplayName("Date Format Tests")
    class DateFormatTests {

        @Test
        @DisplayName("Should return dates in dd/MM/yyyy format")
        void shouldReturnDatesInCorrectFormat() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(1);

            // then
            assertThat(ranges).hasSize(1);
            DateRequestModel range = ranges.get(0);

            // Verify format matches dd/MM/yyyy pattern
            assertThat(range.getStartDate()).matches("\\d{2}/\\d{2}/\\d{4}");
            assertThat(range.getEndDate()).matches("\\d{2}/\\d{2}/\\d{4}");
        }

        @Test
        @DisplayName("Should have start date on first day of month")
        void shouldHaveStartDateOnFirstDayOfMonth() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(3);

            // then
            for (DateRequestModel range : ranges) {
                LocalDate startDate = LocalDate.parse(range.getStartDate(), DATE_FORMATTER);
                assertThat(startDate.getDayOfMonth()).isEqualTo(1);
            }
        }

        @Test
        @DisplayName("Should have end date on last day of month")
        void shouldHaveEndDateOnLastDayOfMonth() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(3);

            // then
            for (DateRequestModel range : ranges) {
                LocalDate startDate = LocalDate.parse(range.getStartDate(), DATE_FORMATTER);
                LocalDate endDate = LocalDate.parse(range.getEndDate(), DATE_FORMATTER);

                // End date should be in the same month as start date
                assertThat(endDate.getMonth()).isEqualTo(startDate.getMonth());

                // End date should be the last day of the month
                int lastDayOfMonth = startDate.lengthOfMonth();
                assertThat(endDate.getDayOfMonth()).isEqualTo(lastDayOfMonth);
            }
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle single month request")
        void shouldHandleSingleMonthRequest() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(1);

            // then
            assertThat(ranges).hasSize(1);
            DateRequestModel range = ranges.get(0);
            assertThat(range.getStartDate()).isNotNull();
            assertThat(range.getEndDate()).isNotNull();
        }

        @Test
        @DisplayName("Should handle maximum allowed months (12)")
        void shouldHandleMaximumAllowedMonths() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(12);

            // then
            assertThat(ranges).hasSize(12);

            // All ranges should be non-null and valid
            for (DateRequestModel range : ranges) {
                assertThat(range.getStartDate()).isNotNull().isNotEmpty();
                assertThat(range.getEndDate()).isNotNull().isNotEmpty();
            }
        }

        @Test
        @DisplayName("Should have consistent range duration (full month)")
        void shouldHaveConsistentRangeDuration() {
            // when
            List<DateRequestModel> ranges = helper.getStartDateEndDateForEveryMonth(6);

            // then
            for (DateRequestModel range : ranges) {
                LocalDate startDate = LocalDate.parse(range.getStartDate(), DATE_FORMATTER);
                LocalDate endDate = LocalDate.parse(range.getEndDate(), DATE_FORMATTER);

                // Start should be first day
                assertThat(startDate.getDayOfMonth()).isEqualTo(1);
                // End should be last day of same month
                assertThat(endDate.getDayOfMonth()).isEqualTo(startDate.lengthOfMonth());
            }
        }
    }
}
