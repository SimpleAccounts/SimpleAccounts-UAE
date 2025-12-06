package com.simpleaccounts.dao.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.Query;
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
@DisplayName("BankAccountDaoImpl Unit Tests")
class BankAccountDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<BankAccount> typedQuery;

    @Mock
    private TypedQuery<BigDecimal> bigDecimalTypedQuery;

    @Mock
    private Query query;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private BankAccountDaoImpl bankAccountDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bankAccountDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(bankAccountDao, "entityClass", BankAccount.class);
    }

    @Test
    @DisplayName("Should return list of bank accounts")
    void getBankAccountsReturnsListOfBankAccounts() {
        // Arrange
        List<BankAccount> expectedAccounts = createBankAccountList(3);
        when(entityManager.createNamedQuery("allBankAccounts", BankAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedAccounts);

        // Act
        List<BankAccount> result = bankAccountDao.getBankAccounts();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedAccounts);
    }

    @Test
    @DisplayName("Should return empty list when no bank accounts exist")
    void getBankAccountsReturnsEmptyListWhenNoAccountsExist() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccounts", BankAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<BankAccount> result = bankAccountDao.getBankAccounts();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return bank accounts by user ID")
    void getBankAccountByUserReturnsAccountsForUser() {
        // Arrange
        int userId = 1;
        List<BankAccount> expectedAccounts = createBankAccountList(2);
        when(entityManager.createQuery("from BankAccount where createdBy = :userId"))
            .thenReturn(query);
        when(query.setParameter("userId", userId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedAccounts);

        // Act
        List<BankAccount> result = bankAccountDao.getBankAccountByUser(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).isEqualTo(expectedAccounts);
        verify(query).setParameter("userId", userId);
    }

    @Test
    @DisplayName("Should return empty list when user has no bank accounts")
    void getBankAccountByUserReturnsEmptyListWhenNoAccounts() {
        // Arrange
        int userId = 999;
        when(entityManager.createQuery("from BankAccount where createdBy = :userId"))
            .thenReturn(query);
        when(query.setParameter("userId", userId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<BankAccount> result = bankAccountDao.getBankAccountByUser(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return null when exception occurs getting accounts by user")
    void getBankAccountByUserReturnsNullOnException() {
        // Arrange
        int userId = 1;
        when(entityManager.createQuery("from BankAccount where createdBy = :userId"))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        List<BankAccount> result = bankAccountDao.getBankAccountByUser(userId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return bank account by ID")
    void getBankAccountByIdReturnsAccount() {
        // Arrange
        int accountId = 1;
        BankAccount expectedAccount = createBankAccount(accountId, "Test Account");
        when(entityManager.createQuery("SELECT b FROM BankAccount b WHERE b.bankAccountId =:id", BankAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("id", accountId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(expectedAccount));

        // Act
        BankAccount result = bankAccountDao.getBankAccountById(accountId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getBankAccountId()).isEqualTo(accountId);
        assertThat(result.getBankAccountName()).isEqualTo("Test Account");
    }

    @Test
    @DisplayName("Should return null when bank account not found by ID")
    void getBankAccountByIdReturnsNullWhenNotFound() {
        // Arrange
        int accountId = 999;
        when(entityManager.createQuery("SELECT b FROM BankAccount b WHERE b.bankAccountId =:id", BankAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("id", accountId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        BankAccount result = bankAccountDao.getBankAccountById(accountId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when result list is null")
    void getBankAccountByIdReturnsNullWhenResultListIsNull() {
        // Arrange
        int accountId = 1;
        when(entityManager.createQuery("SELECT b FROM BankAccount b WHERE b.bankAccountId =:id", BankAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("id", accountId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        BankAccount result = bankAccountDao.getBankAccountById(accountId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should soft delete bank accounts by IDs")
    void deleteByIdsSetsDeleteFlagToTrue() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        BankAccount account1 = createBankAccount(1, "Account 1");
        BankAccount account2 = createBankAccount(2, "Account 2");
        BankAccount account3 = createBankAccount(3, "Account 3");

        when(entityManager.find(BankAccount.class, 1)).thenReturn(account1);
        when(entityManager.find(BankAccount.class, 2)).thenReturn(account2);
        when(entityManager.find(BankAccount.class, 3)).thenReturn(account3);

        // Act
        bankAccountDao.deleteByIds(ids);

        // Assert
        assertThat(account1.getDeleteFlag()).isTrue();
        assertThat(account2.getDeleteFlag()).isTrue();
        assertThat(account3.getDeleteFlag()).isTrue();
        verify(entityManager, times(3)).merge(any(BankAccount.class));
    }

    @Test
    @DisplayName("Should handle null IDs list in delete")
    void deleteByIdsHandlesNullList() {
        // Arrange
        List<Integer> ids = null;

        // Act
        bankAccountDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should handle empty IDs list in delete")
    void deleteByIdsHandlesEmptyList() {
        // Arrange
        List<Integer> ids = new ArrayList<>();

        // Act
        bankAccountDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should return pagination response with filters")
    void getBankAccountsWithFiltersReturnsPaginatedResponse() {
        // Arrange
        Map<BankAccounrFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel();
        List<BankAccount> accounts = createBankAccountList(5);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.BANK_ACCOUNT)))
            .thenReturn("bankAccountName");

        // Act
        PaginationResponseModel result = bankAccountDao.getBankAccounts(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil).getColName(anyString(), eq(DatatableSortingFilterConstant.BANK_ACCOUNT));
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getBankAccountsHandlesEmptyFilterMap() {
        // Arrange
        Map<BankAccounrFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel();

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.BANK_ACCOUNT)))
            .thenReturn("bankAccountName");

        // Act
        PaginationResponseModel result = bankAccountDao.getBankAccounts(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should return total balance of all bank accounts")
    void getAllBankAccountsTotalBalanceReturnsSum() {
        // Arrange
        BigDecimal expectedBalance = new BigDecimal("10000.50");
        when(entityManager.createNamedQuery("allBankAccountsTotalBalance", BigDecimal.class))
            .thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(expectedBalance));

        // Act
        BigDecimal result = bankAccountDao.getAllBankAccountsTotalBalance();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(expectedBalance);
    }

    @Test
    @DisplayName("Should return zero when no accounts have balance")
    void getAllBankAccountsTotalBalanceReturnsZeroWhenEmpty() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountsTotalBalance", BigDecimal.class))
            .thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        BigDecimal result = bankAccountDao.getAllBankAccountsTotalBalance();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should return zero when balance list is null")
    void getAllBankAccountsTotalBalanceReturnsZeroWhenNull() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountsTotalBalance", BigDecimal.class))
            .thenReturn(bigDecimalTypedQuery);
        when(bigDecimalTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        BigDecimal result = bankAccountDao.getAllBankAccountsTotalBalance();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should return null when exception occurs getting total balance")
    void getAllBankAccountsTotalBalanceReturnsNullOnException() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountsTotalBalance", BigDecimal.class))
            .thenThrow(new RuntimeException("Database error"));

        // Act
        BigDecimal result = bankAccountDao.getAllBankAccountsTotalBalance();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should delete single bank account")
    void deleteByIdsSingleAccount() {
        // Arrange
        List<Integer> ids = Collections.singletonList(1);
        BankAccount account = createBankAccount(1, "Account 1");
        when(entityManager.find(BankAccount.class, 1)).thenReturn(account);

        // Act
        bankAccountDao.deleteByIds(ids);

        // Assert
        assertThat(account.getDeleteFlag()).isTrue();
        verify(entityManager).merge(account);
    }

    @Test
    @DisplayName("Should handle multiple filter criteria")
    void getBankAccountsWithMultipleFilters() {
        // Arrange
        Map<BankAccounrFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(BankAccounrFilterEnum.BANK_ACCOUNT_NAME, "Test");
        filterMap.put(BankAccounrFilterEnum.BANK_ACCOUNT_ID, 1);
        PaginationModel paginationModel = createPaginationModel();

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.BANK_ACCOUNT)))
            .thenReturn("bankAccountName");

        // Act
        PaginationResponseModel result = bankAccountDao.getBankAccounts(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should verify query parameter setting for user filter")
    void getBankAccountByUserSetsParameterCorrectly() {
        // Arrange
        int userId = 42;
        when(entityManager.createQuery("from BankAccount where createdBy = :userId"))
            .thenReturn(query);
        when(query.setParameter("userId", userId))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        bankAccountDao.getBankAccountByUser(userId);

        // Assert
        verify(query).setParameter("userId", userId);
    }

    @Test
    @DisplayName("Should return first element from list when getting by ID")
    void getBankAccountByIdReturnsFirstElement() {
        // Arrange
        int accountId = 1;
        BankAccount account1 = createBankAccount(accountId, "Account 1");
        BankAccount account2 = createBankAccount(accountId, "Account 2");
        when(entityManager.createQuery("SELECT b FROM BankAccount b WHERE b.bankAccountId =:id", BankAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("id", accountId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Arrays.asList(account1, account2));

        // Act
        BankAccount result = bankAccountDao.getBankAccountById(accountId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(account1);
    }

    @Test
    @DisplayName("Should handle large number of IDs for deletion")
    void deleteByIdsHandlesLargeList() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
            when(entityManager.find(BankAccount.class, i))
                .thenReturn(createBankAccount(i, "Account " + i));
        }

        // Act
        bankAccountDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(100)).find(eq(BankAccount.class), any(Integer.class));
        verify(entityManager, times(100)).merge(any(BankAccount.class));
    }

    @Test
    @DisplayName("Should use correct named query for all bank accounts")
    void getBankAccountsUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccounts", BankAccount.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        bankAccountDao.getBankAccounts();

        // Assert
        verify(entityManager).createNamedQuery("allBankAccounts", BankAccount.class);
    }

    private List<BankAccount> createBankAccountList(int count) {
        List<BankAccount> accounts = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            accounts.add(createBankAccount(i + 1, "Account " + (i + 1)));
        }
        return accounts;
    }

    private BankAccount createBankAccount(int id, String name) {
        BankAccount account = new BankAccount();
        account.setBankAccountId(id);
        account.setBankAccountName(name);
        account.setDeleteFlag(false);
        return account;
    }

    private PaginationModel createPaginationModel() {
        PaginationModel model = new PaginationModel();
        model.setPageNo(0);
        model.setPageSize(10);
        model.setSortingCol("bankAccountName");
        model.setSortingDir("ASC");
        return model;
    }
}
