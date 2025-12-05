package com.simpleaccounts.rest.financialreport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.entity.VatPayment;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.model.VatReportRequestFilterModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.PostingRequestModel;
import com.simpleaccounts.rest.vatcontroller.VatReportResponseListForBank;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatRecordPaymentHistoryService;
import com.simpleaccounts.service.VatReportFilingService;
import com.simpleaccounts.service.VatReportService;
import com.simpleaccounts.utils.DateFormatUtil;
import com.simpleaccounts.utils.SimpleAccountsMessage;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class VatReportFilingRestControllerTest {

    @Mock
    private JwtTokenUtil jwtTokenUtil;
    @Mock
    private UserService userService;
    @Mock
    private VatReportFilingService vatReportFilingService;
    @Mock
    private VatReportService vatReportService;
    @Mock
    private VatRecordPaymentHistoryService vatRecordPaymentHistoryService;
    @Mock
    private JournalService journalService;
    @Mock
    private DateFormatUtil dateFormatUtil;
    @Mock
    private VatReportFilingRepository vatReportFilingRepository;
    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private VatReportFilingRestController controller;

    @BeforeEach
    void setUp() throws Exception {
        stubMessageUtil();
    }

    @Test
    void getVatReportFilingListShouldReturnOk() {
        PaginationResponseModel model = new PaginationResponseModel(1, new ArrayList<>());
        when(vatReportService.getVatReportList(any(), any(VatReportRequestFilterModel.class)))
                .thenReturn(model);
        when(vatReportFilingService.getVatReportFilingList2(any())).thenReturn(Collections.emptyList());

        ResponseEntity<PaginationResponseModel> response =
                controller.getList(new VatReportRequestFilterModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(vatReportService).getVatReportList(any(EnumMap.class), any());
    }

    @Test
    void getVatReportFilingListShouldReturnNotFoundWhenNoData() {
        when(vatReportService.getVatReportList(any(), any(VatReportRequestFilterModel.class)))
                .thenReturn(null);

        ResponseEntity<PaginationResponseModel> response =
                controller.getList(new VatReportRequestFilterModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getVatReportListForBankShouldFilterByPaymentStatus() {
        VatReportFiling payable = buildVatReportFiling(false, 11, LocalDate.now());
        VatReportFiling reclaimable = buildVatReportFiling(true, 5, LocalDate.now());
        when(vatReportFilingRepository.findAll())
                .thenReturn(Arrays.asList(payable, reclaimable));

        ResponseEntity<?> response = controller.getVatReportListForBank(1, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<?> payload = (List<?>) response.getBody();
        assertThat(payload).hasSize(1);
        VatReportResponseListForBank entry = (VatReportResponseListForBank) payload.get(0);
        assertThat(entry.getTotalAmount()).isEqualTo(payable.getTotalTaxPayable());
    }

    @Test
    void recordVatPaymentShouldReturnOkWhenServiceSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(vatReportFilingService.recordVatPayment(any(), any())).thenReturn(new VatPayment());

        ResponseEntity<?> response =
                controller.recordVatPayment(new RecordVatPaymentRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void recordVatPaymentShouldReturnServerErrorWhenServiceThrows() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(1);
        when(vatReportFilingService.recordVatPayment(any(), any()))
                .thenThrow(new RuntimeException("failure"));

        ResponseEntity<?> response =
                controller.recordVatPayment(new RecordVatPaymentRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void getVatPaymentHistoryListShouldReturnOk() {
        PaginationResponseModel model = new PaginationResponseModel(1, new ArrayList<>());
        when(vatRecordPaymentHistoryService.getVatReportList(any(), any()))
                .thenReturn(model);
        when(vatReportFilingService.getVatPaymentRecordList2(any()))
                .thenReturn(Collections.emptyList());

        ResponseEntity<PaginationResponseModel> response =
                controller.getVatPaymentRecordList(new VatReportRequestFilterModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void deleteVatReportShouldCallServiceAndReturnOk() {
        ResponseEntity<?> response = controller.delete(9);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(vatReportFilingService).deleteVatReportFiling(9);
    }

    @Test
    void generateVatReportShouldReturnConflictWhenDatesOverlap() {
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(5);
        VatReportFiling existing = buildVatReportFiling(false, 11, LocalDate.of(2024, 1, 1));
        existing.setStartDate(LocalDate.of(2024, 1, 1));
        existing.setEndDate(LocalDate.of(2024, 3, 31));
        when(vatReportFilingRepository.findAll())
                .thenReturn(Collections.singletonList(existing));
        LocalDateTime startMock = LocalDateTime.of(2024, 2, 1, 0, 0);
        LocalDateTime endMock = LocalDateTime.of(2024, 2, 28, 0, 0);
        doReturn(startMock, endMock)
                .when(dateFormatUtil)
                .getDateStrAsLocalDateTime(anyString(), anyString());

        ResponseEntity<?> response =
                controller.generateVatReport(new VatReportFilingRequestModel(), request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isInstanceOf(SimpleAccountsMessage.class);
        verify(vatReportFilingService, never()).processVatReport(any(), any());
    }

    @Test
    void undoFiledVatReportShouldPersistJournalWhenServiceReturnsJournal() {
        PostingRequestModel posting = new PostingRequestModel();

        ResponseEntity<?> response = controller.undoFiledVatReport(posting, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    private VatReportFiling buildVatReportFiling(boolean reclaimable, int status, LocalDate filedOn) {
        VatReportFiling filing = new VatReportFiling();
        filing.setId(reclaimable ? 2 : 1);
        filing.setVatNumber("VAT-123");
        filing.setIsVatReclaimable(reclaimable);
        filing.setDeleteFlag(false);
        filing.setStatus(status);
        filing.setTaxFiledOn(filedOn);
        filing.setStartDate(filedOn.minusMonths(3));
        filing.setEndDate(filedOn);
        filing.setTotalTaxPayable(BigDecimal.valueOf(100.0));
        filing.setTotalTaxReclaimable(BigDecimal.valueOf(50.0));
        filing.setBalanceDue(BigDecimal.valueOf(25.0));
        return filing;
    }

    private void stubMessageUtil() throws Exception {
        ReloadableResourceBundleMessageSource source =
                new ReloadableResourceBundleMessageSource() {
                    @Override
                    protected String getMessageInternal(
                            String code, Object[] args, Locale locale) {
                        return code;
                    }
                };
        Field field = com.simpleaccounts.utils.MessageUtil.class
                .getDeclaredField("messageSource");
        field.setAccessible(true);
        field.set(null, source);
    }
}

