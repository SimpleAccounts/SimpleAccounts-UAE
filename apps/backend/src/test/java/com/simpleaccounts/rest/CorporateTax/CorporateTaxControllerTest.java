package com.simpleaccounts.rest.CorporateTax;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.CorporateTax.Model.CorporateTaxDateModel;
import com.simpleaccounts.rest.CorporateTax.Model.CorporateTaxPaymentModel;
import com.simpleaccounts.rest.CorporateTax.Model.PaymentHistoryModel;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxSettingRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRestHelper;
import com.simpleaccounts.rest.financialreport.ProfitAndLossResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CorporateTaxController.class)
@DisplayName("CorporateTaxController Tests")
class CorporateTaxControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private CompanyService companyService;

    @MockBean
    private UserService userService;

    @MockBean
    private CorporateTaxSettingRepository corporateTaxSettingRepository;

    @MockBean
    private DateFormatUtil dateFormatUtil;

    @MockBean
    private FinancialReportRestHelper financialReportRestHelper;

    @MockBean
    private CorporateTaxFilingRepository corporateTaxFilingRepository;

    @MockBean
    private CorporateTaxService corporateTaxService;

    private User mockUser;
    private Company mockCompany;
    private CorporateTaxSettings mockSettings;

    @BeforeEach
    void setUp() {
        mockCompany = new Company();
        mockCompany.setCompanyId(1);
        mockCompany.setIsEligibleForCp(true);

        mockUser = new User();
        mockUser.setUserId(1);
        mockUser.setCompany(mockCompany);

        mockSettings = new CorporateTaxSettings();
        mockSettings.setId(1);
        mockSettings.setFiscalYear("2024");
        mockSettings.setSelectedFlag(false);
        mockSettings.setDeleteFlag(false);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(mockUser);
    }

    @Test
    @DisplayName("Should save corporate tax settings successfully")
    void testSave_Success() throws Exception {
        CorporateTaxDateModel model = new CorporateTaxDateModel();
        model.setIsEligibleForCP(true);
        model.setCorporateTaxSettingId(1);

        when(corporateTaxSettingRepository.findById(1)).thenReturn(Optional.of(mockSettings));
        when(corporateTaxSettingRepository.findAll()).thenReturn(Arrays.asList(mockSettings));

        mockMvc.perform(post("/rest/corporate/tax/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(companyService, times(1)).persist(any(Company.class));
        verify(corporateTaxSettingRepository, times(1)).save(any(CorporateTaxSettings.class));
    }

    @Test
    @DisplayName("Should handle save with null corporateTaxSettingId")
    void testSave_NullSettingId() throws Exception {
        CorporateTaxDateModel model = new CorporateTaxDateModel();
        model.setIsEligibleForCP(true);
        model.setCorporateTaxSettingId(null);

        mockMvc.perform(post("/rest/corporate/tax/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(companyService, times(1)).persist(any(Company.class));
        verify(corporateTaxSettingRepository, times(1)).save(any(CorporateTaxSettings.class));
    }

    @Test
    @DisplayName("Should handle exception during save")
    void testSave_Exception() throws Exception {
        CorporateTaxDateModel model = new CorporateTaxDateModel();
        model.setIsEligibleForCP(true);

        when(companyService.persist(any(Company.class))).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/rest/corporate/tax/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should get corporate tax settings successfully")
    void testGetSetting_Success() throws Exception {
        List<CorporateTaxSettings> settingsList = Arrays.asList(mockSettings);
        when(corporateTaxSettingRepository.findAll()).thenReturn(settingsList);

        mockMvc.perform(get("/rest/corporate/tax/get/setting")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].corporateTaxSettingId").value(1))
                .andExpect(jsonPath("$[0].fiscalYear").value("2024"))
                .andExpect(jsonPath("$[0].isEligibleForCP").value(true));

        verify(corporateTaxSettingRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should handle empty settings list")
    void testGetSetting_EmptyList() throws Exception {
        when(corporateTaxSettingRepository.findAll()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/corporate/tax/get/setting")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(corporateTaxSettingRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should handle exception in get settings")
    void testGetSetting_Exception() throws Exception {
        when(corporateTaxSettingRepository.findAll()).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/corporate/tax/get/setting")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should generate corporate tax successfully")
    void testGenerateCT_Success() throws Exception {
        CorporateTaxModel model = new CorporateTaxModel();
        model.setStartDate(LocalDate.of(2024, 1, 1));
        model.setEndDate(LocalDate.of(2024, 12, 31));
        model.setDueDate(LocalDate.of(2025, 3, 31));
        model.setReportingForYear("2024");
        model.setReportingPeriod("Annual");

        ProfitAndLossResponseModel profitLoss = new ProfitAndLossResponseModel();
        profitLoss.setOperatingProfit(new BigDecimal("500000"));

        when(dateFormatUtil.getDateStrAsLocalDateTime(any(), anyString()))
                .thenReturn(LocalDateTime.now());
        when(financialReportRestHelper.getProfitAndLossReport(any()))
                .thenReturn(profitLoss);

        mockMvc.perform(post("/rest/corporate/tax/generatect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(corporateTaxFilingRepository, times(1)).save(any(CorporateTaxFiling.class));
    }

    @Test
    @DisplayName("Should calculate zero tax for income below threshold")
    void testGenerateCT_BelowThreshold() throws Exception {
        CorporateTaxModel model = new CorporateTaxModel();
        model.setStartDate(LocalDate.of(2024, 1, 1));
        model.setEndDate(LocalDate.of(2024, 12, 31));
        model.setDueDate(LocalDate.of(2025, 3, 31));
        model.setReportingForYear("2024");
        model.setReportingPeriod("Annual");

        ProfitAndLossResponseModel profitLoss = new ProfitAndLossResponseModel();
        profitLoss.setOperatingProfit(new BigDecimal("300000"));

        when(dateFormatUtil.getDateStrAsLocalDateTime(any(), anyString()))
                .thenReturn(LocalDateTime.now());
        when(financialReportRestHelper.getProfitAndLossReport(any()))
                .thenReturn(profitLoss);

        mockMvc.perform(post("/rest/corporate/tax/generatect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(corporateTaxFilingRepository, times(1)).save(any(CorporateTaxFiling.class));
    }

    @Test
    @DisplayName("Should handle exception during generate CT")
    void testGenerateCT_Exception() throws Exception {
        CorporateTaxModel model = new CorporateTaxModel();
        model.setStartDate(LocalDate.of(2024, 1, 1));
        model.setEndDate(LocalDate.of(2024, 12, 31));
        model.setDueDate(LocalDate.of(2025, 3, 31));

        when(dateFormatUtil.getDateStrAsLocalDateTime(any(), anyString()))
                .thenThrow(new RuntimeException("Date parsing error"));

        mockMvc.perform(post("/rest/corporate/tax/generatect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should view corporate tax successfully")
    void testViewCT_Success() throws Exception {
        CorporateTaxFiling filing = new CorporateTaxFiling();
        filing.setId(1);
        filing.setViewCtReport("{\"profit\": 1000}");

        when(corporateTaxFilingRepository.findById(1)).thenReturn(Optional.of(filing));

        mockMvc.perform(get("/rest/corporate/tax/viewct")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profit").value(1000));

        verify(corporateTaxFilingRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("Should handle exception in view CT")
    void testViewCT_Exception() throws Exception {
        when(corporateTaxFilingRepository.findById(anyInt()))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/corporate/tax/viewct")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should file corporate tax successfully")
    void testFileCT_Success() throws Exception {
        CorporateTaxModel model = new CorporateTaxModel();
        model.setId(1);
        model.setTaxFiledOn("01/01/2024");

        CorporateTaxFiling filing = new CorporateTaxFiling();
        filing.setId(1);
        filing.setStartDate(LocalDate.of(2024, 1, 1));
        filing.setTaxableAmount(new BigDecimal("100000"));

        ProfitAndLossResponseModel profitLoss = new ProfitAndLossResponseModel();
        profitLoss.setOperatingProfit(new BigDecimal("500000"));

        when(corporateTaxFilingRepository.findById(1)).thenReturn(Optional.of(filing));
        when(dateFormatUtil.getDateStrAsLocalDateTime(any(), anyString()))
                .thenReturn(LocalDateTime.now());
        when(financialReportRestHelper.getProfitAndLossReport(any()))
                .thenReturn(profitLoss);

        mockMvc.perform(post("/rest/corporate/tax/filect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(corporateTaxService, times(1)).createJournalForCT(any(), anyInt());
        verify(corporateTaxFilingRepository, times(1)).save(any(CorporateTaxFiling.class));
    }

    @Test
    @DisplayName("Should not create journal for zero taxable amount")
    void testFileCT_ZeroTaxableAmount() throws Exception {
        CorporateTaxModel model = new CorporateTaxModel();
        model.setId(1);
        model.setTaxFiledOn("01/01/2024");

        CorporateTaxFiling filing = new CorporateTaxFiling();
        filing.setId(1);
        filing.setStartDate(LocalDate.of(2024, 1, 1));
        filing.setTaxableAmount(BigDecimal.ZERO);

        ProfitAndLossResponseModel profitLoss = new ProfitAndLossResponseModel();
        profitLoss.setOperatingProfit(new BigDecimal("300000"));

        when(corporateTaxFilingRepository.findById(1)).thenReturn(Optional.of(filing));
        when(dateFormatUtil.getDateStrAsLocalDateTime(any(), anyString()))
                .thenReturn(LocalDateTime.now());
        when(financialReportRestHelper.getProfitAndLossReport(any()))
                .thenReturn(profitLoss);

        mockMvc.perform(post("/rest/corporate/tax/filect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(corporateTaxService, never()).createJournalForCT(any(), anyInt());
        verify(corporateTaxFilingRepository, times(1)).save(any(CorporateTaxFiling.class));
    }

    @Test
    @DisplayName("Should unfile corporate tax successfully")
    void testUnfileCT_Success() throws Exception {
        CorporateTaxModel model = new CorporateTaxModel();
        model.setId(1);

        CorporateTaxFiling filing = new CorporateTaxFiling();
        filing.setId(1);
        filing.setTaxableAmount(new BigDecimal("100000"));

        when(corporateTaxFilingRepository.findById(1)).thenReturn(Optional.of(filing));

        mockMvc.perform(post("/rest/corporate/tax/unfilect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(corporateTaxService, times(1)).createReverseJournalForCT(any(), anyInt());
        verify(corporateTaxFilingRepository, times(1)).save(any(CorporateTaxFiling.class));
    }

    @Test
    @DisplayName("Should not create reverse journal for zero taxable amount")
    void testUnfileCT_ZeroTaxableAmount() throws Exception {
        CorporateTaxModel model = new CorporateTaxModel();
        model.setId(1);

        CorporateTaxFiling filing = new CorporateTaxFiling();
        filing.setId(1);
        filing.setTaxableAmount(BigDecimal.ZERO);

        when(corporateTaxFilingRepository.findById(1)).thenReturn(Optional.of(filing));

        mockMvc.perform(post("/rest/corporate/tax/unfilect")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(corporateTaxService, never()).createReverseJournalForCT(any(), anyInt());
        verify(corporateTaxFilingRepository, times(1)).save(any(CorporateTaxFiling.class));
    }

    @Test
    @DisplayName("Should record CT payment successfully")
    void testRecordCTPayment_Success() throws Exception {
        CorporateTaxPaymentModel model = new CorporateTaxPaymentModel();

        CorporateTaxPayment payment = new CorporateTaxPayment();
        when(corporateTaxService.recordCorporateTaxPayment(any(), anyInt()))
                .thenReturn(payment);

        mockMvc.perform(post("/rest/corporate/tax/recordctpayment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());

        verify(corporateTaxService, times(1)).recordCorporateTaxPayment(any(), anyInt());
    }

    @Test
    @DisplayName("Should handle exception during record CT payment")
    void testRecordCTPayment_Exception() throws Exception {
        CorporateTaxPaymentModel model = new CorporateTaxPaymentModel();

        when(corporateTaxService.recordCorporateTaxPayment(any(), anyInt()))
                .thenThrow(new RuntimeException("Payment error"));

        mockMvc.perform(post("/rest/corporate/tax/recordctpayment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should get corporate tax list successfully")
    void testGetList_Success() throws Exception {
        PaginationResponseModel responseModel = new PaginationResponseModel();
        List<CorporateTaxModel> taxList = new ArrayList<>();
        responseModel.setData(taxList);
        responseModel.setTotalElements(10L);

        when(corporateTaxService.getCorporateTaxList(any(), anyInt(), anyInt(), anyBoolean(), any(), any(), anyInt()))
                .thenReturn(taxList);

        mockMvc.perform(get("/rest/corporate/tax/Corporate/list")
                        .param("pageNo", "0")
                        .param("pageSize", "10")
                        .param("paginationDisable", "false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(corporateTaxService, times(1))
                .getCorporateTaxList(any(), anyInt(), anyInt(), anyBoolean(), any(), any(), anyInt());
    }

    @Test
    @DisplayName("Should handle exception in get list")
    void testGetList_Exception() throws Exception {
        when(corporateTaxService.getCorporateTaxList(any(), anyInt(), anyInt(), anyBoolean(), any(), any(), anyInt()))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/corporate/tax/Corporate/list")
                        .param("pageNo", "0")
                        .param("pageSize", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should get payment history successfully")
    void testGetPaymentHistory_Success() throws Exception {
        PaginationResponseModel responseModel = new PaginationResponseModel();
        List<PaymentHistoryModel> historyList = new ArrayList<>();
        responseModel.setData(historyList);

        when(corporateTaxService.getCtPaymentHistory(any(), anyInt(), anyInt(), anyBoolean(), any(), any(), anyInt()))
                .thenReturn(historyList);

        mockMvc.perform(get("/rest/corporate/tax/payment/history")
                        .param("pageNo", "0")
                        .param("pageSize", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(corporateTaxService, times(1))
                .getCtPaymentHistory(any(), anyInt(), anyInt(), anyBoolean(), any(), any(), anyInt());
    }

    @Test
    @DisplayName("Should delete corporate tax report successfully")
    void testDelete_Success() throws Exception {
        CorporateTaxFiling filing = new CorporateTaxFiling();
        filing.setId(1);

        when(corporateTaxFilingRepository.findById(1)).thenReturn(Optional.of(filing));

        mockMvc.perform(delete("/rest/corporate/tax/delete")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0091"))
                .andExpect(jsonPath("$.error").value(false));

        verify(corporateTaxFilingRepository, times(1)).save(any(CorporateTaxFiling.class));
    }

    @Test
    @DisplayName("Should handle exception during delete")
    void testDelete_Exception() throws Exception {
        when(corporateTaxFilingRepository.findById(anyInt()))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(delete("/rest/corporate/tax/delete")
                        .param("id", "1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    @DisplayName("Should handle pagination with sorting")
    void testGetList_WithSorting() throws Exception {
        PaginationResponseModel responseModel = new PaginationResponseModel();
        List<CorporateTaxModel> taxList = new ArrayList<>();

        when(corporateTaxService.getCorporateTaxList(any(), anyInt(), anyInt(), anyBoolean(), any(), any(), anyInt()))
                .thenReturn(taxList);

        mockMvc.perform(get("/rest/corporate/tax/Corporate/list")
                        .param("pageNo", "0")
                        .param("pageSize", "10")
                        .param("order", "asc")
                        .param("sortingCol", "id")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(corporateTaxService, times(1))
                .getCorporateTaxList(any(), eq(0), eq(10), anyBoolean(), eq("asc"), eq("id"), anyInt());
    }

    @Test
    @DisplayName("Should handle large page size")
    void testGetList_LargePageSize() throws Exception {
        when(corporateTaxService.getCorporateTaxList(any(), anyInt(), anyInt(), anyBoolean(), any(), any(), anyInt()))
                .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/corporate/tax/Corporate/list")
                        .param("pageNo", "0")
                        .param("pageSize", "100")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
