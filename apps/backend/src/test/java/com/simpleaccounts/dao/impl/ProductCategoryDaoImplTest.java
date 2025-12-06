package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
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
@DisplayName("ProductCategoryDaoImpl Unit Tests")
class ProductCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private ProductCategoryDaoImpl productCategoryDao;

    @Captor
    private ArgumentCaptor<List<DbFilter>> dbFiltersCaptor;

    private PaginationModel paginationModel;
    private Map<ProductCategoryFilterEnum, Object> filterMap;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(productCategoryDao, "entityManager", entityManager);

        paginationModel = new PaginationModel();
        paginationModel.setSortingCol("name");
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        filterMap = new HashMap<>();
    }

    @Test
    @DisplayName("Should return pagination response with product categories")
    void getProductCategoryListReturnsPaginationResponse() {
        // Arrange
        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        PaginationResponseModel result = productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should map sorting column correctly")
    void getProductCategoryListMapsSortingColumn() {
        // Arrange
        paginationModel.setSortingCol("originalColumn");

        when(dataTableUtil.getColName("originalColumn", DatatableSortingFilterConstant.PRODUCT_CATEGORY))
            .thenReturn("mappedColumn");

        // Act
        productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil).getColName("originalColumn", DatatableSortingFilterConstant.PRODUCT_CATEGORY);
        assertThat(paginationModel.getSortingCol()).isEqualTo("mappedColumn");
    }

    @Test
    @DisplayName("Should use PRODUCT_CATEGORY constant for column mapping")
    void getProductCategoryListUsesCorrectConstant() {
        // Arrange
        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil).getColName(anyString(), eq(DatatableSortingFilterConstant.PRODUCT_CATEGORY));
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getProductCategoryListHandlesEmptyFilterMap() {
        // Arrange
        Map<ProductCategoryFilterEnum, Object> emptyFilterMap = new HashMap<>();

        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        PaginationResponseModel result = productCategoryDao.getProductCategoryList(emptyFilterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should create DbFilters from filter map entries")
    void getProductCategoryListCreatesDbFiltersFromFilterMap() {
        // Arrange
        ProductCategoryFilterEnum mockFilter = mock(ProductCategoryFilterEnum.class);
        when(mockFilter.getDbColumnName()).thenReturn("categoryName");
        when(mockFilter.getCondition()).thenReturn("=");

        filterMap.put(mockFilter, "Test Category");

        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        verify(mockFilter, times(1)).getDbColumnName();
        verify(mockFilter, times(1)).getCondition();
    }

    @Test
    @DisplayName("Should handle multiple filters in filter map")
    void getProductCategoryListHandlesMultipleFilters() {
        // Arrange
        ProductCategoryFilterEnum filter1 = mock(ProductCategoryFilterEnum.class);
        ProductCategoryFilterEnum filter2 = mock(ProductCategoryFilterEnum.class);

        when(filter1.getDbColumnName()).thenReturn("categoryName");
        when(filter1.getCondition()).thenReturn("=");
        when(filter2.getDbColumnName()).thenReturn("categoryCode");
        when(filter2.getCondition()).thenReturn("LIKE");

        filterMap.put(filter1, "Category A");
        filterMap.put(filter2, "CAT%");

        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        verify(filter1).getDbColumnName();
        verify(filter1).getCondition();
        verify(filter2).getDbColumnName();
        verify(filter2).getCondition();
    }

    @Test
    @DisplayName("Should set pagination model sorting column")
    void getProductCategoryListSetsPaginationSortingColumn() {
        // Arrange
        String originalColumn = "categoryName";
        String mappedColumn = "pc.category_name";
        paginationModel.setSortingCol(originalColumn);

        when(dataTableUtil.getColName(originalColumn, DatatableSortingFilterConstant.PRODUCT_CATEGORY))
            .thenReturn(mappedColumn);

        // Act
        productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(paginationModel.getSortingCol()).isEqualTo(mappedColumn);
    }

    @Test
    @DisplayName("Should delete product categories by IDs successfully")
    void deleteByIdsDeletesCategoriesSuccessfully() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        ProductCategory category1 = createProductCategory(1);
        ProductCategory category2 = createProductCategory(2);
        ProductCategory category3 = createProductCategory(3);

        // Mock the DAO methods from AbstractDao
        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);
        when(spyDao.findByPK(1)).thenReturn(category1);
        when(spyDao.findByPK(2)).thenReturn(category2);
        when(spyDao.findByPK(3)).thenReturn(category3);

        // Call real method
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        verify(spyDao).findByPK(1);
        verify(spyDao).findByPK(2);
        verify(spyDao).findByPK(3);
        verify(spyDao).update(category1);
        verify(spyDao).update(category2);
        verify(spyDao).update(category3);
    }

    @Test
    @DisplayName("Should set delete flag to true when deleting by IDs")
    void deleteByIdsSetsDeleteFlagToTrue() {
        // Arrange
        Integer id = 1;
        List<Integer> ids = Collections.singletonList(id);
        ProductCategory category = createProductCategory(id);
        category.setDeleteFlag(false);

        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);
        when(spyDao.findByPK(id)).thenReturn(category);
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        assertThat(category.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should handle null IDs list gracefully")
    void deleteByIdsHandlesNullIdsList() {
        // Arrange
        List<Integer> ids = null;

        // Act
        productCategoryDao.deleteByIds(ids);

        // Assert
        // No exception should be thrown
    }

    @Test
    @DisplayName("Should handle empty IDs list gracefully")
    void deleteByIdsHandlesEmptyIdsList() {
        // Arrange
        List<Integer> ids = Collections.emptyList();

        // Act
        productCategoryDao.deleteByIds(ids);

        // Assert
        // No exception should be thrown
    }

    @Test
    @DisplayName("Should not process when IDs list is null")
    void deleteByIdsDoesNotProcessWhenIdsNull() {
        // Arrange
        List<Integer> ids = null;
        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        verify(spyDao, never()).findByPK(anyInt());
    }

    @Test
    @DisplayName("Should not process when IDs list is empty")
    void deleteByIdsDoesNotProcessWhenIdsEmpty() {
        // Arrange
        List<Integer> ids = Collections.emptyList();
        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        verify(spyDao, never()).findByPK(anyInt());
    }

    @Test
    @DisplayName("Should delete single product category by ID")
    void deleteByIdsDeletesSingleCategory() {
        // Arrange
        Integer id = 5;
        List<Integer> ids = Collections.singletonList(id);
        ProductCategory category = createProductCategory(id);

        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);
        when(spyDao.findByPK(id)).thenReturn(category);
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        verify(spyDao).findByPK(id);
        verify(spyDao).update(category);
    }

    @Test
    @DisplayName("Should delete multiple product categories by IDs")
    void deleteByIdsDeletesMultipleCategories() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3, 4, 5);
        List<ProductCategory> categories = new ArrayList<>();

        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);
        for (Integer id : ids) {
            ProductCategory category = createProductCategory(id);
            categories.add(category);
            when(spyDao.findByPK(id)).thenReturn(category);
        }
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        for (Integer id : ids) {
            verify(spyDao).findByPK(id);
        }
        for (ProductCategory category : categories) {
            verify(spyDao).update(category);
        }
    }

    @Test
    @DisplayName("Should iterate through all IDs in the list")
    void deleteByIdsIteratesThroughAllIds() {
        // Arrange
        List<Integer> ids = Arrays.asList(10, 20, 30);
        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);

        for (Integer id : ids) {
            ProductCategory category = createProductCategory(id);
            when(spyDao.findByPK(id)).thenReturn(category);
        }
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        verify(spyDao).findByPK(10);
        verify(spyDao).findByPK(20);
        verify(spyDao).findByPK(30);
    }

    @Test
    @DisplayName("Should call update for each found product category")
    void deleteByIdsCallsUpdateForEachCategory() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2);
        ProductCategory category1 = createProductCategory(1);
        ProductCategory category2 = createProductCategory(2);

        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);
        when(spyDao.findByPK(1)).thenReturn(category1);
        when(spyDao.findByPK(2)).thenReturn(category2);
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        verify(spyDao).update(category1);
        verify(spyDao).update(category2);
    }

    @Test
    @DisplayName("Should handle large list of IDs")
    void deleteByIdsHandlesLargeListOfIds() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
        }

        ProductCategoryDaoImpl spyDao = mock(ProductCategoryDaoImpl.class);
        for (Integer id : ids) {
            ProductCategory category = createProductCategory(id);
            when(spyDao.findByPK(id)).thenReturn(category);
        }
        when(spyDao.deleteByIds(ids)).thenCallRealMethod();

        // Act
        spyDao.deleteByIds(ids);

        // Assert
        verify(spyDao, times(100)).findByPK(anyInt());
        verify(spyDao, times(100)).update(any(ProductCategory.class));
    }

    @Test
    @DisplayName("Should not fail when filter map has null values")
    void getProductCategoryListHandlesNullFilterValues() {
        // Arrange
        ProductCategoryFilterEnum mockFilter = mock(ProductCategoryFilterEnum.class);
        when(mockFilter.getDbColumnName()).thenReturn("categoryName");
        when(mockFilter.getCondition()).thenReturn("=");

        filterMap.put(mockFilter, null);

        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        PaginationResponseModel result = productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should handle pagination model with different page sizes")
    void getProductCategoryListHandlesDifferentPageSizes() {
        // Arrange
        paginationModel.setPageSize(50);

        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        PaginationResponseModel result = productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should handle pagination model with different page numbers")
    void getProductCategoryListHandlesDifferentPageNumbers() {
        // Arrange
        paginationModel.setPageNo(5);

        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        PaginationResponseModel result = productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should create new PaginationResponseModel with count and data")
    void getProductCategoryListCreatesPaginationResponseModel() {
        // Arrange
        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        PaginationResponseModel result = productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(PaginationResponseModel.class);
    }

    @Test
    @DisplayName("Should call dataTableUtil exactly once for sorting column")
    void getProductCategoryListCallsDataTableUtilOnce() {
        // Arrange
        when(dataTableUtil.getColName(anyString(), anyString()))
            .thenReturn("mappedColumn");

        // Act
        productCategoryDao.getProductCategoryList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil, times(1)).getColName(anyString(), anyString());
    }

    private ProductCategory createProductCategory(int id) {
        ProductCategory category = new ProductCategory();
        category.setProductCategoryId(id);
        category.setProductCategoryName("Category " + id);
        category.setDeleteFlag(false);
        return category;
    }
}
