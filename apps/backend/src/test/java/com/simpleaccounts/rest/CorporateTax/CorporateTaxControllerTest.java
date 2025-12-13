package com.simpleaccounts.rest.CorporateTax;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.CorporateTax.Model.CorporateTaxDateModel;
import com.simpleaccounts.rest.CorporateTax.Model.CorporateTaxPaymentModel;
import com.simpleaccounts.rest.CorporateTax.Repositories.CorporateTaxSettingRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRestHelper;
import com.simpleaccounts.rest.financialreport.ProfitAndLossResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("CorporateTaxController Unit Tests")
class CorporateTaxControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private CompanyService companyService;

    @Mock
    private UserService userService;

    @Mock
    private CorporateTaxSettingRepository corporateTaxSettingRepository;

    @Mock
    private DateFormatUtil dateFormatUtil;

    @Mock
    private FinancialReportRestHelper financialReportRestHelper;

    @Mock
    private CorporateTaxFilingRepository corporateTaxFilingRepository;

    @Mock
    private CorporateTaxService corporateTaxService;

    @InjectMocks
    private CorporateTaxController corporateTaxController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(corporateTaxController).build();
        objectMapper = new ObjectMapper();
    }

    @Nested
    @DisplayName("save Tests")
    class SaveTests {

        @Test
        @DisplayName("Should save corporate tax settings successfully")
        void saveReturnsOkStatus() throws Exception {
            // Arrange
            CorporateTaxDateModel model = new CorporateTaxDateModel();
            model.setIsEligibleForCP(true);
            model.setCorporateTaxSettingId(1);

            User user = createTestUser();
            Company company = createTestCompany();
            user.setCompany(company);

            CorporateTaxSettings settings = new CorporateTaxSettings();
            settings.setId(1);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(corporateTaxSettingRepository.findAll()).thenReturn(new ArrayList<>());
            when(corporateTaxSettingRepository.findById(1)).thenReturn(Optional.of(settings));
            when(corporateTaxSettingRepository.save(any())).thenReturn(settings);

            // Act & Assert
            mockMvc.perform(post("/rest/corporate/tax/save")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when setting not found")
        void saveReturnsNotFoundWhenSettingMissing() throws Exception {
            // Arrange
            CorporateTaxDateModel model = new CorporateTaxDateModel();
            model.setCorporateTaxSettingId(999);

            User user = createTestUser();
            Company company = createTestCompany();
            user.setCompany(company);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(corporateTaxSettingRepository.findAll()).thenReturn(new ArrayList<>());
            when(corporateTaxSettingRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            mockMvc.perform(post("/rest/corporate/tax/save")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getsetting Tests")
    class GetSettingTests {

        @Test
        @DisplayName("Should return corporate tax settings with OK status")
        void getSettingReturnsOkStatus() throws Exception {
            // Arrange
            User user = createTestUser();
            Company company = createTestCompany();
            user.setCompany(company);

            List<CorporateTaxSettings> settingsList = createCorporateTaxSettingsList(2);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(corporateTaxSettingRepository.findAll()).thenReturn(settingsList);

            // Act & Assert
            mockMvc.perform(get("/rest/corporate/tax/get/setting"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("generatect Tests")
    class GenerateCtTests {

        @Test
        @DisplayName("Should generate corporate tax successfully")
        void generateCtReturnsOkStatus() throws Exception {
            // Arrange
            CorporateTaxModel model = new CorporateTaxModel();
            model.setStartDate("01/01/2024");
            model.setEndDate("31/12/2024");
            model.setDueDate("28/02/2025");
            model.setReportingForYear("2024");
            model.setReportingPeriod("Annual");

            ProfitAndLossResponseModel profitLossModel = new ProfitAndLossResponseModel();
            profitLossModel.setOperatingProfit(BigDecimal.valueOf(500000));

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(dateFormatUtil.getDateStrAsLocalDateTime(any(), any()))
                .thenReturn(LocalDateTime.of(2024, 1, 1, 0, 0));
            when(financialReportRestHelper.getProfitAndLossReport(any())).thenReturn(profitLossModel);
            when(corporateTaxFilingRepository.save(any())).thenReturn(new CorporateTaxFiling());

            // Act & Assert
            mockMvc.perform(post("/rest/corporate/tax/generatect")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(model)))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("viewct Tests")
    class ViewCtTests {

        @Test
        @DisplayName("Should return corporate tax view with OK status")
        void viewCtReturnsOkStatus() throws Exception {
            // Arrange
            CorporateTaxFiling filing = createCorporateTaxFiling(1);
            filing.setViewCtReport("{\"key\": \"value\"}");

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(corporateTaxFilingRepository.findById(1)).thenReturn(Optional.of(filing));

            // Act & Assert
            mockMvc.perform(get("/rest/corporate/tax/viewct")
                    .param("id", "1"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when filing not found")
        void viewCtReturnsNotFoundWhenFilingMissing() throws Exception {
            // Arrange
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(corporateTaxFilingRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            mockMvc.perform(get("/rest/corporate/tax/viewct")
                    .param("id", "999"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("getList Tests")
    class GetListTests {

        @Test
        @DisplayName("Should return corporate tax list with OK status")
        void getListReturnsOkStatus() throws Exception {
            // Arrange
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

            // Act & Assert
            mockMvc.perform(get("/rest/corporate/tax/Corporate/list"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getPaymentHistoryList Tests")
    class GetPaymentHistoryListTests {

        @Test
        @DisplayName("Should return payment history list with OK status")
        void getPaymentHistoryListReturnsOkStatus() throws Exception {
            // Arrange
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(corporateTaxService.getCtPaymentHistory(any(), anyInt(), anyInt(), any(), any(), any(), anyInt()))
                .thenReturn(new ArrayList<>());

            // Act & Assert
            mockMvc.perform(get("/rest/corporate/tax/payment/history"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete corporate tax successfully")
        void deleteReturnsOkStatus() throws Exception {
            // Arrange
            CorporateTaxFiling filing = createCorporateTaxFiling(1);
            when(corporateTaxFilingRepository.findById(1)).thenReturn(Optional.of(filing));
            when(corporateTaxFilingRepository.save(any())).thenReturn(filing);

            // Act & Assert
            mockMvc.perform(delete("/rest/corporate/tax/delete")
                    .param("id", "1"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when filing not found")
        void deleteReturnsNotFoundWhenFilingMissing() throws Exception {
            // Arrange
            when(corporateTaxFilingRepository.findById(999)).thenReturn(Optional.empty());

            // Act & Assert
            mockMvc.perform(delete("/rest/corporate/tax/delete")
                    .param("id", "999"))
                .andExpect(status().isNotFound());
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
        company.setIsEligibleForCp(false);
        return company;
    }

    private List<CorporateTaxSettings> createCorporateTaxSettingsList(int count) {
        List<CorporateTaxSettings> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            CorporateTaxSettings settings = new CorporateTaxSettings();
            settings.setId(i + 1);
            settings.setFiscalYear("2024");
            settings.setDeleteFlag(false);
            settings.setSelectedFlag(i == 0);
            list.add(settings);
        }
        return list;
    }

    private CorporateTaxFiling createCorporateTaxFiling(Integer id) {
        CorporateTaxFiling filing = new CorporateTaxFiling();
        filing.setId(id);
        filing.setStartDate(LocalDate.of(2024, 1, 1));
        filing.setEndDate(LocalDate.of(2024, 12, 31));
        filing.setNetIncome(BigDecimal.valueOf(500000));
        filing.setTaxableAmount(BigDecimal.valueOf(125000));
        filing.setTaxAmount(BigDecimal.valueOf(11250));
        filing.setBalanceDue(BigDecimal.valueOf(11250));
        filing.setStatus(1);
        filing.setDeleteFlag(false);
        return filing;
    }
}
