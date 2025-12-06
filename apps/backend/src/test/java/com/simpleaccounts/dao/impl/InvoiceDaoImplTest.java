package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.dao.JournalDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.EarningDetailsModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.InvoiceOverDueModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rest.financialreport.VatReportFilingRequestModel;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.DateUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DateUtils dateUtil;

    @Mock
    private DateFormatUtil dateUtils;

    @Mock
    private DatatableSortingFilterConstant datatableUtil;

    @Mock
    private JournalDao journalDao;

    @Mock
    private JournalLineItemDao journalLineItemDao;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @Mock
    private VatReportFilingRepository vatReportFilingRepository;

    @Mock
    private UserService userService;

    @Mock
    private TypedQuery<Invoice> typedQuery;

    @Mock
    private TypedQuery<DropdownModel> dropdownQuery;

    @Mock
    private TypedQuery<BigDecimal> bigDecimalQuery;

    @Mock
    private TypedQuery<InvoiceOverDueModel> invoiceOverDueQuery;

    @Mock
    private Query query;

    @InjectMocks
    private InvoiceDaoImpl invoiceDao;

    private Invoice testInvoice;
    private Contact testContact;

    @BeforeEach
    void setUp() {
        testContact = new Contact();
        testContact.setContactId(1);
        testContact.setName("Test Contact");

        testInvoice = new Invoice();
        testInvoice.setId(1);
        testInvoice.setInvoiceNumber("INV-001");
        testInvoice.setContact(testContact);
        testInvoice.setTotalAmount(BigDecimal.valueOf(1000));
        testInvoice.setStatus(CommonStatusEnum.POST.getValue());
        testInvoice.setDeleteFlag(false);
    }

    @Test
    void testGetInvoiceList_Success() {
        // Arrange
        Map<InvoiceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setSortingCol("invoiceNumber");

        when(datatableUtil.getColName(anyString(), anyString())).thenReturn("i.invoiceNumber");

        // Act
        PaginationResponseModel result = invoiceDao.getInvoiceList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(datatableUtil).getColName(anyString(), eq(DatatableSortingFilterConstant.INVOICE));
    }

    @Test
    void testGetInvoicesForDropdown_Success() {
        // Arrange
        List<DropdownModel> dropdownList = Arrays.asList(
                new DropdownModel(1, "Invoice 1"),
                new DropdownModel(2, "Invoice 2")
        );
        when(entityManager.createNamedQuery("invoiceForDropdown", DropdownModel.class))
                .thenReturn(dropdownQuery);
        when(dropdownQuery.setParameter("type", 1)).thenReturn(dropdownQuery);
        when(dropdownQuery.getResultList()).thenReturn(dropdownList);

        // Act
        List<DropdownModel> result = invoiceDao.getInvoicesForDropdown(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1);
        verify(dropdownQuery).setParameter("type", 1);
        verify(dropdownQuery).getResultList();
    }

    @Test
    void testGetInvoicesForDropdown_EmptyResult() {
        // Arrange
        when(entityManager.createNamedQuery("invoiceForDropdown", DropdownModel.class))
                .thenReturn(dropdownQuery);
        when(dropdownQuery.setParameter("type", 2)).thenReturn(dropdownQuery);
        when(dropdownQuery.getResultList()).thenReturn(Collections.emptyList());

        // Act
        List<DropdownModel> result = invoiceDao.getInvoicesForDropdown(2);

        // Assert
        assertThat(result).isEmpty();
        verify(dropdownQuery).getResultList();
    }

    @Test
    void testGetLastInvoice_Found() {
        // Arrange
        List<Invoice> invoices = Collections.singletonList(testInvoice);
        when(entityManager.createNamedQuery("lastInvoice", Invoice.class)).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", 1)).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(1)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(invoices);

        // Act
        Invoice result = invoiceDao.getLastInvoice(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getInvoiceNumber()).isEqualTo("INV-001");
        verify(typedQuery).setMaxResults(1);
    }

    @Test
    void testGetLastInvoice_NotFound() {
        // Arrange
        when(entityManager.createNamedQuery("lastInvoice", Invoice.class)).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", 1)).thenReturn(typedQuery);
        when(typedQuery.setMaxResults(1)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Collections.emptyList());

        // Act
        Invoice result = invoiceDao.getLastInvoice(1);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void testGetInvoiceListByDateRange_Success() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();
        LocalDateTime localDateTime = LocalDateTime.now();
        List<Invoice> invoices = Arrays.asList(testInvoice);

        when(dateUtil.get(startDate)).thenReturn(localDateTime);
        when(dateUtil.get(endDate)).thenReturn(localDateTime);
        when(entityManager.createNamedQuery("activeInvoicesByDateRange", Invoice.class))
                .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("startDate"), any(LocalDate.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("endDate"), any(LocalDate.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(invoices);

        // Act
        List<Invoice> result = invoiceDao.getInvoiceList(startDate, endDate);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(typedQuery, times(2)).setParameter(anyString(), any(LocalDate.class));
    }

    @Test
    void testGetInvoiceListByDateRange_EmptyResult() {
        // Arrange
        Date startDate = new Date();
        Date endDate = new Date();
        LocalDateTime localDateTime = LocalDateTime.now();

        when(dateUtil.get(startDate)).thenReturn(localDateTime);
        when(dateUtil.get(endDate)).thenReturn(localDateTime);
        when(entityManager.createNamedQuery("activeInvoicesByDateRange", Invoice.class))
                .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("startDate"), any(LocalDate.class))).thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("endDate"), any(LocalDate.class))).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(null);

        // Act
        List<Invoice> result = invoiceDao.getInvoiceList(startDate, endDate);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void testGetTotalEarnings_Success() {
        // Arrange
        BigDecimal paidAmount = BigDecimal.valueOf(5000);
        LocalDateTime localDateTime = LocalDateTime.now();

        when(dateUtil.get(any(Date.class))).thenReturn(localDateTime);
        when(entityManager.createNamedQuery("getTotalPaidCustomerInvoice", BigDecimal.class))
                .thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("currentDate"), any())).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setMaxResults(1)).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.getSingleResult()).thenReturn(paidAmount);

        when(entityManager.createNamedQuery("getPaidCustomerInvoiceEarningsWeeklyMonthly", BigDecimal.class))
                .thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("startDate"), any())).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("endDate"), any())).thenReturn(bigDecimalQuery);

        // Act
        EarningDetailsModel result = invoiceDao.getTotalEarnings();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalEarnings()).isEqualTo(5000.0f);
    }

    @Test
    void testGetTotalEarnings_NullAmount() {
        // Arrange
        LocalDateTime localDateTime = LocalDateTime.now();

        when(dateUtil.get(any(Date.class))).thenReturn(localDateTime);
        when(entityManager.createNamedQuery("getTotalPaidCustomerInvoice", BigDecimal.class))
                .thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("currentDate"), any())).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setMaxResults(1)).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.getSingleResult()).thenReturn(null);

        when(entityManager.createNamedQuery("getPaidCustomerInvoiceEarningsWeeklyMonthly", BigDecimal.class))
                .thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("startDate"), any())).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("endDate"), any())).thenReturn(bigDecimalQuery);

        // Act
        EarningDetailsModel result = invoiceDao.getTotalEarnings();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalEarnings()).isEqualTo(0.0f);
    }

    @Test
    void testGetUnpaidInvoice_Success() {
        // Arrange
        List<Invoice> unpaidInvoices = Arrays.asList(testInvoice);
        when(entityManager.createNamedQuery("unpaidInvoices", Invoice.class)).thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("status"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter("id", 1)).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", ContactTypeEnum.CUSTOMER.getValue())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(unpaidInvoices);

        // Act
        List<Invoice> result = invoiceDao.getUnpaidInvoice(1, ContactTypeEnum.CUSTOMER);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(typedQuery).setParameter(eq("status"), anyList());
    }

    @Test
    void testGetUnpaidInvoice_EmptyResult() {
        // Arrange
        when(entityManager.createNamedQuery("unpaidInvoices", Invoice.class)).thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("status"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter("id", 1)).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", ContactTypeEnum.SUPPLIER.getValue())).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Collections.emptyList());

        // Act
        List<Invoice> result = invoiceDao.getUnpaidInvoice(1, ContactTypeEnum.SUPPLIER);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void testGetSuggestionUnpaidInvoices_NonAdminUser() {
        // Arrange
        User user = new User();
        Role role = new Role();
        role.setRoleCode(2);
        user.setRole(role);
        Company company = new Company();
        CurrencyCode currencyCode = new CurrencyCode();
        currencyCode.setCurrencyCode(1);
        company.setCurrencyCode(currencyCode);
        user.setCompany(company);

        List<Invoice> invoices = Arrays.asList(testInvoice);

        when(userService.findByPK(1)).thenReturn(user);
        when(entityManager.createNamedQuery("suggestionUnpaidInvoices", Invoice.class))
                .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("status"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("currency"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", ContactTypeEnum.CUSTOMER.getValue())).thenReturn(typedQuery);
        when(typedQuery.setParameter("id", 1)).thenReturn(typedQuery);
        when(typedQuery.setParameter("userId", 1)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(invoices);

        // Act
        List<Invoice> result = invoiceDao.getSuggestionUnpaidInvoices(
                BigDecimal.valueOf(1000), 1, ContactTypeEnum.CUSTOMER, 1, 1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(entityManager).createNamedQuery("suggestionUnpaidInvoices", Invoice.class);
    }

    @Test
    void testGetSuggestionUnpaidInvoices_AdminUser() {
        // Arrange
        User user = new User();
        Role role = new Role();
        role.setRoleCode(1);
        user.setRole(role);
        Company company = new Company();
        CurrencyCode currencyCode = new CurrencyCode();
        currencyCode.setCurrencyCode(1);
        company.setCurrencyCode(currencyCode);
        user.setCompany(company);

        List<Invoice> invoices = Arrays.asList(testInvoice);

        when(userService.findByPK(1)).thenReturn(user);
        when(entityManager.createNamedQuery("suggestionUnpaidInvoicesAdmin", Invoice.class))
                .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("status"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("currency"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", ContactTypeEnum.CUSTOMER.getValue())).thenReturn(typedQuery);
        when(typedQuery.setParameter("id", 1)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(invoices);

        // Act
        List<Invoice> result = invoiceDao.getSuggestionUnpaidInvoices(
                BigDecimal.valueOf(1000), 1, ContactTypeEnum.CUSTOMER, 1, 1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(entityManager).createNamedQuery("suggestionUnpaidInvoicesAdmin", Invoice.class);
    }

    @Test
    void testGetSuggestionExplainedInvoices_Success() {
        // Arrange
        List<Invoice> invoices = Arrays.asList(testInvoice);
        when(entityManager.createNamedQuery("suggestionExplainedInvoices", Invoice.class))
                .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("status"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter("currency", 1)).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", ContactTypeEnum.CUSTOMER.getValue())).thenReturn(typedQuery);
        when(typedQuery.setParameter("id", 1)).thenReturn(typedQuery);
        when(typedQuery.setParameter("userId", 1)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(invoices);

        // Act
        List<Invoice> result = invoiceDao.getSuggestionExplainedInvoices(
                BigDecimal.valueOf(1000), 1, ContactTypeEnum.CUSTOMER, 1, 1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    void testGetTotalInvoiceCountByContactId_Success() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("contactId", 1)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(5L));

        // Act
        Integer result = invoiceDao.getTotalInvoiceCountByContactId(1);

        // Assert
        assertThat(result).isEqualTo(5);
        verify(query).setParameter("contactId", 1);
    }

    @Test
    void testGetTotalInvoiceCountByContactId_NoResults() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("contactId", 1)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.emptyList());

        // Act
        Integer result = invoiceDao.getTotalInvoiceCountByContactId(1);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void testGetReceiptCountByCustInvoiceId_Success() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("invoiceId", 1)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(3L));

        // Act
        Integer result = invoiceDao.getReceiptCountByCustInvoiceId(1);

        // Assert
        assertThat(result).isEqualTo(3);
    }

    @Test
    void testGetReceiptCountBySupInvoiceId_Success() {
        // Arrange
        when(entityManager.createQuery(anyString())).thenReturn(query);
        when(query.setParameter("invoiceId", 1)).thenReturn(query);
        when(query.getResultList()).thenReturn(Collections.singletonList(2L));

        // Act
        Integer result = invoiceDao.getReceiptCountBySupInvoiceId(1);

        // Assert
        assertThat(result).isEqualTo(2);
    }

    @Test
    void testSumOfTotalAmountWithoutVat_WithUnFiledStatus() {
        // Arrange
        ReportRequestModel reportRequestModel = new ReportRequestModel();
        reportRequestModel.setStartDate("01/01/2024");
        reportRequestModel.setEndDate("31/01/2024");

        VatReportResponseModel vatReportResponseModel = new VatReportResponseModel();
        VatReportFiling vatReportFiling = new VatReportFiling();
        vatReportFiling.setStatus(CommonStatusEnum.UN_FILED.getValue());

        when(vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(any(), any()))
                .thenReturn(vatReportFiling);
        when(entityManager.createQuery(anyString(), eq(BigDecimal.class))).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("startDate"), any())).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("endDate"), any())).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter(eq("editFlag"), any())).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.getSingleResult()).thenReturn(BigDecimal.valueOf(1000));

        // Act
        invoiceDao.sumOfTotalAmountWithoutVat(reportRequestModel, vatReportResponseModel);

        // Assert
        assertThat(vatReportResponseModel.getZeroRatedSupplies()).isEqualTo(BigDecimal.valueOf(1000));
    }

    @Test
    void testGetTotalInputVatAmount_Success() {
        // Arrange
        VatReportFilingRequestModel request = new VatReportFilingRequestModel();
        request.setStartDate("01/01/2024");
        request.setEndDate("31/01/2024");

        LocalDateTime localDateTime = LocalDateTime.now();
        when(dateUtils.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(localDateTime);
        when(entityManager.createNamedQuery("totalInputVatAmount", BigDecimal.class))
                .thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter("startDate", localDateTime)).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter("endDate", localDateTime)).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.getSingleResult()).thenReturn(BigDecimal.valueOf(500));

        // Act
        BigDecimal result = invoiceDao.getTotalInputVatAmount(request);

        // Assert
        assertThat(result).isEqualTo(BigDecimal.valueOf(500));
    }

    @Test
    void testGetTotalOutputVatAmount_Success() {
        // Arrange
        VatReportFilingRequestModel request = new VatReportFilingRequestModel();
        request.setStartDate("01/01/2024");
        request.setEndDate("31/01/2024");

        LocalDateTime localDateTime = LocalDateTime.now();
        when(dateUtils.getDateStrAsLocalDateTime(anyString(), anyString())).thenReturn(localDateTime);
        when(entityManager.createNamedQuery("totalOutputVatAmount", BigDecimal.class))
                .thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter("startDate", localDateTime)).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.setParameter("endDate", localDateTime)).thenReturn(bigDecimalQuery);
        when(bigDecimalQuery.getSingleResult()).thenReturn(BigDecimal.valueOf(750));

        // Act
        BigDecimal result = invoiceDao.getTotalOutputVatAmount(request);

        // Assert
        assertThat(result).isEqualTo(BigDecimal.valueOf(750));
    }

    @Test
    void testGetSuggestionUnpaidInvoices_EmptyResult() {
        // Arrange
        User user = new User();
        Role role = new Role();
        role.setRoleCode(2);
        user.setRole(role);
        Company company = new Company();
        CurrencyCode currencyCode = new CurrencyCode();
        currencyCode.setCurrencyCode(1);
        company.setCurrencyCode(currencyCode);
        user.setCompany(company);

        when(userService.findByPK(1)).thenReturn(user);
        when(entityManager.createNamedQuery("suggestionUnpaidInvoices", Invoice.class))
                .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("status"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("currency"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", ContactTypeEnum.CUSTOMER.getValue())).thenReturn(typedQuery);
        when(typedQuery.setParameter("id", 1)).thenReturn(typedQuery);
        when(typedQuery.setParameter("userId", 1)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Collections.emptyList());

        // Act
        List<Invoice> result = invoiceDao.getSuggestionUnpaidInvoices(
                BigDecimal.valueOf(1000), 1, ContactTypeEnum.CUSTOMER, 1, 1);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    void testGetSuggestionExplainedInvoices_EmptyResult() {
        // Arrange
        when(entityManager.createNamedQuery("suggestionExplainedInvoices", Invoice.class))
                .thenReturn(typedQuery);
        when(typedQuery.setParameter(eq("status"), anyList())).thenReturn(typedQuery);
        when(typedQuery.setParameter("currency", 1)).thenReturn(typedQuery);
        when(typedQuery.setParameter("type", ContactTypeEnum.SUPPLIER.getValue())).thenReturn(typedQuery);
        when(typedQuery.setParameter("id", 1)).thenReturn(typedQuery);
        when(typedQuery.setParameter("userId", 1)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(Collections.emptyList());

        // Act
        List<Invoice> result = invoiceDao.getSuggestionExplainedInvoices(
                BigDecimal.valueOf(1000), 1, ContactTypeEnum.SUPPLIER, 1, 1);

        // Assert
        assertThat(result).isNull();
    }
}
