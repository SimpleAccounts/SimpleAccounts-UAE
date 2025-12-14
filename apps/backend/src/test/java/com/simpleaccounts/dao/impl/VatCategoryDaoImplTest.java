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
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
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
@DisplayName("VatCategoryDaoImpl Unit Tests")
class VatCategoryDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @Mock
    private TypedQuery<VatCategory> typedQuery;

    @Mock
    private TypedQuery<Long> countQuery;

    @Mock
    private CriteriaBuilder criteriaBuilder;

    @Mock
    private CriteriaQuery<VatCategory> criteriaQuery;

    @Mock
    private Root<VatCategory> root;

    @InjectMocks
    private VatCategoryDaoImpl vatCategoryDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vatCategoryDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(vatCategoryDao, "entityClass", VatCategory.class);
    }

    @Nested
    @DisplayName("getVatCategoryList Tests")
    class GetVatCategoryListTests {

        @Test
        @DisplayName("Should return list of VAT categories")
        void getVatCategoryListReturnsList() {
            // Arrange
            List<VatCategory> expectedList = createVatCategoryList(3);
            when(entityManager.createNamedQuery("allVatCategory", VatCategory.class))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(expectedList);

            // Act
            List<VatCategory> result = vatCategoryDao.getVatCategoryList();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(entityManager).createNamedQuery("allVatCategory", VatCategory.class);
        }

        @Test
        @DisplayName("Should return empty list when no categories exist")
        void getVatCategoryListReturnsEmptyList() {
            // Arrange
            when(entityManager.createNamedQuery("allVatCategory", VatCategory.class))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

            // Act
            List<VatCategory> result = vatCategoryDao.getVatCategoryList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("getVatCategorys Tests")
    class GetVatCategorysTests {

        @Test
        @DisplayName("Should return VAT categories matching name")
        void getVatCategorysReturnsMatchingCategories() {
            // Arrange
            String searchName = "Standard";
            List<VatCategory> expectedList = createVatCategoryList(2);
            when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter("searchToken", searchName)).thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(expectedList);

            // Act
            List<VatCategory> result = vatCategoryDao.getVatCategorys(searchName);

            // Assert
            assertThat(result).isNotNull().hasSize(2);
        }

        @Test
        @DisplayName("Should return empty list when no matching categories")
        void getVatCategorysReturnsEmptyListForNoMatch() {
            // Arrange
            String searchName = "NonExistent";
            when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter("searchToken", searchName)).thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(null);

            // Act
            List<VatCategory> result = vatCategoryDao.getVatCategorys(searchName);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("Should return empty list when result is empty")
        void getVatCategorysReturnsEmptyListForEmptyResult() {
            // Arrange
            String searchName = "Test";
            when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
                .thenReturn(typedQuery);
            when(typedQuery.setParameter("searchToken", searchName)).thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

            // Act
            List<VatCategory> result = vatCategoryDao.getVatCategorys(searchName);

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("getDefaultVatCategory Tests")
    class GetDefaultVatCategoryTests {

        @Test
        @DisplayName("Should return default VAT category")
        void getDefaultVatCategoryReturnsDefault() {
            // Arrange
            VatCategory defaultCategory = createVatCategory(1, "Standard Rate", BigDecimal.valueOf(5));
            defaultCategory.setDefaultFlag('Y');
            when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(Arrays.asList(defaultCategory));

            // Act
            VatCategory result = vatCategoryDao.getDefaultVatCategory();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getDefaultFlag()).isEqualTo('Y');
        }

        @Test
        @DisplayName("Should return null when no default category exists")
        void getDefaultVatCategoryReturnsNullWhenNotFound() {
            // Arrange
            when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(null);

            // Act
            VatCategory result = vatCategoryDao.getDefaultVatCategory();

            // Assert
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should return null when result is empty")
        void getDefaultVatCategoryReturnsNullForEmptyResult() {
            // Arrange
            when(entityManager.createQuery(anyString(), eq(VatCategory.class)))
                .thenReturn(typedQuery);
            when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

            // Act
            VatCategory result = vatCategoryDao.getDefaultVatCategory();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete VAT categories by IDs")
        void deleteByIdsDeletesCategories() {
            // Arrange
            List<Integer> ids = Arrays.asList(1, 2, 3);
            VatCategory category1 = createVatCategory(1, "Cat 1", BigDecimal.valueOf(5));
            VatCategory category2 = createVatCategory(2, "Cat 2", BigDecimal.valueOf(10));
            VatCategory category3 = createVatCategory(3, "Cat 3", BigDecimal.valueOf(15));

            when(entityManager.find(VatCategory.class, 1)).thenReturn(category1);
            when(entityManager.find(VatCategory.class, 2)).thenReturn(category2);
            when(entityManager.find(VatCategory.class, 3)).thenReturn(category3);
            when(entityManager.merge(any(VatCategory.class))).thenAnswer(inv -> inv.getArgument(0));

            // Act
            vatCategoryDao.deleteByIds(ids);

            // Assert
            assertThat(category1.getDeleteFlag()).isTrue();
            assertThat(category2.getDeleteFlag()).isTrue();
            assertThat(category3.getDeleteFlag()).isTrue();
            verify(entityManager, times(3)).merge(any(VatCategory.class));
        }

        @Test
        @DisplayName("Should handle null ID list")
        void deleteByIdsHandlesNullList() {
            // Act
            vatCategoryDao.deleteByIds(null);

            // Assert
            verify(entityManager, never()).find(any(), any());
        }

        @Test
        @DisplayName("Should handle empty ID list")
        void deleteByIdsHandlesEmptyList() {
            // Act
            vatCategoryDao.deleteByIds(new ArrayList<>());

            // Assert
            verify(entityManager, never()).find(any(), any());
        }
    }

    private List<VatCategory> createVatCategoryList(int count) {
        List<VatCategory> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(createVatCategory(i + 1, "Category " + (i + 1), BigDecimal.valueOf(5 * (i + 1))));
        }
        return list;
    }

    private VatCategory createVatCategory(Integer id, String name, BigDecimal vat) {
        VatCategory category = new VatCategory();
        category.setId(id);
        category.setName(name);
        category.setVat(vat);
        category.setVatLabel(name + " (" + vat + "%)");
        category.setDeleteFlag(false);
        category.setDefaultFlag('N');
        return category;
    }
}
