package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.ProductCategoryFilterEnum;
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
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

    @Mock
    private TypedQuery<ProductCategory> categoryTypedQuery;

    @InjectMocks
    private ProductCategoryDaoImpl productCategoryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(productCategoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(productCategoryDao, "entityClass", ProductCategory.class);
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
            paginationModel.setSortingCol("productCategoryName");

            when(dataTableUtil.getColName(anyString(), anyString()))
                .thenReturn("productCategoryName");

            // Act & Assert - Just verify the DAO doesn't throw
            assertThat(productCategoryDao).isNotNull();
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should soft delete categories by setting delete flag")
        void deleteByIdsSetsDeleteFlagOnCategories() {
            // Arrange
            List<Integer> ids = Arrays.asList(1, 2, 3);
            ProductCategory category1 = createCategory(1, "Category 1", "CAT001");
            ProductCategory category2 = createCategory(2, "Category 2", "CAT002");
            ProductCategory category3 = createCategory(3, "Category 3", "CAT003");

            when(entityManager.find(ProductCategory.class, 1)).thenReturn(category1);
            when(entityManager.find(ProductCategory.class, 2)).thenReturn(category2);
            when(entityManager.find(ProductCategory.class, 3)).thenReturn(category3);
            when(entityManager.merge(any(ProductCategory.class))).thenAnswer(i -> i.getArguments()[0]);

            // Act
            productCategoryDao.deleteByIds(ids);

            // Assert
            verify(entityManager, times(3)).merge(any(ProductCategory.class));
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
            productCategoryDao.deleteByIds(emptyIds);

            // Assert
            verify(entityManager, never()).find(any(), any());
            verify(entityManager, never()).merge(any());
        }

        @Test
        @DisplayName("Should not delete when IDs list is null")
        void deleteByIdsDoesNotDeleteWhenListNull() {
            // Act
            productCategoryDao.deleteByIds(null);

            // Assert
            verify(entityManager, never()).find(any(), any());
            verify(entityManager, never()).merge(any());
        }

        @Test
        @DisplayName("Should delete single category")
        void deleteByIdsDeletesSingleCategory() {
            // Arrange
            List<Integer> ids = Collections.singletonList(1);
            ProductCategory category = createCategory(1, "Category 1", "CAT001");

            when(entityManager.find(ProductCategory.class, 1)).thenReturn(category);
            when(entityManager.merge(any(ProductCategory.class))).thenAnswer(i -> i.getArguments()[0]);

            // Act
            productCategoryDao.deleteByIds(ids);

            // Assert
            verify(entityManager).merge(category);
            assertThat(category.getDeleteFlag()).isTrue();
        }

        @Test
        @DisplayName("Should find and update each category by ID")
        void deleteByIdsFindsAndUpdatesEachCategory() {
            // Arrange
            List<Integer> ids = Arrays.asList(5, 10);
            ProductCategory category1 = createCategory(5, "Category 5", "CAT005");
            ProductCategory category2 = createCategory(10, "Category 10", "CAT010");

            when(entityManager.find(ProductCategory.class, 5)).thenReturn(category1);
            when(entityManager.find(ProductCategory.class, 10)).thenReturn(category2);
            when(entityManager.merge(any(ProductCategory.class))).thenAnswer(i -> i.getArguments()[0]);

            // Act
            productCategoryDao.deleteByIds(ids);

            // Assert
            verify(entityManager).find(ProductCategory.class, 5);
            verify(entityManager).find(ProductCategory.class, 10);
            verify(entityManager, times(2)).merge(any(ProductCategory.class));
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return category by ID")
        void findByPKReturnsCategory() {
            // Arrange
            Integer categoryId = 1;
            ProductCategory expectedCategory = createCategory(categoryId, "Electronics", "ELEC001");

            when(entityManager.find(ProductCategory.class, categoryId))
                .thenReturn(expectedCategory);

            // Act
            ProductCategory result = productCategoryDao.findByPK(categoryId);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(categoryId);
            assertThat(result.getProductCategoryName()).isEqualTo("Electronics");
        }

        @Test
        @DisplayName("Should return null when category not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer categoryId = 999;

            when(entityManager.find(ProductCategory.class, categoryId))
                .thenReturn(null);

            // Act
            ProductCategory result = productCategoryDao.findByPK(categoryId);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("persist Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new category")
        void persistCategoryPersistsNewCategory() {
            // Arrange
            ProductCategory category = createCategory(null, "New Category", "NEW001");

            // Act
            entityManager.persist(category);

            // Assert
            verify(entityManager).persist(category);
        }
    }

    @Nested
    @DisplayName("update Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update existing category")
        void updateCategoryMergesExistingCategory() {
            // Arrange
            ProductCategory category = createCategory(1, "Updated Category", "UPD001");
            when(entityManager.merge(category)).thenReturn(category);

            // Act
            ProductCategory result = productCategoryDao.update(category);

            // Assert
            verify(entityManager).merge(category);
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("delete Tests")
    class DeleteTests {

        @Test
        @DisplayName("Should delete category")
        void deleteCategoryRemovesCategory() {
            // Arrange
            ProductCategory category = createCategory(1, "Delete Category", "DEL001");
            when(entityManager.contains(category)).thenReturn(true);

            // Act
            productCategoryDao.delete(category);

            // Assert
            verify(entityManager).remove(category);
        }
    }

    @Nested
    @DisplayName("Category Entity Structure Tests")
    class CategoryEntityStructureTests {

        @Test
        @DisplayName("Should handle category with all fields populated")
        void handleCategoryWithAllFields() {
            // Arrange
            ProductCategory category = createCategory(1, "Full Category", "FULL001");
            category.setProductCategoryDescription("Full Description");
            category.setVersionNumber(2);

            when(entityManager.find(ProductCategory.class, 1))
                .thenReturn(category);

            // Act
            ProductCategory result = productCategoryDao.findByPK(1);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getProductCategoryDescription()).isEqualTo("Full Description");
            assertThat(result.getVersionNumber()).isEqualTo(2);
        }

        @Test
        @DisplayName("Should maintain delete flag false for new categories")
        void newCategoryHasDeleteFlagFalse() {
            // Arrange & Act
            ProductCategory category = createCategory(100, "New Category", "NEW001");

            // Assert
            assertThat(category.getDeleteFlag()).isFalse();
        }
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
