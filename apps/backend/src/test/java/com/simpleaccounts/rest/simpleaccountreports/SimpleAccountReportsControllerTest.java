package com.simpleaccounts.rest.simpleaccountreports;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingListModel;
import com.simpleaccounts.rest.simpleaccountreports.FTA.FtaAuditResponseModel;
import com.simpleaccounts.rest.simpleaccountreports.soa.StatementOfAccountResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.UserService;
import java.math.BigDecimal;
import java.util.ArrayList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("SimpleAccountReportsController Unit Tests")
class SimpleAccountReportsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private simpleAccountReportRestHelper simpleAccountReportRestHelper;

    @Mock
    private UserService userService;

    @Mock
    private SimpleAccountReportDaoImpl simpleAccountReportDao;

    @InjectMocks
    private SimpleAccountReportsController simpleAccountReportsController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(simpleAccountReportsController).build();
    }

    @Nested
    @DisplayName("salesbycustomer Tests")
    class SalesByCustomerTests {

        @Test
        @DisplayName("Should return sales by customer report with OK status")
        void getSalesByCustomerReturnsOkStatus() throws Exception {
            // Arrange
            SalesByCustomerResponseModel response = new SalesByCustomerResponseModel();
            when(simpleAccountReportRestHelper.getSalesByCustomer(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/salesbycustomer")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when report is null")
        void getSalesByCustomerReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            when(simpleAccountReportRestHelper.getSalesByCustomer(any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/salesbycustomer")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("purchasebyVendor Tests")
    class PurchaseByVendorTests {

        @Test
        @DisplayName("Should return purchase by vendor report with OK status")
        void getPurchaseByVendorReturnsOkStatus() throws Exception {
            // Arrange
            PurchseByVendorResponseModel response = new PurchseByVendorResponseModel();
            when(simpleAccountReportRestHelper.getPurchaseByVendor(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/purchasebyVendor")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when report is null")
        void getPurchaseByVendorReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            when(simpleAccountReportRestHelper.getPurchaseByVendor(any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/purchasebyVendor")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("salesbyproduct Tests")
    class SalesByProductTests {

        @Test
        @DisplayName("Should return sales by product report with OK status")
        void getSalesByProductReturnsOkStatus() throws Exception {
            // Arrange
            SalesByProductResponseModel response = new SalesByProductResponseModel();
            when(simpleAccountReportRestHelper.getSalesByProduct(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/salesbyproduct")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("ReceivableInvoiceSummary Tests")
    class ReceivableInvoiceSummaryTests {

        @Test
        @DisplayName("Should return receivable invoice summary with OK status")
        void getReceivableInvoiceSummaryReturnsOkStatus() throws Exception {
            // Arrange
            ReceivableInvoiceSummaryResponseModel response = new ReceivableInvoiceSummaryResponseModel();
            when(simpleAccountReportRestHelper.getreceivableInvoiceSummary(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/ReceivableInvoiceSummary")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("PayableInvoiceSummary Tests")
    class PayableInvoiceSummaryTests {

        @Test
        @DisplayName("Should return payable invoice summary with OK status")
        void getPayableInvoiceSummaryReturnsOkStatus() throws Exception {
            // Arrange
            PayableInvoiceSummaryResponseModel response = new PayableInvoiceSummaryResponseModel();
            when(simpleAccountReportRestHelper.getPayableInvoiceSummary(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/PayableInvoiceSummary")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("ReceivableInvoiceDetail Tests")
    class ReceivableInvoiceDetailTests {

        @Test
        @DisplayName("Should return receivable invoice detail with OK status")
        void getReceivableInvoiceDetailReturnsOkStatus() throws Exception {
            // Arrange
            User user = createTestUser();
            ReceivableInvoiceDetailResponseModel response = new ReceivableInvoiceDetailResponseModel();
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(simpleAccountReportRestHelper.getreceivableInvoiceDetail(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/ReceivableInvoiceDetail")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("ExpenseDetails Tests")
    class ExpenseDetailsTests {

        @Test
        @DisplayName("Should return expense details with OK status")
        void getExpenseDetailsReturnsOkStatus() throws Exception {
            // Arrange
            User user = createTestUser();
            ExpenseDetailsResponseModel response = new ExpenseDetailsResponseModel();
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(simpleAccountReportRestHelper.getExpenseDetails(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/ExpenseDetails")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getFtaAuditReport Tests")
    class GetFtaAuditReportTests {

        @Test
        @DisplayName("Should return FTA audit report with OK status")
        void getFtaAuditReportReturnsOkStatus() throws Exception {
            // Arrange
            FtaAuditResponseModel response = new FtaAuditResponseModel();
            when(simpleAccountReportRestHelper.getFtaAuditReport(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/getFtaAuditReport")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getAgingReport Tests")
    class GetAgingReportTests {

        @Test
        @DisplayName("Should return aging report with OK status")
        void getAgingReportReturnsOkStatus() throws Exception {
            // Arrange
            AgingListModel response = new AgingListModel();
            when(simpleAccountReportRestHelper.getAgingReport(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/getAgingReport"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when report is null")
        void getAgingReportReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            when(simpleAccountReportRestHelper.getAgingReport(any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/getAgingReport"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("StatementOfAccountReport Tests")
    class StatementOfAccountReportTests {

        @Test
        @DisplayName("Should return SOA report with OK status")
        void getSOAReturnsOkStatus() throws Exception {
            // Arrange
            StatementOfAccountResponseModel response = new StatementOfAccountResponseModel();
            when(simpleAccountReportRestHelper.getSOADetails(any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/StatementOfAccountReport"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("statementOfAccounts Tests")
    class StatementOfAccountsTests {

        @Test
        @DisplayName("Should return statement of accounts with OK status")
        void getStatementOfAccountsReturnsOkStatus() throws Exception {
            // Arrange
            ResponseModelStatementOfAccounts response = new ResponseModelStatementOfAccounts();
            when(simpleAccountReportDao.getStatementOfAccounts(any(), any())).thenReturn(response);

            // Act & Assert
            mockMvc.perform(get("/rest/simpleaccountReports/statementOfAccounts")
                    .param("startDate", "01/01/2024")
                    .param("endDate", "31/12/2024"))
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
}
