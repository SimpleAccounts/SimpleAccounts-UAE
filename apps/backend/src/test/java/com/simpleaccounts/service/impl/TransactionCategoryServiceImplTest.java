package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simpleaccounts.criteria.bankaccount.TransactionCategoryCriteria;
import com.simpleaccounts.dao.bankaccount.TransactionCategoryDao;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.time.LocalDateTime;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionCategoryServiceImpl Tests")
class TransactionCategoryServiceImplTest {

    @Mock
    private TransactionCategoryDao transactionCategoryDao;

    @InjectMocks
    private TransactionCategoryServiceImpl transactionCategoryService;

    private TransactionCategory testCategory;
    private ChartOfAccount testChartOfAccount;

    @BeforeEach
    void setUp() {
        testChartOfAccount = new ChartOfAccount();
        testChartOfAccount.setChartOfAccountId(1);
        testChartOfAccount.setChartOfAccountName("Test COA");
        testChartOfAccount.setChartOfAccountCode("1001");

        testCategory = new TransactionCategory();
        testCategory.setTransactionCategoryId(1);
        testCategory.setTransactionCategoryName("Test Category");
        testCategory.setTransactionCategoryCode("TC001");
        testCategory.setChartOfAccount(testChartOfAccount);
        testCategory.setCreatedDate(LocalDateTime.now());
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return transaction category dao")
        void shouldReturnTransactionCategoryDao() {
            assertThat(transactionCategoryService.getDao()).isEqualTo(transactionCategoryDao);
        }
    }

    @Nested
    @DisplayName("findAllTransactionCategory Tests")
    class FindAllTransactionCategoryTests {

        @Test
        @DisplayName("Should return all transaction categories")
        void shouldReturnAllTransactionCategories() {
            List<TransactionCategory> expectedCategories = Arrays.asList(testCategory);
            when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategory();

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).findAllTransactionCategory();
        }

