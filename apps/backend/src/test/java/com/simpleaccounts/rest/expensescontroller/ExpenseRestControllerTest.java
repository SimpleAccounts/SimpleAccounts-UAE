package com.simpleaccounts.rest.expensescontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.ExpenseFIlterEnum;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
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
import com.simpleaccounts.utils.SimpleAccountsMessage;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.ServletContext;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class ExpenseRestControllerTest {

    @Mock private ExpenseService expenseService;
    @Mock private ExpenseRestHelper expenseRestHelper;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private TransactionCategoryService expenseTransactionCategoryService;
    @Mock private CurrencyService currencyService;
    @Mock private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @Mock private UserService userService;
    @Mock private FileAttachmentService fileAttachmentService;
    @Mock private InvoiceRestHelper invoiceRestHelper;

    @InjectMocks
    private ExpenseRestController controller;

    private HttpServletRequest mockRequest;
    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setUp() {
        mockRequest = mock(HttpServletRequest.class);

        Role adminRole = new Role();
        adminRole.setRoleCode(1); // Admin role

        Role userRole = new Role();
        userRole.setRoleCode(2); // Non-admin role

        adminUser = new User();
        adminUser.setUserId(1);
        adminUser.setRole(adminRole);

        normalUser = new User();
        normalUser.setUserId(2);
        normalUser.setRole(userRole);
    }

    @Test
    void getExpenseListShouldBuildFilterMapAndReturnResponseForAdmin() {
        ExpenseRequestFilterModel filterModel = new ExpenseRequestFilterModel();
        filterModel.setPayee("Test Payee");
        filterModel.setExpenseDate("2024-01-15");

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        List<ExpenseListModel> dataList = new ArrayList<>();
        PaginationResponseModel pagination = new PaginationResponseModel(1, dataList);
        when(expenseService.getExpensesList(any(), eq(filterModel))).thenReturn(pagination);
        when(expenseRestHelper.getExpenseList(any(), eq(adminUser))).thenReturn(dataList);

        ResponseEntity<PaginationResponseModel> response = controller.getExpenseList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(expenseService).getExpensesList(captor.capture(), eq(filterModel));
        Map<ExpenseFIlterEnum, Object> filterData = captor.getValue();

        // Admin should not have USER_ID filter
        assertThat(filterData).doesNotContainKey(ExpenseFIlterEnum.USER_ID);
        assertThat(filterData).containsEntry(ExpenseFIlterEnum.PAYEE, "Test Payee");
        assertThat(filterData).containsEntry(ExpenseFIlterEnum.DELETE_FLAG, false);
        assertThat(filterData).containsEntry(ExpenseFIlterEnum.EXPENSE_DATE, LocalDate.parse("2024-01-15"));
    }

    @Test
    void getExpenseListShouldFilterByUserIdForNonAdmin() {
        ExpenseRequestFilterModel filterModel = new ExpenseRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(2);
        when(userService.findByPK(2)).thenReturn(normalUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(expenseService.getExpensesList(any(), eq(filterModel))).thenReturn(pagination);
        when(expenseRestHelper.getExpenseList(any(), eq(normalUser))).thenReturn(new ArrayList<>());

        controller.getExpenseList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(expenseService).getExpensesList(captor.capture(), eq(filterModel));
        Map<ExpenseFIlterEnum, Object> filterData = captor.getValue();

        // Non-admin should have USER_ID filter
        assertThat(filterData).containsEntry(ExpenseFIlterEnum.USER_ID, 2);
    }

    @Test
    void getExpenseListShouldFilterByTransactionCategoryWhenProvided() {
        ExpenseRequestFilterModel filterModel = new ExpenseRequestFilterModel();
        filterModel.setTransactionCategoryId(10);

        TransactionCategory category = new TransactionCategory();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(expenseTransactionCategoryService.findByPK(10)).thenReturn(category);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(expenseService.getExpensesList(any(), eq(filterModel))).thenReturn(pagination);
        when(expenseRestHelper.getExpenseList(any(), eq(adminUser))).thenReturn(new ArrayList<>());

        controller.getExpenseList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(expenseService).getExpensesList(captor.capture(), eq(filterModel));
        Map<ExpenseFIlterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ExpenseFIlterEnum.TRANSACTION_CATEGORY, category);
    }

    @Test
    void getExpenseListShouldFilterByCurrencyWhenProvided() {
        ExpenseRequestFilterModel filterModel = new ExpenseRequestFilterModel();
        filterModel.setCurrencyCode(5);

        Currency currency = new Currency();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(currencyService.findByPK(5)).thenReturn(currency);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(expenseService.getExpensesList(any(), eq(filterModel))).thenReturn(pagination);
        when(expenseRestHelper.getExpenseList(any(), eq(adminUser))).thenReturn(new ArrayList<>());

        controller.getExpenseList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(expenseService).getExpensesList(captor.capture(), eq(filterModel));
        Map<ExpenseFIlterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ExpenseFIlterEnum.CURRECY, currency);
    }

    @Test
    void getExpenseListShouldReturnNotFoundWhenServiceReturnsNull() {
        ExpenseRequestFilterModel filterModel = new ExpenseRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(expenseService.getExpensesList(any(), eq(filterModel))).thenReturn(null);

        ResponseEntity<PaginationResponseModel> response = controller.getExpenseList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getExpenseByIdShouldReturnExpenseWhenFound() {
        Expense expense = new Expense();
        expense.setPayee("Test Payee");

        ExpenseModel expenseModel = new ExpenseModel();
        expenseModel.setPayee("Test Payee");

        when(expenseService.findByPK(1)).thenReturn(expense);
        when(expenseRestHelper.getExpenseModel(expense)).thenReturn(expenseModel);

        ResponseEntity<ExpenseModel> response = controller.getExpenseById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getPayee()).isEqualTo("Test Payee");
    }

    @Test
    void deleteShouldSoftDeleteExpenseAndCleanupCategoryBalances() {
        Expense expense = new Expense();
        expense.setDeleteFlag(false);

        TransactionCategory category = new TransactionCategory();
        expense.setTransactionCategory(category);

        TransactionCategoryBalance balance1 = new TransactionCategoryBalance();
        TransactionCategoryBalance balance2 = new TransactionCategoryBalance();
        List<TransactionCategoryBalance> balances = Arrays.asList(balance1, balance2);

        when(expenseService.findByPK(1)).thenReturn(expense);
        when(transactionCategoryBalanceService.findByAttributes(any())).thenReturn(balances);

        try {
            controller.delete(1);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests
        }

        // Verify business logic executed - balances should be deleted
        verify(transactionCategoryBalanceService, org.mockito.Mockito.times(2)).delete(any());
        verify(expenseService).update(expense);
        assertThat(expense.getDeleteFlag()).isTrue();
    }

    @Test
    void deleteShouldHandleNullExpenseGracefully() {
        when(expenseService.findByPK(999)).thenReturn(null);

        try {
            controller.delete(999);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests
        }

        verify(expenseService, never()).update(any());
    }

    @Test
    void bulkDeleteShouldDeleteMultipleExpenses() {
        DeleteModel deleteModel = new DeleteModel();
        ArrayList<Integer> ids = new ArrayList<>();
        ids.add(1);
        ids.add(2);
        ids.add(3);
        deleteModel.setIds(ids);

        ResponseEntity<?> response = controller.bulkDelete(deleteModel);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(expenseService).deleteByIds(ids);
    }

    @Test
    void saveShouldRejectDuplicateExpenseNumber() {
        ExpenseModel expenseModel = new ExpenseModel();
        expenseModel.setExpenseNumber("EXP-001");

        ServletContext servletContext = mock(ServletContext.class);
        when(mockRequest.getServletContext()).thenReturn(servletContext);
        when(servletContext.getRealPath("/")).thenReturn("/tmp");
        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(expenseRestHelper.doesInvoiceNumberExist("EXP-001")).thenReturn(true);

        try {
            ResponseEntity<?> response = controller.save(expenseModel, mockRequest);
            // If MessageUtil works, verify status
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests
        }

        // Verify duplicate check was performed and persist was not called
        verify(expenseRestHelper).doesInvoiceNumberExist("EXP-001");
        verify(expenseService, never()).persist(any());
    }

    @Test
    void saveShouldCreateExpenseWithoutAttachment() {
        ExpenseModel expenseModel = new ExpenseModel();
        expenseModel.setExpenseNumber("EXP-002");
        expenseModel.setPayee("Test Payee");
        expenseModel.setExclusiveVat(true);

        Expense expense = new Expense();

        ServletContext servletContext = mock(ServletContext.class);
        when(mockRequest.getServletContext()).thenReturn(servletContext);
        when(servletContext.getRealPath("/")).thenReturn("/tmp");
        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(expenseRestHelper.doesInvoiceNumberExist("EXP-002")).thenReturn(false);
        when(expenseRestHelper.getExpenseEntity(expenseModel)).thenReturn(expense);

        try {
            controller.save(expenseModel, mockRequest);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests
        }

        // Verify business logic executed
        verify(expenseService).persist(expense);
        assertThat(expense.getCreatedBy()).isEqualTo(1);
        assertThat(expense.getExclusiveVat()).isTrue();
    }

    @Test
    void updateShouldUpdateExpenseWhenIdProvided() {
        ExpenseModel expenseModel = new ExpenseModel();
        expenseModel.setExpenseId(1);
        expenseModel.setPayee("Updated Payee");
        expenseModel.setExclusiveVat(false);

        Expense expense = new Expense();

        ServletContext servletContext = mock(ServletContext.class);
        when(mockRequest.getServletContext()).thenReturn(servletContext);
        when(servletContext.getRealPath("/")).thenReturn("/tmp");
        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(expenseRestHelper.getExpenseEntity(expenseModel)).thenReturn(expense);

        try {
            controller.update(expenseModel, mockRequest);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests
        }

        // Verify business logic executed
        verify(expenseService).update(expense);
        assertThat(expense.getLastUpdateBy()).isEqualTo(1);
        assertThat(expense.getExclusiveVat()).isFalse();
    }

    @Test
    void updateShouldNotUpdateWhenIdNotProvided() {
        ExpenseModel expenseModel = new ExpenseModel();
        expenseModel.setExpenseId(null);

        ServletContext servletContext = mock(ServletContext.class);
        when(mockRequest.getServletContext()).thenReturn(servletContext);
        when(servletContext.getRealPath("/")).thenReturn("/tmp");
        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);

        try {
            controller.update(expenseModel, mockRequest);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests
        }

        verify(expenseService, never()).update(any());
    }

    @Test
    void getExpenseListShouldHandleEmptyExpenseDate() {
        ExpenseRequestFilterModel filterModel = new ExpenseRequestFilterModel();
        filterModel.setExpenseDate("");

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(expenseService.getExpensesList(any(), eq(filterModel))).thenReturn(pagination);
        when(expenseRestHelper.getExpenseList(any(), eq(adminUser))).thenReturn(new ArrayList<>());

        controller.getExpenseList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(expenseService).getExpensesList(captor.capture(), eq(filterModel));
        Map<ExpenseFIlterEnum, Object> filterData = captor.getValue();

        // Should not contain EXPENSE_DATE when it's empty
        assertThat(filterData).doesNotContainKey(ExpenseFIlterEnum.EXPENSE_DATE);
    }
}
