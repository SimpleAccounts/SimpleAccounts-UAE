package com.simpleaccounts.rest.transactioncategorybalancecontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.MessageUtil;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(TransactionCategoryBalanceController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionCategoryBalanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private UserService userServiceNew;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @MockBean private TransactionCategoryBalanceRestHelper transactionCategoryBalanceRestHelper;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private JournalService journalService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private User testUser;
    private TransactionCategory testCategory;
    private TransactionCategoryBalance testBalance;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1);

        ChartOfAccount chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountCode("BANK");

        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(1);
        testCategory.setTransactionCategoryName("Test Category");
        testCategory.setTransactionCategoryCode("TC001");
        testCategory.setChartOfAccount(chartOfAccount);

        testBalance = new TransactionCategoryBalance();
        testBalance.setTransactionCategoryBalanceId(1);
        testBalance.setTransactionCategory(testCategory);
        testBalance.setOpeningBalance(new BigDecimal("1000.00"));
        testBalance.setEffectiveDate(new Date());

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userServiceNew.findByPK(1)).thenReturn(testUser);
    }

    @Test
    void saveShouldReturnSuccessMessage() throws Exception {
        TransactioncategoryBalancePersistModel persistModel = new TransactioncategoryBalancePersistModel();
        persistModel.setTransactionCategoryId(1);
        persistModel.setOpeningBalance(new BigDecimal("1000.00"));
        persistModel.setEffectiveDate(new Date());

        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryId(2);
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/save")
                        .param("persistModelList[0].transactionCategoryId", "1")
                        .param("persistModelList[0].openingBalance", "1000.00")
                        .param("persistModelList[0].effectiveDate", String.valueOf(new Date().getTime())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0077"))
                .andExpect(jsonPath("$.error").value(false));

        verify(journalService).persist(any(Journal.class));
    }

    @Test
    void saveShouldReturnErrorOnException() throws Exception {
        when(transactionCategoryService.findByPK(any())).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/rest/transactionCategoryBalance/save")
                        .param("persistModelList[0].transactionCategoryId", "1")
                        .param("persistModelList[0].openingBalance", "1000.00")
                        .param("persistModelList[0].effectiveDate", String.valueOf(new Date().getTime())))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    void saveShouldHandlePositiveBalance() throws Exception {
        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/save")
                        .param("persistModelList[0].transactionCategoryId", "1")
                        .param("persistModelList[0].openingBalance", "5000.00")
                        .param("persistModelList[0].effectiveDate", String.valueOf(new Date().getTime())))
                .andExpect(status().isOk());

        verify(journalService).persist(any(Journal.class));
    }

    @Test
    void saveShouldHandleNegativeBalance() throws Exception {
        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/save")
                        .param("persistModelList[0].transactionCategoryId", "1")
                        .param("persistModelList[0].openingBalance", "-2000.00")
                        .param("persistModelList[0].effectiveDate", String.valueOf(new Date().getTime())))
                .andExpect(status().isOk());

        verify(journalService).persist(any(Journal.class));
    }

    @Test
    void saveShouldHandleMultipleBalances() throws Exception {
        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryService.findByPK(any())).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/save")
                        .param("persistModelList[0].transactionCategoryId", "1")
                        .param("persistModelList[0].openingBalance", "1000.00")
                        .param("persistModelList[0].effectiveDate", String.valueOf(new Date().getTime()))
                        .param("persistModelList[1].transactionCategoryId", "2")
                        .param("persistModelList[1].openingBalance", "2000.00")
                        .param("persistModelList[1].effectiveDate", String.valueOf(new Date().getTime())))
                .andExpect(status().isOk());
    }

    @Test
    void updateShouldReturnSuccessMessage() throws Exception {
        TransactioncategoryBalancePersistModel persistModel = new TransactioncategoryBalancePersistModel();
        persistModel.setTransactionCategoryBalanceId(1);
        persistModel.setTransactionCategoryId(1);
        persistModel.setOpeningBalance(new BigDecimal("1500.00"));
        persistModel.setEffectiveDate(new Date());

        Journal existingJournal = new Journal();
        existingJournal.setId(1);

        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryBalanceService.findByPK(1)).thenReturn(testBalance);
        when(journalService.getJournalByReferenceId(any())).thenReturn(existingJournal);
        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("0078"))
                .andExpect(jsonPath("$.error").value(false));

        verify(journalService).deleteAndUpdateByIds(anyList(), eq(false));
        verify(journalService).updateOpeningBalance(any(Journal.class), eq(true));
    }

    @Test
    void updateShouldReturnErrorOnException() throws Exception {
        TransactioncategoryBalancePersistModel persistModel = new TransactioncategoryBalancePersistModel();
        persistModel.setTransactionCategoryBalanceId(1);

        when(transactionCategoryBalanceService.findByPK(1)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(post("/rest/transactionCategoryBalance/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value(true));
    }

    @Test
    void updateShouldDeleteExistingJournal() throws Exception {
        TransactioncategoryBalancePersistModel persistModel = new TransactioncategoryBalancePersistModel();
        persistModel.setTransactionCategoryBalanceId(1);
        persistModel.setTransactionCategoryId(1);
        persistModel.setOpeningBalance(new BigDecimal("2000.00"));
        persistModel.setEffectiveDate(new Date());

        Journal existingJournal = new Journal();
        existingJournal.setId(10);

        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryBalanceService.findByPK(1)).thenReturn(testBalance);
        when(journalService.getJournalByReferenceId(any())).thenReturn(existingJournal);
        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk());

        verify(journalService).deleteAndUpdateByIds(anyList(), eq(false));
    }

    @Test
    void getTransactionByIdShouldReturnBalance() throws Exception {
        TransactioncategoryBalancePersistModel model = new TransactioncategoryBalancePersistModel();
        model.setTransactionCategoryBalanceId(1);

        when(transactionCategoryBalanceService.findByPK(1)).thenReturn(testBalance);
        when(transactionCategoryBalanceRestHelper.getRequestModel(testBalance)).thenReturn(model);

        mockMvc.perform(get("/rest/transactionCategoryBalance/getTransactionById")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionCategoryBalanceId").value(1));

        verify(transactionCategoryBalanceService).findByPK(1);
    }

    @Test
    void getTransactionByIdShouldReturnNotFoundWhenNull() throws Exception {
        when(transactionCategoryBalanceService.findByPK(1)).thenReturn(null);

        mockMvc.perform(get("/rest/transactionCategoryBalance/getTransactionById")
                        .param("id", "1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllShouldReturnPaginatedList() throws Exception {
        List<TransactionCategoryBalance> balanceList = Arrays.asList(testBalance);
        PaginationResponseModel response = new PaginationResponseModel(1, balanceList);
        List<TransactioncategoryBalancePersistModel> modelList = new ArrayList<>();

        when(transactionCategoryBalanceService.getAll(any(), any())).thenReturn(response);
        when(transactionCategoryBalanceRestHelper.getList(balanceList)).thenReturn(modelList);

        mockMvc.perform(get("/rest/transactionCategoryBalance/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        verify(transactionCategoryBalanceService).getAll(any(), any());
    }

    @Test
    void getAllShouldReturnNotFoundWhenNull() throws Exception {
        when(transactionCategoryBalanceService.getAll(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/transactionCategoryBalance/list"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAllShouldHandleAscendingOrder() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionCategoryBalanceService.getAll(any(), any())).thenReturn(response);
        when(transactionCategoryBalanceRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transactionCategoryBalance/list")
                        .param("order", "asc"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllShouldHandleDescendingOrder() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionCategoryBalanceService.getAll(any(), any())).thenReturn(response);
        when(transactionCategoryBalanceRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transactionCategoryBalance/list")
                        .param("order", "desc"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllShouldDefaultToAscendingOrder() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionCategoryBalanceService.getAll(any(), any())).thenReturn(response);
        when(transactionCategoryBalanceRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transactionCategoryBalance/list"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllShouldFilterByUserId() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionCategoryBalanceService.getAll(any(), any())).thenReturn(response);
        when(transactionCategoryBalanceRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transactionCategoryBalance/list"))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any());
    }

    @Test
    void getAllShouldHandleEmptyList() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(0, new ArrayList<>());

        when(transactionCategoryBalanceService.getAll(any(), any())).thenReturn(response);
        when(transactionCategoryBalanceRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transactionCategoryBalance/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void saveShouldHandleZeroBalance() throws Exception {
        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/save")
                        .param("persistModelList[0].transactionCategoryId", "1")
                        .param("persistModelList[0].openingBalance", "0.00")
                        .param("persistModelList[0].effectiveDate", String.valueOf(new Date().getTime())))
                .andExpect(status().isOk());
    }

    @Test
    void updateShouldHandleNullJournal() throws Exception {
        TransactioncategoryBalancePersistModel persistModel = new TransactioncategoryBalancePersistModel();
        persistModel.setTransactionCategoryBalanceId(1);
        persistModel.setTransactionCategoryId(1);
        persistModel.setOpeningBalance(new BigDecimal("1500.00"));
        persistModel.setEffectiveDate(new Date());

        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryBalanceService.findByPK(1)).thenReturn(testBalance);
        when(journalService.getJournalByReferenceId(any())).thenReturn(null);
        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk());
    }

    @Test
    void getAllShouldHandlePaginationParameters() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(100, new ArrayList<>());

        when(transactionCategoryBalanceService.getAll(any(), any())).thenReturn(response);
        when(transactionCategoryBalanceRestHelper.getList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/transactionCategoryBalance/list")
                        .param("page", "1")
                        .param("limit", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(100));
    }

    @Test
    void getTransactionByIdShouldHandleDifferentIds() throws Exception {
        TransactioncategoryBalancePersistModel model = new TransactioncategoryBalancePersistModel();

        when(transactionCategoryBalanceService.findByPK(999)).thenReturn(testBalance);
        when(transactionCategoryBalanceRestHelper.getRequestModel(testBalance)).thenReturn(model);

        mockMvc.perform(get("/rest/transactionCategoryBalance/getTransactionById")
                        .param("id", "999"))
                .andExpect(status().isOk());

        verify(transactionCategoryBalanceService).findByPK(999);
    }

    @Test
    void saveShouldExtractUserIdFromRequest() throws Exception {
        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/save")
                        .param("persistModelList[0].transactionCategoryId", "1")
                        .param("persistModelList[0].openingBalance", "1000.00")
                        .param("persistModelList[0].effectiveDate", String.valueOf(new Date().getTime())))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any());
        verify(userServiceNew).findByPK(1);
    }

    @Test
    void updateShouldExtractUserIdFromRequest() throws Exception {
        TransactioncategoryBalancePersistModel persistModel = new TransactioncategoryBalancePersistModel();
        persistModel.setTransactionCategoryBalanceId(1);
        persistModel.setTransactionCategoryId(1);
        persistModel.setOpeningBalance(new BigDecimal("1500.00"));
        persistModel.setEffectiveDate(new Date());

        TransactionCategory offsetCategory = new TransactionCategory();
        offsetCategory.setTransactionCategoryCode("OPENING_BALANCE_OFFSET_LIABILITIES");

        when(transactionCategoryBalanceService.findByPK(1)).thenReturn(testBalance);
        when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
        when(transactionCategoryService.findTransactionCategoryByTransactionCategoryCode(any()))
                .thenReturn(offsetCategory);

        mockMvc.perform(post("/rest/transactionCategoryBalance/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(persistModel)))
                .andExpect(status().isOk());

        verify(jwtTokenUtil).getUserIdFromHttpRequest(any());
        verify(userServiceNew).findByPK(1);
    }
}
