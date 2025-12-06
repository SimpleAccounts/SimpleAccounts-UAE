package com.simpleaccounts.dao.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.bankaccount.ImportedDraftTransaction;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("ImportedDraftTransactonDaoImpl Unit Tests")
class ImportedDraftTransactonDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private ImportedDraftTransactonDaoImpl importedDraftTransactonDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(importedDraftTransactonDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(importedDraftTransactonDao, "entityClass", ImportedDraftTransaction.class);
    }

    @Test
    @DisplayName("Should update or create imported draft transaction")
    void updateOrCreateImportedDraftTransactionUpdatesTransaction() {
        // Arrange
        ImportedDraftTransaction transaction = createImportedDraftTransaction(1, 100);
        when(entityManager.merge(transaction))
            .thenReturn(transaction);

        // Act
        ImportedDraftTransaction result = importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(transaction);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(transaction);
        verify(entityManager).merge(transaction);
    }

    @Test
    @DisplayName("Should create new imported draft transaction with null ID")
    void updateOrCreateImportedDraftTransactionCreatesNewTransaction() {
        // Arrange
        ImportedDraftTransaction newTransaction = createImportedDraftTransaction(null, 200);
        when(entityManager.merge(newTransaction))
            .thenReturn(newTransaction);

        // Act
        ImportedDraftTransaction result = importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(newTransaction);

        // Assert
        assertThat(result).isNotNull();
        verify(entityManager).merge(newTransaction);
    }

    @Test
    @DisplayName("Should verify merge called on update or create")
    void updateOrCreateImportedDraftTransactionCallsMerge() {
        // Arrange
        ImportedDraftTransaction transaction = createImportedDraftTransaction(5, 500);
        when(entityManager.merge(transaction))
            .thenReturn(transaction);

        // Act
        importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(transaction);

        // Assert
        verify(entityManager).merge(transaction);
    }

    @Test
    @DisplayName("Should handle null transaction in update or create")
    void updateOrCreateImportedDraftTransactionHandlesNullTransaction() {
        // Arrange
        ImportedDraftTransaction transaction = null;
        when(entityManager.merge(transaction))
            .thenReturn(null);

        // Act
        ImportedDraftTransaction result = importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(transaction);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should delete imported draft transaction by bank account ID")
    void deleteImportedDraftTransactionDeletesSuccessfully() {
        // Arrange
        Integer bankAccountId = 123;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(1);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
        verify(query).setParameter("bankAccountId", bankAccountId);
        verify(query).executeUpdate();
    }

    @Test
    @DisplayName("Should execute native query for deletion")
    void deleteImportedDraftTransactionExecutesNativeQuery() {
        // Arrange
        Integer bankAccountId = 456;
        String expectedSql = "UPDATE IMPORTED_DRAFT_TRANSACTON idt SET idt.DELETE_FLAG=1 WHERE idt.BANK_ACCOUNT_ID= :bankAccountId";
        when(entityManager.createNativeQuery(expectedSql))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(1);

        // Act
        importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        verify(entityManager).createNativeQuery(expectedSql);
    }

    @Test
    @DisplayName("Should return true even when no rows affected")
    void deleteImportedDraftTransactionReturnsTrueWhenNoRowsAffected() {
        // Arrange
        Integer bankAccountId = 999;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should handle null bank account ID in delete")
    void deleteImportedDraftTransactionHandlesNullBankAccountId() {
        // Arrange
        Integer bankAccountId = null;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should set delete flag to 1 in query")
    void deleteImportedDraftTransactionSetsDeleteFlagToOne() {
        // Arrange
        Integer bankAccountId = 100;
        String expectedSql = "UPDATE IMPORTED_DRAFT_TRANSACTON idt SET idt.DELETE_FLAG=1 WHERE idt.BANK_ACCOUNT_ID= :bankAccountId";
        when(entityManager.createNativeQuery(expectedSql))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(1);

        // Act
        importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        verify(entityManager).createNativeQuery(expectedSql);
        verify(query).executeUpdate();
    }

    @Test
    @DisplayName("Should handle multiple deletions")
    void deleteImportedDraftTransactionHandlesMultipleDeletions() {
        // Arrange
        Integer bankAccountId = 200;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(5);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
        verify(query).executeUpdate();
    }

    @Test
    @DisplayName("Should return updated transaction with same ID")
    void updateOrCreateImportedDraftTransactionReturnsSameId() {
        // Arrange
        ImportedDraftTransaction transaction = createImportedDraftTransaction(10, 1000);
        when(entityManager.merge(transaction))
            .thenReturn(transaction);

        // Act
        ImportedDraftTransaction result = importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(transaction);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getImportedDraftTransactionId()).isEqualTo(10);
    }

    @Test
    @DisplayName("Should handle transaction with zero bank account ID")
    void deleteImportedDraftTransactionHandlesZeroBankAccountId() {
        // Arrange
        Integer bankAccountId = 0;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should verify parameter set correctly in delete query")
    void deleteImportedDraftTransactionSetsParameterCorrectly() {
        // Arrange
        Integer bankAccountId = 777;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(1);

        // Act
        importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        verify(query).setParameter("bankAccountId", bankAccountId);
    }

    @Test
    @DisplayName("Should call executeUpdate once per delete")
    void deleteImportedDraftTransactionCallsExecuteUpdateOnce() {
        // Arrange
        Integer bankAccountId = 888;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(1);

        // Act
        importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        verify(query, times(1)).executeUpdate();
    }

    @Test
    @DisplayName("Should return merged entity from update")
    void updateOrCreateImportedDraftTransactionReturnsMergedEntity() {
        // Arrange
        ImportedDraftTransaction original = createImportedDraftTransaction(1, 100);
        ImportedDraftTransaction merged = createImportedDraftTransaction(1, 100);
        when(entityManager.merge(original))
            .thenReturn(merged);

        // Act
        ImportedDraftTransaction result = importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(original);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(merged);
    }

    @Test
    @DisplayName("Should handle transaction with different bank account IDs")
    void updateOrCreateImportedDraftTransactionHandlesDifferentBankAccounts() {
        // Arrange
        ImportedDraftTransaction transaction1 = createImportedDraftTransaction(1, 100);
        ImportedDraftTransaction transaction2 = createImportedDraftTransaction(2, 200);

        when(entityManager.merge(transaction1))
            .thenReturn(transaction1);
        when(entityManager.merge(transaction2))
            .thenReturn(transaction2);

        // Act
        ImportedDraftTransaction result1 = importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(transaction1);
        ImportedDraftTransaction result2 = importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(transaction2);

        // Assert
        assertThat(result1.getBankAccountId()).isEqualTo(100);
        assertThat(result2.getBankAccountId()).isEqualTo(200);
    }

    @Test
    @DisplayName("Should handle negative bank account ID in delete")
    void deleteImportedDraftTransactionHandlesNegativeBankAccountId() {
        // Arrange
        Integer bankAccountId = -1;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(0);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should use native query for soft delete")
    void deleteImportedDraftTransactionUsesNativeQuery() {
        // Arrange
        Integer bankAccountId = 321;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(1);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
        verify(entityManager).createNativeQuery(anyString());
    }

    @Test
    @DisplayName("Should always return true from delete operation")
    void deleteImportedDraftTransactionAlwaysReturnsTrue() {
        // Arrange
        Integer bankAccountId = 555;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(10);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should handle update or create with large bank account ID")
    void updateOrCreateImportedDraftTransactionHandlesLargeBankAccountId() {
        // Arrange
        ImportedDraftTransaction transaction = createImportedDraftTransaction(1, Integer.MAX_VALUE);
        when(entityManager.merge(transaction))
            .thenReturn(transaction);

        // Act
        ImportedDraftTransaction result = importedDraftTransactonDao.updateOrCreateImportedDraftTransaction(transaction);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getBankAccountId()).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    @DisplayName("Should delete with large bank account ID")
    void deleteImportedDraftTransactionHandlesLargeBankAccountId() {
        // Arrange
        Integer bankAccountId = Integer.MAX_VALUE;
        when(entityManager.createNativeQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("bankAccountId", bankAccountId))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(1);

        // Act
        boolean result = importedDraftTransactonDao.deleteImportedDraftTransaction(bankAccountId);

        // Assert
        assertThat(result).isTrue();
    }

    private ImportedDraftTransaction createImportedDraftTransaction(Integer id, Integer bankAccountId) {
        ImportedDraftTransaction transaction = new ImportedDraftTransaction();
        transaction.setImportedDraftTransactionId(id);
        transaction.setBankAccountId(bankAccountId);
        return transaction;
    }
}
