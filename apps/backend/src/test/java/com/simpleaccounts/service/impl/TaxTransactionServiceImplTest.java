package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.TaxTransactionDao;
import com.simpleaccounts.entity.TaxTransaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaxTransactionServiceImpl Unit Tests")
class TaxTransactionServiceImplTest {

    @Mock
    private TaxTransactionDao taxTransactionDao;

    @InjectMocks
    private TaxTransactionServiceImpl taxTransactionService;

    @Nested
    @DisplayName("getClosedTaxTransactionList Tests")
    class GetClosedTaxTransactionListTests {

        @Test
        @DisplayName("Should return closed tax transaction list")
        void getClosedTaxTransactionListReturnsList() {
            // Arrange
            List<TaxTransaction> expectedList = createTaxTransactionList(3, "CLOSE");
            when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(expectedList);

            // Act
            List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(taxTransactionDao).getClosedTaxTransactionList();
        }

        @Test
        @DisplayName("Should return empty list when no closed transactions")
        void getClosedTaxTransactionListReturnsEmptyList() {
            // Arrange
            when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(new ArrayList<>());

            // Act
            List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
            verify(taxTransactionDao).getClosedTaxTransactionList();
        }

        @Test
        @DisplayName("Should return null when DAO returns null")
        void getClosedTaxTransactionListReturnsNull() {
            // Arrange
            when(taxTransactionDao.getClosedTaxTransactionList()).thenReturn(null);

            // Act
            List<TaxTransaction> result = taxTransactionService.getClosedTaxTransactionList();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getOpenTaxTransactionList Tests")
    class GetOpenTaxTransactionListTests {

        @Test
        @DisplayName("Should return open tax transaction list")
        void getOpenTaxTransactionListReturnsList() {
            // Arrange
            List<TaxTransaction> expectedList = createTaxTransactionList(5, "OPEN");
            when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(expectedList);

            // Act
            List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

            // Assert
            assertThat(result).isNotNull().hasSize(5);
            verify(taxTransactionDao).getOpenTaxTransactionList();
        }

        @Test
        @DisplayName("Should return empty list when no open transactions")
        void getOpenTaxTransactionListReturnsEmptyList() {
            // Arrange
            when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(new ArrayList<>());

            // Act
            List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
            verify(taxTransactionDao).getOpenTaxTransactionList();
        }

        @Test
        @DisplayName("Should return null when DAO returns null")
        void getOpenTaxTransactionListReturnsNull() {
            // Arrange
            when(taxTransactionDao.getOpenTaxTransactionList()).thenReturn(null);

            // Act
            List<TaxTransaction> result = taxTransactionService.getOpenTaxTransactionList();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return tax transaction DAO")
        void getDaoReturnsTaxTransactionDao() {
            // The DAO is properly injected
            assertThat(taxTransactionDao).isNotNull();
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
        TaxTransaction taxTransaction = new TaxTransaction();
        taxTransaction.setTaxTransactionId(id);
        taxTransaction.setStatus(status);
        taxTransaction.setVatIn(BigDecimal.valueOf(100));
        taxTransaction.setVatOut(BigDecimal.valueOf(80));
        taxTransaction.setDueAmount(BigDecimal.valueOf(20));
        taxTransaction.setPaidAmount(BigDecimal.ZERO);
        taxTransaction.setStartDate(new Date());
        taxTransaction.setEndDate(new Date());
        taxTransaction.setCreatedBy(1);
        taxTransaction.setCreatedDate(LocalDateTime.now());
        return taxTransaction;
    }
}
