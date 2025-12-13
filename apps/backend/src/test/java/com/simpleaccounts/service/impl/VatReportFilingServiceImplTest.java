package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.entity.VatTaxAgency;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.rest.financialreport.VatPaymentHistoryModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportResponseModel;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.JournalLineItemService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("VatReportFilingServiceImpl Unit Tests")
class VatReportFilingServiceImplTest {

    @Mock
    private DateFormatUtil dateUtils;

    @Mock
    private DateFormatHelper dateFormatHelper;

    @Mock
    private VatReportFilingRepository vatReportFilingRepository;

    @Mock
    private DateFormatUtil dateFormatUtil;

    @Mock
    private CompanyService companyService;

    @Mock
    private VatTaxAgencyRepository vatTaxAgencyRepository;

    @Mock
    private JournalLineItemService journalLineItemService;

    @Mock
    private JournalService journalService;

    @Mock
    private VatRecordPaymentHistoryRepository vatRecordPaymentHistoryRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private VatReportFilingServiceImpl vatReportFilingService;

    private User testUser;
    private Company testCompany;
    private Currency testCurrency;

    @BeforeEach
    void setUp() {
        testUser = createTestUser();
        testCompany = createTestCompany();
        testCurrency = createTestCurrency();
    }

    @Nested
    @DisplayName("getVatReportFilingList Tests")
    class GetVatReportFilingListTests {

        @Test
        @DisplayName("Should return VAT report filing list")
        void getVatReportFilingListReturnsList() {
            // Arrange
            List<VatReportFiling> vatReportFilings = createVatReportFilingList(3);
            when(vatReportFilingRepository.findAll()).thenReturn(vatReportFilings);
            when(userService.findByPK(anyInt())).thenReturn(testUser);
            when(companyService.getCompanyCurrency()).thenReturn(testCurrency);
            when(vatTaxAgencyRepository.findVatTaxAgencyByVatReportFillingId(anyInt()))
                .thenReturn(new ArrayList<>());

            // Act
            List<VatReportResponseModel> result = vatReportFilingService.getVatReportFilingList();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(vatReportFilingRepository).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no VAT reports")
        void getVatReportFilingListReturnsEmptyList() {
            // Arrange
            when(vatReportFilingRepository.findAll()).thenReturn(new ArrayList<>());

            // Act
            List<VatReportResponseModel> result = vatReportFilingService.getVatReportFilingList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should populate tax agency ID when available")
        void getVatReportFilingListPopulatesTaxAgencyId() {
            // Arrange
            VatReportFiling filing = createVatReportFiling(1);
            List<VatReportFiling> vatReportFilings = Arrays.asList(filing);
            VatTaxAgency taxAgency = new VatTaxAgency();
            taxAgency.setId(100);

            when(vatReportFilingRepository.findAll()).thenReturn(vatReportFilings);
            when(userService.findByPK(anyInt())).thenReturn(testUser);
            when(companyService.getCompanyCurrency()).thenReturn(testCurrency);
            when(vatTaxAgencyRepository.findVatTaxAgencyByVatReportFillingId(1))
                .thenReturn(Arrays.asList(taxAgency));

            // Act
            List<VatReportResponseModel> result = vatReportFilingService.getVatReportFilingList();

            // Assert
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getTaxAgencyId()).isEqualTo(100);
        }
    }

    @Nested
    @DisplayName("getVatReportFilingList2 Tests")
    class GetVatReportFilingList2Tests {

        @Test
        @DisplayName("Should return VAT report filing list from provided list")
        void getVatReportFilingList2ReturnsList() {
            // Arrange
            List<VatReportFiling> vatReportFilings = createVatReportFilingList(2);
            when(userService.findByPK(anyInt())).thenReturn(testUser);
            when(companyService.getCompanyCurrency()).thenReturn(testCurrency);
            when(vatTaxAgencyRepository.findVatTaxAgencyByVatReportFillingId(anyInt()))
                .thenReturn(new ArrayList<>());

            // Act
            List<VatReportResponseModel> result = vatReportFilingService.getVatReportFilingList2(vatReportFilings);

            // Assert
            assertThat(result).isNotNull().hasSize(2);
        }

