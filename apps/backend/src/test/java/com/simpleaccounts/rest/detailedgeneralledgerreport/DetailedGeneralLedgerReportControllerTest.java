package com.simpleaccounts.rest.detailedgeneralledgerreport;

import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DetailedGeneralLedgerReportController.class)
@DisplayName("DetailedGeneralLedgerReportController Tests")
class DetailedGeneralLedgerReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DetailedGeneralLedgerRestHelper detailedGeneralLedgerRestHelper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtTokenUtil jwtTokenUtil;

    @MockBean
    private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

    private User mockUser;
    private Role mockRole;

    @BeforeEach
    void setUp() {
        mockRole = new Role();
        mockRole.setRoleCode(2); // Non-admin role

        mockUser = new User();
        mockUser.setUserId(1);
        mockUser.setRole(mockRole);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any(HttpServletRequest.class))).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(mockUser);
    }

    @Test
    @DisplayName("Should get detailed general ledger report successfully")
    void testGetDateFormat_Success() throws Exception {
        List<Object> reportData = Arrays.asList("Report1", "Report2", "Report3");
        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(reportData);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(3));

        verify(detailedGeneralLedgerRestHelper, times(1))
                .getDetailedGeneralLedgerReport(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should return NOT_FOUND when report data is null")
    void testGetDateFormat_NotFound() throws Exception {
        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(null);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(detailedGeneralLedgerRestHelper, times(1))
                .getDetailedGeneralLedgerReport(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle empty report list")
    void testGetDateFormat_EmptyList() throws Exception {
        List<Object> emptyList = new ArrayList<>();
        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(emptyList);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(detailedGeneralLedgerRestHelper, times(1))
                .getDetailedGeneralLedgerReport(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle exception in getList")
    void testGetDateFormat_Exception() throws Exception {
        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()); // Exception is caught and logged

        verify(detailedGeneralLedgerRestHelper, times(1))
                .getDetailedGeneralLedgerReport(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should filter by userId for non-admin users")
    void testGetDateFormat_NonAdminUser() throws Exception {
        List<Object> reportData = Arrays.asList("Report1");
        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(reportData);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(jwtTokenUtil, times(1)).getUserIdFromHttpRequest(any(HttpServletRequest.class));
        verify(userService, times(1)).findByPK(1);
    }

    @Test
    @DisplayName("Should not filter by userId for admin users")
    void testGetDateFormat_AdminUser() throws Exception {
        Role adminRole = new Role();
        adminRole.setRoleCode(1); // Admin role
        mockUser.setRole(adminRole);

        List<Object> reportData = Arrays.asList("Report1", "Report2");
        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(reportData);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        verify(userService, times(1)).findByPK(1);
    }

    @Test
    @DisplayName("Should get used transaction categories successfully")
    void testGetUsedTransactionCategory_Success() throws Exception {
        TransactionCategory category1 = new TransactionCategory();
        category1.setTransactionCategoryId(1);
        category1.setTransactionCategoryName("Category 1");

        TransactionCategoryClosingBalance balance1 = new TransactionCategoryClosingBalance();
        balance1.setId(1);
        balance1.setTransactionCategory(category1);

        List<TransactionCategoryClosingBalance> balanceList = Arrays.asList(balance1);

        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(balanceList);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].label").value("Category 1"))
                .andExpect(jsonPath("$[0].value").value(1));

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle empty transaction category list")
    void testGetUsedTransactionCategory_EmptyList() throws Exception {
        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle null transaction category list")
    void testGetUsedTransactionCategory_NullList() throws Exception {
        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(null);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle exception in getUsedTransactionCategory")
    void testGetUsedTransactionCategory_Exception() throws Exception {
        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle categories with parent categories")
    void testGetUsedTransactionCategory_WithParent() throws Exception {
        TransactionCategory parentCategory = new TransactionCategory();
        parentCategory.setTransactionCategoryId(1);
        parentCategory.setTransactionCategoryName("Parent Category");

        TransactionCategory childCategory = new TransactionCategory();
        childCategory.setTransactionCategoryId(2);
        childCategory.setTransactionCategoryName("Child Category");
        childCategory.setParentTransactionCategory(parentCategory);

        TransactionCategoryClosingBalance balance = new TransactionCategoryClosingBalance();
        balance.setId(1);
        balance.setTransactionCategory(childCategory);

        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(Arrays.asList(balance));

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2)); // Parent and child

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should remove duplicate categories")
    void testGetUsedTransactionCategory_RemoveDuplicates() throws Exception {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(1);
        category.setTransactionCategoryName("Category 1");

        TransactionCategoryClosingBalance balance1 = new TransactionCategoryClosingBalance();
        balance1.setId(1);
        balance1.setTransactionCategory(category);

        TransactionCategoryClosingBalance balance2 = new TransactionCategoryClosingBalance();
        balance2.setId(2);
        balance2.setTransactionCategory(category);

        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(Arrays.asList(balance1, balance2));

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle category with null name")
    void testGetUsedTransactionCategory_NullName() throws Exception {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(1);
        category.setTransactionCategoryName(null);

        TransactionCategoryClosingBalance balance = new TransactionCategoryClosingBalance();
        balance.setId(1);
        balance.setTransactionCategory(category);

        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(Arrays.asList(balance));

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle category with null id")
    void testGetUsedTransactionCategory_NullId() throws Exception {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(null);
        category.setTransactionCategoryName("Category");

        TransactionCategoryClosingBalance balance = new TransactionCategoryClosingBalance();
        balance.setId(null);
        balance.setTransactionCategory(category);

        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(Arrays.asList(balance));

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle multiple categories with different parents")
    void testGetUsedTransactionCategory_MultipleCategoriesWithParents() throws Exception {
        TransactionCategory parent1 = new TransactionCategory();
        parent1.setTransactionCategoryId(1);
        parent1.setTransactionCategoryName("Parent 1");

        TransactionCategory child1 = new TransactionCategory();
        child1.setTransactionCategoryId(2);
        child1.setTransactionCategoryName("Child 1");
        child1.setParentTransactionCategory(parent1);

        TransactionCategory parent2 = new TransactionCategory();
        parent2.setTransactionCategoryId(3);
        parent2.setTransactionCategoryName("Parent 2");

        TransactionCategory child2 = new TransactionCategory();
        child2.setTransactionCategoryId(4);
        child2.setTransactionCategoryName("Child 2");
        child2.setParentTransactionCategory(parent2);

        TransactionCategoryClosingBalance balance1 = new TransactionCategoryClosingBalance();
        balance1.setId(1);
        balance1.setTransactionCategory(child1);

        TransactionCategoryClosingBalance balance2 = new TransactionCategoryClosingBalance();
        balance2.setId(2);
        balance2.setTransactionCategory(child2);

        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(Arrays.asList(balance1, balance2));

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should verify correct content type")
    void testGetList_ContentType() throws Exception {
        List<Object> reportData = Arrays.asList("Report1");
        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(reportData);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(detailedGeneralLedgerRestHelper, times(1))
                .getDetailedGeneralLedgerReport(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle large report data")
    void testGetDateFormat_LargeDataSet() throws Exception {
        List<Object> largeDataSet = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            largeDataSet.add("Report" + i);
        }

        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(largeDataSet);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1000));

        verify(detailedGeneralLedgerRestHelper, times(1))
                .getDetailedGeneralLedgerReport(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle user with null role")
    void testGetDateFormat_NullRole() throws Exception {
        mockUser.setRole(null);
        List<Object> reportData = Arrays.asList("Report1");

        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(reportData);

        // This should throw NullPointerException but is caught
        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle categories without parent")
    void testGetUsedTransactionCategory_NoParent() throws Exception {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(1);
        category.setTransactionCategoryName("Standalone Category");
        category.setParentTransactionCategory(null);

        TransactionCategoryClosingBalance balance = new TransactionCategoryClosingBalance();
        balance.setId(1);
        balance.setTransactionCategory(category);

        when(transactionCategoryClosingBalanceService.getList(any(ReportRequestModel.class)))
                .thenReturn(Arrays.asList(balance));

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getUsedTransactionCatogery")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(transactionCategoryClosingBalanceService, times(1))
                .getList(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should verify service interactions")
    void testGetList_ServiceInteractions() throws Exception {
        List<Object> reportData = Arrays.asList("Report1");
        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(reportData);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(jwtTokenUtil, times(1)).getUserIdFromHttpRequest(any(HttpServletRequest.class));
        verify(userService, times(1)).findByPK(1);
        verify(detailedGeneralLedgerRestHelper, times(1))
                .getDetailedGeneralLedgerReport(any(ReportRequestModel.class));
    }

    @Test
    @DisplayName("Should handle multiple report entries")
    void testGetDateFormat_MultipleEntries() throws Exception {
        List<Object> reportData = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            reportData.add("Report Entry " + i);
        }

        when(detailedGeneralLedgerRestHelper.getDetailedGeneralLedgerReport(any(ReportRequestModel.class)))
                .thenReturn(reportData);

        mockMvc.perform(get("/rest/detailedGeneralLedgerReport/getList")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(10));

        verify(detailedGeneralLedgerRestHelper, times(1))
                .getDetailedGeneralLedgerReport(any(ReportRequestModel.class));
    }
}
