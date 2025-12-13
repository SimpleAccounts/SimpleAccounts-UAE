package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.simpleaccounts.model.ChartData;
import com.simpleaccounts.service.report.model.BankAccountTransactionReportModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChartUtil Tests")
class ChartUtilTest {

    @Mock
    private DateFormatUtil dateFormatUtil;

    private ChartUtil chartUtil;

    @BeforeEach
    void setUp() {
        chartUtil = new ChartUtil(dateFormatUtil);
    }

    @Nested
    @DisplayName("convert Tests")
    class ConvertTests {

        @Test
        @DisplayName("Should convert row data to ChartData list")
        void shouldConvertRowDataToChartDataList() {
            // given
            List<Object[]> rows = new ArrayList<>();
            rows.add(new Object[]{100, "3-2024"}); // Month 3 (March), Year 2024
            rows.add(new Object[]{200, "4-2024"}); // Month 4 (April), Year 2024

            // when
            List<ChartData> result = chartUtil.convert(rows);

            // then
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getMonth()).isEqualTo(2); // 0-indexed (March = 2)
            assertThat(result.get(0).getYear()).isEqualTo(2024);
            assertThat(result.get(0).getAmount()).isEqualTo(100);
        }

        @Test
        @DisplayName("Should return empty list for empty input")
        void shouldReturnEmptyListForEmptyInput() {
            // given
            List<Object[]> rows = new ArrayList<>();

            // when
            List<ChartData> result = chartUtil.convert(rows);

            // then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("convertToTransactionReportModel Tests")
    class ConvertToTransactionReportModelTests {

        @Test
        @DisplayName("Should convert rows to transaction report models")
        void shouldConvertRowsToTransactionReportModels() {
            // given
            LocalDateTime transactionDate = LocalDateTime.of(2024, 3, 15, 10, 30);
            List<Object[]> rows = new ArrayList<>();
            rows.add(new Object[]{new BigDecimal("100.50"), transactionDate, "REF-001"});

            // when
            List<BankAccountTransactionReportModel> result = chartUtil.convertToTransactionReportModel(rows);

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getAmount()).isEqualTo(new BigDecimal("100.50"));
            assertThat(result.get(0).getReference()).isEqualTo("REF-001");
            assertThat(result.get(0).getType()).isEqualTo("TYPE-TBD");
            assertThat(result.get(0).getTransaction()).isEqualTo("TRANSACTION-TBD");
        }

        @Test
        @DisplayName("Should return empty list for empty input")
        void shouldReturnEmptyListForEmptyInput() {
            // when
            List<BankAccountTransactionReportModel> result = chartUtil.convertToTransactionReportModel(new ArrayList<>());

            // then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("addAmount Tests")
    class AddAmountTests {

        @Test
        @DisplayName("Should sum month values from row data")
        void shouldSumMonthValuesFromRowData() {
            // given
            List<Object[]> rows = new ArrayList<>();
            rows.add(new Object[]{100, "1-2024"});
            rows.add(new Object[]{200, "2-2024"});
            rows.add(new Object[]{300, "3-2024"});

            // when
            int result = chartUtil.addAmount(rows);

            // then
            // Sum of months: 0 + 1 + 2 = 3 (0-indexed months)
            assertThat(result).isEqualTo(3);
        }
    }

    @Nested
    @DisplayName("populateForAlltheMonths Tests")
    class PopulateForAllMonthsTests {

        @Test
        @DisplayName("Should return empty chart data when input is null")
        void shouldReturnEmptyChartDataWhenInputIsNull() {
            // when
            List<ChartData> result = chartUtil.populateForAlltheMonths(null, 3);

            // then
            assertThat(result).hasSize(3);
            // All amounts should be 0
            result.forEach(cd -> assertThat(cd.getAmount()).isEqualTo(0));
        }

        @Test
        @DisplayName("Should return empty chart data when input is empty")
        void shouldReturnEmptyChartDataWhenInputIsEmpty() {
            // when
            List<ChartData> result = chartUtil.populateForAlltheMonths(new ArrayList<>(), 3);

            // then
            assertThat(result).hasSize(3);
        }

        @Test
        @DisplayName("Should populate missing months with zero")
        void shouldPopulateMissingMonthsWithZero() {
            // given
            Calendar cal = Calendar.getInstance();
            int currentMonth = cal.get(Calendar.MONTH);
            int currentYear = cal.get(Calendar.YEAR);

            List<ChartData> chartDatas = new ArrayList<>();
            chartDatas.add(new ChartData(currentMonth, currentYear, 100));

            // when
            List<ChartData> result = chartUtil.populateForAlltheMonths(chartDatas, 3);

            // then
            assertThat(result).hasSize(3);
        }
    }

    @Nested
    @DisplayName("getCashMap Tests")
    class GetCashMapTests {

        @Test
        @DisplayName("Should create cash map from row data")
        void shouldCreateCashMapFromRowData() {
            // given
            List<Object[]> rows = new ArrayList<>();
            rows.add(new Object[]{100, "3-2024"});

            // when
            Map<Object, Number> result = chartUtil.getCashMap(rows, 1);

            // then
            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should handle empty row data")
        void shouldHandleEmptyRowData() {
            // when
            Map<Object, Number> result = chartUtil.getCashMap(new ArrayList<>(), 3);

            // then
            assertThat(result).isNotNull();
            assertThat(result).hasSize(3);
        }
    }

    @Nested
    @DisplayName("getStartDate and getEndDate Tests")
    class DateRangeTests {

        @Test
        @DisplayName("Should return start date with first day of month")
        void shouldReturnStartDateWithFirstDayOfMonth() {
            // when
            Calendar result = chartUtil.getStartDate(Calendar.MONTH, -3);

            // then
            assertThat(result.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
        }

        @Test
        @DisplayName("Should return end date at last day of current month")
        void shouldReturnEndDateAtLastDayOfCurrentMonth() {
            // when
            Calendar result = chartUtil.getEndDate();

            // then
            Calendar nextMonth = Calendar.getInstance();
            nextMonth.add(Calendar.MONTH, 1);
            nextMonth.set(Calendar.DAY_OF_MONTH, 1);
            nextMonth.add(Calendar.DAY_OF_MONTH, -1);

            assertThat(result.get(Calendar.DAY_OF_MONTH)).isEqualTo(nextMonth.get(Calendar.DAY_OF_MONTH));
        }
    }

    @Nested
    @DisplayName("modifyDate Tests")
    class ModifyDateTests {

        @Test
        @DisplayName("Should add days to date")
        void shouldAddDaysToDate() {
            // given
            Calendar cal = Calendar.getInstance();
            cal.set(2024, Calendar.MARCH, 15);
            Date date = cal.getTime();

            // when
            Date result = chartUtil.modifyDate(date, Calendar.DAY_OF_MONTH, 5);

            // then
            Calendar resultCal = Calendar.getInstance();
            resultCal.setTime(result);
            assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(20);
        }

        @Test
        @DisplayName("Should subtract months from date")
        void shouldSubtractMonthsFromDate() {
            // given
            Calendar cal = Calendar.getInstance();
            cal.set(2024, Calendar.MARCH, 15);
            Date date = cal.getTime();

            // when
            Date result = chartUtil.modifyDate(date, Calendar.MONTH, -2);

            // then
            Calendar resultCal = Calendar.getInstance();
            resultCal.setTime(result);
            assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(Calendar.JANUARY);
        }
    }

    @Nested
    @DisplayName("getMaxValue Tests")
    class GetMaxValueTests {

        @Test
        @DisplayName("Should return scaled max value when max is greater than 10")
        void shouldReturnScaledMaxValueWhenGreaterThan10() {
            // given
            Map<Object, Number> data = new LinkedHashMap<>();
            data.put("Jan", 50);
            data.put("Feb", 100);
            data.put("Mar", 75);

            // when
            int result = chartUtil.getMaxValue(data);

            // then
            // max = 100, result = 100 + 100/5 = 120
            assertThat(result).isEqualTo(120);
        }

        @Test
        @DisplayName("Should return doubled max value when max is less than 10")
        void shouldReturnDoubledMaxValueWhenLessThan10() {
            // given
            Map<Object, Number> data = new LinkedHashMap<>();
            data.put("Jan", 3);
            data.put("Feb", 5);
            data.put("Mar", 4);

            // when
            int result = chartUtil.getMaxValue(data);

            // then
            // max = 5, result = 5 * 2 = 10
            assertThat(result).isEqualTo(10);
        }

        @Test
        @DisplayName("Should handle null values in map")
        void shouldHandleNullValuesInMap() {
            // given
            Map<Object, Number> data = new LinkedHashMap<>();
            data.put("Jan", 50);
            data.put("Feb", null);
            data.put("Mar", 30);

            // when
            int result = chartUtil.getMaxValue(data);

            // then
            // max = 50, result = 50 + 50/5 = 60
            assertThat(result).isEqualTo(60);
        }

        @Test
        @DisplayName("Should handle empty map")
        void shouldHandleEmptyMap() {
            // given
            Map<Object, Number> data = new LinkedHashMap<>();

            // when
            int result = chartUtil.getMaxValue(data);

            // then
            assertThat(result).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("localeDateTimeToDate Tests")
    class LocaleDateTimeToDateTests {

        @Test
        @DisplayName("Should convert LocalDateTime to Date")
        void shouldConvertLocalDateTimeToDate() {
            // given
            LocalDateTime ldt = LocalDateTime.of(2024, 3, 15, 10, 30, 0);

            // when
            Date result = chartUtil.localeDateTimeToDate(ldt);

            // then
            assertThat(result).isNotNull();
            Calendar cal = Calendar.getInstance();
            cal.setTime(result);
            assertThat(cal.get(Calendar.YEAR)).isEqualTo(2024);
            assertThat(cal.get(Calendar.MONTH)).isEqualTo(Calendar.MARCH);
            assertThat(cal.get(Calendar.DAY_OF_MONTH)).isEqualTo(15);
        }
    }

    @Nested
    @DisplayName("getCashFlow Tests")
    class GetCashFlowTests {

        @Test
        @DisplayName("Should create cash flow model with inflow and outflow data")
        void shouldCreateCashFlowModelWithInflowAndOutflowData() {
            // given
            Map<Object, Number> inflow = new LinkedHashMap<>();
            inflow.put("Jan", 1000);
            inflow.put("Feb", 2000);
            inflow.put("Mar", 1500);

            Map<Object, Number> outflow = new LinkedHashMap<>();
            outflow.put("Jan", 800);
            outflow.put("Feb", 1200);
            outflow.put("Mar", 900);

            // when
            Object result = chartUtil.getCashFlow(inflow, outflow);

            // then
            assertThat(result).isNotNull();
            assertThat(result).isInstanceOf(Map.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) result;
            assertThat(map).containsKeys("inflow", "outflow", "labels");

            @SuppressWarnings("unchecked")
            Map<String, Object> inflowMap = (Map<String, Object>) map.get("inflow");
            assertThat(inflowMap.get("label")).isEqualTo("Inflow");
            assertThat(inflowMap.get("sum")).isEqualTo(4500); // 1000 + 2000 + 1500

            @SuppressWarnings("unchecked")
            Map<String, Object> outflowMap = (Map<String, Object>) map.get("outflow");
            assertThat(outflowMap.get("label")).isEqualTo("Outflow");
            assertThat(outflowMap.get("sum")).isEqualTo(2900); // 800 + 1200 + 900
        }

        @Test
        @DisplayName("Should include months as labels")
        void shouldIncludeMonthsAsLabels() {
            // given
            Map<Object, Number> inflow = new LinkedHashMap<>();
            inflow.put("Jan-24", 1000);
            inflow.put("Feb-24", 2000);

            Map<Object, Number> outflow = new LinkedHashMap<>();
            outflow.put("Jan-24", 800);
            outflow.put("Feb-24", 1200);

            // when
            Object result = chartUtil.getCashFlow(inflow, outflow);

            // then
            @SuppressWarnings("unchecked")
            Map<String, Object> map = (Map<String, Object>) result;
            @SuppressWarnings("unchecked")
            List<Object> labels = (List<Object>) map.get("labels");
            assertThat(labels).containsExactly("Jan-24", "Feb-24");
        }
    }

    @Nested
    @DisplayName("ChartData Key Generation Tests")
    class ChartDataKeyTests {

        @ParameterizedTest(name = "Month {0} in year {1} should generate key {2}")
        @CsvSource({
            "0, 2024, Jan-24",
            "1, 2024, Feb-24",
            "11, 2024, Dec-24",
            "5, 2023, Jun-23"
        })
        @DisplayName("Should generate correct key from ChartData")
        void shouldGenerateCorrectKeyFromChartData(int month, int year, String expectedKey) {
            // given
            ChartData chartData = new ChartData(month, year, 100);

            // when
            String key = chartData.getKey();

            // then
            assertThat(key).isEqualTo(expectedKey);
        }
    }
}
