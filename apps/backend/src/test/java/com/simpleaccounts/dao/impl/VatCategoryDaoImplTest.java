package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.VatCategoryFilterEnum;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
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
@DisplayName("VatCategoryDaoImpl Unit Tests")
class VatCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<VatCategory> vatCategoryTypedQuery;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private VatCategoryDaoImpl vatCategoryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vatCategoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(vatCategoryDao, "entityClass", VatCategory.class);
    }

    @Test
    @DisplayName("Should return all VAT categories using named query")
    void getVatCategoryListReturnsAllCategories() {
        // Arrange
        List<VatCategory> categories = createVatCategoryList(5);
        when(entityManager.createNamedQuery("allVatCategory", VatCategory.class))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<VatCategory> result = vatCategoryDao.getVatCategoryList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(categories);
    }

    @Test
    @DisplayName("Should return empty list when no VAT categories exist")
    void getVatCategoryListReturnsEmptyListWhenNone() {
        // Arrange
        when(entityManager.createNamedQuery("allVatCategory", VatCategory.class))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<VatCategory> result = vatCategoryDao.getVatCategoryList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use allVatCategory named query")
    void getVatCategoryListUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allVatCategory", VatCategory.class))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        vatCategoryDao.getVatCategoryList();

        // Assert
        verify(entityManager).createNamedQuery("allVatCategory", VatCategory.class);
    }

    @Test
    @DisplayName("Should return VAT categories by name search")
    void getVatCategorysReturnsCategoriesByName() {
        // Arrange
        String searchName = "Standard";
        List<VatCategory> categories = createVatCategoryList(3);
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.setParameter("searchToken", searchName))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<VatCategory> result = vatCategoryDao.getVatCategorys(searchName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return empty list when no categories match search")
    void getVatCategorysReturnsEmptyListWhenNoMatch() {
        // Arrange
        String searchName = "NonExistent";
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.setParameter("searchToken", searchName))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<VatCategory> result = vatCategoryDao.getVatCategorys(searchName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when search result is null")
    void getVatCategorysReturnsEmptyListWhenNull() {
        // Arrange
        String searchName = "Test";
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.setParameter("searchToken", searchName))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<VatCategory> result = vatCategoryDao.getVatCategorys(searchName);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should set search token parameter correctly")
    void getVatCategorysSetSearchTokenParameter() {
        // Arrange
        String searchName = "VAT";
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.setParameter("searchToken", searchName))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        vatCategoryDao.getVatCategorys(searchName);

        // Assert
        verify(vatCategoryTypedQuery).setParameter("searchToken", searchName);
    }

    @Test
    @DisplayName("Should return default VAT category when exists")
    void getDefaultVatCategoryReturnsDefaultCategory() {
        // Arrange
        VatCategory defaultCategory = createVatCategory(1, "Standard", new BigDecimal("5.00"));
        defaultCategory.setDefaultFlag('Y');
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(defaultCategory));

        // Act
        VatCategory result = vatCategoryDao.getDefaultVatCategory();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getDefaultFlag()).isEqualTo('Y');
    }

    @Test
    @DisplayName("Should return null when no default VAT category exists")
    void getDefaultVatCategoryReturnsNullWhenNotExists() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        VatCategory result = vatCategoryDao.getDefaultVatCategory();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when result list is null for default category")
    void getDefaultVatCategoryReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        VatCategory result = vatCategoryDao.getDefaultVatCategory();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return first category when multiple default categories exist")
    void getDefaultVatCategoryReturnsFirstWhenMultiple() {
        // Arrange
        VatCategory category1 = createVatCategory(1, "Standard", new BigDecimal("5.00"));
        VatCategory category2 = createVatCategory(2, "Reduced", new BigDecimal("2.50"));
        category1.setDefaultFlag('Y');
        category2.setDefaultFlag('Y');

        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(Arrays.asList(category1, category2));

        // Act
        VatCategory result = vatCategoryDao.getDefaultVatCategory();

        // Assert
        assertThat(result).isEqualTo(category1);
    }

    @Test
    @DisplayName("Should soft delete VAT categories by setting delete flag")
    void deleteByIdsSetsDeleteFlagOnCategories() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        VatCategory category1 = createVatCategory(1, "Standard", new BigDecimal("5.00"));
        VatCategory category2 = createVatCategory(2, "Reduced", new BigDecimal("2.50"));
        VatCategory category3 = createVatCategory(3, "Zero", new BigDecimal("0.00"));

        when(entityManager.find(VatCategory.class, 1)).thenReturn(category1);
        when(entityManager.find(VatCategory.class, 2)).thenReturn(category2);
        when(entityManager.find(VatCategory.class, 3)).thenReturn(category3);
        when(entityManager.merge(any(VatCategory.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        vatCategoryDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(3)).merge(any(VatCategory.class));
        assertThat(category1.getDeleteFlag()).isTrue();
        assertThat(category2.getDeleteFlag()).isTrue();
        assertThat(category3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNotDeleteWhenListEmpty() {
        // Arrange
        List<Integer> emptyIds = new ArrayList<>();

        // Act
        vatCategoryDao.deleteByIds(emptyIds);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNotDeleteWhenListNull() {
        // Act
        vatCategoryDao.deleteByIds(null);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should delete single VAT category")
    void deleteByIdsDeletesSingleCategory() {
        // Arrange
        List<Integer> ids = Collections.singletonList(1);
        VatCategory category = createVatCategory(1, "Standard", new BigDecimal("5.00"));

        when(entityManager.find(VatCategory.class, 1)).thenReturn(category);
        when(entityManager.merge(any(VatCategory.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        vatCategoryDao.deleteByIds(ids);

        // Assert
        verify(entityManager).merge(category);
        assertThat(category.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should find and update each category by ID")
    void deleteByIdsFindsAndUpdatesEachCategory() {
        // Arrange
        List<Integer> ids = Arrays.asList(5, 10);
        VatCategory category1 = createVatCategory(5, "Category5", new BigDecimal("5.00"));
        VatCategory category2 = createVatCategory(10, "Category10", new BigDecimal("10.00"));

        when(entityManager.find(VatCategory.class, 5)).thenReturn(category1);
        when(entityManager.find(VatCategory.class, 10)).thenReturn(category2);
        when(entityManager.merge(any(VatCategory.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        vatCategoryDao.deleteByIds(ids);

        // Assert
        verify(entityManager).find(VatCategory.class, 5);
        verify(entityManager).find(VatCategory.class, 10);
        verify(entityManager, times(2)).merge(any(VatCategory.class));
    }

    @Test
    @DisplayName("Should return pagination response model with category list")
    void getVatCategoryListReturnsPaginationResponseModel() {
        // Arrange
        Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "name", "ASC");

        List<VatCategory> categories = createVatCategoryList(5);
        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.VAT_CATEGORY)))
            .thenReturn("name");
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(categories);

        // Act
        PaginationResponseModel result = vatCategoryDao.getVatCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should handle null pagination model gracefully")
    void getVatCategoryListHandlesNullPaginationModel() {
        // Arrange
        Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);

        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = vatCategoryDao.getVatCategoryList(filterMap, null);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should handle pagination model with null sorting column")
    void getVatCategoryListHandlesNullSortingCol() {
        // Arrange
        Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, null, "ASC");

        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = vatCategoryDao.getVatCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(dataTableUtil, never()).getColName(any(), any());
    }

    @Test
    @DisplayName("Should apply filters to category list query")
    void getVatCategoryListAppliesFilters() {
        // Arrange
        Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);
        filterMap.put(VatCategoryFilterEnum.NAME, "Standard");
        PaginationModel paginationModel = createPaginationModel(0, 10, "name", "ASC");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.VAT_CATEGORY)))
            .thenReturn("name");
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        vatCategoryDao.getVatCategoryList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil).getColName(anyString(), eq(DatatableSortingFilterConstant.VAT_CATEGORY));
    }

    @Test
    @DisplayName("Should verify VAT category entity structure")
    void vatCategoryEntityHasCorrectStructure() {
        // Arrange
        VatCategory category = createVatCategory(1, "Standard", new BigDecimal("5.00"));
        category.setDefaultFlag('Y');
        category.setOrderSequence(1);

        // Assert
        assertThat(category.getId()).isEqualTo(1);
        assertThat(category.getName()).isEqualTo("Standard");
        assertThat(category.getVat()).isEqualTo(new BigDecimal("5.00"));
        assertThat(category.getDefaultFlag()).isEqualTo('Y');
        assertThat(category.getOrderSequence()).isEqualTo(1);
        assertThat(category.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should handle large number of IDs for deletion")
    void deleteByIdsHandlesLargeNumberOfIds() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
            when(entityManager.find(VatCategory.class, i))
                .thenReturn(createVatCategory(i, "Category" + i, new BigDecimal(i)));
        }
        when(entityManager.merge(any(VatCategory.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        vatCategoryDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(100)).find(eq(VatCategory.class), any(Integer.class));
        verify(entityManager, times(100)).merge(any(VatCategory.class));
    }

    @Test
    @DisplayName("Should maintain delete flag false for new categories")
    void newCategoryHasDeleteFlagFalse() {
        // Arrange & Act
        VatCategory category = createVatCategory(100, "New Category", new BigDecimal("15.00"));

        // Assert
        assertThat(category.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should return VAT label correctly")
    void getVatLabelReturnsCorrectFormat() {
        // Arrange
        VatCategory category = createVatCategory(1, "Standard", new BigDecimal("5.00"));

        // Act
        String vatLabel = category.getVatLabel();

        // Assert
        assertThat(vatLabel).isEqualTo("Standard(5.00)");
    }

    @Test
    @DisplayName("Should handle categories ordered by default flag and sequence")
    void getVatCategorysOrdersByDefaultFlagAndSequence() {
        // Arrange
        String searchName = "VAT";
        VatCategory category1 = createVatCategory(1, "VAT Standard", new BigDecimal("5.00"));
        category1.setDefaultFlag('Y');
        category1.setOrderSequence(1);

        VatCategory category2 = createVatCategory(2, "VAT Reduced", new BigDecimal("2.50"));
        category2.setDefaultFlag('N');
        category2.setOrderSequence(2);

        List<VatCategory> categories = Arrays.asList(category1, category2);

        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.setParameter("searchToken", searchName))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(categories);

        // Act
        List<VatCategory> result = vatCategoryDao.getVatCategorys(searchName);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDefaultFlag()).isEqualTo('Y');
    }

    @Test
    @DisplayName("Should call named query exactly once for getVatCategoryList")
    void getVatCategoryListCallsNamedQueryOnce() {
        // Arrange
        when(entityManager.createNamedQuery("allVatCategory", VatCategory.class))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        vatCategoryDao.getVatCategoryList();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("allVatCategory", VatCategory.class);
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getVatCategoryListHandlesEmptyFilterMap() {
        // Arrange
        Map<VatCategoryFilterEnum, Object> emptyFilterMap = new EnumMap<>(VatCategoryFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "name", "ASC");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.VAT_CATEGORY)))
            .thenReturn("name");
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = vatCategoryDao.getVatCategoryList(emptyFilterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should set sorting column from pagination model")
    void getVatCategoryListSetsSortingColumn() {
        // Arrange
        Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "2", "ASC");

        when(dataTableUtil.getColName("2", DatatableSortingFilterConstant.VAT_CATEGORY))
            .thenReturn("name");
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        vatCategoryDao.getVatCategoryList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil).getColName("2", DatatableSortingFilterConstant.VAT_CATEGORY);
        assertThat(paginationModel.getSortingCol()).isEqualTo("name");
    }

    @Test
    @DisplayName("Should correctly count total results")
    void getVatCategoryListReturnsCorrectTotalCount() {
        // Arrange
        Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "name", "ASC");
        List<VatCategory> categories = createVatCategoryList(15);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.VAT_CATEGORY)))
            .thenReturn("name");
        when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
            .thenReturn(vatCategoryTypedQuery);
        when(vatCategoryTypedQuery.getResultList())
            .thenReturn(categories);

        // Act
        PaginationResponseModel result = vatCategoryDao.getVatCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRecordsTotal()).isEqualTo(15);
    }

    private List<VatCategory> createVatCategoryList(int count) {
        List<VatCategory> categories = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            categories.add(createVatCategory(i + 1, "Category " + (i + 1), new BigDecimal(i + 1)));
        }
        return categories;
    }

    private VatCategory createVatCategory(int id, String name, BigDecimal vat) {
        VatCategory category = new VatCategory();
        category.setId(id);
        category.setName(name);
        category.setVat(vat);
        category.setDeleteFlag(Boolean.FALSE);
        category.setDefaultFlag('N');
        category.setVersionNumber(1);
        return category;
    }

    private PaginationModel createPaginationModel(int pageNo, int pageSize, String sortingCol, String order) {
        PaginationModel model = new PaginationModel();
        model.setPageNo(pageNo);
        model.setPageSize(pageSize);
        model.setSortingCol(sortingCol);
        model.setOrder(order);
        return model;
    }
}
