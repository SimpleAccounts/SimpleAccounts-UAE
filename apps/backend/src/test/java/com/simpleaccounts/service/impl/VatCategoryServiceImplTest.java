package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.VatCategoryFilterEnum;
import com.simpleaccounts.dao.VatCategoryDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.entity.VatCategory;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

@ExtendWith(MockitoExtension.class)
@DisplayName("VatCategoryServiceImpl Tests")
class VatCategoryServiceImplTest {

    @Mock
    private VatCategoryDao vatCategoryDao;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache vatCategoryCache;

    @InjectMocks
    private VatCategoryServiceImpl vatCategoryService;

    private VatCategory testVatCategory;
    private Integer vatCategoryId;

    @BeforeEach
    void setUp() {
        vatCategoryId = 1;

        testVatCategory = new VatCategory();
        testVatCategory.setId(vatCategoryId);
        testVatCategory.setName("Standard VAT");
        testVatCategory.setVat(new BigDecimal("5.00"));
        testVatCategory.setVatLabel("5% VAT");
        testVatCategory.setIsDefault(false);
        testVatCategory.setIsActive(true);
        testVatCategory.setCreatedBy(1);
        testVatCategory.setCreatedDate(LocalDateTime.now());
    }

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return VatCategoryDao instance")
        void shouldReturnVatCategoryDao() {
            assertThat(vatCategoryService.getDao()).isEqualTo(vatCategoryDao);
        }

        @Test
        @DisplayName("Should not return null")
        void shouldNotReturnNull() {
            assertThat(vatCategoryService.getDao()).isNotNull();
        }

