package com.simpleaccounts.rest.paymentcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Journal;
import com.simpleaccounts.entity.Payment;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.SupplierInvoicePayment;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.repository.PaymentDebitNoteRelationRepository;
import com.simpleaccounts.repository.TransactionExplanationRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.creditnotecontroller.CreditNoteRepository;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.service.bankaccount.TransactionStatusService;
import com.simpleaccounts.utils.DateFormatUtil;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private DateFormatUtil dateFormtUtil;
    @MockBean private PaymentService paymentService;
    @MockBean private ContactService contactService;
    @MockBean private PaymentRestHelper paymentRestHelper;
    @MockBean private UserService userServiceNew;
    @MockBean private SupplierInvoicePaymentService supplierInvoicePaymentService;
    @MockBean private JournalService journalService;
    @MockBean private UserService userService;
    @MockBean private BankAccountService bankAccountService;
    @MockBean private ChartOfAccountCategoryService chartOfAccountCategoryService;
    @MockBean private TransactionService transactionService;
    @MockBean private TransactionStatusService transactionStatusService;
    @MockBean private CreditNoteRepository creditNoteRepository;
    @MockBean private PaymentDebitNoteRelationRepository paymentDebitNoteRelationRepository;
    @MockBean private TransactionExplanationRepository transactionExplanationRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private User adminUser;
    private User normalUser;

    @BeforeEach
    void setUp() {
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
    void getPaymentListShouldReturnPaginatedListForAdmin() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        when(paymentService.getPayments(any(), any())).thenReturn(pagination);

        mockMvc.perform(get("/rest/payment/getlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(10));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(paymentService).getPayments(captor.capture(), any());
        Map<PaymentFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(PaymentFilterEnum.DELETE_FLAG, false);
    }

    @Test
    void getPaymentListShouldFilterByUserIdForNonAdmin() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(2);
        when(userService.findByPK(2)).thenReturn(normalUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(paymentService.getPayments(any(), any())).thenReturn(pagination);

        mockMvc.perform(get("/rest/payment/getlist"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(paymentService).getPayments(captor.capture(), any());
        Map<PaymentFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(PaymentFilterEnum.USER_ID, 2);
    }

    @Test
    void getPaymentListShouldApplySupplierFilter() throws Exception {
        Contact supplier = new Contact();
        supplier.setContactId(5);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(contactService.findByPK(5)).thenReturn(supplier);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(paymentService.getPayments(any(), any())).thenReturn(pagination);

        mockMvc.perform(get("/rest/payment/getlist")
                        .param("supplierId", "5"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(paymentService).getPayments(captor.capture(), any());
        Map<PaymentFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(PaymentFilterEnum.SUPPLIER, supplier);
    }

    @Test
    void getPaymentListShouldApplyInvoiceAmountFilter() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(paymentService.getPayments(any(), any())).thenReturn(pagination);

        mockMvc.perform(get("/rest/payment/getlist")
                        .param("invoiceAmount", "1000.00"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(paymentService).getPayments(captor.capture(), any());
        Map<PaymentFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsKey(PaymentFilterEnum.INVOICE_AMOUNT);
    }

    @Test
    void getPaymentListShouldApplyPaymentDateFilter() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(paymentService.getPayments(any(), any())).thenReturn(pagination);

        mockMvc.perform(get("/rest/payment/getlist")
                        .param("paymentDate", "2024-12-01"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(paymentService).getPayments(captor.capture(), any());
        Map<PaymentFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(PaymentFilterEnum.PAYMENT_DATE, LocalDate.of(2024, 12, 1));
    }

    @Test
    void getPaymentListShouldReturnInternalServerErrorOnNullResponse() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);
        when(paymentService.getPayments(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/payment/getlist"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getPaymentListShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/payment/getlist"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getPaymentByIdShouldReturnPayment() throws Exception {
        Payment payment = new Payment();
        payment.setPaymentId(1);
        payment.setInvoiceAmount(new BigDecimal("1000.00"));

        PaymentPersistModel persistModel = new PaymentPersistModel();
        persistModel.setPaymentId(1);
        persistModel.setAmount(new BigDecimal("1000.00"));

        when(paymentService.findByPK(1)).thenReturn(payment);
        when(paymentRestHelper.convertToPaymentPersistModel(payment)).thenReturn(persistModel);

        mockMvc.perform(get("/rest/payment/getpaymentbyid")
                        .param("paymentId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentId").value(1));

        verify(paymentService).findByPK(1);
    }

    @Test
    void getPaymentByIdShouldReturnBadRequestForNullId() throws Exception {
        mockMvc.perform(get("/rest/payment/getpaymentbyid"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getPaymentByIdShouldHandleException() throws Exception {
        when(paymentService.findByPK(1)).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(get("/rest/payment/getpaymentbyid")
                        .param("paymentId", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveShouldPersistPayment() throws Exception {
        Payment payment = new Payment();
        payment.setPaymentId(1);

        Journal journal = new Journal();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userServiceNew.findByPK(1)).thenReturn(adminUser);
        when(paymentRestHelper.convertToPayment(any())).thenReturn(payment);
        when(paymentRestHelper.getSupplierInvoicePaymentEntity(any())).thenReturn(new ArrayList<>());
        when(paymentRestHelper.paymentPosting(any(), any(), any(), any())).thenReturn(journal);

        mockMvc.perform(post("/rest/payment/save")
                        .param("contactId", "1")
                        .param("amount", "1000.00"))
                .andExpect(status().isOk());

        verify(paymentService).persist(any(Payment.class));
        verify(journalService).persist(any(Journal.class));
    }

    @Test
    void saveShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(post("/rest/payment/save")
                        .param("contactId", "1")
                        .param("amount", "1000.00"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateShouldUpdatePayment() throws Exception {
        Payment payment = new Payment();
        payment.setPaymentId(1);

        Journal journal = new Journal();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userServiceNew.findByPK(1)).thenReturn(adminUser);
        when(paymentRestHelper.convertToPayment(any())).thenReturn(payment);
        when(paymentRestHelper.paymentPosting(any(), any(), any(), any())).thenReturn(journal);

        mockMvc.perform(post("/rest/payment/update")
                        .param("paymentId", "1")
                        .param("amount", "1000.00"))
                .andExpect(status().isOk());

        verify(paymentService).update(any(Payment.class));
        verify(journalService).update(any(Journal.class));
    }

    @Test
    void updateShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(post("/rest/payment/update")
                        .param("paymentId", "1")
                        .param("amount", "1000.00"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deletePaymentShouldDeleteExistingPayment() throws Exception {
        Payment payment = new Payment();
        payment.setPaymentId(1);

        when(paymentService.findByPK(1)).thenReturn(payment);

        mockMvc.perform(delete("/rest/payment/delete")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successfully")));

        verify(paymentService).deleteByIds(Arrays.asList(1));
    }

    @Test
    void deletePaymentShouldHandleNullPayment() throws Exception {
        when(paymentService.findByPK(999)).thenReturn(null);

        mockMvc.perform(delete("/rest/payment/delete")
                        .param("id", "999"))
                .andExpect(status().isOk());

        verify(paymentService, never()).deleteByIds(any());
    }

    @Test
    void deletePaymentShouldHandleException() throws Exception {
        when(paymentService.findByPK(1)).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(delete("/rest/payment/delete")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteExpensesShouldDeleteMultiplePayments() throws Exception {
        mockMvc.perform(delete("/rest/payment/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isOk());

        verify(paymentService).deleteByIds(any());
    }

    @Test
    void deleteExpensesShouldHandleException() throws Exception {
        when(paymentService.deleteByIds(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(delete("/rest/payment/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getPaymentListShouldTransformPayments() throws Exception {
        Payment payment = new Payment();
        payment.setPaymentId(1);

        PaymentViewModel viewModel = new PaymentViewModel();
        viewModel.setPaymentId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(1, Arrays.asList(payment));
        when(paymentService.getPayments(any(), any())).thenReturn(pagination);
        when(paymentRestHelper.convertToPaymentViewModel(payment)).thenReturn(viewModel);

        mockMvc.perform(get("/rest/payment/getlist"))
                .andExpect(status().isOk());

        verify(paymentRestHelper).convertToPaymentViewModel(payment);
    }

    @Test
    void getPaymentListShouldHandleEmptyResults() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(adminUser);

        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(paymentService.getPayments(any(), any())).thenReturn(pagination);

        mockMvc.perform(get("/rest/payment/getlist"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void saveShouldPersistSupplierInvoicePayments() throws Exception {
        Payment payment = new Payment();
        payment.setPaymentId(1);

        SupplierInvoicePayment supplierInvoicePayment = new SupplierInvoicePayment();
        List<SupplierInvoicePayment> paymentList = Arrays.asList(supplierInvoicePayment);

        Journal journal = new Journal();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userServiceNew.findByPK(1)).thenReturn(adminUser);
        when(paymentRestHelper.convertToPayment(any())).thenReturn(payment);
        when(paymentRestHelper.getSupplierInvoicePaymentEntity(any())).thenReturn(paymentList);
        when(paymentRestHelper.paymentPosting(any(), any(), any(), any())).thenReturn(journal);

        mockMvc.perform(post("/rest/payment/save")
                        .param("contactId", "1")
                        .param("amount", "1000.00"))
                .andExpect(status().isOk());

        verify(supplierInvoicePaymentService).persist(any(SupplierInvoicePayment.class));
    }
}
