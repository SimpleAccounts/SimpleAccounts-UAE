package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
import com.simpleaccounts.dao.ProductCategoryDao;
import com.simpleaccounts.entity.ProductCategory;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProductCategoryServiceImpl Unit Tests")
class ProductCategoryServiceImplTest {

    @Mock
    private ProductCategoryDao productCategoryDao;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private ProductCategoryServiceImpl productCategoryService;

    @Nested
    @DisplayName("findAllProductCategoryByUserId Tests")
    class FindAllProductCategoryByUserIdTests {

        @Test
        @DisplayName("Should return categories for user when not deleted")
        void findAllProductCategoryByUserIdReturnsCategories() {
            // Arrange
            Integer userId = 1;
            List<ProductCategory> expectedCategories = createCategoryList(3);

            when(productCategoryDao.executeQuery(any()))
                .thenReturn(expectedCategories);

            // Act
            List<ProductCategory> result = productCategoryService.findAllProductCategoryByUserId(userId, false);

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(productCategoryDao).executeQuery(any());
        }

        @Test
        @DisplayName("Should return deleted categories when isDeleted is true")
        void findAllProductCategoryByUserIdReturnsDeletedCategories() {
            // Arrange
            Integer userId = 1;
            List<ProductCategory> deletedCategories = createCategoryList(2);
            deletedCategories.forEach(c -> c.setDeleteFlag(true));

            when(productCategoryDao.executeQuery(any()))
                .thenReturn(deletedCategories);

            // Act
            List<ProductCategory> result = productCategoryService.findAllProductCategoryByUserId(userId, true);

            // Assert
            assertThat(result).isNotNull().hasSize(2);
        }

        @Test
        @DisplayName("Should return empty list when no categories exist")
        void findAllProductCategoryByUserIdReturnsEmptyList() {
            // Arrange
            Integer userId = 1;

            when(productCategoryDao.executeQuery(any()))
                .thenReturn(new ArrayList<>());

            // Act
            List<ProductCategory> result = productCategoryService.findAllProductCategoryByUserId(userId, false);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("getProductCategoryList Tests")
    class GetProductCategoryListTests {

        @Test
        @DisplayName("Should return paginated category list")
        void getProductCategoryListReturnsPaginatedResults() {
            // Arrange
            Map<ProductCategoryFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(ProductCategoryFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            List<ProductCategory> categories = createCategoryList(5);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(5, categories);

            when(productCategoryDao.getProductCategoryList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = productCategoryService.getProductCategoryList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(5);
            assertThat(result.getData()).hasSize(5);
            verify(productCategoryDao).getProductCategoryList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should return empty results when no categories match filter")
        void getProductCategoryListReturnsEmptyResults() {
            // Arrange
            Map<ProductCategoryFilterEnum, Object> filterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();
            PaginationResponseModel expectedResponse = new PaginationResponseModel(0, new ArrayList<>());

            when(productCategoryDao.getProductCategoryList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = productCategoryService.getProductCategoryList(filterMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isZero();
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return category by ID with caching")
        void findByPKReturnsCategory() {
            // Arrange
            Integer categoryId = 1;
            ProductCategory expectedCategory = createCategory(categoryId, "Electronics", "ELEC001");

            when(productCategoryDao.findByPK(categoryId))
                .thenReturn(expectedCategory);

            // Act
            ProductCategory result = productCategoryService.findByPK(categoryId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(categoryId);
            assertThat(result.getProductCategoryName()).isEqualTo("Electronics");
            verify(productCategoryDao).findByPK(categoryId);
        }

        @Test
        @DisplayName("Should return null when category not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer categoryId = 999;

            when(productCategoryDao.findByPK(categoryId))
                .thenReturn(null);

            // Act
            ProductCategory result = productCategoryService.findByPK(categoryId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @BeforeEach
        void setUp() {
            when(cacheManager.getCache("productCategoryCache")).thenReturn(cache);
        }

        @Test
        @DisplayName("Should update category and evict from cache")
        void updateCategoryEvictsFromCache() {
            // Arrange
            ProductCategory category = createCategory(1, "Updated Category", "UPD001");

            when(productCategoryDao.update(category)).thenReturn(category);

            // Act
            ProductCategory result = productCategoryService.update(category);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductCategoryName()).isEqualTo("Updated Category");
            verify(cache).evict(1);
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @BeforeEach
        void setUp() {
            when(cacheManager.getCache("productCategoryCache")).thenReturn(cache);
        }

        @Test
        @DisplayName("Should delete categories by IDs and evict from cache")
        void deleteByIdsEvictsFromCache() {
            // Arrange
            ArrayList<Integer> ids = new ArrayList<>(Arrays.asList(1, 2, 3));

            // Act
            productCategoryService.deleteByIds(ids);

            // Assert
            verify(productCategoryDao).deleteByIds(ids);
            verify(cache, times(3)).evict(anyInt());
        }

        @Test
        @DisplayName("Should handle single ID deletion")
        void deleteByIdsSingleId() {
            // Arrange
            ArrayList<Integer> ids = new ArrayList<>(Collections.singletonList(1));

            // Act
            productCategoryService.deleteByIds(ids);

            // Assert
            verify(productCategoryDao).deleteByIds(ids);
            verify(cache).evict(1);
        }

        @Test
        @DisplayName("Should handle empty ID list")
        void deleteByIdsEmptyList() {
            // Arrange
            ArrayList<Integer> ids = new ArrayList<>();

            // Act
            productCategoryService.deleteByIds(ids);

            // Assert
            verify(productCategoryDao).deleteByIds(ids);
            verify(cache, never()).evict(anyInt());
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new category with activity")
        void persistCategorySavesWithActivity() {
            // Arrange
            ProductCategory category = createCategory(null, "New Category", "NEW001");

            // Act
            productCategoryService.persist(category);

            // Assert
            verify(productCategoryDao).persist(category);
        }
    }

    private List<ProductCategory> createCategoryList(int count) {
        List<ProductCategory> categories = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            categories.add(createCategory(i, "Category " + i, "CAT00" + i));
        }
        return categories;
    }

    private ProductCategory createCategory(Integer id, String name, String code) {
        ProductCategory category = new ProductCategory();
        category.setId(id);
        category.setProductCategoryName(name);
        category.setProductCategoryCode(code);
        category.setProductCategoryDescription("Description for " + name);
        category.setDeleteFlag(false);
        category.setCreatedBy(1);
        category.setCreatedDate(LocalDateTime.now());
        category.setVersionNumber(1);
        return category;
    }
}
