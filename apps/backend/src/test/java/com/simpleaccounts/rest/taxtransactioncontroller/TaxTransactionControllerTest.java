package com.simpleaccounts.rest.taxtransactioncontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.TaxTransaction;
import com.simpleaccounts.service.TaxTransactionService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
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
@DisplayName("TaxTransactionController Unit Tests")
class TaxTransactionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TaxTransactionService taxTransactionService;

    @Mock
    private TaxTranscationRestHelper taxTranscationRestHelper;

    @InjectMocks
    private TaxTransactionController taxTransactionController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(taxTransactionController).build();
    }

    @Nested
    @DisplayName("getOpenTaxTransaction Tests")
    class GetOpenTaxTransactionTests {

        @Test
        @DisplayName("Should return open tax transactions with OK status")
        void getOpenTaxTransactionReturnsOkStatus() throws Exception {
            // Arrange
            List<TaxTransaction> transactions = createTaxTransactionList(3, "OPEN");
            when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(transactions);
            when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
            when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
            when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(true);

            // Act & Assert
            mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when no transactions")
        void getOpenTaxTransactionReturnsNotFoundWhenEmpty() throws Exception {
            // Arrange
            when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(null);
            when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
            when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
            when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(true);

            // Act & Assert
            mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction"))
                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should create new transaction when not exists")
        void getOpenTaxTransactionCreatesNewWhenNotExists() throws Exception {
            // Arrange
            List<TaxTransaction> transactions = new ArrayList<>();
            List<TaxTransaction> newTransactions = createTaxTransactionList(1, "OPEN");

            when(taxTransactionService.getOpenTaxTransactionList()).thenReturn(transactions);
            when(taxTranscationRestHelper.getStartDate()).thenReturn(new Date());
            when(taxTranscationRestHelper.getEndDate()).thenReturn(new Date());
            when(taxTranscationRestHelper.isTaxTransactionExist(any(), any(), any())).thenReturn(false);
            when(taxTranscationRestHelper.separateTransactionCrediTAndDebit(any(), any())).thenReturn(newTransactions);

            // Act & Assert
            mockMvc.perform(get("/rest/taxtransaction/getOpenTaxTransaction"))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("getCloseTaxTransaction Tests")
    class GetCloseTaxTransactionTests {

        @Test
        @DisplayName("Should return closed tax transactions with OK status")
        void getCloseTaxTransactionReturnsOkStatus() throws Exception {
            // Arrange
            List<TaxTransaction> transactions = createTaxTransactionList(5, "CLOSE");
            when(taxTransactionService.getClosedTaxTransactionList()).thenReturn(transactions);

            // Act & Assert
            mockMvc.perform(get("/rest/taxtransaction/getCloseTaxTranscation"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should return NOT_FOUND when no closed transactions")
        void getCloseTaxTransactionReturnsNotFoundWhenNull() throws Exception {
            // Arrange
            when(taxTransactionService.getClosedTaxTransactionList()).thenReturn(null);

            // Act & Assert
            mockMvc.perform(get("/rest/taxtransaction/getCloseTaxTranscation"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("save Tests")
    class SaveTests {

        @Test
        @DisplayName("Should save tax transaction successfully")
        void saveReturnsOkStatus() throws Exception {
            // Arrange
            TaxTransaction transaction = createTaxTransaction(1, "OPEN");
            transaction.setVatIn(BigDecimal.valueOf(1000));
            transaction.setVatOut(BigDecimal.valueOf(800));
            transaction.setDueAmount(BigDecimal.valueOf(200));
            transaction.setPaidAmount(BigDecimal.valueOf(200));

            when(taxTransactionService.findByPK(1)).thenReturn(transaction);
            doNothing().when(taxTransactionService).persist(any());

            // Act & Assert
            mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                    .param("id", "1"))
                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Should create new transaction for partial payment")
        void saveCreatesNewTransactionForPartialPayment() throws Exception {
            // Arrange
            TaxTransaction transaction = createTaxTransaction(1, "OPEN");
            transaction.setVatIn(BigDecimal.valueOf(1000));
            transaction.setVatOut(BigDecimal.valueOf(800));
            transaction.setDueAmount(BigDecimal.valueOf(200));
            transaction.setPaidAmount(BigDecimal.valueOf(100)); // Partial payment

            when(taxTransactionService.findByPK(1)).thenReturn(transaction);
            doNothing().when(taxTransactionService).persist(any());

            // Act & Assert
            mockMvc.perform(post("/rest/taxtransaction/saveTaxTransaction")
                    .param("id", "1"))
                .andExpect(status().isOk());
        }
    }

    private List<TaxTransaction> createTaxTransactionList(int count, String status) {
        List<TaxTransaction> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createTaxTransaction(i + 1, status));
        }
        return list;
    }

    private TaxTransaction createTaxTransaction(Integer id, String status) {
        TaxTransaction transaction = new TaxTransaction();
        transaction.setTaxTransactionId(id);
        transaction.setStatus(status);
        transaction.setVatIn(BigDecimal.valueOf(1000));
        transaction.setVatOut(BigDecimal.valueOf(800));
        transaction.setDueAmount(BigDecimal.valueOf(200));
        transaction.setPaidAmount(BigDecimal.ZERO);
        transaction.setStartDate(new Date());
        transaction.setEndDate(new Date());
        transaction.setCreatedBy(1);
        transaction.setCreatedDate(LocalDateTime.now());
        return transaction;
    }
}
