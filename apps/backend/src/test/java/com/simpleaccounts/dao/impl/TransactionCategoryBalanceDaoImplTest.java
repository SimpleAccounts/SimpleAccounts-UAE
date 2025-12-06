package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
@DisplayName("TransactionCategoryBalanceDaoImpl Unit Tests")
class TransactionCategoryBalanceDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @Mock
    private ChartOfAccountService chartOfAccountService;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @InjectMocks
    private TransactionCategoryBalanceDaoImpl transactionCategoryBalanceDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(transactionCategoryBalanceDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(transactionCategoryBalanceDao, "entityClass", TransactionCategoryBalance.class);
    }

    @Test
    @DisplayName("Should return all transaction category balances with filters")
    void getAllReturnsBalancesWithFilters() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        List<TransactionCategoryBalance> balances = createBalanceList(5);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(balances);

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(5);
        assertThat(result.getData()).hasSize(5);
    }

    @Test
    @DisplayName("Should exclude opening balance offset liabilities")
    void getAllExcludesOpeningBalanceOffsetLiabilities() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);
        List<TransactionCategory> excludedCategories = createTransactionCategoryList(2);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap()))
            .thenReturn(excludedCategories)
            .thenReturn(new ArrayList<>())
            .thenReturn(new ArrayList<>())
            .thenReturn(new ArrayList<>())
            .thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(transactionCategoryService, times(5)).findByAttributes(anyMap());
    }

    @Test
    @DisplayName("Should exclude opening balance offset assets")
    void getAllExcludesOpeningBalanceOffsetAssets() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(chartOfAccountService).findByPK(7);
    }

    @Test
    @DisplayName("Should exclude petty cash transactions")
    void getAllExcludesPettyCash() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(transactionCategoryService, times(5)).findByAttributes(anyMap());
    }

    @Test
    @DisplayName("Should exclude employee reimbursement transactions")
    void getAllExcludesEmployeeReimbursement() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(transactionCategoryService, times(5)).findByAttributes(anyMap());
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getAllHandlesEmptyFilterMap() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> emptyFilterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(emptyFilterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should handle null pagination model")
    void getAllHandlesNullPaginationModel() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        ChartOfAccount chartOfAccount = createChartOfAccount(7);
        List<TransactionCategoryBalance> balances = createBalanceList(3);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(3L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(balances);

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should add NOT IN filter for excluded categories")
    void getAllAddsNotInFilterForExcludedCategories() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);
        List<TransactionCategory> excludedCategories = createTransactionCategoryList(3);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(excludedCategories);
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(entityManager, times(2)).createQuery(any(String.class));
    }

    @Test
    @DisplayName("Should combine all excluded transaction categories")
    void getAllCombinesAllExcludedCategories() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);
        List<TransactionCategory> categories1 = createTransactionCategoryList(1);
        List<TransactionCategory> categories2 = createTransactionCategoryList(2);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap()))
            .thenReturn(categories1)
            .thenReturn(categories2)
            .thenReturn(new ArrayList<>())
            .thenReturn(new ArrayList<>())
            .thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(transactionCategoryService, times(5)).findByAttributes(anyMap());
    }

    @Test
    @DisplayName("Should retrieve chart of account with ID 7")
    void getAllRetrievesChartOfAccountWithId7() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(chartOfAccountService).findByPK(7);
    }

    @Test
    @DisplayName("Should return correct result count")
    void getAllReturnsCorrectResultCount() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(25L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createBalanceList(10));

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result.getCount()).isEqualTo(25);
    }

    @Test
    @DisplayName("Should execute query for count and data")
    void getAllExecutesQueriesForCountAndData() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(query, times(1)).getSingleResult();
        verify(query, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle large result sets")
    void getAllHandlesLargeResultSets() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 100);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);
        List<TransactionCategoryBalance> balances = createBalanceList(100);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(100L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(balances);

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result.getCount()).isEqualTo(100);
        assertThat(result.getData()).hasSize(100);
    }

    @Test
    @DisplayName("Should return empty data when no balances exist")
    void getAllReturnsEmptyDataWhenNoBalances() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result.getData()).isEmpty();
    }

    @Test
    @DisplayName("Should build DbFilter from each filter map entry")
    void getAllBuildsDbFilterFromFilterMap() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(entityManager, times(2)).createQuery(any(String.class));
    }

    @Test
    @DisplayName("Should initialize all transaction category maps")
    void getAllInitializesAllTransactionCategoryMaps() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(transactionCategoryService, times(5)).findByAttributes(anyMap());
    }

    @Test
    @DisplayName("Should create PaginationResponseModel with count and data")
    void getAllCreatesPaginationResponseModel() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);
        List<TransactionCategoryBalance> balances = createBalanceList(5);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(balances);

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCount()).isNotNull();
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should handle pagination with different page sizes")
    void getAllHandlesDifferentPageSizes() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 25);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(25L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createBalanceList(25));

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result.getData()).hasSize(25);
    }

    @Test
    @DisplayName("Should handle pagination with different page numbers")
    void getAllHandlesDifferentPageNumbers() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(2, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(30L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(createBalanceList(10));

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(paginationModel.getPageNo()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getAllReturnsConsistentResults() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);
        List<TransactionCategoryBalance> balances = createBalanceList(5);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(5L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(balances);

        // Act
        PaginationResponseModel result1 = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);
        PaginationResponseModel result2 = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result1.getCount()).isEqualTo(result2.getCount());
    }

    @Test
    @DisplayName("Should properly aggregate all excluded categories")
    void getAllAggregatesExcludedCategories() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(createTransactionCategoryList(1));
        when(query.getSingleResult()).thenReturn(0L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(new ArrayList<>());

        // Act
        transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        verify(transactionCategoryService, times(5)).findByAttributes(anyMap());
    }

    @Test
    @DisplayName("Should handle single balance result")
    void getAllHandlesSingleBalance() {
        // Arrange
        Map<TransactionCategoryBalanceFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel(0, 10);
        ChartOfAccount chartOfAccount = createChartOfAccount(7);
        List<TransactionCategoryBalance> balances = createBalanceList(1);

        when(chartOfAccountService.findByPK(7)).thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(anyMap())).thenReturn(new ArrayList<>());
        when(query.getSingleResult()).thenReturn(1L);
        when(entityManager.createQuery(any(String.class))).thenReturn(query);
        when(query.getResultList()).thenReturn(balances);

        // Act
        PaginationResponseModel result = transactionCategoryBalanceDao.getAll(filterMap, paginationModel);

        // Assert
        assertThat(result.getData()).hasSize(1);
    }

    private List<TransactionCategoryBalance> createBalanceList(int count) {
        List<TransactionCategoryBalance> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createBalance(i + 1));
        }
        return list;
    }

    private TransactionCategoryBalance createBalance(int id) {
        TransactionCategoryBalance balance = new TransactionCategoryBalance();
        balance.setTransactionCategoryBalanceId(id);
        balance.setBalance(new BigDecimal("1000.00"));
        balance.setBalanceDate(LocalDateTime.now());
        return balance;
    }

    private List<TransactionCategory> createTransactionCategoryList(int count) {
        List<TransactionCategory> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createTransactionCategory(i + 1));
        }
        return list;
    }

    private TransactionCategory createTransactionCategory(int id) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setTransactionCategoryName("Category " + id);
        return category;
    }

    private ChartOfAccount createChartOfAccount(int id) {
        ChartOfAccount chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountId(id);
        chartOfAccount.setChartOfAccountName("Account " + id);
        return chartOfAccount;
    }

    private PaginationModel createPaginationModel(int pageNo, int pageSize) {
        PaginationModel model = new PaginationModel();
        model.setPageNo(pageNo);
        model.setPageSize(pageSize);
        return model;
    }
}
