package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.VatCategoryFilterEnum;
import com.simpleaccounts.dao.VatCategoryDao;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
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
@DisplayName("VatCategoryServiceImpl Unit Tests")
class VatCategoryServiceImplTest {

    @Mock
    private VatCategoryDao vatCategoryDao;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private VatCategoryServiceImpl vatCategoryService;

    @Nested
    @DisplayName("getVatCategoryList Tests")
    class GetVatCategoryListTests {

        @Test
        @DisplayName("Should return VAT category list")
        void getVatCategoryListReturnsList() {
            // Arrange
            List<VatCategory> expectedList = createVatCategoryList(3);
            when(vatCategoryDao.getVatCategoryList()).thenReturn(expectedList);

            // Act
            List<VatCategory> result = vatCategoryService.getVatCategoryList();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(vatCategoryDao).getVatCategoryList();
        }

        @Test
        @DisplayName("Should return empty list when no VAT categories exist")
        void getVatCategoryListReturnsEmptyList() {
            // Arrange
            when(vatCategoryDao.getVatCategoryList()).thenReturn(new ArrayList<>());

            // Act
            List<VatCategory> result = vatCategoryService.getVatCategoryList();

            // Assert
            assertThat(result).isNotNull().isEmpty();
        }
    }

    @Nested
    @DisplayName("getVatCategorys Tests")
    class GetVatCategorysTests {

        @Test
        @DisplayName("Should return VAT categories by name")
        void getVatCategorysReturnsMatchingCategories() {
            // Arrange
            String searchName = "Standard";
            List<VatCategory> expectedList = createVatCategoryList(2);
            when(vatCategoryDao.getVatCategorys(searchName)).thenReturn(expectedList);

            // Act
            List<VatCategory> result = vatCategoryService.getVatCategorys(searchName);

            // Assert
            assertThat(result).isNotNull().hasSize(2);
            verify(vatCategoryDao).getVatCategorys(searchName);
        }

        @Test
        @DisplayName("Should return empty list when no matching categories")
        void getVatCategorysReturnsEmptyForNoMatch() {
            // Arrange
            String searchName = "NonExistent";
            when(vatCategoryDao.getVatCategorys(searchName)).thenReturn(new ArrayList<>());

            // Act
            List<VatCategory> result = vatCategoryService.getVatCategorys(searchName);

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
            VatCategory expectedCategory = createVatCategory(1, "Standard Rate", BigDecimal.valueOf(5));
            when(vatCategoryDao.getDefaultVatCategory()).thenReturn(expectedCategory);

            // Act
            VatCategory result = vatCategoryService.getDefaultVatCategory();

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Standard Rate");
            verify(vatCategoryDao).getDefaultVatCategory();
        }

        @Test
        @DisplayName("Should return null when no default category exists")
        void getDefaultVatCategoryReturnsNullWhenNotFound() {
            // Arrange
            when(vatCategoryDao.getDefaultVatCategory()).thenReturn(null);

            // Act
            VatCategory result = vatCategoryService.getDefaultVatCategory();

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("findByPK Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should return VAT category by ID")
        void findByPKReturnsCategory() {
            // Arrange
            Integer id = 1;
            VatCategory expectedCategory = createVatCategory(id, "Standard Rate", BigDecimal.valueOf(5));
            when(vatCategoryDao.findByPK(id)).thenReturn(expectedCategory);

            // Act
            VatCategory result = vatCategoryService.findByPK(id);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(id);
            verify(vatCategoryDao).findByPK(id);
        }

        @Test
        @DisplayName("Should return null when category not found")
        void findByPKReturnsNullWhenNotFound() {
            // Arrange
            Integer id = 999;
            when(vatCategoryDao.findByPK(id)).thenReturn(null);

            // Act
            VatCategory result = vatCategoryService.findByPK(id);

            // Assert
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getVatCategoryList with filters Tests")
    class GetVatCategoryListWithFiltersTests {

        @Test
        @DisplayName("Should return paginated VAT category list")
        void getVatCategoryListWithFiltersReturnsPaginatedResult() {
            // Arrange
            Map<VatCategoryFilterEnum, Object> filterDataMap = new EnumMap<>(VatCategoryFilterEnum.class);
            filterDataMap.put(VatCategoryFilterEnum.DELETE_FLAG, false);
            PaginationModel paginationModel = new PaginationModel();

            List<VatCategory> categories = createVatCategoryList(5);
            PaginationResponseModel expectedResponse = new PaginationResponseModel(5, categories);
            when(vatCategoryDao.getVatCategoryList(filterDataMap, paginationModel))
                .thenReturn(expectedResponse);

            // Act
            PaginationResponseModel result = vatCategoryService.getVatCategoryList(filterDataMap, paginationModel);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(5);
            verify(vatCategoryDao).getVatCategoryList(filterDataMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("getVatCategoryForDropDown Tests")
    class GetVatCategoryForDropDownTests {

        @Test
        @DisplayName("Should return dropdown list of VAT categories")
        void getVatCategoryForDropDownReturnsDropdownList() {
            // Arrange
            List<VatCategory> categories = createVatCategoryList(3);
            when(vatCategoryDao.getVatCategoryList()).thenReturn(categories);

            // Act
            List<DropdownModel> result = vatCategoryService.getVatCategoryForDropDown();

            // Assert
            assertThat(result).isNotNull().hasSize(3);
            verify(vatCategoryDao).getVatCategoryList();
        }

        @Test
        @DisplayName("Should return empty dropdown list when no categories")
        void getVatCategoryForDropDownReturnsEmptyList() {
            // Arrange
            when(vatCategoryDao.getVatCategoryList()).thenReturn(new ArrayList<>());

            // Act
            List<DropdownModel> result = vatCategoryService.getVatCategoryForDropDown();

            // Assert
            assertThat(result).isNotNull().isEmpty();
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
            doNothing().when(vatCategoryDao).deleteByIds(ids);

            // Act
            vatCategoryService.deleteByIds(ids);

            // Assert
            verify(vatCategoryDao).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should handle empty ID list")
        void deleteByIdsHandlesEmptyList() {
            // Arrange
            List<Integer> ids = new ArrayList<>();
            doNothing().when(vatCategoryDao).deleteByIds(ids);

            // Act
            vatCategoryService.deleteByIds(ids);

            // Assert
            verify(vatCategoryDao).deleteByIds(ids);
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
        VatCategory vatCategory = new VatCategory();
        vatCategory.setId(id);
        vatCategory.setName(name);
        vatCategory.setVat(vat);
        vatCategory.setVatLabel(name + " (" + vat + "%)");
        vatCategory.setDeleteFlag(false);
        vatCategory.setDefaultFlag('N');
        return vatCategory;
    }
}
