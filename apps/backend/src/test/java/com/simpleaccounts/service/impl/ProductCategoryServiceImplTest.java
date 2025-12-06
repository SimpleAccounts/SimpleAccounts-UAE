package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
import com.simpleaccounts.dao.ProductCategoryDao;
import com.simpleaccounts.entity.ProductCategory;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@ExtendWith(MockitoExtension.class)
class ProductCategoryServiceImplTest {

    @Mock
    private ProductCategoryDao productCategoryDao;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache productCategoryCache;

    @InjectMocks
    private ProductCategoryServiceImpl productCategoryService;

    private ProductCategory testProductCategory;
    private PaginationModel testPaginationModel;

    @BeforeEach
    void setUp() {
        testProductCategory = new ProductCategory();
        testProductCategory.setId(1);
        testProductCategory.setProductCategoryCode("CAT-001");
        testProductCategory.setProductCategoryName("Electronics");
        testProductCategory.setDescription("Electronic items");
        testProductCategory.setCreatedBy(1);
        testProductCategory.setCreatedDate(LocalDateTime.now());
        testProductCategory.setDeleteFlag(false);

        testPaginationModel = new PaginationModel();
        testPaginationModel.setPageNumber(1);
        testPaginationModel.setPageSize(10);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnProductCategoryDaoWhenGetDaoCalled() {
        assertThat(productCategoryService.getDao()).isEqualTo(productCategoryDao);
    }

    @Test
    void shouldReturnNonNullDao() {
        assertThat(productCategoryService.getDao()).isNotNull();
    }

    // ========== findAllProductCategoryByUserId Tests ==========

    @Test
    void shouldReturnProductCategoriesForUserIdWhenNotDeleted() {
        Integer userId = 1;
        boolean isDeleted = false;

        List<ProductCategory> expectedList = Arrays.asList(testProductCategory);
        when(productCategoryDao.executeQuery(anyList())).thenReturn(expectedList);

        List<ProductCategory> result = productCategoryService.findAllProductCategoryByUserId(userId, isDeleted);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testProductCategory);

        ArgumentCaptor<List<DbFilter>> filterCaptor = ArgumentCaptor.forClass(List.class);
        verify(productCategoryDao, times(1)).executeQuery(filterCaptor.capture());

        List<DbFilter> capturedFilters = filterCaptor.getValue();
        assertThat(capturedFilters).hasSize(2);
    }

