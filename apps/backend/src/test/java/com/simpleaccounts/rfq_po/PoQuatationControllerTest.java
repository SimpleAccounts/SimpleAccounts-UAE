package com.simpleaccounts.rfq_po;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ContactService;
import com.simpleaccounts.service.FileAttachmentService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.JournalService;
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
class PoQuatationControllerTest {

    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private PoQuatationRestHelper poQuatationRestHelper;
    @Mock private PoQuatationService poQuatationService;
    @Mock private UserService userService;
    @Mock private ContactService contactService;
    @Mock private PoQuatationLineItemService poQuatationLineItemService;
    @Mock private InvoiceService invoiceService;
    @Mock private FileAttachmentService fileAttachmentService;
    @Mock private RfqPoGrnInvoiceRelationService rfqPoGrnInvoiceRelationService;
    @Mock private RfqPoGrnInvoiceRelationDao rfqPoGrnInvoiceRelationDao;
    @Mock private JournalService journalService;

    @InjectMocks
    private PoQuatationController controller;

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
    void getListForRfqShouldReturnPaginatedListForAdmin() {
        RfqRequestFilterModel filterModel = new RfqRequestFilterModel();
        filterModel.setRfqNumber("RFQ-001");
        filterModel.setStatus(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(5, new ArrayList<>());
        when(poQuatationService.getRfqList(any(), eq(filterModel))).thenReturn(pagination);
        when(poQuatationRestHelper.getRfqListModel(any())).thenReturn(new ArrayList<>());

        ResponseEntity<PaginationResponseModel> response = controller.getListForRfq(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getCount()).isEqualTo(5);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(poQuatationService).getRfqList(captor.capture(), eq(filterModel));
        Map<RfqFilterEnum, Object> filterData = captor.getValue();

        // Admin should not have USER_ID filter
        assertThat(filterData).doesNotContainKey(RfqFilterEnum.USER_ID);
        assertThat(filterData).containsEntry(RfqFilterEnum.RFQ_NUMBER, "RFQ-001");
        assertThat(filterData).containsEntry(RfqFilterEnum.STATUS, 1);
        assertThat(filterData).containsEntry(RfqFilterEnum.DELETE_FLAG, false);
    }

    @Test
    void getListForRfqShouldFilterByUserIdForNonAdmin() {
        RfqRequestFilterModel filterModel = new RfqRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(2);
        when(userService.findByPK(2)).thenReturn(normalUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(poQuatationService.getRfqList(any(), eq(filterModel))).thenReturn(pagination);
        when(poQuatationRestHelper.getRfqListModel(any())).thenReturn(new ArrayList<>());

        controller.getListForRfq(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(poQuatationService).getRfqList(captor.capture(), eq(filterModel));
        Map<RfqFilterEnum, Object> filterData = captor.getValue();

        // Non-admin should have USER_ID filter
        assertThat(filterData).containsEntry(RfqFilterEnum.USER_ID, 2);
    }

    @Test
    void getListForRfqShouldReturnNotFoundWhenServiceReturnsNull() {
        RfqRequestFilterModel filterModel = new RfqRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(poQuatationService.getRfqList(any(), eq(filterModel))).thenReturn(null);

        ResponseEntity<PaginationResponseModel> response = controller.getListForRfq(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getListForRfqShouldFilterBySupplierId() {
        RfqRequestFilterModel filterModel = new RfqRequestFilterModel();
        filterModel.setSupplierId(5);

        Contact supplier = new Contact();
        supplier.setContactId(5);

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(contactService.findByPK(5)).thenReturn(supplier);

        PaginationResponseModel pagination = new PaginationResponseModel(3, new ArrayList<>());
        when(poQuatationService.getRfqList(any(), eq(filterModel))).thenReturn(pagination);
        when(poQuatationRestHelper.getRfqListModel(any())).thenReturn(new ArrayList<>());

        ResponseEntity<PaginationResponseModel> response = controller.getListForRfq(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(poQuatationService).getRfqList(captor.capture(), eq(filterModel));
        Map<RfqFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(RfqFilterEnum.SUPPLIERID, supplier);
    }

    @Test
    void getListForRfqShouldFilterByType() {
        RfqRequestFilterModel filterModel = new RfqRequestFilterModel();
        filterModel.setType(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(2, new ArrayList<>());
        when(poQuatationService.getRfqList(any(), eq(filterModel))).thenReturn(pagination);
        when(poQuatationRestHelper.getRfqListModel(any())).thenReturn(new ArrayList<>());

        controller.getListForRfq(filterModel, mockRequest);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(poQuatationService).getRfqList(captor.capture(), eq(filterModel));
        Map<RfqFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(RfqFilterEnum.TYPE, 1);
    }

    @Test
    void getListForRfqShouldTransformResponseData() {
        RfqRequestFilterModel filterModel = new RfqRequestFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PoQuatation rfq = new PoQuatation();
        rfq.setId(1);

        ArrayList<Object> rfqList = new ArrayList<>();
        rfqList.add(rfq);
        PaginationResponseModel pagination = new PaginationResponseModel(1, rfqList);
        when(poQuatationService.getRfqList(any(), eq(filterModel))).thenReturn(pagination);

        RfqListModel listModel = new RfqListModel();
        listModel.setId(1);
        ArrayList<RfqListModel> transformedList = new ArrayList<>();
        transformedList.add(listModel);
        when(poQuatationRestHelper.getRfqListModel(any())).thenReturn(transformedList);

        ResponseEntity<PaginationResponseModel> response = controller.getListForRfq(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(poQuatationRestHelper).getRfqListModel(any());
    }
}
