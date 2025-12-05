package com.simpleaccounts.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.RoleCode;
import com.simpleaccounts.constant.dbfilter.ExpenseFIlterEnum;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.helper.ExpenseRestHelper;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.expensescontroller.ExpenseListModel;
import com.simpleaccounts.rest.expensescontroller.ExpenseRequestFilterModel;
import com.simpleaccounts.rest.expensescontroller.ExpenseRestController;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Phase 1 RBAC regression for expense endpoints.
 */
@RunWith(MockitoJUnitRunner.class)
public class RolePermissionTest {

    private static final int USER_ID = 202;

    @InjectMocks
    private ExpenseRestController expenseRestController;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private UserService userService;

    @Mock
    private ExpenseService expenseService;

    @Mock
    private ExpenseRestHelper expenseRestHelper;

    @Mock
    private TransactionCategoryService expenseTransactionCategoryService;

    @Mock
    private CurrencyService currencyService;

    @Test
    public void shouldReturnExpenseDataForAdmins() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(USER_ID);
        when(userService.findByPK(USER_ID)).thenReturn(buildUser(RoleCode.ADMIN));

        PaginationResponseModel serviceResponse = new PaginationResponseModel(2, new ArrayList<>());
        when(expenseService.getExpensesList(anyMap(), any(ExpenseRequestFilterModel.class)))
            .thenReturn(serviceResponse);
        when(expenseRestHelper.getExpenseList(any(), any(User.class)))
            .thenReturn(Collections.singletonList(new ExpenseListModel()));

        ExpenseRequestFilterModel filterModel = new ExpenseRequestFilterModel();
        ResponseEntity<PaginationResponseModel> response =
            expenseRestController.getExpenseList(filterModel, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(Integer.valueOf(2), response.getBody().getCount());

        ArgumentCaptor<Map<ExpenseFIlterEnum, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(expenseService).getExpensesList(captor.capture(), any(ExpenseRequestFilterModel.class));
        assertTrue("baseline delete filter is always added",
            captor.getValue().containsKey(ExpenseFIlterEnum.DELETE_FLAG));
    }

    @Test
    public void shouldRestrictEmployeesToTheirOwnExpenses() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(USER_ID);
        when(userService.findByPK(USER_ID)).thenReturn(buildUser(RoleCode.EMPLOYEE));

        PaginationResponseModel serviceResponse = new PaginationResponseModel(1, new ArrayList<>());
        when(expenseService.getExpensesList(anyMap(), any(ExpenseRequestFilterModel.class)))
            .thenReturn(serviceResponse);
        when(expenseRestHelper.getExpenseList(any(), any(User.class)))
            .thenReturn(Collections.singletonList(new ExpenseListModel()));

        ExpenseRequestFilterModel filterModel = new ExpenseRequestFilterModel();
        ResponseEntity<PaginationResponseModel> response =
            expenseRestController.getExpenseList(filterModel, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> payload = (List<?>) response.getBody().getData();
        assertEquals(1, payload.size());

        ArgumentCaptor<Map<ExpenseFIlterEnum, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(expenseService).getExpensesList(captor.capture(), any(ExpenseRequestFilterModel.class));
        assertTrue("Employees should only see their own expenses",
            captor.getValue().containsKey(ExpenseFIlterEnum.USER_ID));
        assertEquals(USER_ID, captor.getValue().get(ExpenseFIlterEnum.USER_ID));
    }

    private User buildUser(RoleCode roleCode) {
        Role role = new Role();
        role.setRoleCode(roleCode.getCode());
        role.setRoleName(roleCode.name());

        User user = new User();
        user.setUserId(USER_ID);
        user.setRole(role);
        return user;
    }
}



