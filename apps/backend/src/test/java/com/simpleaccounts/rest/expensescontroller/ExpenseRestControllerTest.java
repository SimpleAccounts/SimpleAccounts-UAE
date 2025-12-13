package com.simpleaccounts.rest.expensescontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.helper.ExpenseRestHelper;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.FileAttachmentService;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExpenseRestController Unit Tests")
class ExpenseRestControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private ExpenseService expenseService;

    @Mock
    private ExpenseRestHelper expenseRestHelper;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private TransactionCategoryService expenseTransactionCategoryService;

    @Mock
    private CurrencyService currencyService;

    @Mock
    private TransactionCategoryBalanceService transactionCategoryBalanceService;

    @Mock
    private UserService userService;

    @Mock
    private FileAttachmentService fileAttachmentService;

    @Mock
    private InvoiceRestHelper invoiceRestHelper;

    @InjectMocks
    private ExpenseRestController expenseRestController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(expenseRestController).build();
        objectMapper = new ObjectMapper();
    }

    @Nested
    @DisplayName("getExpenseList Tests")
    class GetExpenseListTests {

        @Test
        @DisplayName("Should return expense list successfully")
        void getExpenseListReturnsExpenses() throws Exception {
            // Arrange
            User user = createUser(1, "John", "Doe");
            List<Expense> expenses = createExpenseList(5);
            List<ExpenseModel> expenseModels = createExpenseModelList(5);
            PaginationResponseModel response = new PaginationResponseModel(5, expenses);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(expenseService.getExpensesList(any(), any())).thenReturn(response);
            when(expenseRestHelper.getExpenseList(any(), any())).thenReturn(expenseModels);

            // Act & Assert
            mockMvc.perform(get("/rest/expense/getList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return not found when no expenses exist")
        void getExpenseListReturnsNotFound() throws Exception {
            // Arrange
            User user = createUser(1, "John", "Doe");

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(expenseService.getExpensesList(any(), any())).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/expense/getList"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should handle filter parameters correctly")
        void getExpenseListHandlesFilters() throws Exception {
            // Arrange
            User user = createUser(1, "John", "Doe");
            List<Expense> expenses = createExpenseList(3);
            List<ExpenseModel> expenseModels = createExpenseModelList(3);
            PaginationResponseModel response = new PaginationResponseModel(3, expenses);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(user);
            when(expenseService.getExpensesList(any(), any())).thenReturn(response);
            when(expenseRestHelper.getExpenseList(any(), any())).thenReturn(expenseModels);

            // Act & Assert
            mockMvc.perform(get("/rest/expense/getList")
                            .param("payee", "Test Payee")
                            .param("expenseDate", "2024-01-01"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getExpenseById Tests")
    class GetExpenseByIdTests {

        @Test
        @DisplayName("Should return expense by ID")
        void getExpenseByIdReturnsExpense() throws Exception {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("500.00"));
            ExpenseModel expenseModel = createExpenseModel(1, new BigDecimal("500.00"));

            when(expenseService.findByPK(1)).thenReturn(expense);
            when(expenseRestHelper.getExpenseModel(expense)).thenReturn(expenseModel);

            // Act & Assert
            mockMvc.perform(get("/rest/expense/getExpenseById")
                            .param("expenseId", "1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("deleteExpense Tests")
    class DeleteExpenseTests {

        @Test
        @DisplayName("Should delete expense successfully")
        void deleteExpenseSucceeds() throws Exception {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("500.00"));
            List<TransactionCategoryBalance> balances = new ArrayList<>();

            when(expenseService.findByPK(1)).thenReturn(expense);
            when(transactionCategoryBalanceService.findByAttributes(any())).thenReturn(balances);

            // Act & Assert
            mockMvc.perform(delete("/rest/expense/delete")
                            .param("expenseId", "1"))
                    .andExpect(status().isOk());

            verify(expenseService).update(any(Expense.class));
        }

        @Test
        @DisplayName("Should delete expense with transaction category balances")
        void deleteExpenseDeletesBalances() throws Exception {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("500.00"));
            TransactionCategoryBalance balance = new TransactionCategoryBalance();
            List<TransactionCategoryBalance> balances = Arrays.asList(balance);

            when(expenseService.findByPK(1)).thenReturn(expense);
            when(transactionCategoryBalanceService.findByAttributes(any())).thenReturn(balances);

            // Act & Assert
            mockMvc.perform(delete("/rest/expense/delete")
                            .param("expenseId", "1"))
                    .andExpect(status().isOk());

            verify(transactionCategoryBalanceService).delete(any(TransactionCategoryBalance.class));
            verify(expenseService).update(any(Expense.class));
        }
    }

    @Nested
    @DisplayName("bulkDelete Tests")
    class BulkDeleteTests {

        @Test
        @DisplayName("Should bulk delete expenses successfully")
        void bulkDeleteSucceeds() throws Exception {
            // Arrange
            String requestBody = "{\"ids\":[1,2,3]}";

            // Act & Assert
            mockMvc.perform(delete("/rest/expense/deletes")
                            .contentType("application/json")
                            .content(requestBody))
                    .andExpect(status().isOk());

            verify(expenseService).deleteByIds(any());
        }
    }

    @Nested
    @DisplayName("Expense Entity Tests")
    class ExpenseEntityTests {

        @Test
        @DisplayName("Should handle expense with all fields")
        void handleExpenseWithAllFields() throws Exception {
            // Arrange
            Expense expense = createExpense(1, new BigDecimal("500.00"));
            expense.setPayee("Test Payee");
            expense.setReceiptNumber("REC-001");
            expense.setExpenseDescription("Test Description");

            ExpenseModel expenseModel = createExpenseModel(1, new BigDecimal("500.00"));
            expenseModel.setPayee("Test Payee");

            when(expenseService.findByPK(1)).thenReturn(expense);
            when(expenseRestHelper.getExpenseModel(expense)).thenReturn(expenseModel);

            // Act & Assert
            mockMvc.perform(get("/rest/expense/getExpenseById")
                            .param("expenseId", "1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Admin vs Non-Admin Role Tests")
    class AdminRoleTests {

        @Test
        @DisplayName("Should handle admin user without user ID filter")
        void handleAdminUser() throws Exception {
            // Arrange
            User adminUser = createUser(1, "Admin", "User");
            Role adminRole = new Role();
            adminRole.setRoleCode(1); // Admin role
            adminUser.setRole(adminRole);

            List<Expense> expenses = createExpenseList(5);
            List<ExpenseModel> expenseModels = createExpenseModelList(5);
            PaginationResponseModel response = new PaginationResponseModel(5, expenses);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
            when(userService.findByPK(1)).thenReturn(adminUser);
            when(expenseService.getExpensesList(any(), any())).thenReturn(response);
            when(expenseRestHelper.getExpenseList(any(), any())).thenReturn(expenseModels);

            // Act & Assert
            mockMvc.perform(get("/rest/expense/getList"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should handle non-admin user with user ID filter")
        void handleNonAdminUser() throws Exception {
            // Arrange
            User regularUser = createUser(2, "Regular", "User");
            Role userRole = new Role();
            userRole.setRoleCode(2); // Non-admin role
            regularUser.setRole(userRole);

            List<Expense> expenses = createExpenseList(3);
            List<ExpenseModel> expenseModels = createExpenseModelList(3);
            PaginationResponseModel response = new PaginationResponseModel(3, expenses);

            when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(2);
            when(userService.findByPK(2)).thenReturn(regularUser);
            when(expenseService.getExpensesList(any(), any())).thenReturn(response);
            when(expenseRestHelper.getExpenseList(any(), any())).thenReturn(expenseModels);

            // Act & Assert
            mockMvc.perform(get("/rest/expense/getList"))
                    .andExpect(status().isOk());
        }
    }

    private User createUser(Integer id, String firstName, String lastName) {
        User user = new User();
        user.setUserId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUserEmail(firstName.toLowerCase() + "@test.com");
        user.setDeleteFlag(false);
        user.setIsActive(true);

        Role role = new Role();
        role.setRoleCode(1);
        role.setRoleName("Admin");
        user.setRole(role);

        Company company = new Company();
        company.setCompanyId(1);
        user.setCompany(company);

        return user;
    }

    private List<Expense> createExpenseList(int count) {
        List<Expense> expenses = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            expenses.add(createExpense(i, new BigDecimal(100 * i)));
        }
        return expenses;
    }

    private Expense createExpense(Integer id, BigDecimal amount) {
        Expense expense = new Expense();
        expense.setExpenseId(id);
        expense.setExpenseAmount(amount);
        expense.setExpenseNumber("EXP-" + id);
        expense.setExpenseDate(LocalDate.now());
        expense.setExpenseVatAmount(amount.multiply(new BigDecimal("0.05")));
        expense.setExchangeRate(BigDecimal.ONE);
        expense.setDeleteFlag(false);
        expense.setVatClaimable(true);
        expense.setExclusiveVat(false);
        expense.setStatus(2);
        expense.setCreatedBy(1);
        expense.setCreatedDate(LocalDateTime.now());
        expense.setVersionNumber(1);
        return expense;
    }

    private List<ExpenseModel> createExpenseModelList(int count) {
        List<ExpenseModel> models = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            models.add(createExpenseModel(i, new BigDecimal(100 * i)));
        }
        return models;
    }

    private ExpenseModel createExpenseModel(Integer id, BigDecimal amount) {
        ExpenseModel model = new ExpenseModel();
        model.setExpenseId(id);
        model.setExpenseAmount(amount);
        model.setExpenseNumber("EXP-" + id);
        return model;
    }
}