    @Test
    void shouldReturnProductCategoriesForUserIdWhenDeleted() {
        Integer userId = 1;
        boolean isDeleted = true;

        List<ProductCategory> expectedList = new ArrayList<>();
        when(productCategoryDao.executeQuery(anyList())).thenReturn(expectedList);

        List<ProductCategory> result = productCategoryService.findAllProductCategoryByUserId(userId, isDeleted);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productCategoryDao, times(1)).executeQuery(anyList());
    }

    @Test
    void shouldReturnEmptyListWhenNoMatchingCategories() {
        Integer userId = 999;
        boolean isDeleted = false;

        when(productCategoryDao.executeQuery(anyList())).thenReturn(Collections.emptyList());

        List<ProductCategory> result = productCategoryService.findAllProductCategoryByUserId(userId, isDeleted);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productCategoryDao, times(1)).executeQuery(anyList());
    }

    @Test
    void shouldReturnMultipleCategoriesForUserId() {
        ProductCategory category2 = new ProductCategory();
        category2.setId(2);
        category2.setProductCategoryCode("CAT-002");
        category2.setProductCategoryName("Furniture");

        ProductCategory category3 = new ProductCategory();
        category3.setId(3);
        category3.setProductCategoryCode("CAT-003");
        category3.setProductCategoryName("Clothing");

        List<ProductCategory> expectedList = Arrays.asList(testProductCategory, category2, category3);
        when(productCategoryDao.executeQuery(anyList())).thenReturn(expectedList);

        List<ProductCategory> result = productCategoryService.findAllProductCategoryByUserId(1, false);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testProductCategory, category2, category3);
        verify(productCategoryDao, times(1)).executeQuery(anyList());
    }

    @Test
    void shouldHandleNullUserId() {
        Integer userId = null;
        boolean isDeleted = false;

        when(productCategoryDao.executeQuery(anyList())).thenReturn(Collections.emptyList());

        List<ProductCategory> result = productCategoryService.findAllProductCategoryByUserId(userId, isDeleted);

        assertThat(result).isNotNull();
        verify(productCategoryDao, times(1)).executeQuery(anyList());
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistProductCategorySuccessfully() {
        productCategoryService.persist(testProductCategory);

        verify(productCategoryDao, times(1)).persist(testProductCategory);
    }

    @Test
    void shouldPersistProductCategoryWithActivity() {
        ProductCategory newCategory = new ProductCategory();
        newCategory.setProductCategoryCode("CAT-NEW");
        newCategory.setProductCategoryName("New Category");

        productCategoryService.persist(newCategory);

        verify(productCategoryDao, times(1)).persist(newCategory);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateProductCategorySuccessfully() {
        when(productCategoryDao.update(testProductCategory)).thenReturn(testProductCategory);
        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        ProductCategory result = productCategoryService.update(testProductCategory);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testProductCategory);
        verify(productCategoryDao, times(1)).update(testProductCategory);
        verify(cacheManager, times(1)).getCache("productCategoryCache");
        verify(productCategoryCache, times(1)).evict(1);
    }

    @Test
    void shouldUpdateProductCategoryAndEvictCache() {
        testProductCategory.setProductCategoryName("Updated Electronics");
        when(productCategoryDao.update(testProductCategory)).thenReturn(testProductCategory);
        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        ProductCategory result = productCategoryService.update(testProductCategory);

        assertThat(result).isNotNull();
        assertThat(result.getProductCategoryName()).isEqualTo("Updated Electronics");
        verify(productCategoryCache, times(1)).evict(1);
        verify(productCategoryDao, times(1)).update(testProductCategory);
    }

    @Test
    void shouldHandleUpdateWithNullCache() {
        when(productCategoryDao.update(testProductCategory)).thenReturn(testProductCategory);
        when(cacheManager.getCache("productCategoryCache")).thenReturn(null);

        assertThatThrownBy(() -> productCategoryService.update(testProductCategory))
                .isInstanceOf(NullPointerException.class);

        verify(productCategoryDao, times(1)).update(testProductCategory);
    }

    // ========== deleteByIds Tests ==========

    @Test
    void shouldDeleteSingleCategoryById() {
        ArrayList<Integer> ids = new ArrayList<>(Collections.singletonList(1));
        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        productCategoryService.deleteByIds(ids);

        verify(productCategoryDao, times(1)).deleteByIds(ids);
        verify(productCategoryCache, times(1)).evict(1);
    }

    @Test
    void shouldDeleteMultipleCategoriesByIds() {
        ArrayList<Integer> ids = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        productCategoryService.deleteByIds(ids);

        verify(productCategoryDao, times(1)).deleteByIds(ids);
        verify(productCategoryCache, times(5)).evict(any(Integer.class));
    }

    @Test
    void shouldHandleEmptyIdsList() {
        ArrayList<Integer> ids = new ArrayList<>();
        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        productCategoryService.deleteByIds(ids);

        verify(productCategoryDao, times(1)).deleteByIds(ids);
        verify(productCategoryCache, never()).evict(any());
    }

    @Test
    void shouldDeleteByIdsAndEvictAllFromCache() {
        ArrayList<Integer> ids = new ArrayList<>(Arrays.asList(10, 20, 30));
        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        productCategoryService.deleteByIds(ids);

        ArgumentCaptor<Integer> idCaptor = ArgumentCaptor.forClass(Integer.class);
        verify(productCategoryCache, times(3)).evict(idCaptor.capture());

        List<Integer> evictedIds = idCaptor.getAllValues();
        assertThat(evictedIds).containsExactly(10, 20, 30);
        verify(productCategoryDao, times(1)).deleteByIds(ids);
    }

    // ========== getProductCategoryList Tests ==========

    @Test
    void shouldReturnProductCategoryListWithFilters() {
        Map<ProductCategoryFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ProductCategoryFilterEnum.DELETE_FLAG, false);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(1L);
        expectedResponse.setData(Arrays.asList(testProductCategory));

        when(productCategoryDao.getProductCategoryList(filterMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = productCategoryService.getProductCategoryList(
                filterMap, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(1L);
        assertThat(result.getData()).hasSize(1);
        verify(productCategoryDao, times(1)).getProductCategoryList(filterMap, testPaginationModel);
    }

    @Test
    void shouldReturnEmptyListWhenNoMatchingFilters() {
        Map<ProductCategoryFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ProductCategoryFilterEnum.PRODUCT_CATEGORY_NAME, "NonExistent");

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(0L);
        expectedResponse.setData(Collections.emptyList());

        when(productCategoryDao.getProductCategoryList(filterMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = productCategoryService.getProductCategoryList(
                filterMap, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(0L);
        assertThat(result.getData()).isEmpty();
        verify(productCategoryDao, times(1)).getProductCategoryList(filterMap, testPaginationModel);
    }

    @Test
    void shouldHandleNullFilterMap() {
        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(1L);
        expectedResponse.setData(Arrays.asList(testProductCategory));

        when(productCategoryDao.getProductCategoryList(null, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = productCategoryService.getProductCategoryList(
                null, testPaginationModel);

        assertThat(result).isNotNull();
        verify(productCategoryDao, times(1)).getProductCategoryList(null, testPaginationModel);
    }

    @Test
    void shouldHandlePaginationCorrectly() {
        Map<ProductCategoryFilterEnum, Object> filterMap = new HashMap<>();
        testPaginationModel.setPageNumber(2);
        testPaginationModel.setPageSize(20);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(50L);
        expectedResponse.setData(Arrays.asList(testProductCategory));

        when(productCategoryDao.getProductCategoryList(filterMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = productCategoryService.getProductCategoryList(
                filterMap, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(50L);
        verify(productCategoryDao, times(1)).getProductCategoryList(filterMap, testPaginationModel);
    }

    // ========== findByPK (Cacheable) Tests ==========

    @Test
    void shouldFindProductCategoryByPrimaryKey() {
        when(productCategoryDao.findByPK(1)).thenReturn(testProductCategory);

        ProductCategory result = productCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testProductCategory);
        assertThat(result.getId()).isEqualTo(1);
        assertThat(result.getProductCategoryName()).isEqualTo("Electronics");
        verify(productCategoryDao, times(1)).findByPK(1);
    }

    @Test
    void shouldReturnNullWhenCategoryNotFoundByPK() {
        when(productCategoryDao.findByPK(999)).thenReturn(null);

        ProductCategory result = productCategoryService.findByPK(999);

        assertThat(result).isNull();
        verify(productCategoryDao, times(1)).findByPK(999);
    }

    @Test
    void shouldCacheFindByPKResult() {
        when(productCategoryDao.findByPK(1)).thenReturn(testProductCategory);

        ProductCategory result = productCategoryService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1);
        verify(productCategoryDao, times(1)).findByPK(1);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldDeleteProductCategory() {
        productCategoryService.delete(testProductCategory);

        verify(productCategoryDao, times(1)).delete(testProductCategory);
    }

    @Test
    void shouldFindProductCategoriesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("productCategoryCode", "CAT-001");
        attributes.put("deleteFlag", false);

        List<ProductCategory> expectedList = Arrays.asList(testProductCategory);
        when(productCategoryDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<ProductCategory> result = productCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testProductCategory);
        verify(productCategoryDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("productCategoryCode", "NONEXISTENT");

        when(productCategoryDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<ProductCategory> result = productCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productCategoryDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<ProductCategory> result = productCategoryService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productCategoryDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<ProductCategory> result = productCategoryService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(productCategoryDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleCategoryWithMinimalData() {
        ProductCategory minimalCategory = new ProductCategory();
        minimalCategory.setId(99);

        when(productCategoryDao.findByPK(99)).thenReturn(minimalCategory);

        ProductCategory result = productCategoryService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99);
        assertThat(result.getProductCategoryName()).isNull();
        verify(productCategoryDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleLargeNumberOfIdsForDeletion() {
        ArrayList<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
        }

        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        productCategoryService.deleteByIds(ids);

        verify(productCategoryDao, times(1)).deleteByIds(ids);
        verify(productCategoryCache, times(100)).evict(any(Integer.class));
    }

    @Test
    void shouldHandleSequentialUpdateOperations() {
        testProductCategory.setProductCategoryName("Electronics V1");
        when(productCategoryDao.update(any(ProductCategory.class))).thenReturn(testProductCategory);
        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        productCategoryService.update(testProductCategory);

        testProductCategory.setProductCategoryName("Electronics V2");
        productCategoryService.update(testProductCategory);

        verify(productCategoryDao, times(2)).update(testProductCategory);
        verify(productCategoryCache, times(2)).evict(1);
    }

    @Test
    void shouldHandleMultipleFiltersInProductCategoryList() {
        Map<ProductCategoryFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ProductCategoryFilterEnum.PRODUCT_CATEGORY_CODE, "CAT-001");
        filterMap.put(ProductCategoryFilterEnum.PRODUCT_CATEGORY_NAME, "Electronics");
        filterMap.put(ProductCategoryFilterEnum.DELETE_FLAG, false);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(1L);
        expectedResponse.setData(Arrays.asList(testProductCategory));

        when(productCategoryDao.getProductCategoryList(filterMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = productCategoryService.getProductCategoryList(
                filterMap, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(1L);
        verify(productCategoryDao, times(1)).getProductCategoryList(filterMap, testPaginationModel);
    }

    @Test
    void shouldVerifyDaoInteractionForFindAllByUserId() {
        when(productCategoryDao.executeQuery(anyList())).thenReturn(Arrays.asList(testProductCategory));

        productCategoryService.findAllProductCategoryByUserId(1, false);
        productCategoryService.findAllProductCategoryByUserId(1, false);

        verify(productCategoryDao, times(2)).executeQuery(anyList());
    }

    @Test
    void shouldPersistAndFindProductCategory() {
        when(productCategoryDao.findByPK(1)).thenReturn(testProductCategory);

        productCategoryService.persist(testProductCategory);
        ProductCategory found = productCategoryService.findByPK(1);

        assertThat(found).isNotNull();
        assertThat(found).isEqualTo(testProductCategory);
        verify(productCategoryDao, times(1)).persist(testProductCategory);
        verify(productCategoryDao, times(1)).findByPK(1);
    }

    @Test
    void shouldHandleCategoryWithLongDescription() {
        String longDescription = "A".repeat(1000);
        testProductCategory.setDescription(longDescription);

        when(productCategoryDao.update(testProductCategory)).thenReturn(testProductCategory);
        when(cacheManager.getCache("productCategoryCache")).thenReturn(productCategoryCache);

        ProductCategory result = productCategoryService.update(testProductCategory);

        assertThat(result).isNotNull();
        assertThat(result.getDescription()).hasSize(1000);
        verify(productCategoryDao, times(1)).update(testProductCategory);
    }

    @Test
    void shouldHandleZeroPageNumberInPagination() {
        Map<ProductCategoryFilterEnum, Object> filterMap = new HashMap<>();
        testPaginationModel.setPageNumber(0);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(0L);
        expectedResponse.setData(Collections.emptyList());

        when(productCategoryDao.getProductCategoryList(filterMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = productCategoryService.getProductCategoryList(
                filterMap, testPaginationModel);

        assertThat(result).isNotNull();
        verify(productCategoryDao, times(1)).getProductCategoryList(filterMap, testPaginationModel);
    }
}