        @Test
        @DisplayName("Should return empty list when no categories exist")
        void shouldReturnEmptyListWhenNoCategories() {
            when(transactionCategoryDao.findAllTransactionCategory()).thenReturn(Collections.emptyList());

            List<TransactionCategory> result = transactionCategoryService.findAllTransactionCategory();

            assertThat(result).isNotNull().isEmpty();
            verify(transactionCategoryDao).findAllTransactionCategory();
        }
    }

    @Nested
    @DisplayName("findTransactionCategoryByTransactionCategoryCode Tests")
    class FindByCodeTests {

        @Test
        @DisplayName("Should return category by code")
        void shouldReturnCategoryByCode() {
            String code = "TC001";
            when(transactionCategoryDao.findTransactionCategoryByTransactionCategoryCode(code))
                    .thenReturn(testCategory);

            TransactionCategory result = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(code);

            assertThat(result).isNotNull();
            assertThat(result.getTransactionCategoryCode()).isEqualTo(code);
            verify(transactionCategoryDao).findTransactionCategoryByTransactionCategoryCode(code);
        }

        @Test
        @DisplayName("Should return null when code not found")
        void shouldReturnNullWhenCodeNotFound() {
            String code = "INVALID";
            when(transactionCategoryDao.findTransactionCategoryByTransactionCategoryCode(code))
                    .thenReturn(null);

            TransactionCategory result = transactionCategoryService
                    .findTransactionCategoryByTransactionCategoryCode(code);

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("getDefaultTransactionCategory Tests")
    class GetDefaultTransactionCategoryTests {

        @Test
        @DisplayName("Should return first category as default")
        void shouldReturnFirstCategoryAsDefault() {
            when(transactionCategoryDao.findAllTransactionCategory())
                    .thenReturn(Arrays.asList(testCategory));

            TransactionCategory result = transactionCategoryService.getDefaultTransactionCategory();

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testCategory);
        }

        @Test
        @DisplayName("Should return null when no categories exist")
        void shouldReturnNullWhenNoCategories() {
            when(transactionCategoryDao.findAllTransactionCategory())
                    .thenReturn(Collections.emptyList());

            TransactionCategory result = transactionCategoryService.getDefaultTransactionCategory();

            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("findAllTransactionCategoryByChartOfAccountIdAndName Tests")
    class FindByChartOfAccountIdAndNameTests {

        @Test
        @DisplayName("Should return categories by chart of account id and name")
        void shouldReturnCategoriesByChartOfAccountIdAndName() {
            Integer chartOfAccountId = 1;
            String name = "Test Category";
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.findAllTransactionCategoryByChartOfAccountIdAndName(chartOfAccountId, name))
                    .thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService
                    .findAllTransactionCategoryByChartOfAccountIdAndName(chartOfAccountId, name);

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).findAllTransactionCategoryByChartOfAccountIdAndName(chartOfAccountId, name);
        }
    }

    @Nested
    @DisplayName("findAllTransactionCategoryByChartOfAccount Tests")
    class FindByChartOfAccountTests {

        @Test
        @DisplayName("Should return categories by chart of account id")
        void shouldReturnCategoriesByChartOfAccountId() {
            Integer chartOfAccountId = 1;
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.findAllTransactionCategoryByChartOfAccount(chartOfAccountId))
                    .thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService
                    .findAllTransactionCategoryByChartOfAccount(chartOfAccountId);

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).findAllTransactionCategoryByChartOfAccount(chartOfAccountId);
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete categories by ids")
        void shouldDeleteCategoriesByIds() {
            List<Integer> ids = Arrays.asList(1, 2, 3);

            transactionCategoryService.deleteByIds(ids);

            verify(transactionCategoryDao).deleteByIds(ids);
        }
    }

    @Nested
    @DisplayName("getTransactionCategoryList Tests")
    class GetTransactionCategoryListTests {

        @Test
        @DisplayName("Should return paginated transaction category list")
        void shouldReturnPaginatedList() {
            Map<TransactionCategoryFilterEnum, Object> filterMap = new EnumMap<>(TransactionCategoryFilterEnum.class);
            filterMap.put(TransactionCategoryFilterEnum.DELETE_FLAG, false);

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, new HashMap<>());
            when(transactionCategoryDao.getTransactionCategoryList(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = transactionCategoryService
                    .getTransactionCategoryList(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(1);
            verify(transactionCategoryDao).getTransactionCategoryList(filterMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("getNxtTransactionCatCodeByChartOfAccount Tests")
    class GetNextCodeTests {

        @Test
        @DisplayName("Should return next transaction category code")
        void shouldReturnNextCode() {
            String expectedCode = "TC002";
            when(transactionCategoryDao.getNxtTransactionCatCodeByChartOfAccount(testChartOfAccount))
                    .thenReturn(expectedCode);

            String result = transactionCategoryService.getNxtTransactionCatCodeByChartOfAccount(testChartOfAccount);

            assertThat(result).isEqualTo(expectedCode);
            verify(transactionCategoryDao).getNxtTransactionCatCodeByChartOfAccount(testChartOfAccount);
        }
    }

    @Nested
    @DisplayName("getTransactionCatByChartOfAccountCategoryId Tests")
    class GetByChartOfAccountCategoryIdTests {

        @Test
        @DisplayName("Should return categories by chart of account category id")
        void shouldReturnCategoriesByChartOfAccountCategoryId() {
            Integer categoryId = 1;
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.getTransactionCatByChartOfAccountCategoryId(categoryId))
                    .thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService
                    .getTransactionCatByChartOfAccountCategoryId(categoryId);

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).getTransactionCatByChartOfAccountCategoryId(categoryId);
        }
    }

    @Nested
    @DisplayName("getListForReceipt Tests")
    class GetListForReceiptTests {

        @Test
        @DisplayName("Should return categories for receipt")
        void shouldReturnCategoriesForReceipt() {
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.findTnxCatForReicpt()).thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService.getListForReceipt();

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).findTnxCatForReicpt();
        }
    }

    @Nested
    @DisplayName("getTransactionCategoryListForSalesProduct Tests")
    class GetListForSalesProductTests {

        @Test
        @DisplayName("Should return categories for sales product")
        void shouldReturnCategoriesForSalesProduct() {
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.getTransactionCategoryListForSalesProduct()).thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForSalesProduct();

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).getTransactionCategoryListForSalesProduct();
        }
    }

    @Nested
    @DisplayName("getTransactionCategoryListForPurchaseProduct Tests")
    class GetListForPurchaseProductTests {

        @Test
        @DisplayName("Should return categories for purchase product")
        void shouldReturnCategoriesForPurchaseProduct() {
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.getTransactionCategoryListForPurchaseProduct()).thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForPurchaseProduct();

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).getTransactionCategoryListForPurchaseProduct();
        }
    }

    @Nested
    @DisplayName("getTransactionCategoryListForInventory Tests")
    class GetListForInventoryTests {

        @Test
        @DisplayName("Should return categories for inventory")
        void shouldReturnCategoriesForInventory() {
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.getTransactionCategoryListForInventory()).thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListForInventory();

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).getTransactionCategoryListForInventory();
        }
    }

    @Nested
    @DisplayName("getTransactionCategoryListManualJornal Tests")
    class GetListManualJournalTests {

        @Test
        @DisplayName("Should return categories for manual journal")
        void shouldReturnCategoriesForManualJournal() {
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.getTransactionCategoryListManualJornal()).thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService.getTransactionCategoryListManualJornal();

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).getTransactionCategoryListManualJornal();
        }
    }

    @Nested
    @DisplayName("findTransactionCategoryListByParentCategory Tests")
    class FindByParentCategoryTests {

        @Test
        @DisplayName("Should return categories by parent category id")
        void shouldReturnCategoriesByParentCategoryId() {
            Integer parentCategoryId = 1;
            List<TransactionCategory> expectedCategories = Collections.singletonList(testCategory);
            when(transactionCategoryDao.findTransactionCategoryListByParentCategory(parentCategoryId))
                    .thenReturn(expectedCategories);

            List<TransactionCategory> result = transactionCategoryService
                    .findTransactionCategoryListByParentCategory(parentCategoryId);

            assertThat(result).isNotNull().hasSize(1);
            verify(transactionCategoryDao).findTransactionCategoryListByParentCategory(parentCategoryId);
        }
    }

    @Nested
    @DisplayName("getDefaultTransactionCategoryByTransactionCategoryId Tests")
    class GetDefaultByCategoryIdTests {

        @Test
        @DisplayName("Should return default category by id")
        void shouldReturnDefaultCategoryById() {
            Integer categoryId = 1;
            when(transactionCategoryDao.getDefaultTransactionCategoryByTransactionCategoryId(categoryId))
                    .thenReturn(testCategory);

            TransactionCategory result = transactionCategoryService
                    .getDefaultTransactionCategoryByTransactionCategoryId(categoryId);

            assertThat(result).isNotNull();
            assertThat(result.getTransactionCategoryId()).isEqualTo(categoryId);
            verify(transactionCategoryDao).getDefaultTransactionCategoryByTransactionCategoryId(categoryId);
        }
    }
}
