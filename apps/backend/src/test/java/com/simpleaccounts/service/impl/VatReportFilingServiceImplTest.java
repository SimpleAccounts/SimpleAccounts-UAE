package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.CustomizeInvoiceTemplate;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.entity.VatTaxAgency;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportResponseModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import com.simpleaccounts.rest.financialreport.VatTaxAgencyRepository;
import com.simpleaccounts.rest.financialreport.VatPaymentRepository;
import com.simpleaccounts.rest.financialreport.VatRecordPaymentHistoryRepository;
import com.simpleaccounts.rest.customizeinvoiceprefixsuffixccontroller.CustomizeInvoiceTemplateService;
import com.simpleaccounts.helper.DateFormatHelper;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.JournalLineItemService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.InvoiceNumberUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VatReportFilingServiceImplTest {

    @Mock
    private DateFormatUtil dateFormatUtil;
    @Mock
    private DateFormatUtil dateUtils;
    @Mock
    private DateFormatHelper dateFormatHelper;
    @Mock
    private VatReportFilingRepository vatReportFilingRepository;
    @Mock
    private CompanyService companyService;
    @Mock
    private VatTaxAgencyRepository vatTaxAgencyRepository;
    @Mock
    private JournalLineItemService journalLineItemService;
    @Mock
    private JournalService journalService;
    @Mock
    private VatPaymentRepository vatPaymentRepository;
    @Mock
    private BankAccountService bankAccountService;
    @Mock
    private TransactionService transactionService;
    @Mock
    private TransactionCategoryService transactionCategoryService;
    @Mock
    private ChartOfAccountCategoryService chartOfAccountCategoryService;
    @Mock
    private VatRecordPaymentHistoryRepository vatRecordPaymentHistoryRepository;
    @Mock
    private UserService userService;
    @Mock
    private InvoiceService invoiceService;
    @Mock
    private ExpenseService expenseService;
    @Mock
    private JournalLineItemRepository journalLineItemRepository;
    @Mock
    private TransactionExplanationRepository transactionExplanationRepository;
    @Mock
    private CustomizeInvoiceTemplateService customizeInvoiceTemplateService;
    @Mock
    private InvoiceNumberUtil invoiceNumberUtil;

    @InjectMocks
    private VatReportFilingServiceImpl service;

    @Test
    void getVatReportFilingListShouldMapEntitiesIntoResponseModels() {
        VatReportFiling filing = new VatReportFiling();
        filing.setId(1);
        filing.setStartDate(LocalDate.of(2024, 1, 1));
        filing.setEndDate(LocalDate.of(2024, 3, 31));
        filing.setCreatedBy(10);
        filing.setCreatedDate(LocalDateTime.of(2024, 1, 1, 0, 0));
        filing.setStatus(CommonStatusEnum.UN_FILED.getValue());
        filing.setTotalTaxPayable(BigDecimal.TEN);
        filing.setTotalTaxReclaimable(BigDecimal.ZERO);
        filing.setVatNumber("VAT-001");
        when(vatReportFilingRepository.findAll()).thenReturn(Collections.singletonList(filing));
        User user = buildUser(10, "Admin");
        when(userService.findByPK(10)).thenReturn(user);
        Currency currency = new Currency();
        currency.setCurrencyIsoCode("AED");
        when(companyService.getCompanyCurrency()).thenReturn(currency);
        when(vatTaxAgencyRepository.findVatTaxAgencyByVatReportFillingId(1))
                .thenReturn(Collections.emptyList());

        java.util.List<VatReportResponseModel> response = service.getVatReportFilingList();

        assertThat(response).hasSize(1);
        VatReportResponseModel model = response.get(0);
        assertThat(model.getId()).isEqualTo(1);
        assertThat(model.getTaxReturns()).contains("01/01/2024");
    }

    @Test
    void deleteVatReportFilingShouldDelegateToRepository() {
        service.deleteVatReportFiling(99);

        verify(vatReportFilingRepository).deleteById(99);
    }

    @Test
    void processVatReportShouldPersistTotals() {
        VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
        requestModel.setStartDate("01-01-2024");
        requestModel.setEndDate("31-03-2024");
        User user = buildUser(5, "Auditor");
        when(customizeInvoiceTemplateService.getLastInvoice(12)).thenReturn("VAT0001");
        CustomizeInvoiceTemplate template = new CustomizeInvoiceTemplate();
        when(customizeInvoiceTemplateService.getInvoiceTemplate(12)).thenReturn(template);
        when(invoiceNumberUtil.fetchSuffixFromString("VAT0001")).thenReturn("0001");
        when(journalLineItemService.totalInputVatAmount(any(), any(), eq(88)))
                .thenReturn(BigDecimal.valueOf(5));
        when(journalLineItemService.totalOutputVatAmount(any(), any(), eq(94)))
                .thenReturn(BigDecimal.valueOf(15));
        LocalDateTime mockStart = LocalDateTime.of(2024, 1, 1, 0, 0);
        LocalDateTime mockEnd = LocalDateTime.of(2024, 3, 31, 0, 0);
        org.mockito.Mockito.doReturn(mockStart, mockEnd)
                .when(dateUtils)
                .getDateStrAsLocalDateTime(anyString(), anyString());

        boolean result = service.processVatReport(requestModel, user);

        assertThat(result).isTrue();
        verify(vatReportFilingRepository).save(any(VatReportFiling.class));
    }

    @Test
    void postFiledVatShouldCreateJournalEntries() {
        VatReportFiling filing = new VatReportFiling();
        filing.setId(7);
        filing.setStartDate(LocalDate.of(2024, 1, 1));
        filing.setEndDate(LocalDate.of(2024, 3, 31));
        when(dateFormatUtil.getLocalDateTimeAsString(any(), any()))
                .thenReturn("01/01/2024")
                .thenReturn("31/03/2024");
        when(journalLineItemService.totalInputVatAmount(any(), any(), eq(88)))
                .thenReturn(BigDecimal.valueOf(5));
        when(journalLineItemService.totalOutputVatAmount(any(), any(), eq(94)))
                .thenReturn(BigDecimal.valueOf(10));
        when(journalLineItemService.getIdsAndTypeInTotalInputVat(any(), any(), eq(88)))
                .thenReturn(Collections.emptyList());
        when(journalLineItemService.getIdsAndTypeInTotalOutputVat(any(), any(), eq(94)))
                .thenReturn(Collections.emptyList());
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(anyString()))
                .thenReturn(new TransactionCategory());
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(
                        TransactionCategoryCodeEnum.GCC_VAT_PAYABLE.getCode()))
                .thenReturn(new TransactionCategory());
        when(dateFormatHelper.convertToLocalDateViaSqlDate(any()))
                .thenReturn(LocalDate.of(2024, 4, 1));
        service.postFiledVat(filing, 1, new java.util.Date());

        verify(journalService).persist(any(Journal.class));
    }

    @Test
    void undoFiledVatReportShouldReturnNullWhenServiceReturnsNull() {
        PostingRequestModel model = new PostingRequestModel();
        model.setPostingRefId(20);
        model.setPostingRefType(PostingReferenceTypeEnum.VAT_REPORT_FILED.name());
        when(journalLineItemRepository.findAllByReferenceIdAndReferenceType(any(), any()))
                .thenReturn(Collections.emptyList());
        VatReportFiling filing = new VatReportFiling();
        filing.setId(20);
        filing.setStartDate(LocalDate.of(2024, 1, 1));
        filing.setEndDate(LocalDate.of(2024, 3, 31));
        when(vatReportFilingRepository.findById(20)).thenReturn(Optional.of(filing));
        when(vatTaxAgencyRepository.findVatTaxAgencyByVatReportFillingId(20))
                .thenReturn(Collections.emptyList());
        when(journalLineItemService.getIdsAndTypeInTotalInputVat(any(), any(), eq(88)))
                .thenReturn(Collections.emptyList());
        when(journalLineItemService.getIdsAndTypeInTotalOutputVat(any(), any(), eq(94)))
                .thenReturn(Collections.emptyList());

        Journal journal = service.undoFiledVatReport(model, 1);

        assertThat(journal).isNull();
        verify(journalService, never()).persist(any());
    }

    private User buildUser(int id, String firstName) {
        User user = new User();
        user.setUserId(id);
        user.setFirstName(firstName);
        user.setLastName("User");
        return user;
    }
}

