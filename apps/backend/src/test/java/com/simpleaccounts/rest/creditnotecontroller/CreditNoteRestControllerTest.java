package com.simpleaccounts.rest.creditnotecontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.CreditNote;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.CreditNoteInvoiceRelationService;
import com.simpleaccounts.service.FileAttachmentService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.UserService;

import java.math.BigDecimal;
import java.util.ArrayList;
import javax.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class CreditNoteRestControllerTest {

    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private InvoiceService invoiceService;
    @Mock private CreditNoteRestHelper creditNoteRestHelper;
    @Mock private JournalService journalService;
    @Mock private UserService userService;
    @Mock private CompanyService companyService;
    @Mock private CreditNoteInvoiceRelationService creditNoteInvoiceRelationService;
    @Mock private FileAttachmentService fileAttachmentService;
    @Mock private CreditNoteRepository creditNoteRepository;

    @InjectMocks
    private CreditNoteRestController controller;

    private HttpServletRequest mockRequest;
    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setUp() {
        mockRequest = mock(HttpServletRequest.class);

        Role adminRole = new Role();
        adminRole.setRoleCode(1);

        Role userRole = new Role();
        userRole.setRoleCode(2);

        adminUser = new User();
        adminUser.setUserId(1);
        adminUser.setRole(adminRole);

        normalUser = new User();
        normalUser.setUserId(2);
        normalUser.setRole(userRole);
    }

    @Test
    void getListShouldReturnPaginatedListForAdmin() {
        CreditNoteRequestFilterModel filterModel = new CreditNoteRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        ResponseEntity<PaginationResponseModel> response =
            controller.getList(filterModel, null, null, 0, 10, true, null, null, null, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(creditNoteRestHelper).getListModel(any(), any(), any(), anyInt(), anyInt(),
            eq(true), any(), any(), eq(1), any());
    }

    @Test
    void getListShouldFilterByContactWhenProvided() {
        CreditNoteRequestFilterModel filterModel = new CreditNoteRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        ResponseEntity<PaginationResponseModel> response =
            controller.getList(filterModel, 5, null, 0, 10, true, null, null, null, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(creditNoteRestHelper).getListModel(any(), eq(5), any(), anyInt(), anyInt(),
            eq(true), any(), any(), eq(1), any());
    }

    @Test
    void getListShouldFilterByAmountWhenProvided() {
        CreditNoteRequestFilterModel filterModel = new CreditNoteRequestFilterModel();
        BigDecimal amount = new BigDecimal("1000.00");

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        ResponseEntity<PaginationResponseModel> response =
            controller.getList(filterModel, null, amount, 0, 10, true, null, null, null, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(creditNoteRestHelper).getListModel(any(), any(), eq(amount), anyInt(), anyInt(),
            eq(true), any(), any(), eq(1), any());
    }

    @Test
    void getListShouldHandlePaginationParameters() {
        CreditNoteRequestFilterModel filterModel = new CreditNoteRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        ResponseEntity<PaginationResponseModel> response =
            controller.getList(filterModel, null, null, 2, 20, false, "desc", "date", null, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(creditNoteRestHelper).getListModel(any(), any(), any(), eq(2), eq(20),
            eq(false), eq("desc"), eq("date"), eq(1), any());
    }

    @Test
    void getListShouldFilterByTypeWhenProvided() {
        CreditNoteRequestFilterModel filterModel = new CreditNoteRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        ResponseEntity<PaginationResponseModel> response =
            controller.getList(filterModel, null, null, 0, 10, true, null, null, 1, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(creditNoteRestHelper).getListModel(any(), any(), any(), anyInt(), anyInt(),
            eq(true), any(), any(), eq(1), eq(1));
    }

    @Test
    void getListShouldReturnOkForNonAdminUser() {
        CreditNoteRequestFilterModel filterModel = new CreditNoteRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(2);
        when(userService.findByPK(2)).thenReturn(normalUser);

        ResponseEntity<PaginationResponseModel> response =
            controller.getList(filterModel, null, null, 0, 10, true, null, null, null, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(creditNoteRestHelper).getListModel(any(), any(), any(), anyInt(), anyInt(),
            eq(true), any(), any(), eq(2), any());
    }

    @Test
    void getListShouldHandleSortingParameters() {
        CreditNoteRequestFilterModel filterModel = new CreditNoteRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        ResponseEntity<PaginationResponseModel> response =
            controller.getList(filterModel, null, null, 0, 10, true, "asc", "creditNoteNumber", null, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(creditNoteRestHelper).getListModel(any(), any(), any(), anyInt(), anyInt(),
            eq(true), eq("asc"), eq("creditNoteNumber"), anyInt(), any());
    }
}