        @Test
        @DisplayName("Should handle empty list")
        void getVatReportFilingList2HandlesEmptyList() {
            // Act
            List<VatReportResponseModel> result = vatReportFilingService.getVatReportFilingList2(new ArrayList<>());

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("deleteVatReportFiling Tests")
    class DeleteVatReportFilingTests {

        @Test
        @DisplayName("Should delete VAT report filing by ID")
        void deleteVatReportFilingDeletesById() {
            // Arrange
            Integer id = 1;
            doNothing().when(vatReportFilingRepository).deleteById(id);

            // Act
            vatReportFilingService.deleteVatReportFiling(id);

            // Assert
            verify(vatReportFilingRepository).deleteById(id);
        }
    }

    @Nested
    @DisplayName("processVatReport Tests")
    class ProcessVatReportTests {

        @Test
        @DisplayName("Should process new VAT report successfully")
        void processVatReportCreatesNewReport() {
            // Arrange
            VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
            requestModel.setStartDate("01/01/2024");
            requestModel.setEndDate("31/03/2024");

            when(dateUtils.getDateStrAsLocalDateTime(any(), any()))
                .thenReturn(LocalDateTime.of(2024, 1, 1, 0, 0));
            when(journalLineItemService.totalInputVatAmount(any(), any(), anyInt()))
                .thenReturn(BigDecimal.valueOf(1000));
            when(journalLineItemService.totalOutputVatAmount(any(), any(), anyInt()))
                .thenReturn(BigDecimal.valueOf(1500));

            // Act
            boolean result = vatReportFilingService.processVatReport(requestModel, testUser);

            // Assert
            assertThat(result).isTrue();
            verify(vatReportFilingRepository).save(any(VatReportFiling.class));
        }

        @Test
        @DisplayName("Should return false when existing report not found")
        void processVatReportReturnsFalseWhenNotFound() {
            // Arrange
            VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
            requestModel.setId(999);
            requestModel.setStartDate("01/01/2024");
            requestModel.setEndDate("31/03/2024");

            when(vatReportFilingRepository.findById(999)).thenReturn(Optional.empty());

            // Act
            boolean result = vatReportFilingService.processVatReport(requestModel, testUser);

            // Assert
            assertThat(result).isFalse();
            verify(vatReportFilingRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should update existing VAT report")
        void processVatReportUpdatesExistingReport() {
            // Arrange
            VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
            requestModel.setId(1);
            requestModel.setStartDate("01/01/2024");
            requestModel.setEndDate("31/03/2024");

            VatReportFiling existingFiling = createVatReportFiling(1);
            when(vatReportFilingRepository.findById(1)).thenReturn(Optional.of(existingFiling));
            when(dateUtils.getDateStrAsLocalDateTime(any(), any()))
                .thenReturn(LocalDateTime.of(2024, 1, 1, 0, 0));
            when(journalLineItemService.totalInputVatAmount(any(), any(), anyInt()))
                .thenReturn(BigDecimal.valueOf(500));
            when(journalLineItemService.totalOutputVatAmount(any(), any(), anyInt()))
                .thenReturn(BigDecimal.valueOf(800));

            // Act
            boolean result = vatReportFilingService.processVatReport(requestModel, testUser);

            // Assert
            assertThat(result).isTrue();
            verify(vatReportFilingRepository).save(existingFiling);
        }
    }

    @Nested
    @DisplayName("getVatPaymentRecordList Tests")
    class GetVatPaymentRecordListTests {

        @Test
        @DisplayName("Should return VAT payment record list")
        void getVatPaymentRecordListReturnsList() {
            // Arrange
            List<VatRecordPaymentHistory> paymentHistories = createPaymentHistoryList(3);
            when(vatRecordPaymentHistoryRepository.findAll()).thenReturn(paymentHistories);
            when(companyService.getCompanyCurrency()).thenReturn(testCurrency);

            // Act
            List<VatPaymentHistoryModel> result = vatReportFilingService.getVatPaymentRecordList();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
        }

        @Test
        @DisplayName("Should return empty list when no payment records")
        void getVatPaymentRecordListReturnsEmptyList() {
            // Arrange
            when(vatRecordPaymentHistoryRepository.findAll()).thenReturn(new ArrayList<>());

            // Act
            List<VatPaymentHistoryModel> result = vatReportFilingService.getVatPaymentRecordList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should filter out deleted records")
        void getVatPaymentRecordListFiltersDeletedRecords() {
            // Arrange
            List<VatRecordPaymentHistory> paymentHistories = new ArrayList<>();
            VatRecordPaymentHistory activeRecord = createPaymentHistory(1, false);
            VatRecordPaymentHistory deletedRecord = createPaymentHistory(2, true);
            paymentHistories.add(activeRecord);
            paymentHistories.add(deletedRecord);

            when(vatRecordPaymentHistoryRepository.findAll()).thenReturn(paymentHistories);
            when(companyService.getCompanyCurrency()).thenReturn(testCurrency);

            // Act
            List<VatPaymentHistoryModel> result = vatReportFilingService.getVatPaymentRecordList();

            // Assert
            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("getVatPaymentRecordList2 Tests")
    class GetVatPaymentRecordList2Tests {

        @Test
        @DisplayName("Should return VAT payment record list from provided list")
        void getVatPaymentRecordList2ReturnsList() {
            // Arrange
            List<VatRecordPaymentHistory> paymentHistories = createPaymentHistoryList(2);
            when(companyService.getCompanyCurrency()).thenReturn(testCurrency);

            // Act
            List<VatPaymentHistoryModel> result = vatReportFilingService.getVatPaymentRecordList2(paymentHistories);

            // Assert
            assertThat(result).isNotNull().hasSize(2);
        }
    }

    private User createTestUser() {
        User user = new User();
        user.setUserId(1);
        user.setFirstName("Test");
        user.setLastName("User");
        return user;
    }

    private Company createTestCompany() {
        Company company = new Company();
        company.setCompanyId(1);
        company.setCompanyName("Test Company");
        return company;
    }

    private Currency createTestCurrency() {
        Currency currency = new Currency();
        currency.setCurrencyId(1);
        currency.setCurrencyIsoCode("AED");
        return currency;
    }

    private List<VatReportFiling> createVatReportFilingList(int count) {
        List<VatReportFiling> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createVatReportFiling(i + 1));
        }
        return list;
    }

    private VatReportFiling createVatReportFiling(Integer id) {
        VatReportFiling filing = new VatReportFiling();
        filing.setId(id);
        filing.setVatNumber("VAT-" + id);
        filing.setStartDate(LocalDate.now().minusMonths(3));
        filing.setEndDate(LocalDate.now());
        filing.setTotalTaxPayable(BigDecimal.valueOf(1000));
        filing.setTotalTaxReclaimable(BigDecimal.ZERO);
        filing.setBalanceDue(BigDecimal.valueOf(1000));
        filing.setStatus(1);
        filing.setDeleteFlag(false);
        filing.setCreatedBy(1);
        filing.setCreatedDate(LocalDateTime.now());
        return filing;
    }

    private List<VatRecordPaymentHistory> createPaymentHistoryList(int count) {
        List<VatRecordPaymentHistory> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createPaymentHistory(i + 1, false));
        }
        return list;
    }

    private VatRecordPaymentHistory createPaymentHistory(Integer id, boolean deleted) {
        VatRecordPaymentHistory history = new VatRecordPaymentHistory();
        history.setId(id);
        history.setDeleteFlag(deleted);
        history.setAmountPaid(BigDecimal.valueOf(500));
        history.setAmountReclaimed(BigDecimal.ZERO);
        history.setStartDate(LocalDateTime.now().minusMonths(3));
        history.setEndDate(LocalDateTime.now());
        history.setDateOfFiling(LocalDateTime.now());
        return history;
    }
}
