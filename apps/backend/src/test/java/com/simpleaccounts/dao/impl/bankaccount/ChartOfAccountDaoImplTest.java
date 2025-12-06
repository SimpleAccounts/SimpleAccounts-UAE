package com.simpleaccounts.dao.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
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
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChartOfAccountDaoImpl Unit Tests")
class ChartOfAccountDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<ChartOfAccount> typedQuery;

    @InjectMocks
    private ChartOfAccountDaoImpl chartOfAccountDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(chartOfAccountDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(chartOfAccountDao, "entityClass", ChartOfAccount.class);
    }

    @Test
    @DisplayName("Should update or create chart of account")
    void updateOrCreateTransactionUpdatesChartOfAccount() {
        // Arrange
        ChartOfAccount chartOfAccount = createChartOfAccount(1, "Test Account");
        when(entityManager.merge(chartOfAccount))
            .thenReturn(chartOfAccount);

        // Act
        ChartOfAccount result = chartOfAccountDao.updateOrCreateTransaction(chartOfAccount);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(chartOfAccount);
        verify(entityManager).merge(chartOfAccount);
    }

    @Test
    @DisplayName("Should create new chart of account with null ID")
    void updateOrCreateTransactionCreatesNewAccount() {
        // Arrange
        ChartOfAccount newAccount = createChartOfAccount(null, "New Account");
        when(entityManager.merge(newAccount))
            .thenReturn(newAccount);

        // Act
        ChartOfAccount result = chartOfAccountDao.updateOrCreateTransaction(newAccount);

        // Assert
        assertThat(result).isNotNull();
        verify(entityManager).merge(newAccount);
    }

    @Test
    @DisplayName("Should get chart of account by ID")
    void getChartOfAccountReturnsAccountById() {
        // Arrange
        Integer id = 1;
        ChartOfAccount expectedAccount = createChartOfAccount(id, "Test Account");
        when(entityManager.find(ChartOfAccount.class, id))
            .thenReturn(expectedAccount);

        // Act
        ChartOfAccount result = chartOfAccountDao.getChartOfAccount(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountId()).isEqualTo(id);
        assertThat(result.getChartOfAccountName()).isEqualTo("Test Account");
    }

    @Test
    @DisplayName("Should return null when chart of account not found by ID")
    void getChartOfAccountReturnsNullWhenNotFound() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(ChartOfAccount.class, id))
            .thenReturn(null);

        // Act
        ChartOfAccount result = chartOfAccountDao.getChartOfAccount(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find all chart of accounts")
    void findAllReturnsAllChartOfAccounts() {
        // Arrange
        List<ChartOfAccount> expectedAccounts = createChartOfAccountList(5);
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedAccounts);

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findAll();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedAccounts);
    }

    @Test
    @DisplayName("Should return empty list when no chart of accounts exist")
    void findAllReturnsEmptyListWhenNoAccounts() {
        // Arrange
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findAll();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find chart of accounts by text")
    void findByTextReturnsMatchingAccounts() {
        // Arrange
        String searchText = "Revenue";
        List<ChartOfAccount> matchingAccounts = Arrays.asList(
            createChartOfAccount(1, "Revenue Account"),
            createChartOfAccount(2, "Service Revenue")
        );
        when(entityManager.createQuery(anyString(), eq(ChartOfAccount.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("searchToken", searchText))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(matchingAccounts);

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findByText(searchText);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(typedQuery).setParameter("searchToken", searchText);
    }

    @Test
    @DisplayName("Should return empty list when no accounts match text")
    void findByTextReturnsEmptyListWhenNoMatches() {
        // Arrange
        String searchText = "NonExistent";
        when(entityManager.createQuery(anyString(), eq(ChartOfAccount.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("searchToken", searchText))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findByText(searchText);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should get default chart of account")
    void getDefaultChartOfAccountReturnsFirstAccount() {
        // Arrange
        List<ChartOfAccount> accounts = createChartOfAccountList(3);
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(accounts);

        // Act
        ChartOfAccount result = chartOfAccountDao.getDefaultChartOfAccount();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(accounts.get(0));
    }

    @Test
    @DisplayName("Should return null when no default chart of account exists")
    void getDefaultChartOfAccountReturnsNullWhenNoAccounts() {
        // Arrange
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        ChartOfAccount result = chartOfAccountDao.getDefaultChartOfAccount();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when account list is null")
    void getDefaultChartOfAccountReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        ChartOfAccount result = chartOfAccountDao.getDefaultChartOfAccount();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find all child chart of accounts")
    void findAllChildReturnsChildAccounts() {
        // Arrange
        List<ChartOfAccount> childAccounts = createChartOfAccountList(4);
        when(entityManager.createNamedQuery("findAllChildChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(childAccounts);

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findAllChild();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
        assertThat(result).isEqualTo(childAccounts);
    }

    @Test
    @DisplayName("Should return empty list when no child accounts exist")
    void findAllChildReturnsEmptyListWhenNoChildren() {
        // Arrange
        when(entityManager.createNamedQuery("findAllChildChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findAllChild();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query for findAll")
    void findAllUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountDao.findAll();

        // Assert
        verify(entityManager).createNamedQuery("findAllChartOfAccount", ChartOfAccount.class);
    }

    @Test
    @DisplayName("Should use correct named query for findAllChild")
    void findAllChildUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("findAllChildChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountDao.findAllChild();

        // Assert
        verify(entityManager).createNamedQuery("findAllChildChartOfAccount", ChartOfAccount.class);
    }

    @Test
    @DisplayName("Should handle null search text")
    void findByTextHandlesNullSearchText() {
        // Arrange
        String searchText = null;
        when(entityManager.createQuery(anyString(), eq(ChartOfAccount.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("searchToken", searchText))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findByText(searchText);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty search text")
    void findByTextHandlesEmptySearchText() {
        // Arrange
        String searchText = "";
        when(entityManager.createQuery(anyString(), eq(ChartOfAccount.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("searchToken", searchText))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findByText(searchText);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should verify entity manager merge called")
    void updateOrCreateTransactionCallsMerge() {
        // Arrange
        ChartOfAccount account = createChartOfAccount(5, "Test");
        when(entityManager.merge(account))
            .thenReturn(account);

        // Act
        chartOfAccountDao.updateOrCreateTransaction(account);

        // Assert
        verify(entityManager).merge(account);
    }

    @Test
    @DisplayName("Should verify entity manager find called")
    void getChartOfAccountCallsFind() {
        // Arrange
        Integer id = 10;
        when(entityManager.find(ChartOfAccount.class, id))
            .thenReturn(createChartOfAccount(id, "Test"));

        // Act
        chartOfAccountDao.getChartOfAccount(id);

        // Assert
        verify(entityManager).find(ChartOfAccount.class, id);
    }

    @Test
    @DisplayName("Should handle single element list for default")
    void getDefaultChartOfAccountHandlesSingleElement() {
        // Arrange
        List<ChartOfAccount> accounts = Collections.singletonList(
            createChartOfAccount(1, "Only Account")
        );
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(accounts);

        // Act
        ChartOfAccount result = chartOfAccountDao.getDefaultChartOfAccount();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountName()).isEqualTo("Only Account");
    }

    @Test
    @DisplayName("Should handle large list of accounts")
    void findAllHandlesLargeList() {
        // Arrange
        List<ChartOfAccount> accounts = createChartOfAccountList(100);
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(accounts);

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findAll();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should return accounts in correct order from findByText")
    void findByTextReturnsAccountsInOrder() {
        // Arrange
        String searchText = "Test";
        ChartOfAccount account1 = createChartOfAccount(1, "Test Account 1");
        ChartOfAccount account2 = createChartOfAccount(2, "Test Account 2");
        List<ChartOfAccount> accounts = Arrays.asList(account1, account2);

        when(entityManager.createQuery(anyString(), eq(ChartOfAccount.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("searchToken", searchText))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(accounts);

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findByText(searchText);

        // Assert
        assertThat(result.get(0).getChartOfAccountName()).isEqualTo("Test Account 1");
        assertThat(result.get(1).getChartOfAccountName()).isEqualTo("Test Account 2");
    }

    @Test
    @DisplayName("Should handle partial text match")
    void findByTextHandlesPartialMatch() {
        // Arrange
        String searchText = "Rev";
        List<ChartOfAccount> accounts = Collections.singletonList(
            createChartOfAccount(1, "Revenue")
        );
        when(entityManager.createQuery(anyString(), eq(ChartOfAccount.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("searchToken", searchText))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(accounts);

        // Act
        List<ChartOfAccount> result = chartOfAccountDao.findByText(searchText);

        // Assert
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should return updated account after merge")
    void updateOrCreateTransactionReturnsUpdatedAccount() {
        // Arrange
        ChartOfAccount originalAccount = createChartOfAccount(1, "Original");
        ChartOfAccount updatedAccount = createChartOfAccount(1, "Updated");
        when(entityManager.merge(originalAccount))
            .thenReturn(updatedAccount);

        // Act
        ChartOfAccount result = chartOfAccountDao.updateOrCreateTransaction(originalAccount);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(updatedAccount);
    }

    @Test
    @DisplayName("Should handle null chart of account in update")
    void updateOrCreateTransactionHandlesNullAccount() {
        // Arrange
        ChartOfAccount account = null;
        when(entityManager.merge(account))
            .thenReturn(null);

        // Act
        ChartOfAccount result = chartOfAccountDao.updateOrCreateTransaction(account);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should call findAll when getting default account")
    void getDefaultChartOfAccountCallsFindAll() {
        // Arrange
        when(entityManager.createNamedQuery("findAllChartOfAccount", ChartOfAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        chartOfAccountDao.getDefaultChartOfAccount();

        // Assert
        verify(entityManager).createNamedQuery("findAllChartOfAccount", ChartOfAccount.class);
    }

    private List<ChartOfAccount> createChartOfAccountList(int count) {
        List<ChartOfAccount> accounts = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            accounts.add(createChartOfAccount(i + 1, "Account " + (i + 1)));
        }
        return accounts;
    }

    private ChartOfAccount createChartOfAccount(Integer id, String name) {
        ChartOfAccount account = new ChartOfAccount();
        account.setChartOfAccountId(id);
        account.setChartOfAccountName(name);
        account.setDeleteFlag(false);
        return account;
    }
}