        @Test
        @DisplayName("Should return same instance on multiple calls")
        void shouldReturnSameInstanceOnMultipleCalls() {
            var dao1 = vatCategoryService.getDao();
            var dao2 = vatCategoryService.getDao();

            assertThat(dao1).isSameAs(dao2);
            assertThat(dao1).isEqualTo(vatCategoryDao);
        }
    }

    @Nested
    @DisplayName("getVatCategoryList() Tests")
    class GetVatCategoryListTests {

        @Test
        @DisplayName("Should return list of VAT categories")
        void shouldReturnListOfVatCategories() {
            List<VatCategory> expectedList = Arrays.asList(
                testVatCategory,
                createVatCategory(2, "Zero VAT", new BigDecimal("0.00"))
            );

            when(vatCategoryDao.getVatCategoryList()).thenReturn(expectedList);

            List<VatCategory> result = vatCategoryService.getVatCategoryList();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result).isEqualTo(expectedList);
            verify(vatCategoryDao, times(1)).getVatCategoryList();
        }

        @Test
        @DisplayName("Should return empty list when no categories exist")
        void shouldReturnEmptyListWhenNoCategoriesExist() {
            when(vatCategoryDao.getVatCategoryList()).thenReturn(Collections.emptyList());

            List<VatCategory> result = vatCategoryService.getVatCategoryList();

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(vatCategoryDao, times(1)).getVatCategoryList();
        }

        @Test
        @DisplayName("Should handle single VAT category")
        void shouldHandleSingleVatCategory() {
            List<VatCategory> singleList = Collections.singletonList(testVatCategory);

            when(vatCategoryDao.getVatCategoryList()).thenReturn(singleList);

            List<VatCategory> result = vatCategoryService.getVatCategoryList();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testVatCategory);
        }

        @Test
        @DisplayName("Should handle large list of VAT categories")
        void shouldHandleLargeListOfVatCategories() {
            List<VatCategory> largeList = new ArrayList<>();
            for (int i = 0; i < 50; i++) {
                largeList.add(createVatCategory(i, "VAT " + i, new BigDecimal(i)));
            }

            when(vatCategoryDao.getVatCategoryList()).thenReturn(largeList);

            List<VatCategory> result = vatCategoryService.getVatCategoryList();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(50);
        }
    }

    @Nested
    @DisplayName("getVatCategorys() Tests")
    class GetVatCategorysTests {

        @Test
        @DisplayName("Should return VAT categories by name")
        void shouldReturnVatCategoriesByName() {
            String name = "Standard";
            List<VatCategory> expectedList = Collections.singletonList(testVatCategory);

            when(vatCategoryDao.getVatCategorys(name)).thenReturn(expectedList);

            List<VatCategory> result = vatCategoryService.getVatCategorys(name);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).contains("Standard");
            verify(vatCategoryDao, times(1)).getVatCategorys(name);
        }

        @Test
        @DisplayName("Should return empty list when name not found")
        void shouldReturnEmptyListWhenNameNotFound() {
            String name = "NonExistent";

            when(vatCategoryDao.getVatCategorys(name)).thenReturn(Collections.emptyList());

            List<VatCategory> result = vatCategoryService.getVatCategorys(name);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(vatCategoryDao, times(1)).getVatCategorys(name);
        }

        @Test
        @DisplayName("Should handle null name")
        void shouldHandleNullName() {
            when(vatCategoryDao.getVatCategorys(null)).thenReturn(Collections.emptyList());

            List<VatCategory> result = vatCategoryService.getVatCategorys(null);

            assertThat(result).isNotNull();
            verify(vatCategoryDao, times(1)).getVatCategorys(null);
        }

        @Test
        @DisplayName("Should handle empty name")
        void shouldHandleEmptyName() {
            when(vatCategoryDao.getVatCategorys("")).thenReturn(Collections.emptyList());

            List<VatCategory> result = vatCategoryService.getVatCategorys("");

            assertThat(result).isNotNull();
            verify(vatCategoryDao, times(1)).getVatCategorys("");
        }

        @Test
        @DisplayName("Should return multiple categories with similar names")
        void shouldReturnMultipleCategoriesWithSimilarNames() {
            String name = "VAT";
            List<VatCategory> expectedList = Arrays.asList(
                createVatCategory(1, "Standard VAT", new BigDecimal("5.00")),
                createVatCategory(2, "Reduced VAT", new BigDecimal("2.50"))
            );

            when(vatCategoryDao.getVatCategorys(name)).thenReturn(expectedList);

            List<VatCategory> result = vatCategoryService.getVatCategorys(name);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
        }
    }

    @Nested
    @DisplayName("getDefaultVatCategory() Tests")
    class GetDefaultVatCategoryTests {

        @Test
        @DisplayName("Should return default VAT category")
        void shouldReturnDefaultVatCategory() {
            testVatCategory.setIsDefault(true);

            when(vatCategoryDao.getDefaultVatCategory()).thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.getDefaultVatCategory();

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testVatCategory);
            assertThat(result.getIsDefault()).isTrue();
            verify(vatCategoryDao, times(1)).getDefaultVatCategory();
        }

        @Test
        @DisplayName("Should return null when no default category exists")
        void shouldReturnNullWhenNoDefaultCategoryExists() {
            when(vatCategoryDao.getDefaultVatCategory()).thenReturn(null);

            VatCategory result = vatCategoryService.getDefaultVatCategory();

            assertThat(result).isNull();
            verify(vatCategoryDao, times(1)).getDefaultVatCategory();
        }

        @Test
        @DisplayName("Should cache default VAT category")
        void shouldCacheDefaultVatCategory() {
            testVatCategory.setIsDefault(true);

            when(vatCategoryDao.getDefaultVatCategory()).thenReturn(testVatCategory);

            VatCategory result1 = vatCategoryService.getDefaultVatCategory();
            VatCategory result2 = vatCategoryService.getDefaultVatCategory();

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            verify(vatCategoryDao, times(2)).getDefaultVatCategory();
        }
    }

    @Nested
    @DisplayName("persist() Tests")
    class PersistTests {

        @Test
        @DisplayName("Should persist new VAT category with activity")
        void shouldPersistNewVatCategoryWithActivity() {
            ArgumentCaptor<Activity> activityCaptor = ArgumentCaptor.forClass(Activity.class);

            vatCategoryService.persist(testVatCategory);

            verify(vatCategoryDao, times(1)).persist(eq(testVatCategory), eq(null), activityCaptor.capture());

            Activity capturedActivity = activityCaptor.getValue();
            assertThat(capturedActivity).isNotNull();
            assertThat(capturedActivity.getActivityCode()).isEqualTo("CREATED");
            assertThat(capturedActivity.getModuleCode()).isEqualTo("VAT_CATEGORY");
            assertThat(capturedActivity.getLoggingRequired()).isTrue();
        }

        @Test
        @DisplayName("Should create activity with correct VAT value")
        void shouldCreateActivityWithCorrectVatValue() {
            ArgumentCaptor<Activity> activityCaptor = ArgumentCaptor.forClass(Activity.class);

            vatCategoryService.persist(testVatCategory);

            verify(vatCategoryDao, times(1)).persist(eq(testVatCategory), eq(null), activityCaptor.capture());

            Activity capturedActivity = activityCaptor.getValue();
            assertThat(capturedActivity.getField1()).isEqualTo(testVatCategory.getVat().toString());
            assertThat(capturedActivity.getField2()).isEqualTo(testVatCategory.getName());
        }

        @Test
        @DisplayName("Should persist VAT category with zero rate")
        void shouldPersistVatCategoryWithZeroRate() {
            VatCategory zeroVat = createVatCategory(10, "Zero VAT", BigDecimal.ZERO);

            vatCategoryService.persist(zeroVat);

            verify(vatCategoryDao, times(1)).persist(eq(zeroVat), eq(null), any(Activity.class));
        }
    }

    @Nested
    @DisplayName("update() Tests")
    class UpdateTests {

        @Test
        @DisplayName("Should update VAT category with activity")
        void shouldUpdateVatCategoryWithActivity() {
            ArgumentCaptor<Activity> activityCaptor = ArgumentCaptor.forClass(Activity.class);

            when(vatCategoryDao.update(eq(testVatCategory), eq(null), any(Activity.class)))
                .thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.update(testVatCategory);

            assertThat(result).isNotNull();
            verify(vatCategoryDao, times(1)).update(eq(testVatCategory), eq(null), activityCaptor.capture());

            Activity capturedActivity = activityCaptor.getValue();
            assertThat(capturedActivity.getActivityCode()).isEqualTo("UPDATED");
            assertThat(capturedActivity.getModuleCode()).isEqualTo("VAT_CATEGORY");
        }

        @Test
        @DisplayName("Should update VAT category and return updated entity")
        void shouldUpdateVatCategoryAndReturnUpdatedEntity() {
            testVatCategory.setName("Updated Name");
            testVatCategory.setVat(new BigDecimal("10.00"));

            when(vatCategoryDao.update(eq(testVatCategory), eq(null), any(Activity.class)))
                .thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.update(testVatCategory);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Updated Name");
            assertThat(result.getVat()).isEqualByComparingTo(new BigDecimal("10.00"));
        }

        @Test
        @DisplayName("Should create update activity with timestamp")
        void shouldCreateUpdateActivityWithTimestamp() {
            ArgumentCaptor<Activity> activityCaptor = ArgumentCaptor.forClass(Activity.class);

            when(vatCategoryDao.update(eq(testVatCategory), eq(null), any(Activity.class)))
                .thenReturn(testVatCategory);

            vatCategoryService.update(testVatCategory);

            verify(vatCategoryDao, times(1)).update(eq(testVatCategory), eq(null), activityCaptor.capture());

            Activity capturedActivity = activityCaptor.getValue();
            assertThat(capturedActivity.getLastUpdateDate()).isNotNull();
        }
    }

    @Nested
    @DisplayName("deleteByIds() Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete VAT categories by IDs")
        void shouldDeleteVatCategoriesByIds() {
            List<Integer> ids = Arrays.asList(1, 2, 3);

            doNothing().when(vatCategoryDao).deleteByIds(ids);

            vatCategoryService.deleteByIds(ids);

            verify(vatCategoryDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should delete single VAT category by ID")
        void shouldDeleteSingleVatCategoryById() {
            List<Integer> ids = Collections.singletonList(1);

            doNothing().when(vatCategoryDao).deleteByIds(ids);

            vatCategoryService.deleteByIds(ids);

            verify(vatCategoryDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should handle empty IDs list")
        void shouldHandleEmptyIdsList() {
            List<Integer> ids = Collections.emptyList();

            doNothing().when(vatCategoryDao).deleteByIds(ids);

            vatCategoryService.deleteByIds(ids);

            verify(vatCategoryDao, times(1)).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should delete multiple VAT categories efficiently")
        void shouldDeleteMultipleVatCategoriesEfficiently() {
            List<Integer> ids = new ArrayList<>();
            for (int i = 1; i <= 20; i++) {
                ids.add(i);
            }

            doNothing().when(vatCategoryDao).deleteByIds(ids);

            vatCategoryService.deleteByIds(ids);

            verify(vatCategoryDao, times(1)).deleteByIds(ids);
        }
    }

    @Nested
    @DisplayName("getVatCategoryList() with Pagination Tests")
    class GetVatCategoryListPaginationTests {

        @Test
        @DisplayName("Should get paginated VAT category list")
        void shouldGetPaginatedVatCategoryList() {
            Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);
            filterMap.put(VatCategoryFilterEnum.IS_ACTIVE, true);

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(1);
            paginationModel.setRecordPerPage(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setTotalRecords(25L);

            when(vatCategoryDao.getVatCategoryList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            PaginationResponseModel result =
                vatCategoryService.getVatCategoryList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getTotalRecords()).isEqualTo(25L);
            verify(vatCategoryDao, times(1)).getVatCategoryList(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle empty filter map with pagination")
        void shouldHandleEmptyFilterMapWithPagination() {
            Map<VatCategoryFilterEnum, Object> emptyMap = new EnumMap<>(VatCategoryFilterEnum.class);
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatCategoryDao.getVatCategoryList(emptyMap, paginationModel))
                .thenReturn(expectedResponse);

            PaginationResponseModel result =
                vatCategoryService.getVatCategoryList(emptyMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatCategoryDao, times(1)).getVatCategoryList(emptyMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle null filter map with pagination")
        void shouldHandleNullFilterMapWithPagination() {
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatCategoryDao.getVatCategoryList(null, paginationModel))
                .thenReturn(expectedResponse);

            PaginationResponseModel result =
                vatCategoryService.getVatCategoryList(null, paginationModel);

            assertThat(result).isNotNull();
            verify(vatCategoryDao, times(1)).getVatCategoryList(null, paginationModel);
        }

        @Test
        @DisplayName("Should handle null pagination model")
        void shouldHandleNullPaginationModel() {
            Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatCategoryDao.getVatCategoryList(filterMap, null))
                .thenReturn(expectedResponse);

            PaginationResponseModel result =
                vatCategoryService.getVatCategoryList(filterMap, null);

            assertThat(result).isNotNull();
            verify(vatCategoryDao, times(1)).getVatCategoryList(filterMap, null);
        }

        @Test
        @DisplayName("Should handle multiple filter criteria with pagination")
        void shouldHandleMultipleFilterCriteriaWithPagination() {
            Map<VatCategoryFilterEnum, Object> filterMap = new EnumMap<>(VatCategoryFilterEnum.class);
            filterMap.put(VatCategoryFilterEnum.IS_ACTIVE, true);
            filterMap.put(VatCategoryFilterEnum.NAME, "Standard");

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(2);
            paginationModel.setRecordPerPage(20);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(vatCategoryDao.getVatCategoryList(filterMap, paginationModel))
                .thenReturn(expectedResponse);

            PaginationResponseModel result =
                vatCategoryService.getVatCategoryList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(vatCategoryDao, times(1)).getVatCategoryList(filterMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("getVatCategoryForDropDown() Tests")
    class GetVatCategoryForDropDownTests {

        @Test
        @DisplayName("Should return dropdown models for VAT categories")
        void shouldReturnDropdownModelsForVatCategories() {
            List<VatCategory> vatList = Arrays.asList(
                testVatCategory,
                createVatCategory(2, "Zero VAT", BigDecimal.ZERO)
            );

            when(vatCategoryDao.getVatCategoryList()).thenReturn(vatList);

            List<DropdownModel> result = vatCategoryService.getVatCategoryForDropDown();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result.get(0).getValue()).isEqualTo(1);
            assertThat(result.get(0).getLabel()).isEqualTo("5% VAT");
            verify(vatCategoryDao, times(1)).getVatCategoryList();
        }

        @Test
        @DisplayName("Should return empty list when no categories for dropdown")
        void shouldReturnEmptyListWhenNoCategoriesForDropdown() {
            when(vatCategoryDao.getVatCategoryList()).thenReturn(Collections.emptyList());

            List<DropdownModel> result = vatCategoryService.getVatCategoryForDropDown();

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(vatCategoryDao, times(1)).getVatCategoryList();
        }

        @Test
        @DisplayName("Should map VAT category ID to dropdown value")
        void shouldMapVatCategoryIdToDropdownValue() {
            VatCategory vat = createVatCategory(100, "Custom VAT", new BigDecimal("15.00"));
            vat.setVatLabel("15% Custom VAT");

            when(vatCategoryDao.getVatCategoryList()).thenReturn(Collections.singletonList(vat));

            List<DropdownModel> result = vatCategoryService.getVatCategoryForDropDown();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getValue()).isEqualTo(100);
            assertThat(result.get(0).getLabel()).isEqualTo("15% Custom VAT");
        }

        @Test
        @DisplayName("Should handle large number of categories in dropdown")
        void shouldHandleLargeNumberOfCategoriesInDropdown() {
            List<VatCategory> largeList = new ArrayList<>();
            for (int i = 0; i < 30; i++) {
                VatCategory vat = createVatCategory(i, "VAT " + i, new BigDecimal(i));
                vat.setVatLabel(i + "% VAT");
                largeList.add(vat);
            }

            when(vatCategoryDao.getVatCategoryList()).thenReturn(largeList);

            List<DropdownModel> result = vatCategoryService.getVatCategoryForDropDown();

            assertThat(result).hasSize(30);
        }
    }

    @Nested
    @DisplayName("findByPK() Tests")
    class FindByPKTests {

        @Test
        @DisplayName("Should find VAT category by primary key")
        void shouldFindVatCategoryByPrimaryKey() {
            when(vatCategoryDao.findByPK(vatCategoryId)).thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.findByPK(vatCategoryId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testVatCategory);
            assertThat(result.getId()).isEqualTo(vatCategoryId);
            verify(vatCategoryDao, times(1)).findByPK(vatCategoryId);
        }

        @Test
        @DisplayName("Should throw exception when VAT category not found by PK")
        void shouldThrowExceptionWhenVatCategoryNotFoundByPK() {
            when(vatCategoryDao.findByPK(999)).thenReturn(null);

            assertThatThrownBy(() -> vatCategoryService.findByPK(999))
                    .isInstanceOf(ServiceException.class);

            verify(vatCategoryDao, times(1)).findByPK(999);
        }

        @Test
        @DisplayName("Should handle null ID")
        void shouldHandleNullId() {
            when(vatCategoryDao.findByPK(null)).thenReturn(null);

            assertThatThrownBy(() -> vatCategoryService.findByPK(null))
                    .isInstanceOf(ServiceException.class);

            verify(vatCategoryDao, times(1)).findByPK(null);
        }

        @Test
        @DisplayName("Should find VAT category with cacheable annotation")
        void shouldFindVatCategoryWithCacheableAnnotation() {
            when(vatCategoryDao.findByPK(vatCategoryId)).thenReturn(testVatCategory);

            VatCategory result1 = vatCategoryService.findByPK(vatCategoryId);
            VatCategory result2 = vatCategoryService.findByPK(vatCategoryId);

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            verify(vatCategoryDao, times(2)).findByPK(vatCategoryId);
        }
    }

    @Nested
    @DisplayName("Edge Cases and Error Handling Tests")
    class EdgeCasesAndErrorHandlingTests {

        @Test
        @DisplayName("Should handle VAT category with minimal data")
        void shouldHandleVatCategoryWithMinimalData() {
            VatCategory minimalVat = new VatCategory();
            minimalVat.setId(50);

            when(vatCategoryDao.findByPK(50)).thenReturn(minimalVat);

            VatCategory result = vatCategoryService.findByPK(50);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(50);
            assertThat(result.getName()).isNull();
        }

        @Test
        @DisplayName("Should handle VAT category with zero rate")
        void shouldHandleVatCategoryWithZeroRate() {
            testVatCategory.setVat(BigDecimal.ZERO);

            when(vatCategoryDao.update(eq(testVatCategory), eq(null), any(Activity.class)))
                .thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.update(testVatCategory);

            assertThat(result).isNotNull();
            assertThat(result.getVat()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle VAT category with negative rate")
        void shouldHandleVatCategoryWithNegativeRate() {
            testVatCategory.setVat(new BigDecimal("-5.00"));

            when(vatCategoryDao.update(eq(testVatCategory), eq(null), any(Activity.class)))
                .thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.update(testVatCategory);

            assertThat(result).isNotNull();
            assertThat(result.getVat()).isEqualByComparingTo(new BigDecimal("-5.00"));
        }

        @Test
        @DisplayName("Should handle VAT category with very large rate")
        void shouldHandleVatCategoryWithVeryLargeRate() {
            testVatCategory.setVat(new BigDecimal("999.99"));

            when(vatCategoryDao.update(eq(testVatCategory), eq(null), any(Activity.class)))
                .thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.update(testVatCategory);

            assertThat(result).isNotNull();
            assertThat(result.getVat()).isEqualByComparingTo(new BigDecimal("999.99"));
        }

        @Test
        @DisplayName("Should handle VAT category with empty string values")
        void shouldHandleVatCategoryWithEmptyStringValues() {
            VatCategory emptyVat = createVatCategory(60, "", BigDecimal.ZERO);
            emptyVat.setVatLabel("");

            when(vatCategoryDao.update(eq(emptyVat), eq(null), any(Activity.class)))
                .thenReturn(emptyVat);

            VatCategory result = vatCategoryService.update(emptyVat);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEmpty();
            assertThat(result.getVatLabel()).isEmpty();
        }

        @Test
        @DisplayName("Should handle VAT category with special characters")
        void shouldHandleVatCategoryWithSpecialCharacters() {
            VatCategory specialVat = createVatCategory(70, "VAT <>&\"'", new BigDecimal("5.00"));

            when(vatCategoryDao.update(eq(specialVat), eq(null), any(Activity.class)))
                .thenReturn(specialVat);

            VatCategory result = vatCategoryService.update(specialVat);

            assertThat(result).isNotNull();
            assertThat(result.getName()).contains("<", ">", "&", "\"", "'");
        }

        @Test
        @DisplayName("Should handle very long VAT category name")
        void shouldHandleVeryLongVatCategoryName() {
            String longName = "VAT Category ".repeat(50);
            testVatCategory.setName(longName);

            when(vatCategoryDao.update(eq(testVatCategory), eq(null), any(Activity.class)))
                .thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.update(testVatCategory);

            assertThat(result).isNotNull();
            assertThat(result.getName()).hasSize(longName.length());
        }

        @Test
        @DisplayName("Should handle multiple default VAT categories")
        void shouldHandleMultipleDefaultVatCategories() {
            VatCategory default1 = createVatCategory(1, "Default 1", new BigDecimal("5.00"));
            default1.setIsDefault(true);

            when(vatCategoryDao.getDefaultVatCategory()).thenReturn(default1);

            VatCategory result = vatCategoryService.getDefaultVatCategory();

            assertThat(result).isNotNull();
            assertThat(result.getIsDefault()).isTrue();
        }

        @Test
        @DisplayName("Should handle inactive VAT categories")
        void shouldHandleInactiveVatCategories() {
            testVatCategory.setIsActive(false);

            when(vatCategoryDao.update(eq(testVatCategory), eq(null), any(Activity.class)))
                .thenReturn(testVatCategory);

            VatCategory result = vatCategoryService.update(testVatCategory);

            assertThat(result).isNotNull();
            assertThat(result.getIsActive()).isFalse();
        }

        @Test
        @DisplayName("Should handle concurrent updates")
        void shouldHandleConcurrentUpdates() {
            VatCategory vat1 = createVatCategory(1, "VAT 1", new BigDecimal("5.00"));
            VatCategory vat2 = createVatCategory(2, "VAT 2", new BigDecimal("10.00"));

            when(vatCategoryDao.update(eq(vat1), eq(null), any(Activity.class))).thenReturn(vat1);
            when(vatCategoryDao.update(eq(vat2), eq(null), any(Activity.class))).thenReturn(vat2);

            VatCategory result1 = vatCategoryService.update(vat1);
            VatCategory result2 = vatCategoryService.update(vat2);

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            assertThat(result1.getId()).isNotEqualTo(result2.getId());
        }

        @Test
        @DisplayName("Should handle null VAT label")
        void shouldHandleNullVatLabel() {
            testVatCategory.setVatLabel(null);

            List<VatCategory> vatList = Collections.singletonList(testVatCategory);
            when(vatCategoryDao.getVatCategoryList()).thenReturn(vatList);

            List<DropdownModel> result = vatCategoryService.getVatCategoryForDropDown();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getLabel()).isNull();
        }

        @Test
        @DisplayName("Should handle activity creation with null values")
        void shouldHandleActivityCreationWithNullValues() {
            VatCategory nullVat = new VatCategory();
            nullVat.setId(80);
            nullVat.setVat(null);
            nullVat.setName(null);

            assertThatThrownBy(() -> vatCategoryService.persist(nullVat))
                .isInstanceOf(NullPointerException.class);
        }
    }

    // Helper method
    private VatCategory createVatCategory(Integer id, String name, BigDecimal vat) {
        VatCategory vatCategory = new VatCategory();
        vatCategory.setId(id);
        vatCategory.setName(name);
        vatCategory.setVat(vat);
        vatCategory.setVatLabel(vat + "% " + name);
        vatCategory.setIsDefault(false);
        vatCategory.setIsActive(true);
        vatCategory.setCreatedBy(1);
        vatCategory.setCreatedDate(LocalDateTime.now());
        return vatCategory;
    }
}
