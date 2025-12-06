package com.simpleaccounts.rest.taxtransactioncontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.constant.TaxTransactionStatusConstant;
import com.simpleaccounts.entity.TaxTransaction;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.service.TaxTransactionService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(TaxTransactionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TaxTransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private TaxTransactionService taxTransactionService;
    @MockBean private TaxTranscationRestHelper taxTranscationRestHelper;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private TaxTransaction openTransaction;
    private TaxTransaction closedTransaction;

    @BeforeEach
    void setUp() {
        openTransaction = new TaxTransaction();
        openTransaction.setTaxTransactionId(1);
        openTransaction.setStatus(TaxTransactionStatusConstant.OPEN);
        openTransaction.setVatIn(new BigDecimal("5000.00"));
        openTransaction.setVatOut(new BigDecimal("3000.00"));
        openTransaction.setDueAmount(new BigDecimal("2000.00"));
        openTransaction.setStartDate(new Date());
        openTransaction.setEndDate(new Date());

        closedTransaction = new TaxTransaction();
        closedTransaction.setTaxTransactionId(2);
        closedTransaction.setStatus(TaxTransactionStatusConstant.CLOSE);
        closedTransaction.setVatIn(new BigDecimal("10000.00"));
        closedTransaction.setVatOut(new BigDecimal("8000.00"));
        closedTransaction.setPaidAmount(new BigDecimal("2000.00"));
        closedTransaction.setDueAmount(BigDecimal.ZERO);
        closedTransaction.setPaymentDate(new Date());
    }

    @Test
    void getOpenTaxTransactionShouldReturnOpenTransactions() throws Exception {
        List<TaxTransaction> transactionList = Arrays.asList(openTransaction);

        when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(transactionList);
        when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(true);

        mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(taxTransactionService).getOpenTaxTransactionList();
    }

    @Test
    void getOpenTaxTransactionShouldReturnNotFoundWhenNull() throws Exception {
        when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(null);
        when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(false);
        when(taxTranscationRestHelper.separateTransactionCrediTAndDebit(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getOpenTaxTransactionShouldSeparateTransactionsWhenNotExist() throws Exception {
        List<TaxTransaction> emptyList = new ArrayList<>();
        List<TaxTransaction> separatedList = Arrays.asList(openTransaction);

        when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(emptyList);
        when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(false);
        when(taxTranscationRestHelper.separateTransactionCrediTAndDebit(any(), any())).thenReturn(separatedList);

        mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));

        verify(taxTranscationRestHelper).separateTransactionCrediTAndDebit(any(), any());
    }

    @Test
    void getOpenTaxTransactionShouldHandleEmptyList() throws Exception {
        List<TaxTransaction> emptyList = new ArrayList<>();

        when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(emptyList);
        when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(true);

        mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getCloseTaxTranscationShouldReturnClosedTransactions() throws Exception {
        List<TaxTransaction> transactionList = Arrays.asList(closedTransaction);

        when(taxTransactionService.getClosedTaxTransactionList()).thenReturn(transactionList);

        mockMvc.perform(get("/rest/taxtransaction/getCloseTaxTranscation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));

        verify(taxTransactionService).getClosedTaxTransactionList();
    }

    @Test
    void getCloseTaxTranscationShouldReturnNotFoundWhenNull() throws Exception {
        when(taxTransactionService.getClosedTaxTransactionList()).thenReturn(null);

        mockMvc.perform(get("/rest/taxtransaction/getCloseTaxTranscation"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCloseTaxTranscationShouldHandleEmptyList() throws Exception {
        List<TaxTransaction> emptyList = new ArrayList<>();

        when(taxTransactionService.getClosedTaxTransactionList()).thenReturn(emptyList);

        mockMvc.perform(get("/rest/taxtransaction/getCloseTaxTranscation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void saveTaxTransactionShouldCloseTransactionWhenFullyPaid() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setPaidAmount(new BigDecimal("2000.00"));

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Saved successfull")));

        verify(taxTransactionService).update(transaction);
    }

    @Test
    void saveTaxTransactionShouldCreateNewTransactionWhenPartiallyPaid() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setPaidAmount(new BigDecimal("1000.00"));
        transaction.setStartDate(new Date());
        transaction.setEndDate(new Date());

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Saved successfull")));

        verify(taxTransactionService).persist(any(TaxTransaction.class));
        verify(taxTransactionService).update(transaction);
    }

    @Test
    void saveTaxTransactionShouldHandleDueAmountNull() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setPaidAmount(new BigDecimal("2000.00"));
        transaction.setDueAmount(null);

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).update(transaction);
    }

    @Test
    void saveTaxTransactionShouldHandleExistingDueAmount() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setDueAmount(new BigDecimal("1500.00"));
        transaction.setPaidAmount(new BigDecimal("1500.00"));

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).update(transaction);
    }

    @Test
    void saveTaxTransactionShouldPersistNewTransactionWhenIdIsNull() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setTaxTransactionId(null);
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setPaidAmount(new BigDecimal("2000.00"));

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).persist(transaction);
    }

    @Test
    void saveTaxTransactionShouldSetPaymentDate() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setPaidAmount(new BigDecimal("2000.00"));

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).update(transaction);
    }

    @Test
    void saveTaxTransactionShouldHandleOverpayment() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setPaidAmount(new BigDecimal("3000.00"));

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).update(transaction);
    }

    @Test
    void saveTaxTransactionShouldCalculateCorrectDueAmount() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("10000.00"));
        transaction.setVatOut(new BigDecimal("7000.00"));
        transaction.setPaidAmount(new BigDecimal("1500.00"));
        transaction.setStartDate(new Date());
        transaction.setEndDate(new Date());

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).persist(any(TaxTransaction.class));
    }

    @Test
    void saveTaxTransactionShouldSetStatusToClosed() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setPaidAmount(new BigDecimal("2000.00"));

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).update(transaction);
    }

    @Test
    void saveTaxTransactionShouldHandleZeroPaidAmount() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("5000.00"));
        transaction.setVatOut(new BigDecimal("3000.00"));
        transaction.setPaidAmount(BigDecimal.ZERO);
        transaction.setStartDate(new Date());
        transaction.setEndDate(new Date());

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).persist(any(TaxTransaction.class));
    }

    @Test
    void getOpenTaxTransactionShouldHandlePaginationModel() throws Exception {
        List<TaxTransaction> transactionList = Arrays.asList(openTransaction);

        when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(transactionList);
        when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(true);

        mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction")
                        .param("page", "0")
                        .param("limit", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void saveTaxTransactionShouldCopyFieldsToNewTransaction() throws Exception {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setVatIn(new BigDecimal("8000.00"));
        transaction.setVatOut(new BigDecimal("5000.00"));
        transaction.setPaidAmount(new BigDecimal("2000.00"));
        transaction.setStartDate(new Date());
        transaction.setEndDate(new Date());

        when(taxTransactionService.findByPK(1)).thenReturn(transaction);

        mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                        .param("id", "1"))
                .andExpect(status().isOk());

        verify(taxTransactionService).persist(any(TaxTransaction.class));
    }

    @Test
    void getOpenTaxTransactionShouldHandleMultipleTransactions() throws Exception {
        List<TaxTransaction> transactionList = Arrays.asList(openTransaction, openTransaction, openTransaction);

        when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(transactionList);
        when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
        when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(true);

        mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void getCloseTaxTranscationShouldHandleMultipleTransactions() throws Exception {
        List<TaxTransaction> transactionList = Arrays.asList(closedTransaction, closedTransaction);

        when(taxTransactionService.getClosedTaxTransactionList()).thenReturn(transactionList);

        mockMvc.perform(get("/rest/taxtransaction/getCloseTaxTranscation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }
}
