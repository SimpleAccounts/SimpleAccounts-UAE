package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.ChartOfAccountCategory;
import com.simpleaccounts.entity.CoacTransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ChartOfAccountCategoryService;
import com.simpleaccounts.service.TransactionCategoryService;
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
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("CoacTransactionCategoryDaoImpl Unit Tests")
class CoacTransactionCategoryDaoImplTest {

  @Mock private EntityManager entityManager;

  @Mock private ChartOfAccountCategoryService chartOfAccountCategoryService;

  @Mock private TransactionCategoryService transactionCategoryService;

  @Mock private TypedQuery<Integer> integerTypedQuery;

  @InjectMocks private CoacTransactionCategoryDaoImpl coacTransactionCategoryDao;

  @Captor private ArgumentCaptor<CoacTransactionCategory> coacTransactionCategoryCaptor;

  private ChartOfAccount testChartOfAccount;
  private TransactionCategory testTransactionCategory;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(coacTransactionCategoryDao, "entityManager", entityManager);

    testChartOfAccount = new ChartOfAccount();
    testChartOfAccount.setChartOfAccountId(1);
    testChartOfAccount.setChartOfAccountName("Test Account");

    testTransactionCategory = new TransactionCategory();
    testTransactionCategory.setTransactionCategoryId(100);
    testTransactionCategory.setChartOfAccount(testChartOfAccount);
  }

  @Test
  @DisplayName("Should add CoAC transaction category when COA categories exist")
  void addCoacTransactionCategoryAddsWhenCoaCategoriesExist() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Arrays.asList(1, 2, 3);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(3)).persist(any(CoacTransactionCategory.class));
    verify(entityManager, times(3)).flush();
    verify(entityManager, times(3)).refresh(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should not add when COA category list is empty")
  void addCoacTransactionCategoryDoesNotAddWhenListEmpty() {
    // Arrange
    Integer maxId = 5;
    List<Integer> emptyList = new ArrayList<>();

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(emptyList);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, never()).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should not add when COA category list is null")
  void addCoacTransactionCategoryDoesNotAddWhenListNull() {
    // Arrange
    Integer maxId = 5;

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(null);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, never()).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should query for max ID before processing")
  void addCoacTransactionCategoryQueriesForMaxId() {
    // Arrange
    Integer maxId = 15;
    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(new ArrayList<>());

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager).createQuery("SELECT MAX(id) FROM CoacTransactionCategory", Integer.class);
  }

  @Test
  @DisplayName("Should query for COA categories by chart of account")
  void addCoacTransactionCategoryQueriesForCoaCategories() {
    // Arrange
    Integer maxId = 10;
    mockMaxIdQuery(maxId);

    TypedQuery<Integer> coaQuery = mockCoaCategoryQuery(new ArrayList<>());

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(coaQuery).setParameter("chartOfAccount", testTransactionCategory.getChartOfAccount());
  }

  @Test
  @DisplayName("Should increment ID for each category added")
  void addCoacTransactionCategoryIncrementsIdForEachCategory() {
    // Arrange
    Integer maxId = 20;
    List<Integer> coaCategoryIds = Arrays.asList(1, 2);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(2)).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should set chart of account category on new entity")
  void addCoacTransactionCategorySetsChartOfAccountCategory() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Collections.singletonList(5);
    ChartOfAccountCategory expectedCategory = new ChartOfAccountCategory();
    expectedCategory.setChartOfAccountCategoryId(5);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    when(chartOfAccountCategoryService.findByPK(5)).thenReturn(expectedCategory);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(chartOfAccountCategoryService).findByPK(5);
    verify(entityManager).persist(coacTransactionCategoryCaptor.capture());
    assertThat(coacTransactionCategoryCaptor.getValue().getChartOfAccountCategory())
        .isEqualTo(expectedCategory);
  }

  @Test
  @DisplayName("Should set transaction category on new entity")
  void addCoacTransactionCategorySetsTransactionCategory() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Collections.singletonList(3);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager).persist(coacTransactionCategoryCaptor.capture());
    assertThat(coacTransactionCategoryCaptor.getValue().getTransactionCategory())
        .isEqualTo(testTransactionCategory);
  }

  @Test
  @DisplayName("Should persist each COA transaction category")
  void addCoacTransactionCategoryPersistsEachEntity() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Arrays.asList(1, 2, 3, 4);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(4)).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should handle single COA category")
  void addCoacTransactionCategoryHandlesSingleCategory() {
    // Arrange
    Integer maxId = 5;
    List<Integer> coaCategoryIds = Collections.singletonList(7);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(1)).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should handle null max ID")
  void addCoacTransactionCategoryHandlesNullMaxId() {
    // Arrange
    mockMaxIdQuery(null);
    mockCoaCategoryQuery(Collections.singletonList(1));

    // Act & Assert
    assertThatThrownBy(
            () ->
                coacTransactionCategoryDao.addCoacTransactionCategory(
                    testChartOfAccount, testTransactionCategory))
        .isInstanceOf(NullPointerException.class);
  }

  @Test
  @DisplayName("Should use chart of account from transaction category")
  void addCoacTransactionCategoryUsesChartOfAccountFromTransactionCategory() {
    // Arrange
    Integer maxId = 10;
    mockMaxIdQuery(maxId);
    TypedQuery<Integer> coaQuery = mockCoaCategoryQuery(new ArrayList<>());

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(coaQuery).setParameter("chartOfAccount", testChartOfAccount);
  }

  @Test
  @DisplayName("Should create new CoAC transaction category for each ID")
  void addCoacTransactionCategoryCreatesNewEntityForEachId() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Arrays.asList(1, 2);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(2)).persist(coacTransactionCategoryCaptor.capture());
    List<CoacTransactionCategory> capturedEntities = coacTransactionCategoryCaptor.getAllValues();
    assertThat(capturedEntities).hasSize(2);
    assertThat(capturedEntities.get(0)).isNotSameAs(capturedEntities.get(1));
  }

  @Test
  @DisplayName("Should handle large number of COA categories")
  void addCoacTransactionCategoryHandlesLargeNumberOfCategories() {
    // Arrange
    Integer maxId = 100;
    List<Integer> coaCategoryIds = new ArrayList<>();
    for (int i = 1; i <= 50; i++) {
      coaCategoryIds.add(i);
    }

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(50)).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should execute COA category query with correct parameters")
  void addCoacTransactionCategoryExecutesQueryWithCorrectParams() {
    // Arrange
    Integer maxId = 10;
    mockMaxIdQuery(maxId);
    TypedQuery<Integer> coaQuery = mockCoaCategoryQuery(new ArrayList<>());

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager)
        .createQuery(
            "SELECT c.chartOfAccountCategory.chartOfAccountCategoryId  FROM CoaCoaCategory c  WHERE"
                + " c.chartOfAccount = :chartOfAccount",
            Integer.class);
    verify(coaQuery).setParameter("chartOfAccount", testChartOfAccount);
  }

  @Test
  @DisplayName("Should load chart of account category for each ID")
  void addCoacTransactionCategoryLoadsChartOfAccountCategoryForEachId() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Arrays.asList(5, 10, 15);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(chartOfAccountCategoryService).findByPK(5);
    verify(chartOfAccountCategoryService).findByPK(10);
    verify(chartOfAccountCategoryService).findByPK(15);
  }

  @Test
  @DisplayName("Should not call persist when category list is empty")
  void addCoacTransactionCategoryDoesNotPersistWhenEmpty() {
    // Arrange
    Integer maxId = 10;
    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(Collections.emptyList());

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, never()).persist(any());
    verify(chartOfAccountCategoryService, never()).findByPK(any());
  }

  @Test
  @DisplayName("Should handle zero max ID")
  void addCoacTransactionCategoryHandlesZeroMaxId() {
    // Arrange
    Integer maxId = 0;
    List<Integer> coaCategoryIds = Collections.singletonList(1);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should process all categories in the list")
  void addCoacTransactionCategoryProcessesAllCategories() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Arrays.asList(1, 2, 3);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(chartOfAccountCategoryService, times(3)).findByPK(any());
    verify(entityManager, times(3)).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should create query for max ID exactly once")
  void addCoacTransactionCategoryCreatesMaxIdQueryOnce() {
    // Arrange
    Integer maxId = 10;
    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(new ArrayList<>());

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(1))
        .createQuery("SELECT MAX(id) FROM CoacTransactionCategory", Integer.class);
  }

  @Test
  @DisplayName("Should create COA category query exactly once")
  void addCoacTransactionCategoryCreatesCoaCategoryQueryOnce() {
    // Arrange
    Integer maxId = 10;
    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(new ArrayList<>());

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(1))
        .createQuery(
            "SELECT c.chartOfAccountCategory.chartOfAccountCategoryId  FROM CoaCoaCategory c  WHERE"
                + " c.chartOfAccount = :chartOfAccount",
            Integer.class);
  }

  @Test
  @DisplayName("Should handle duplicate category IDs")
  void addCoacTransactionCategoryHandlesDuplicateCategoryIds() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Arrays.asList(1, 1, 2);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(3)).persist(any(CoacTransactionCategory.class));
  }

  @Test
  @DisplayName("Should verify all entities are flushed and refreshed")
  void addCoacTransactionCategoryFlushesAndRefreshesAllEntities() {
    // Arrange
    Integer maxId = 10;
    List<Integer> coaCategoryIds = Arrays.asList(1, 2);

    mockMaxIdQuery(maxId);
    mockCoaCategoryQuery(coaCategoryIds);
    mockChartOfAccountCategoryService(coaCategoryIds);

    // Act
    coacTransactionCategoryDao.addCoacTransactionCategory(
        testChartOfAccount, testTransactionCategory);

    // Assert
    verify(entityManager, times(2)).flush();
    verify(entityManager, times(2)).refresh(any(CoacTransactionCategory.class));
  }

  private void mockMaxIdQuery(Integer maxId) {
    TypedQuery<Integer> maxIdQuery = (TypedQuery<Integer>) integerTypedQuery;
    when(entityManager.createQuery("SELECT MAX(id) FROM CoacTransactionCategory", Integer.class))
        .thenReturn(maxIdQuery);
    when(maxIdQuery.getSingleResult()).thenReturn(maxId);
  }

  private TypedQuery<Integer> mockCoaCategoryQuery(List<Integer> categoryIds) {
    TypedQuery<Integer> coaQuery = (TypedQuery<Integer>) integerTypedQuery;
    when(entityManager.createQuery(
            "SELECT c.chartOfAccountCategory.chartOfAccountCategoryId  FROM CoaCoaCategory c  WHERE"
                + " c.chartOfAccount = :chartOfAccount",
            Integer.class))
        .thenReturn(coaQuery);
    when(coaQuery.setParameter(eq("chartOfAccount"), any())).thenReturn(coaQuery);
    when(coaQuery.getResultList()).thenReturn(categoryIds);
    return coaQuery;
  }

  private void mockChartOfAccountCategoryService(List<Integer> categoryIds) {
    for (Integer id : categoryIds) {
      ChartOfAccountCategory category = new ChartOfAccountCategory();
      category.setChartOfAccountCategoryId(id);
      when(chartOfAccountCategoryService.findByPK(id)).thenReturn(category);
    }
  }
}
