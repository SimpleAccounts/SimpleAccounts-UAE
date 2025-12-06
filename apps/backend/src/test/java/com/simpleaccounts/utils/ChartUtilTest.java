package com.simpleaccounts.utils;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.model.ChartData;
import com.simpleaccounts.model.DashboardInvoiceDataModel;
import com.simpleaccounts.service.report.model.BankAccountTransactionReportModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChartUtil Tests")
class ChartUtilTest {

    @Mock
    private DateFormatUtil dateFormatUtil;

    @InjectMocks
    private ChartUtil chartUtil;

    @BeforeEach
    void setUp() {
        // Setup is done by @BeforeEach
    }

    @Test
    @DisplayName("Should convert Object array list to ChartData list")
    void testConvert_ValidData() {
        // Given
        List<Object[]> rows = Arrays.asList(
            new Object[]{100, "0-2024"},
            new Object[]{200, "1-2024"},
            new Object[]{300, "2-2024"}
        );

        // When
        List<ChartData> result = chartUtil.convert(rows);

        // Then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getAmount()).isEqualTo(100);
        assertThat(result.get(0).getMonth()).isEqualTo(0);
        assertThat(result.get(0).getYear()).isEqualTo(2024);
    }

    @Test
    @DisplayName("Should handle empty list in convert")
    void testConvert_EmptyList() {
        // Given
        List<Object[]> rows = new ArrayList<>();

        // When
        List<ChartData> result = chartUtil.convert(rows);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should convert LocalDateTime to Date")
    void testLocaleDateTimeToDate() {
        // Given
        LocalDateTime ldt = LocalDateTime.of(2024, 1, 15, 10, 30);

        // When
        Date result = chartUtil.localeDateTimeToDate(ldt);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(Date.class);
    }

    @Test
    @DisplayName("Should convert to transaction report model")
    void testConvertToTransactionReportModel() {
        // Given
        LocalDateTime dateTime = LocalDateTime.of(2024, 1, 15, 10, 0);
        List<Object[]> rows = Arrays.asList(
            new Object[]{new BigDecimal("100.50"), dateTime, "REF-001"},
            new Object[]{new BigDecimal("250.75"), dateTime, "REF-002"}
        );

        // When
        List<BankAccountTransactionReportModel> result =
            chartUtil.convertToTransactionReportModel(rows);

        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getAmount()).isEqualTo(new BigDecimal("100.50"));
        assertThat(result.get(0).getReference()).isEqualTo("REF-001");
        assertThat(result.get(0).getType()).isEqualTo("TYPE-TBD");
        assertThat(result.get(1).getAmount()).isEqualTo(new BigDecimal("250.75"));
        assertThat(result.get(1).getReference()).isEqualTo("REF-002");
    }

    @Test
    @DisplayName("Should add amounts from chart data")
    void testAddAmount() {
        // Given
        List<Object[]> rows = Arrays.asList(
            new Object[]{100, "0-2024"},
            new Object[]{200, "1-2024"},
            new Object[]{300, "2-2024"}
        );

        // When
        int result = chartUtil.addAmount(rows);

        // Then - sum of months (0 + 1 + 2)
        assertThat(result).isEqualTo(3);
    }

    @Test
    @DisplayName("Should populate all months with chart data")
    void testPopulateForAlltheMonths_WithData() {
        // Given
        List<ChartData> chartDatas = Arrays.asList(
            new ChartData(0, 2024, 100),
            new ChartData(2, 2024, 300)
        );

        // When
        List<ChartData> result = chartUtil.populateForAlltheMonths(chartDatas, 3);

        // Then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getAmount()).isNotNull();
    }

    @Test
    @DisplayName("Should return empty chart data when input is null")
    void testPopulateForAlltheMonths_NullInput() {
        // When
        List<ChartData> result = chartUtil.populateForAlltheMonths(null, 6);

        // Then
        assertThat(result).hasSize(6);
        assertThat(result.get(0).getAmount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return empty chart data when input list is empty")
    void testPopulateForAlltheMonths_EmptyInput() {
        // When
        List<ChartData> result = chartUtil.populateForAlltheMonths(new ArrayList<>(), 6);

        // Then
        assertThat(result).hasSize(6);
    }

    @Test
    @DisplayName("Should get start date with calendar field")
    void testGetStartDate() {
        // When
        Calendar result = chartUtil.getStartDate(Calendar.MONTH, -6);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.get(Calendar.DAY_OF_MONTH)).isEqualTo(1);
    }

    @Test
    @DisplayName("Should get end date of current month")
    void testGetEndDate() {
        // When
        Calendar result = chartUtil.getEndDate();

        // Then
        assertThat(result).isNotNull();
        Calendar now = Calendar.getInstance();
        assertThat(result.get(Calendar.MONTH)).isEqualTo(now.get(Calendar.MONTH));
    }

    @Test
    @DisplayName("Should modify date by adding days")
    void testModifyDate_AddDays() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.JANUARY, 1, 0, 0, 0);
        Date date = cal.getTime();

