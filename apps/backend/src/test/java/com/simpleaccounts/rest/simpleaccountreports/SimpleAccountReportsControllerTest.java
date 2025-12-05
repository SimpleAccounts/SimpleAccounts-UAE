package com.simpleaccounts.rest.simpleaccountreports;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.simpleaccountreports.Aging.AgingListModel;
import com.simpleaccounts.security.JwtTokenUtil;
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
class SimpleAccountReportsControllerTest {

    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private simpleAccountReportRestHelper simpleAccountReportRestHelper;
    @Mock private UserService userService;
    @Mock private SimpleAccountReportDaoImpl simpleAccountReportDao;

    @InjectMocks
    private SimpleAccountReportsController controller;

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
    void getSalesbycustomerShouldReturnReportForAdmin() {
        ReportRequestModel requestModel = new ReportRequestModel();

        SalesByCustomerResponseModel responseModel = new SalesByCustomerResponseModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getSalesByCustomer(requestModel)).thenReturn(responseModel);

        ResponseEntity<SalesByCustomerResponseModel> response =
            controller.getSalesbycustomer(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getSalesbycustomerShouldReturnNotFoundWhenNull() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getSalesByCustomer(requestModel)).thenReturn(null);

        ResponseEntity<SalesByCustomerResponseModel> response =
            controller.getSalesbycustomer(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getSalesbyVendorShouldReturnReportForAdmin() {
        ReportRequestModel requestModel = new ReportRequestModel();

        PurchseByVendorResponseModel responseModel = new PurchseByVendorResponseModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getPurchaseByVendor(requestModel)).thenReturn(responseModel);

        ResponseEntity<PurchseByVendorResponseModel> response =
            controller.getSalesbyVendor(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getSalesbyVendorShouldReturnNotFoundWhenNull() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getPurchaseByVendor(requestModel)).thenReturn(null);

        ResponseEntity<PurchseByVendorResponseModel> response =
            controller.getSalesbyVendor(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getSalesByProductShouldReturnReportForAdmin() {
        ReportRequestModel requestModel = new ReportRequestModel();

        SalesByProductResponseModel responseModel = new SalesByProductResponseModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getSalesByProduct(requestModel)).thenReturn(responseModel);

        ResponseEntity<SalesByProductResponseModel> response =
            controller.getSalesByProduct(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getSalesByProductShouldReturnNotFoundWhenNull() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getSalesByProduct(requestModel)).thenReturn(null);

        ResponseEntity<SalesByProductResponseModel> response =
            controller.getSalesByProduct(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getPurchaseByProductShouldReturnReportForAdmin() {
        ReportRequestModel requestModel = new ReportRequestModel();

        PurchaseByProductResponseModel responseModel = new PurchaseByProductResponseModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getPurchaseByProduct(requestModel)).thenReturn(responseModel);

        ResponseEntity<PurchaseByProductResponseModel> response =
            controller.getPurchaseByProduct(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getPurchaseByProductShouldReturnNotFoundWhenNull() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getPurchaseByProduct(requestModel)).thenReturn(null);

        ResponseEntity<PurchaseByProductResponseModel> response =
            controller.getPurchaseByProduct(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getReceivableInvoiceSummaryShouldReturnReportForAdmin() {
        ReportRequestModel requestModel = new ReportRequestModel();

        ReceivableInvoiceSummaryResponseModel responseModel = new ReceivableInvoiceSummaryResponseModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getreceivableInvoiceSummary(requestModel)).thenReturn(responseModel);

        ResponseEntity<ReceivableInvoiceSummaryResponseModel> response =
            controller.getReceivableInvoiceSummary(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getReceivableInvoiceSummaryShouldReturnNotFoundWhenNull() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getreceivableInvoiceSummary(requestModel)).thenReturn(null);

        ResponseEntity<ReceivableInvoiceSummaryResponseModel> response =
            controller.getReceivableInvoiceSummary(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getPayableInvoiceSummaryShouldReturnReportForAdmin() {
        ReportRequestModel requestModel = new ReportRequestModel();

        PayableInvoiceSummaryResponseModel responseModel = new PayableInvoiceSummaryResponseModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getPayableInvoiceSummary(requestModel)).thenReturn(responseModel);

        ResponseEntity<PayableInvoiceSummaryResponseModel> response =
            controller.getPayableInvoiceSummary(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getPayableInvoiceSummaryShouldReturnNotFoundWhenNull() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getPayableInvoiceSummary(requestModel)).thenReturn(null);

        ResponseEntity<PayableInvoiceSummaryResponseModel> response =
            controller.getPayableInvoiceSummary(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getReceivableInvoiceDetailShouldReturnReportForAdmin() {
        ReportRequestModel requestModel = new ReportRequestModel();

        ReceivableInvoiceDetailResponseModel responseModel = new ReceivableInvoiceDetailResponseModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getreceivableInvoiceDetail(requestModel)).thenReturn(responseModel);

        ResponseEntity<ReceivableInvoiceDetailResponseModel> response =
            controller.getReceivableInvoiceDetail(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getReceivableInvoiceDetailShouldReturnNotFoundWhenNull() {
        ReportRequestModel requestModel = new ReportRequestModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(simpleAccountReportRestHelper.getreceivableInvoiceDetail(requestModel)).thenReturn(null);

        ResponseEntity<ReceivableInvoiceDetailResponseModel> response =
            controller.getReceivableInvoiceDetail(requestModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
