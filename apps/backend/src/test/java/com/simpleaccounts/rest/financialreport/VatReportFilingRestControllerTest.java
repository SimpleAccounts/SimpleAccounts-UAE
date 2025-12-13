package com.simpleaccounts.rest.financialreport;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.VatRecordPaymentHistoryService;
import com.simpleaccounts.service.VatReportFilingService;
import com.simpleaccounts.service.VatReportService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("VatReportFilingRestController Unit Tests")
class VatReportFilingRestControllerTest {

    private MockMvc mockMvc;

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

    @InjectMocks
    private VatReportFilingRestController vatReportFilingRestController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(vatReportFilingRestController).build();
        objectMapper = new ObjectMapper();
    }

    @Nested
    @DisplayName("getVatReportFilingList Tests")
    class GetVatReportFilingListTests {

        @Test
        @DisplayName("Should return VAT report filing list with OK status")
        void getVatReportFilingListReturnsOkStatus() throws Exception {
            // Arrange
            List<VatReportFiling> filings = createVatReportFilingList(3);
            List<VatReportResponseModel> responseModels = createVatReportResponseModelList(3);
            PaginationResponseModel response = new PaginationResponseModel(3, filings);

            when(vatReportService.getVatReportList(any(), any())).thenReturn(response);
            when(vatReportFilingService.getVatReportFilingList2(any())).thenReturn(responseModels);

            // Act & Assert
            mockMvc.perform(get("/rest/vatReport/getVatReportFilingList"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when response is null")
        void getVatReportFilingListReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            when(vatReportService.getVatReportList(any(), any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/vatReport/getVatReportFilingList"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getVatPaymentHistoryList Tests")
    class GetVatPaymentHistoryListTests {

        @Test
        @DisplayName("Should return VAT payment history list with OK status")
        void getVatPaymentHistoryListReturnsOkStatus() throws Exception {
            // Arrange
            List<VatRecordPaymentHistory> histories = createPaymentHistoryList(3);
            List<VatPaymentHistoryModel> models = createPaymentHistoryModelList(3);
            PaginationResponseModel response = new PaginationResponseModel(3, histories);

            when(vatRecordPaymentHistoryService.getVatReportList(any(), any())).thenReturn(response);
            when(vatReportFilingService.getVatPaymentRecordList2(any())).thenReturn(models);

            // Act & Assert
            mockMvc.perform(get("/rest/vatReport/getVatPaymentHistoryList"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when response is null")
        void getVatPaymentHistoryListReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            when(vatRecordPaymentHistoryService.getVatReportList(any(), any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/vatReport/getVatPaymentHistoryList"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getVatReportListForBank Tests")
    class GetVatReportListForBankTests {

        @Test
        @DisplayName("Should return VAT report list for payment")
        void getVatReportListForBankReturnsPaymentList() throws Exception {
            // Arrange
            List<VatReportFiling> filings = createVatReportFilingList(2);
            when(vatReportFilingRepository.findAll()).thenReturn(filings);

            // Act & Assert
            mockMvc.perform(get("/rest/vatReport/getVatReportListForBank")
                    .param("id", "1"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return VAT report list for claim")
        void getVatReportListForBankReturnsClaimList() throws Exception {
            // Arrange
            List<VatReportFiling> filings = createVatReportFilingList(2);
            when(vatReportFilingRepository.findAll()).thenReturn(filings);

            // Act & Assert
            mockMvc.perform(get("/rest/vatReport/getVatReportListForBank")
                    .param("id", "2"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("generateVatReport Tests")
    class GenerateVatReportTests {

        @Test
        @DisplayName("Should generate VAT report successfully")
        void generateVatReportReturnsOkStatus() throws Exception {
            // Arrange
            VatReportFilingRequestModel requestModel = new VatReportFilingRequestModel();
            requestModel.setStartDate("01/01/2024");
            requestModel.setEndDate("31/03/2024");

            User user = createTestUser();
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(dateFormatUtil.getDateStrAsLocalDateTime(any(), any()))
                .thenReturn(LocalDateTime.of(2024, 1, 1, 0, 0));
            when(vatReportFilingRepository.findAll()).thenReturn(new ArrayList<>());
            when(vatReportFilingService.processVatReport(any(), any())).thenReturn(true);

            // Act & Assert
            mockMvc.perform(post("/rest/vatReport/generateVatReport")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(requestModel)))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete VAT report successfully")
        void deleteReturnsOkStatus() throws Exception {
            // Arrange
            doNothing().when(vatReportFilingService).deleteVatReportFiling(1);

            // Act & Assert
            mockMvc.perform(delete("/rest/vatReport/delete")
                    .param("id", "1"))
                .andExpect(status().isOk());
        }
    }

    private User createTestUser() {
        User user = new User();
        user.setUserId(1);
        user.setFirstName("Test");
        user.setLastName("User");
        return user;
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
        filing.setStatus(11);
        filing.setDeleteFlag(false);
        filing.setIsVatReclaimable(false);
        return filing;
    }

    private List<VatReportResponseModel> createVatReportResponseModelList(int count) {
        List<VatReportResponseModel> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            VatReportResponseModel model = new VatReportResponseModel();
            model.setId(i + 1);
            list.add(model);
        }
        return list;
    }

    private List<VatRecordPaymentHistory> createPaymentHistoryList(int count) {
        List<VatRecordPaymentHistory> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            VatRecordPaymentHistory history = new VatRecordPaymentHistory();
            history.setId(i + 1);
            history.setDeleteFlag(false);
            list.add(history);
        }
        return list;
    }

    private List<VatPaymentHistoryModel> createPaymentHistoryModelList(int count) {
        List<VatPaymentHistoryModel> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            VatPaymentHistoryModel model = new VatPaymentHistoryModel();
            list.add(model);
        }
        return list;
    }
}