        // When
        Date result = chartUtil.modifyDate(date, Calendar.DAY_OF_MONTH, 5);

        // Then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance();
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.DAY_OF_MONTH)).isEqualTo(6);
    }

    @Test
    @DisplayName("Should modify date by subtracting months")
    void testModifyDate_SubtractMonths() {
        // Given
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.MARCH, 15, 0, 0, 0);
        Date date = cal.getTime();

        // When
        Date result = chartUtil.modifyDate(date, Calendar.MONTH, -2);

        // Then
        assertThat(result).isNotNull();
        Calendar resultCal = Calendar.getInstance();
        resultCal.setTime(result);
        assertThat(resultCal.get(Calendar.MONTH)).isEqualTo(Calendar.JANUARY);
    }

    @Test
    @DisplayName("Should get max value from data map")
    void testGetMaxValue_SmallNumbers() {
        // Given
        Map<Object, Number> data = new LinkedHashMap<>();
        data.put("Jan", 5);
        data.put("Feb", 8);
        data.put("Mar", 3);

        // When
        int result = chartUtil.getMaxValue(data);

        // Then - max is 8, which is less than 10, so result should be 8 * 2 = 16
        assertThat(result).isEqualTo(16);
    }

    @Test
    @DisplayName("Should get max value for large numbers")
    void testGetMaxValue_LargeNumbers() {
        // Given
        Map<Object, Number> data = new LinkedHashMap<>();
        data.put("Jan", 100);
        data.put("Feb", 200);
        data.put("Mar", 150);

        // When
        int result = chartUtil.getMaxValue(data);

        // Then - max is 200, result should be 200 + 200/5 = 240
        assertThat(result).isEqualTo(240);
    }

    @Test
    @DisplayName("Should handle null values in max value calculation")
    void testGetMaxValue_WithNullValues() {
        // Given
        Map<Object, Number> data = new LinkedHashMap<>();
        data.put("Jan", 100);
        data.put("Feb", null);
        data.put("Mar", 50);

        // When
        int result = chartUtil.getMaxValue(data);

        // Then
        assertThat(result).isEqualTo(120); // max is 100, result is 100 + 100/5
    }

    @Test
    @DisplayName("Should get cash map from rows")
    void testGetCashMap() {
        // Given
        List<Object[]> rows = Arrays.asList(
            new Object[]{100, "0-2024"},
            new Object[]{200, "1-2024"}
        );

        // When
        Map<Object, Number> result = chartUtil.getCashMap(rows, 2);

        // Then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should create cash flow data structure")
    void testGetCashFlow() {
        // Given
        Map<Object, Number> inflow = new LinkedHashMap<>();
        inflow.put("Jan", 1000);
        inflow.put("Feb", 1500);

        Map<Object, Number> outflow = new LinkedHashMap<>();
        outflow.put("Jan", 800);
        outflow.put("Feb", 1200);

        // When
        Object result = chartUtil.getCashFlow(inflow, outflow);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(Map.class);

        @SuppressWarnings("unchecked")
        Map<String, Object> cashFlowMap = (Map<String, Object>) result;
        assertThat(cashFlowMap).containsKeys("inflow", "outflow", "labels");

        @SuppressWarnings("unchecked")
        Map<String, Object> inflowMap = (Map<String, Object>) cashFlowMap.get("inflow");
        assertThat(inflowMap.get("label")).isEqualTo("Inflow");
        assertThat(inflowMap.get("sum")).isEqualTo(2500);

        @SuppressWarnings("unchecked")
        Map<String, Object> outflowMap = (Map<String, Object>) cashFlowMap.get("outflow");
        assertThat(outflowMap.get("label")).isEqualTo("Outflow");
        assertThat(outflowMap.get("sum")).isEqualTo(2000);
    }

    @Test
    @DisplayName("Should get invoice data with paid, due, and overdue")
    void testGetInvoiceData() {
        // Given
        List<Invoice> invoices = new ArrayList<>();

        Invoice paidInvoice = createInvoice(1L, CommonStatusEnum.PAID.ordinal() + 1,
            LocalDate.now(), new BigDecimal("1000"), 1);
        Invoice dueInvoice = createInvoice(2L, CommonStatusEnum.PAID.ordinal() - 1,
            LocalDate.now().plusDays(10), new BigDecimal("500"), 0);
        Invoice overdueInvoice = createInvoice(3L, CommonStatusEnum.PAID.ordinal() - 1,
            LocalDate.now().minusDays(10), new BigDecimal("750"), 0);

        invoices.add(paidInvoice);
        invoices.add(dueInvoice);
        invoices.add(overdueInvoice);

        when(dateFormatUtil.getLocalDateTimeAsString(any(), eq("MMM yyyy")))
            .thenReturn("Jan 2024");

        // When
        Object result = chartUtil.getinvoiceData(invoices, 6);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(DashboardInvoiceDataModel.class);

        DashboardInvoiceDataModel model = (DashboardInvoiceDataModel) result;
        assertThat(model.getLabels()).hasSize(6);
        assertThat(model.getPaid()).isNotNull();
        assertThat(model.getDue()).isNotNull();
        assertThat(model.getOverDue()).isNotNull();
    }

    @Test
    @DisplayName("Should separate customer and supplier invoices")
    void testGetInvoiceData_CustomerAndSupplier() {
        // Given
        List<Invoice> invoices = new ArrayList<>();

        Invoice customerInvoice = createInvoice(1L, CommonStatusEnum.PAID.ordinal() + 1,
            LocalDate.now(), new BigDecimal("1000"), 0);
        Invoice supplierInvoice = createInvoice(2L, CommonStatusEnum.PAID.ordinal() + 1,
            LocalDate.now(), new BigDecimal("2000"), 1);

        invoices.add(customerInvoice);
        invoices.add(supplierInvoice);

        when(dateFormatUtil.getLocalDateTimeAsString(any(), eq("MMM yyyy")))
            .thenReturn("Jan 2024");

        // When
        Object result = chartUtil.getinvoiceData(invoices, 3);

        // Then
        assertThat(result).isNotNull();
        DashboardInvoiceDataModel model = (DashboardInvoiceDataModel) result;
        assertThat(model.getCustomer()).isNotNull();
        assertThat(model.getSupplier()).isNotNull();
    }

    @Test
    @DisplayName("Should handle empty invoice list")
    void testGetInvoiceData_EmptyList() {
        // Given
        List<Invoice> invoices = new ArrayList<>();

        // When
        Object result = chartUtil.getinvoiceData(invoices, 6);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(DashboardInvoiceDataModel.class);
    }

    @Test
    @DisplayName("Should get empty cash map for zero count")
    void testGetCashMap_ZeroCount() {
        // Given
        List<Object[]> rows = Arrays.asList(
            new Object[]{100, "0-2024"}
        );

        // When
        Map<Object, Number> result = chartUtil.getCashMap(rows, 0);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle max value calculation with empty map")
    void testGetMaxValue_EmptyMap() {
        // Given
        Map<Object, Number> data = new LinkedHashMap<>();

        // When
        int result = chartUtil.getMaxValue(data);

        // Then
        assertThat(result).isEqualTo(0);
    }

    @Test
    @DisplayName("Should convert zero amount correctly")
    void testConvert_WithZeroAmount() {
        // Given
        List<Object[]> rows = Arrays.asList(
            new Object[]{0, "0-2024"}
        );

        // When
        List<ChartData> result = chartUtil.convert(rows);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAmount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle LocalDateTime conversion for current date")
    void testLocaleDateTimeToDate_CurrentDate() {
        // Given
        LocalDateTime now = LocalDateTime.now();

        // When
        Date result = chartUtil.localeDateTimeToDate(now);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isBeforeOrEqualTo(new Date());
    }

    // Helper method to create test invoice
    private Invoice createInvoice(Long id, int status, LocalDate dueDate,
                                   BigDecimal amount, int type) {
        Invoice invoice = new Invoice();
        invoice.setId(id);
        invoice.setStatus(status);
        invoice.setInvoiceDueDate(dueDate);
        invoice.setTotalAmount(amount);
        invoice.setType(type);
        invoice.setInvoiceDate(LocalDate.now());
        return invoice;
    }
}
