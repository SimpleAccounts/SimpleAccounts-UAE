package com.simpleaccounts.rest.receiptcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.ReceiptFilterEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.CustomerInvoiceReceiptService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.ReceiptService;
import com.simpleaccounts.service.UserService;

import java.util.ArrayList;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

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
class ReceiptControllerTest {

    @Mock private ReceiptService receiptService;
    @Mock private ReceiptRestHelper receiptRestHelper;
    @Mock private ContactService contactService;
    @Mock private InvoiceService invoiceService;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private CustomerInvoiceReceiptService customerInvoiceReceiptService;
    @Mock private JournalService journalService;
    @Mock private UserService userService;
    @Mock private BankAccountService bankAccountService;

    @InjectMocks
    private ReceiptController controller;

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
        ReceiptRequestFilterModel filterModel = new ReceiptRequestFilterModel();
        filterModel.setReferenceCode("RCP-001");

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        when(receiptService.getReceiptList(any(), eq(filterModel))).thenReturn(pagination);
        when(receiptRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        ResponseEntity<PaginationResponseModel> response = controller.getList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getCount()).isEqualTo(10);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(receiptService).getReceiptList(captor.capture(), eq(filterModel));
        Map<ReceiptFilterEnum, Object> filterData = captor.getValue();

        // Admin should not have USER_ID filter
        assertThat(filterData).doesNotContainKey(ReceiptFilterEnum.USER_ID);
        assertThat(filterData).containsEntry(ReceiptFilterEnum.REFERENCE_CODE, "RCP-001");
        assertThat(filterData).containsEntry(ReceiptFilterEnum.DELETE, false);
    }

    @Test
    void getListShouldFilterByUserIdForNonAdmin() {
        ReceiptRequestFilterModel filterModel = new ReceiptRequestFilterModel();
        filterModel.setUserId(2);

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(2);
        when(userService.findByPK(2)).thenReturn(normalUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(receiptService.getReceiptList(any(), eq(filterModel))).thenReturn(pagination);
        when(receiptRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        controller.getList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(receiptService).getReceiptList(captor.capture(), eq(filterModel));
        Map<ReceiptFilterEnum, Object> filterData = captor.getValue();

        // Non-admin should have USER_ID filter
        assertThat(filterData).containsEntry(ReceiptFilterEnum.USER_ID, 2);
    }

    @Test
    void getListShouldReturnNotFoundWhenServiceReturnsNull() {
        ReceiptRequestFilterModel filterModel = new ReceiptRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(receiptService.getReceiptList(any(), eq(filterModel))).thenReturn(null);

        ResponseEntity<PaginationResponseModel> response = controller.getList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getListShouldFilterByContactId() {
        ReceiptRequestFilterModel filterModel = new ReceiptRequestFilterModel();
        filterModel.setContactId(5);

        Contact contact = new Contact();
        contact.setContactId(5);

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(contactService.findByPK(5)).thenReturn(contact);

        PaginationResponseModel pagination = new PaginationResponseModel(3, new ArrayList<>());
        when(receiptService.getReceiptList(any(), eq(filterModel))).thenReturn(pagination);
        when(receiptRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        ResponseEntity<PaginationResponseModel> response = controller.getList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(receiptService).getReceiptList(captor.capture(), eq(filterModel));
        Map<ReceiptFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ReceiptFilterEnum.CONTACT, contact);
    }

    @Test
    void getListShouldFilterByInvoiceId() {
        ReceiptRequestFilterModel filterModel = new ReceiptRequestFilterModel();
        filterModel.setInvoiceId(10);

        Invoice invoice = new Invoice();
        invoice.setId(10);

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(invoiceService.findByPK(10)).thenReturn(invoice);

        PaginationResponseModel pagination = new PaginationResponseModel(2, new ArrayList<>());
        when(receiptService.getReceiptList(any(), eq(filterModel))).thenReturn(pagination);
        when(receiptRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        ResponseEntity<PaginationResponseModel> response = controller.getList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(receiptService).getReceiptList(captor.capture(), eq(filterModel));
        Map<ReceiptFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ReceiptFilterEnum.INVOICE, invoice);
    }

    @Test
    void getListShouldTransformReceiptData() {
        ReceiptRequestFilterModel filterModel = new ReceiptRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(1, new ArrayList<>());
        when(receiptService.getReceiptList(any(), eq(filterModel))).thenReturn(pagination);
        when(receiptRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        ResponseEntity<PaginationResponseModel> response = controller.getList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(receiptRestHelper).getListModel(any());
    }

    @Test
    void getListShouldHandleEmptyReferenceCode() {
        ReceiptRequestFilterModel filterModel = new ReceiptRequestFilterModel();
        filterModel.setReferenceCode("");

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(receiptService.getReceiptList(any(), eq(filterModel))).thenReturn(pagination);
        when(receiptRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        controller.getList(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(receiptService).getReceiptList(captor.capture(), eq(filterModel));
        Map<ReceiptFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ReceiptFilterEnum.REFERENCE_CODE, "");
    }
}
