package com.simpleaccounts.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.RoleCode;
import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceListModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRequestFilterModel;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestController;
import com.simpleaccounts.rest.invoicecontroller.InvoiceRestHelper;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.InvoiceService;
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
 * Phase 1 RBAC regression for invoice data access.
 */
@RunWith(MockitoJUnitRunner.class)
public class UserAuthorizationTest {

    private static final int USER_ID = 101;

    @InjectMocks
    private InvoiceRestController invoiceRestController;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private UserService userService;

    @Mock
    private InvoiceService invoiceService;

    @Mock
    private InvoiceRestHelper invoiceRestHelper;

    @Mock
    private ContactService contactService;

    @Mock
    private CurrencyService currencyService;

    @Test
    public void shouldAllowAdminToAccessAllInvoices() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(USER_ID);
        when(userService.findByPK(USER_ID)).thenReturn(buildUser(RoleCode.ADMIN));

        PaginationResponseModel serviceResponse = new PaginationResponseModel(1, new ArrayList<>());
        when(invoiceService.getInvoiceList(anyMap(), any(InvoiceRequestFilterModel.class)))
            .thenReturn(serviceResponse);
        when(invoiceRestHelper.getListModel(any()))
            .thenReturn(Collections.singletonList(buildInvoiceListModel("INV-1001")));

        InvoiceRequestFilterModel filterModel = new InvoiceRequestFilterModel();
        ResponseEntity<PaginationResponseModel> response =
            invoiceRestController.getInvoiceList(filterModel, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> payload = (List<?>) response.getBody().getData();
        assertEquals("INV-1001", ((InvoiceListModel) payload.get(0)).getReferenceNumber());

        ArgumentCaptor<Map<InvoiceFilterEnum, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(invoiceService).getInvoiceList(captor.capture(), eq(filterModel));
        assertFalse("Admins should not be forced through USER_ID filter",
            captor.getValue().containsKey(InvoiceFilterEnum.USER_ID));
    }

    @Test
    public void shouldRestrictEmployeeToOwnInvoices() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(USER_ID);
        when(userService.findByPK(USER_ID)).thenReturn(buildUser(RoleCode.EMPLOYEE));

        PaginationResponseModel serviceResponse = new PaginationResponseModel(2, new ArrayList<>());
        when(invoiceService.getInvoiceList(anyMap(), any(InvoiceRequestFilterModel.class)))
            .thenReturn(serviceResponse);
        when(invoiceRestHelper.getListModel(any()))
            .thenReturn(Collections.singletonList(buildInvoiceListModel("INV-2002")));

        InvoiceRequestFilterModel filterModel = new InvoiceRequestFilterModel();
        ResponseEntity<PaginationResponseModel> response =
            invoiceRestController.getInvoiceList(filterModel, request);

        List<?> payload = (List<?>) response.getBody().getData();
        assertEquals("INV-2002", ((InvoiceListModel) payload.get(0)).getReferenceNumber());

        ArgumentCaptor<Map<InvoiceFilterEnum, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(invoiceService).getInvoiceList(captor.capture(), eq(filterModel));
        assertTrue("Employees should be scoped by USER_ID",
            captor.getValue().containsKey(InvoiceFilterEnum.USER_ID));
        assertEquals(USER_ID, captor.getValue().get(InvoiceFilterEnum.USER_ID));
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

    private InvoiceListModel buildInvoiceListModel(String referenceNumber) {
        InvoiceListModel model = new InvoiceListModel();
        model.setReferenceNumber(referenceNumber);
        return model;
    }
}

