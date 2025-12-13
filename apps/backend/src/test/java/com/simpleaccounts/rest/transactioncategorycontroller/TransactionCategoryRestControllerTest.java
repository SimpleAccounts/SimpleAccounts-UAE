package com.simpleaccounts.rest.transactioncategorycontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.repository.TransactionExpensesRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.SingleLevelDropDownModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(TransactionCategoryRestController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("TransactionCategoryRestController Tests")
class TransactionCategoryRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionCategoryService transactionCategoryService;
    @MockBean
    private ChartOfAccountService chartOfAccountService;
    @MockBean
    private UserService userServiceNew;
    @MockBean
    private CoacTransactionCategoryService coacTransactionCategoryService;
    @MockBean
    private JwtTokenUtil jwtTokenUtil;
    @MockBean
    private TranscationCategoryHelper transcationCategoryHelper;
    @MockBean
    private TransactionService transactionService;
    @MockBean
    private UserService userService;
    @MockBean
    private TransactionExpensesRepository transactionExpensesRepository;
    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        String basePath() {
            return "/tmp";
        }
    }

    private TransactionCategory testCategory;
    private ChartOfAccount testChartOfAccount;
    private User testUser;

    @BeforeEach
    void setUp() {
        testChartOfAccount = new ChartOfAccount();
        testChartOfAccount.setChartOfAccountId(1);
        testChartOfAccount.setChartOfAccountName("Test COA");
        testChartOfAccount.setChartOfAccountCode("1001");

        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(1);
        testCategory.setTransactionCategoryName("Test Category");
        testCategory.setTransactionCategoryCode("TC001");
        testCategory.setChartOfAccount(testChartOfAccount);

        testUser = new User();
        testUser.setUserId(1);
        testUser.setUserName("testuser");
    }

    @Nested
    @DisplayName("GET /rest/transactioncategory/gettransactioncategory Tests")
    class GetAllTransactionCategoryTests {

        @Test
        @DisplayName("Should return all transaction categories")
        void shouldReturnAllTransactionCategories() throws Exception {
            List<TransactionCategory> categories = Collections.singletonList(testCategory);
            TransactionCategoryModel model = new TransactionCategoryModel();
            model.setTransactionCategoryId(1);
            model.setTransactionCategoryName("Test Category");

            when(transactionCategoryService.findAllTransactionCategory()).thenReturn(categories);
            when(transcationCategoryHelper.getListModel(categories)).thenReturn(Collections.singletonList(model));

            mockMvc.perform(get("/rest/transactioncategory/gettransactioncategory"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].transactionCategoryId").value(1));
        }

        @Test
        @DisplayName("Should return error when no categories found")
        void shouldReturnErrorWhenNoCategories() throws Exception {
            when(transactionCategoryService.findAllTransactionCategory()).thenReturn(null);

            mockMvc.perform(get("/rest/transactioncategory/gettransactioncategory"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /rest/transactioncategory/getList Tests")
    class GetListTests {

        @Test
        @DisplayName("Should return paginated transaction category list")
        void shouldReturnPaginatedList() throws Exception {
            PaginationResponseModel responseModel = new PaginationResponseModel(1, new HashMap<>());
            responseModel.setData(Collections.singletonList(testCategory));

            when(chartOfAccountService.getChartOfAccount(7)).thenReturn(testChartOfAccount);
            when(chartOfAccountService.getChartOfAccount(8)).thenReturn(testChartOfAccount);
            when(transactionCategoryService.getTransactionCategoryList(any(), any())).thenReturn(responseModel);
            when(transcationCategoryHelper.getListModel(any())).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/rest/transactioncategory/getList"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.count").value(1));
        }

        @Test
        @DisplayName("Should return not found when service returns null")
        void shouldReturnNotFoundWhenNull() throws Exception {
            when(chartOfAccountService.getChartOfAccount(7)).thenReturn(testChartOfAccount);
            when(chartOfAccountService.getChartOfAccount(8)).thenReturn(testChartOfAccount);
            when(transactionCategoryService.getTransactionCategoryList(any(), any())).thenReturn(null);

            mockMvc.perform(get("/rest/transactioncategory/getList"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /rest/transactioncategory/getExportList Tests")
    class GetExportListTests {

        @Test
        @DisplayName("Should return export list")
        void shouldReturnExportList() throws Exception {
            List<TransactionCategory> categories = Collections.singletonList(testCategory);
            TransactionCategoryExportModel exportModel = new TransactionCategoryExportModel();
            exportModel.setTransactionCategoryName("Test Category");

            when(transactionCategoryService.findAllTransactionCategory()).thenReturn(categories);
            when(transcationCategoryHelper.getExportListModel(categories))
                    .thenReturn(Collections.singletonList(exportModel));

            mockMvc.perform(get("/rest/transactioncategory/getExportList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no data")
        void shouldReturnNotFoundWhenNoData() throws Exception {
            when(transactionCategoryService.findAllTransactionCategory()).thenReturn(null);

            mockMvc.perform(get("/rest/transactioncategory/getExportList"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("GET /rest/transactioncategory/getTransactionCategoryById Tests")
    class GetByIdTests {

        @Test
        @DisplayName("Should return transaction category by id")
        void shouldReturnTransactionCategoryById() throws Exception {
            TransactionCategoryModel model = new TransactionCategoryModel();
            model.setTransactionCategoryId(1);
            model.setTransactionCategoryName("Test Category");

            when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
            when(transcationCategoryHelper.getModel(testCategory)).thenReturn(model);

            mockMvc.perform(get("/rest/transactioncategory/getTransactionCategoryById")
                            .param("id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.transactionCategoryId").value(1));
        }

        @Test
        @DisplayName("Should return error when category not found")
        void shouldReturnErrorWhenNotFound() throws Exception {
            when(transactionCategoryService.findByPK(999)).thenReturn(null);

            mockMvc.perform(get("/rest/transactioncategory/getTransactionCategoryById")
                            .param("id", "999"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("DELETE /rest/transactioncategory/deleteTransactionCategory Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete transaction category")
        void shouldDeleteTransactionCategory() throws Exception {
            when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);

            mockMvc.perform(delete("/rest/transactioncategory/deleteTransactionCategory")
                            .param("id", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value("0068"));

            verify(transactionCategoryService).update(any(), anyInt());
        }

        @Test
        @DisplayName("Should return error when category not found")
        void shouldReturnErrorWhenNotFound() throws Exception {
            when(transactionCategoryService.findByPK(999)).thenReturn(null);

            mockMvc.perform(delete("/rest/transactioncategory/deleteTransactionCategory")
                            .param("id", "999"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("DELETE /rest/transactioncategory/deleteTransactionCategories Tests")
    class DeleteMultipleTests {

        @Test
        @DisplayName("Should delete multiple categories")
        void shouldDeleteMultipleCategories() throws Exception {
            String requestBody = "{\"ids\":[1,2,3]}";

            mockMvc.perform(delete("/rest/transactioncategory/deleteTransactionCategories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(requestBody))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value("0068"));

            verify(transactionCategoryService).deleteByIds(any());
        }
    }

    @Nested
    @DisplayName("POST /rest/transactioncategory/save Tests")
    class SaveTests {

        @Test
        @DisplayName("Should save new transaction category")
        void shouldSaveNewTransactionCategory() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userServiceNew.findByPK(1)).thenReturn(testUser);
            when(transcationCategoryHelper.getEntity(any())).thenReturn(testCategory);

            TransactionCategoryBean bean = new TransactionCategoryBean();
            bean.setTransactionCategoryName("Test Category");
            bean.setChartOfAccount(1);

            mockMvc.perform(post("/rest/transactioncategory/save")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(bean)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value("0069"));

            verify(transactionCategoryService).persist(any());
        }
    }

    @Nested
    @DisplayName("POST /rest/transactioncategory/update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update transaction category")
        void shouldUpdateTransactionCategory() throws Exception {
            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userServiceNew.findByPK(1)).thenReturn(testUser);
            when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);

            TransactionCategoryBean bean = new TransactionCategoryBean();
            bean.setTransactionCategoryId(1);
            bean.setTransactionCategoryName("Updated Category");
            bean.setChartOfAccount(1);

            mockMvc.perform(post("/rest/transactioncategory/update")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(bean)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value("0070"));

            verify(transactionCategoryService).update(any());
        }
    }

    @Nested
    @DisplayName("GET /rest/transactioncategory/getForExpenses Tests")
    class GetForExpensesTests {

        @Test
        @DisplayName("Should return categories for expenses")
        void shouldReturnCategoriesForExpenses() throws Exception {
            List<TransactionCategory> categories = Collections.singletonList(testCategory);
            when(transactionExpensesRepository.getTransactionCategory(any())).thenReturn(categories);

            mockMvc.perform(get("/rest/transactioncategory/getForExpenses"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return error when no categories")
        void shouldReturnErrorWhenNoCategories() throws Exception {
            when(transactionExpensesRepository.getTransactionCategory(any())).thenReturn(null);

            mockMvc.perform(get("/rest/transactioncategory/getForExpenses"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /rest/transactioncategory/getExplainedTransactionCountForTransactionCategory Tests")
    class GetExplainedTransactionCountTests {

        @Test
        @DisplayName("Should return explained transaction count")
        void shouldReturnExplainedTransactionCount() throws Exception {
            testChartOfAccount.setChartOfAccountCode("EXPENSE");
            when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);
            when(transactionService.getExplainedTransactionCountByTransactionCategoryId(1)).thenReturn(5);

            mockMvc.perform(get("/rest/transactioncategory/getExplainedTransactionCountForTransactionCategory")
                            .param("transactionCategoryId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(5));
        }

        @Test
        @DisplayName("Should return 1 for bank category")
        void shouldReturn1ForBankCategory() throws Exception {
            testChartOfAccount.setChartOfAccountCode("BANK");
            when(transactionCategoryService.findByPK(1)).thenReturn(testCategory);

            mockMvc.perform(get("/rest/transactioncategory/getExplainedTransactionCountForTransactionCategory")
                            .param("transactionCategoryId", "1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(1));
        }
    }

    @Nested
    @DisplayName("GET /rest/transactioncategory/getTransactionCategoryListForManualJornal Tests")
    class GetListForManualJournalTests {

        @Test
        @DisplayName("Should return categories for manual journal")
        void shouldReturnCategoriesForManualJournal() throws Exception {
            List<TransactionCategory> categories = Collections.singletonList(testCategory);
            SingleLevelDropDownModel dropDownModel = new SingleLevelDropDownModel();
            dropDownModel.setValue(1);
            dropDownModel.setLabel("Test Category");

            when(transactionCategoryService.getTransactionCategoryListManualJornal()).thenReturn(categories);
            when(transcationCategoryHelper.getSingleLevelDropDownModelListForManualJournal(categories))
                    .thenReturn(Collections.singletonList(dropDownModel));

            mockMvc.perform(get("/rest/transactioncategory/getTransactionCategoryListForManualJornal"))
                    .andExpect(status().isOk());
        }
    }
}
