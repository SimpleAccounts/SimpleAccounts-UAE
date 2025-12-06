package com.simpleaccounts.dao.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("BankAccountStatusDaoImpl Unit Tests")
class BankAccountStatusDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<BankAccountStatus> typedQuery;

    @InjectMocks
    private BankAccountStatusDaoImpl bankAccountStatusDao;

    @BeforeEach
    void setUp() {
        // No additional setup needed
    }

    @Test
    @DisplayName("Should return list of bank account statuses")
    void getBankAccountStatusesReturnsListOfStatuses() {
        // Arrange
        List<BankAccountStatus> expectedStatuses = createBankAccountStatusList(3);
        when(entityManager.createNamedQuery("allBankAccountStatuses", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedStatuses);

        // Act
        List<BankAccountStatus> result = bankAccountStatusDao.getBankAccountStatuses();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedStatuses);
    }

    @Test
    @DisplayName("Should return empty list when no statuses exist")
    void getBankAccountStatusesReturnsEmptyListWhenNoStatuses() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountStatuses", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<BankAccountStatus> result = bankAccountStatusDao.getBankAccountStatuses();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query")
    void getBankAccountStatusesUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountStatuses", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        bankAccountStatusDao.getBankAccountStatuses();

        // Assert
        verify(entityManager).createNamedQuery("allBankAccountStatuses", BankAccountStatus.class);
    }

    @Test
    @DisplayName("Should find bank account status by ID")
    void getBankAccountStatusReturnsStatusById() {
        // Arrange
        Integer id = 1;
        BankAccountStatus expectedStatus = createBankAccountStatus(id, "Active");
        when(entityManager.find(BankAccountStatus.class, id))
            .thenReturn(expectedStatus);

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatus(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getBankAccountStatusId()).isEqualTo(id);
        assertThat(result.getBankAccountStatusName()).isEqualTo("Active");
    }

    @Test
    @DisplayName("Should return null when status not found by ID")
    void getBankAccountStatusReturnsNullWhenNotFound() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(BankAccountStatus.class, id))
            .thenReturn(null);

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatus(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle null ID")
    void getBankAccountStatusHandlesNullId() {
        // Arrange
        Integer id = null;
        when(entityManager.find(BankAccountStatus.class, id))
            .thenReturn(null);

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatus(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find bank account status by name")
    void getBankAccountStatusByNameReturnsStatus() {
        // Arrange
        String statusName = "Active";
        BankAccountStatus expectedStatus = createBankAccountStatus(1, statusName);
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(expectedStatus));

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getBankAccountStatusName()).isEqualTo(statusName);
    }

    @Test
    @DisplayName("Should return null when status not found by name")
    void getBankAccountStatusByNameReturnsNullWhenNotFound() {
        // Arrange
        String statusName = "NonExistent";
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when result list is null for name search")
    void getBankAccountStatusByNameReturnsNullWhenListIsNull() {
        // Arrange
        String statusName = "Active";
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return first element when multiple statuses found by name")
    void getBankAccountStatusByNameReturnsFirstElement() {
        // Arrange
        String statusName = "Active";
        BankAccountStatus status1 = createBankAccountStatus(1, statusName);
        BankAccountStatus status2 = createBankAccountStatus(2, statusName);
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Arrays.asList(status1, status2));

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(status1);
    }

    @Test
    @DisplayName("Should set status parameter correctly")
    void getBankAccountStatusByNameSetsParameter() {
        // Arrange
        String statusName = "Inactive";
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        verify(typedQuery).setParameter("status", statusName);
    }

    @Test
    @DisplayName("Should handle null status name")
    void getBankAccountStatusByNameHandlesNullName() {
        // Arrange
        String statusName = null;
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle empty status name")
    void getBankAccountStatusByNameHandlesEmptyName() {
        // Arrange
        String statusName = "";
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return multiple statuses in correct order")
    void getBankAccountStatusesReturnsStatusesInOrder() {
        // Arrange
        BankAccountStatus status1 = createBankAccountStatus(1, "Active");
        BankAccountStatus status2 = createBankAccountStatus(2, "Inactive");
        BankAccountStatus status3 = createBankAccountStatus(3, "Closed");
        List<BankAccountStatus> statuses = Arrays.asList(status1, status2, status3);

        when(entityManager.createNamedQuery("allBankAccountStatuses", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(statuses);

        // Act
        List<BankAccountStatus> result = bankAccountStatusDao.getBankAccountStatuses();

        // Assert
        assertThat(result.get(0).getBankAccountStatusName()).isEqualTo("Active");
        assertThat(result.get(1).getBankAccountStatusName()).isEqualTo("Inactive");
        assertThat(result.get(2).getBankAccountStatusName()).isEqualTo("Closed");
    }

    @Test
    @DisplayName("Should return same instance for same ID lookup")
    void getBankAccountStatusReturnsSameInstanceForSameId() {
        // Arrange
        Integer id = 1;
        BankAccountStatus status = createBankAccountStatus(id, "Active");
        when(entityManager.find(BankAccountStatus.class, id))
            .thenReturn(status);

        // Act
        BankAccountStatus result1 = bankAccountStatusDao.getBankAccountStatus(id);
        BankAccountStatus result2 = bankAccountStatusDao.getBankAccountStatus(id);

        // Assert
        assertThat(result1).isSameAs(result2);
    }

    @Test
    @DisplayName("Should verify entity manager called for find")
    void getBankAccountStatusVerifiesEntityManagerCall() {
        // Arrange
        Integer id = 5;
        when(entityManager.find(BankAccountStatus.class, id))
            .thenReturn(createBankAccountStatus(id, "Test"));

        // Act
        bankAccountStatusDao.getBankAccountStatus(id);

        // Assert
        verify(entityManager).find(BankAccountStatus.class, id);
    }

    @Test
    @DisplayName("Should handle case-sensitive status name search")
    void getBankAccountStatusByNameIsCaseSensitive() {
        // Arrange
        String statusName = "ACTIVE";
        BankAccountStatus status = createBankAccountStatus(1, statusName);
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(status));

        // Act
        BankAccountStatus result = bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getBankAccountStatusName()).isEqualTo(statusName);
    }

    @Test
    @DisplayName("Should handle large list of statuses")
    void getBankAccountStatusesHandlesLargeList() {
        // Arrange
        List<BankAccountStatus> statuses = createBankAccountStatusList(100);
        when(entityManager.createNamedQuery("allBankAccountStatuses", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(statuses);

        // Act
        List<BankAccountStatus> result = bankAccountStatusDao.getBankAccountStatuses();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should use findBankAccountStatusByName named query")
    void getBankAccountStatusByNameUsesCorrectNamedQuery() {
        // Arrange
        String statusName = "Active";
        when(entityManager.createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("status", statusName))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        bankAccountStatusDao.getBankAccountStatusByName(statusName);

        // Assert
        verify(entityManager).createNamedQuery("findBankAccountStatusByName", BankAccountStatus.class);
    }

    @Test
    @DisplayName("Should not call named query when finding by ID")
    void getBankAccountStatusDoesNotCallNamedQuery() {
        // Arrange
        Integer id = 1;
        when(entityManager.find(BankAccountStatus.class, id))
            .thenReturn(createBankAccountStatus(id, "Test"));

        // Act
        bankAccountStatusDao.getBankAccountStatus(id);

        // Assert
        verify(entityManager, never()).createNamedQuery(anyString(), any());
    }

    @Test
    @DisplayName("Should handle single status in list")
    void getBankAccountStatusesHandlesSingleStatus() {
        // Arrange
        List<BankAccountStatus> statuses = Collections.singletonList(
            createBankAccountStatus(1, "Active")
        );
        when(entityManager.createNamedQuery("allBankAccountStatuses", BankAccountStatus.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(statuses);

        // Act
        List<BankAccountStatus> result = bankAccountStatusDao.getBankAccountStatuses();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getBankAccountStatusName()).isEqualTo("Active");
    }

    private List<BankAccountStatus> createBankAccountStatusList(int count) {
        List<BankAccountStatus> statuses = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            statuses.add(createBankAccountStatus(i + 1, "Status " + (i + 1)));
        }
        return statuses;
    }

    private BankAccountStatus createBankAccountStatus(Integer id, String name) {
        BankAccountStatus status = new BankAccountStatus();
        status.setBankAccountStatusId(id);
        status.setBankAccountStatusName(name);
        return status;
    }
}
