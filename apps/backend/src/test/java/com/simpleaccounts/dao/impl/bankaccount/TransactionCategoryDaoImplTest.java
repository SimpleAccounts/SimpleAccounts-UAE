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
import com.simpleaccounts.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
@DisplayName("TransactionCategoryDaoImpl Unit Tests")
class TransactionCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<TransactionCategory> typedQuery;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private ChartOfAccountService chartOfAccountService;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @InjectMocks
    private TransactionCategoryDaoImpl transactionCategoryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(transactionCategoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(transactionCategoryDao, "entityClass", TransactionCategory.class);
    }

    @Test
    @DisplayName("Should return default transaction category")
    void getDefaultTransactionCategoryReturnsFirstCategory() {
        // Arrange
        List<TransactionCategory> categories = createTransactionCategoryList(3);
        when(entityManager.createNamedQuery("findAllTransactionCategory", TransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(categories);

        // Act
        TransactionCategory result = transactionCategoryDao.getDefaultTransactionCategory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(categories.get(0));
    }

    @Test
    @DisplayName("Should return null when no default transaction category exists")
    void getDefaultTransactionCategoryReturnsNullWhenNoCategories() {
        // Arrange
        when(entityManager.createNamedQuery("findAllTransactionCategory", TransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        TransactionCategory result = transactionCategoryDao.getDefaultTransactionCategory();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find all transaction categories")
    void findAllTransactionCategoryReturnsAllCategories() {
        // Arrange
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(5);
        when(entityManager.createNamedQuery("findAllTransactionCategory", TransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao.findAllTransactionCategory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedCategories);
    }

    @Test
    @DisplayName("Should return empty list when no transaction categories exist")
    void findAllTransactionCategoryReturnsEmptyList() {
        // Arrange
        when(entityManager.createNamedQuery("findAllTransactionCategory", TransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<TransactionCategory> result = transactionCategoryDao.findAllTransactionCategory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should update or create transaction category")
    void updateOrCreateTransactionUpdatesCategory() {
        // Arrange
        TransactionCategory category = createTransactionCategory(1, "Test Category");
        when(entityManager.merge(category))
            .thenReturn(category);

        // Act
        TransactionCategory result = transactionCategoryDao.updateOrCreateTransaction(category);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(category);
        verify(entityManager).merge(category);
    }

    @Test
    @DisplayName("Should find transaction categories by chart of account ID and name")
    void findAllTransactionCategoryByChartOfAccountIdAndNameReturnsCategories() {
        // Arrange
        Integer chartOfAccountId = 1;
        String name = "Revenue";
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(2);
        when(entityManager.createQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("chartOfAccountId", chartOfAccountId))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("transactionCategoryName", name))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao
            .findAllTransactionCategoryByChartOfAccountIdAndName(chartOfAccountId, name);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return empty list when no categories match chart of account and name")
    void findAllTransactionCategoryByChartOfAccountIdAndNameReturnsEmptyList() {
        // Arrange
        Integer chartOfAccountId = 999;
        String name = "NonExistent";
        when(entityManager.createQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("chartOfAccountId", chartOfAccountId))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("transactionCategoryName", name))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<TransactionCategory> result = transactionCategoryDao
            .findAllTransactionCategoryByChartOfAccountIdAndName(chartOfAccountId, name);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should find transaction categories by chart of account")
    void findAllTransactionCategoryByChartOfAccountReturnsCategories() {
        // Arrange
        Integer chartOfAccountId = 1;
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(3);
        when(entityManager.createQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("chartOfAccountId", chartOfAccountId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao
            .findAllTransactionCategoryByChartOfAccount(chartOfAccountId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should find transaction category by transaction category code")
    void findTransactionCategoryByTransactionCategoryCodeReturnsCategory() {
        // Arrange
        String categoryCode = "TC001";
        TransactionCategory expectedCategory = createTransactionCategory(1, "Test");
        when(entityManager.createQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("transactionCategoryCode", categoryCode))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(expectedCategory));

        // Act
        TransactionCategory result = transactionCategoryDao
            .findTransactionCategoryByTransactionCategoryCode(categoryCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedCategory);
    }

    @Test
    @DisplayName("Should return null when category not found by code")
    void findTransactionCategoryByTransactionCategoryCodeReturnsNull() {
        // Arrange
        String categoryCode = "INVALID";
        when(entityManager.createQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("transactionCategoryCode", categoryCode))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        TransactionCategory result = transactionCategoryDao
            .findTransactionCategoryByTransactionCategoryCode(categoryCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find transaction categories by parent category")
    void findTransactionCategoryListByParentCategoryReturnsCategories() {
        // Arrange
        Integer parentCategoryId = 1;
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(4);
        when(entityManager.createQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("parentCategoryId", parentCategoryId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao
            .findTransactionCategoryListByParentCategory(parentCategoryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
    }

    @Test
    @DisplayName("Should get default transaction category excluding specific ID")
    void getDefaultTransactionCategoryByTransactionCategoryIdReturnsCategory() {
        // Arrange
        Integer excludeId = 5;
        TransactionCategory expectedCategory = createTransactionCategory(1, "Default");
        when(entityManager.createQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("transactionCategoryId", excludeId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(expectedCategory));

        // Act
        TransactionCategory result = transactionCategoryDao
            .getDefaultTransactionCategoryByTransactionCategoryId(excludeId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedCategory);
    }

    @Test
    @DisplayName("Should soft delete transaction categories by IDs")
    void deleteByIdsSetsDeleteFlagToTrue() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        TransactionCategory category1 = createTransactionCategory(1, "Category 1");
        TransactionCategory category2 = createTransactionCategory(2, "Category 2");
        TransactionCategory category3 = createTransactionCategory(3, "Category 3");

        when(entityManager.find(TransactionCategory.class, 1)).thenReturn(category1);
        when(entityManager.find(TransactionCategory.class, 2)).thenReturn(category2);
        when(entityManager.find(TransactionCategory.class, 3)).thenReturn(category3);

        // Act
        transactionCategoryDao.deleteByIds(ids);

        // Assert
        assertThat(category1.getDeleteFlag()).isTrue();
        assertThat(category2.getDeleteFlag()).isTrue();
        assertThat(category3.getDeleteFlag()).isTrue();
        verify(entityManager, times(3)).merge(any(TransactionCategory.class));
    }

    @Test
    @DisplayName("Should handle null IDs list in delete")
    void deleteByIdsHandlesNullList() {
        // Arrange
        List<Integer> ids = null;

        // Act
        transactionCategoryDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
    }

    @Test
    @DisplayName("Should handle empty IDs list in delete")
    void deleteByIdsHandlesEmptyList() {
        // Arrange
        List<Integer> ids = new ArrayList<>();

        // Act
        transactionCategoryDao.deleteByIds(ids);

        // Assert
        verify(entityManager, never()).find(any(), any());
    }

    @Test
    @DisplayName("Should get transaction category list with pagination")
    void getTransactionCategoryListReturnsPaginatedResponse() {
        // Arrange
        Map<TransactionCategoryFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = createPaginationModel();
        ChartOfAccount chartOfAccount = new ChartOfAccount();

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.CHART_OF_ACCOUNT)))
            .thenReturn("transactionCategoryName");
        when(chartOfAccountService.findByPK(7))
            .thenReturn(chartOfAccount);
        when(transactionCategoryService.findByAttributes(any()))
            .thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = transactionCategoryDao
            .getTransactionCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should get next transaction category code by chart of account")
    void getNxtTransactionCatCodeByChartOfAccountReturnsNextCode() {
        // Arrange
        ChartOfAccount chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountCode("COA");

        TransactionCategory lastCategory = createTransactionCategory(1, "Test");
        lastCategory.setTransactionCategoryCode("COA-005");

        when(entityManager.createNamedQuery("findMaxTnxCodeByChartOfAccId", TransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("chartOfAccountId", chartOfAccount))
            .thenReturn(typedQuery);
        when(typedQuery.setMaxResults(1))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.singletonList(lastCategory));

        // Act
        String result = transactionCategoryDao.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount);

        // Assert
        assertThat(result).isEqualTo("COA-006");
    }

    @Test
    @DisplayName("Should return first code when no previous codes exist")
    void getNxtTransactionCatCodeByChartOfAccountReturnsFirstCode() {
        // Arrange
        ChartOfAccount chartOfAccount = new ChartOfAccount();
        chartOfAccount.setChartOfAccountCode("NEW");

        when(entityManager.createNamedQuery("findMaxTnxCodeByChartOfAccId", TransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("chartOfAccountId", chartOfAccount))
            .thenReturn(typedQuery);
        when(typedQuery.setMaxResults(1))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        String result = transactionCategoryDao.getNxtTransactionCatCodeByChartOfAccount(chartOfAccount);

        // Assert
        assertThat(result).isEqualTo("NEW-001");
    }

    @Test
    @DisplayName("Should get transaction categories by chart of account category ID")
    void getTransactionCatByChartOfAccountCategoryIdReturnsCategories() {
        // Arrange
        Integer categoryId = 1;
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(3);
        when(entityManager.createNativeQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("coaCategoryId", categoryId))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao
            .getTransactionCatByChartOfAccountCategoryId(categoryId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should find transaction categories for receipt")
    void findTnxCatForReicptReturnsCategories() {
        // Arrange
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(2);
        when(entityManager.createNamedQuery("findTnxCatForReicpt"))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao.findTnxCatForReicpt();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should get transaction categories for sales product")
    void getTransactionCategoryListForSalesProductReturnsCategories() {
        // Arrange
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(3);
        when(entityManager.createNamedQuery("getTransactionCategoryListForSalesProduct"))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao.getTransactionCategoryListForSalesProduct();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should get transaction categories for purchase product")
    void getTransactionCategoryListForPurchaseProductReturnsCategories() {
        // Arrange
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(4);
        when(entityManager.createNamedQuery("getTransactionCategoryListForPurchaseProduct"))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao.getTransactionCategoryListForPurchaseProduct();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
    }

    @Test
    @DisplayName("Should get transaction categories for inventory")
    void getTransactionCategoryListForInventoryReturnsCategories() {
        // Arrange
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(2);
        when(entityManager.createNamedQuery("getTransactionCategoryListForInventory"))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao.getTransactionCategoryListForInventory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should get transaction categories for manual journal")
    void getTransactionCategoryListManualJornalReturnsCategories() {
        // Arrange
        List<TransactionCategory> expectedCategories = createTransactionCategoryList(5);
        when(entityManager.createNamedQuery("getTransactionCategoryListManualJornal"))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedCategories);

        // Act
        List<TransactionCategory> result = transactionCategoryDao.getTransactionCategoryListManualJornal();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should handle null result list")
    void findAllTransactionCategoryByChartOfAccountIdAndNameHandlesNullResult() {
        // Arrange
        Integer chartOfAccountId = 1;
        String name = "Test";
        when(entityManager.createQuery(anyString(), eq(TransactionCategory.class)))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("chartOfAccountId", chartOfAccountId))
            .thenReturn(typedQuery);
        when(typedQuery.setParameter("transactionCategoryName", name))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<TransactionCategory> result = transactionCategoryDao
            .findAllTransactionCategoryByChartOfAccountIdAndName(chartOfAccountId, name);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query")
    void findAllTransactionCategoryUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("findAllTransactionCategory", TransactionCategory.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        transactionCategoryDao.findAllTransactionCategory();

        // Assert
        verify(entityManager).createNamedQuery("findAllTransactionCategory", TransactionCategory.class);
    }

    private List<TransactionCategory> createTransactionCategoryList(int count) {
        List<TransactionCategory> categories = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            categories.add(createTransactionCategory(i + 1, "Category " + (i + 1)));
        }
        return categories;
    }

    private TransactionCategory createTransactionCategory(Integer id, String name) {
        TransactionCategory category = new TransactionCategory();
        category.setTransactionCategoryId(id);
        category.setTransactionCategoryName(name);
        category.setDeleteFlag(false);
        return category;
    }

    private PaginationModel createPaginationModel() {
        PaginationModel model = new PaginationModel();
        model.setPageNo(0);
        model.setPageSize(10);
        model.setSortingCol("transactionCategoryName");
        model.setSortingDir("ASC");
        return model;
    }
}
