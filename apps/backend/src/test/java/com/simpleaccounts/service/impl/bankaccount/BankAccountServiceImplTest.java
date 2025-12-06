package com.simpleaccounts.service.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.dao.bankaccount.BankAccountDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.BankDetails;
import com.simpleaccounts.entity.bankaccount.BankDetailsRepository;
import com.simpleaccounts.model.DashBoardBankDataModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

@ExtendWith(MockitoExtension.class)
@DisplayName("BankAccountServiceImpl Tests")
class BankAccountServiceImplTest {

    @Mock
    private BankAccountDao bankAccountDao;

    @Mock
    private DateFormatUtil dateFormatUtil;

    @Mock
    private BankDetailsRepository bankDetailsRepository;

    @InjectMocks
    private BankAccountServiceImpl bankAccountService;

    private BankAccount testBankAccount;
    private Integer bankAccountId;

    @BeforeEach
    void setUp() {
        bankAccountId = 1;
        testBankAccount = createTestBankAccount(bankAccountId);
    }

    private BankAccount createTestBankAccount(Integer id) {
        BankAccount bankAccount = new BankAccount();
        bankAccount.setBankAccountId(id);
        bankAccount.setBankAccountName("Test Bank Account");
        bankAccount.setAccountNumber("1234567890");
        bankAccount.setBankName("Test Bank");
        bankAccount.setCurrentBalance(new BigDecimal("10000.00"));
        bankAccount.setCreatedDate(LocalDateTime.now());
        bankAccount.setLastUpdateDate(LocalDateTime.now());
        bankAccount.setDeleteFlag(false);
        return bankAccount;
    }

    private BankDetails createTestBankDetails(Integer id, String bankName) {
        BankDetails bankDetails = new BankDetails();
        bankDetails.setId(id);
        bankDetails.setBankName(bankName);
        return bankDetails;
    }

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return BankAccountDao instance")
        void shouldReturnBankAccountDao() {
            BankAccountDao result = bankAccountService.getDao();

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(bankAccountDao);
            assertThat(result).isInstanceOf(BankAccountDao.class);
        }

        @Test
        @DisplayName("Should return same DAO instance on multiple calls")
        void shouldReturnSameDaoInstanceOnMultipleCalls() {
            BankAccountDao result1 = bankAccountService.getDao();
            BankAccountDao result2 = bankAccountService.getDao();

            assertThat(result1).isSameAs(result2);
        }

        @Test
        @DisplayName("Should not return null")
        void shouldNotReturnNull() {
            assertThat(bankAccountService.getDao()).isNotNull();
        }
    }

    @Nested
    @DisplayName("getBankAccounts() Tests")
    class GetBankAccountsTests {

        @Test
        @DisplayName("Should get all bank accounts")
        void shouldGetAllBankAccounts() {
            List<BankAccount> expectedAccounts = Arrays.asList(
                    testBankAccount,
                    createTestBankAccount(2),
                    createTestBankAccount(3)
            );

            when(bankAccountDao.getBankAccounts()).thenReturn(expectedAccounts);

            List<BankAccount> result = bankAccountService.getBankAccounts();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(3);
            assertThat(result).containsExactlyElementsOf(expectedAccounts);
            verify(bankAccountDao, times(1)).getBankAccounts();
        }

        @Test
        @DisplayName("Should return empty list when no accounts exist")
        void shouldReturnEmptyListWhenNoAccountsExist() {
            when(bankAccountDao.getBankAccounts()).thenReturn(Collections.emptyList());

            List<BankAccount> result = bankAccountService.getBankAccounts();

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(bankAccountDao, times(1)).getBankAccounts();
        }

        @Test
        @DisplayName("Should handle single bank account")
        void shouldHandleSingleBankAccount() {
            List<BankAccount> singleAccount = Collections.singletonList(testBankAccount);
            when(bankAccountDao.getBankAccounts()).thenReturn(singleAccount);

            List<BankAccount> result = bankAccountService.getBankAccounts();

            assertThat(result).hasSize(1);
            assertThat(result.get(0)).isEqualTo(testBankAccount);
        }
    }

    @Nested
    @DisplayName("getBankAccountByUser() Tests")
    class GetBankAccountByUserTests {

        @Test
        @DisplayName("Should get bank accounts by user ID")
        void shouldGetBankAccountsByUserId() {
            int userId = 10;
            List<BankAccount> expectedAccounts = Arrays.asList(
                    testBankAccount,
                    createTestBankAccount(2)
            );

            when(bankAccountDao.getBankAccountByUser(userId)).thenReturn(expectedAccounts);

            List<BankAccount> result = bankAccountService.getBankAccountByUser(userId);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            verify(bankAccountDao, times(1)).getBankAccountByUser(userId);
        }

        @Test
        @DisplayName("Should return empty list for user with no accounts")
        void shouldReturnEmptyListForUserWithNoAccounts() {
            int userId = 999;
            when(bankAccountDao.getBankAccountByUser(userId)).thenReturn(Collections.emptyList());

            List<BankAccount> result = bankAccountService.getBankAccountByUser(userId);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should handle zero user ID")
        void shouldHandleZeroUserId() {
            when(bankAccountDao.getBankAccountByUser(0)).thenReturn(Collections.emptyList());

            List<BankAccount> result = bankAccountService.getBankAccountByUser(0);

            assertThat(result).isNotNull();
            verify(bankAccountDao, times(1)).getBankAccountByUser(0);
        }

        @Test
        @DisplayName("Should handle negative user ID")
        void shouldHandleNegativeUserId() {
            when(bankAccountDao.getBankAccountByUser(-1)).thenReturn(Collections.emptyList());

            List<BankAccount> result = bankAccountService.getBankAccountByUser(-1);

            assertThat(result).isNotNull();
            verify(bankAccountDao, times(1)).getBankAccountByUser(-1);
        }
    }

    @Nested
    @DisplayName("getBankAccountById() Tests")
    class GetBankAccountByIdTests {

        @Test
        @DisplayName("Should get bank account by ID")
        void shouldGetBankAccountById() {
            when(bankAccountDao.getBankAccountById(bankAccountId)).thenReturn(testBankAccount);

            BankAccount result = bankAccountService.getBankAccountById(bankAccountId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testBankAccount);
            assertThat(result.getBankAccountId()).isEqualTo(bankAccountId);
            verify(bankAccountDao, times(1)).getBankAccountById(bankAccountId);
        }

        @Test
        @DisplayName("Should return null when account not found")
        void shouldReturnNullWhenAccountNotFound() {
            when(bankAccountDao.getBankAccountById(999)).thenReturn(null);

            BankAccount result = bankAccountService.getBankAccountById(999);

            assertThat(result).isNull();
            verify(bankAccountDao, times(1)).getBankAccountById(999);
        }

        @Test
        @DisplayName("Should handle zero ID")
        void shouldHandleZeroId() {
            when(bankAccountDao.getBankAccountById(0)).thenReturn(null);

            BankAccount result = bankAccountService.getBankAccountById(0);

            verify(bankAccountDao, times(1)).getBankAccountById(0);
        }

        @Test
        @DisplayName("Should handle negative ID")
        void shouldHandleNegativeId() {
            when(bankAccountDao.getBankAccountById(-1)).thenReturn(null);

            BankAccount result = bankAccountService.getBankAccountById(-1);

            verify(bankAccountDao, times(1)).getBankAccountById(-1);
        }
    }

    @Nested
    @DisplayName("deleteByIds() Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete bank accounts by IDs")
        void shouldDeleteBankAccountsByIds() {
            List<Integer> idsToDelete = Arrays.asList(1, 2, 3);
            doNothing().when(bankAccountDao).deleteByIds(idsToDelete);

            bankAccountService.deleteByIds(idsToDelete);

            verify(bankAccountDao, times(1)).deleteByIds(idsToDelete);
        }

        @Test
        @DisplayName("Should handle single ID deletion")
        void shouldHandleSingleIdDeletion() {
            List<Integer> singleId = Collections.singletonList(bankAccountId);
            doNothing().when(bankAccountDao).deleteByIds(singleId);

            bankAccountService.deleteByIds(singleId);

            verify(bankAccountDao, times(1)).deleteByIds(singleId);
        }

        @Test
        @DisplayName("Should handle empty ID list")
        void shouldHandleEmptyIdList() {
            List<Integer> emptyList = Collections.emptyList();
            doNothing().when(bankAccountDao).deleteByIds(emptyList);

            bankAccountService.deleteByIds(emptyList);

            verify(bankAccountDao, times(1)).deleteByIds(emptyList);
        }

        @Test
        @DisplayName("Should delete multiple bank accounts")
        void shouldDeleteMultipleBankAccounts() {
            List<Integer> manyIds = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
            doNothing().when(bankAccountDao).deleteByIds(manyIds);

            bankAccountService.deleteByIds(manyIds);

            verify(bankAccountDao, times(1)).deleteByIds(manyIds);
        }
    }

    @Nested
    @DisplayName("getBankAccounts() with Filter Tests")
    class GetBankAccountsWithFilterTests {

        @Test
        @DisplayName("Should get bank accounts with filter and pagination")
        void shouldGetBankAccountsWithFilterAndPagination() {
            Map<BankAccounrFilterEnum, Object> filterMap = new HashMap<>();
            filterMap.put(BankAccounrFilterEnum.BANK_ACCOUNT_ID, 1);
            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNumber(1);
            paginationModel.setRecordPerPage(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            expectedResponse.setRecords(Arrays.asList(testBankAccount));
            expectedResponse.setTotalRecords(1L);

            when(bankAccountDao.getBankAccounts(filterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = bankAccountService.getBankAccounts(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getTotalRecords()).isEqualTo(1L);
            verify(bankAccountDao, times(1)).getBankAccounts(filterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle empty filter map")
        void shouldHandleEmptyFilterMap() {
            Map<BankAccounrFilterEnum, Object> emptyFilterMap = new HashMap<>();
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(bankAccountDao.getBankAccounts(emptyFilterMap, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = bankAccountService.getBankAccounts(emptyFilterMap, paginationModel);

            assertThat(result).isNotNull();
            verify(bankAccountDao, times(1)).getBankAccounts(emptyFilterMap, paginationModel);
        }

        @Test
        @DisplayName("Should handle null filter map")
        void shouldHandleNullFilterMap() {
            PaginationModel paginationModel = new PaginationModel();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(bankAccountDao.getBankAccounts(null, paginationModel))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = bankAccountService.getBankAccounts(null, paginationModel);

            assertThat(result).isNotNull();
            verify(bankAccountDao, times(1)).getBankAccounts(null, paginationModel);
        }

        @Test
        @DisplayName("Should handle null pagination model")
        void shouldHandleNullPaginationModel() {
            Map<BankAccounrFilterEnum, Object> filterMap = new HashMap<>();

            PaginationResponseModel expectedResponse = new PaginationResponseModel();
            when(bankAccountDao.getBankAccounts(filterMap, null))
                    .thenReturn(expectedResponse);

            PaginationResponseModel result = bankAccountService.getBankAccounts(filterMap, null);

            assertThat(result).isNotNull();
            verify(bankAccountDao, times(1)).getBankAccounts(filterMap, null);
        }
    }

    @Nested
    @DisplayName("getBankBalanceList() Tests")
    class GetBankBalanceListTests {

        @Test
        @DisplayName("Should get bank balance list with data")
        void shouldGetBankBalanceListWithData() {
            Map<Object, Number> inflow = new HashMap<>();
            inflow.put("Jan", 5000);
            inflow.put("Feb", 6000);
            inflow.put("Mar", 7000);

            Map<Object, Number> outflow = new HashMap<>();
            outflow.put("Jan", 3000);
            outflow.put("Feb", 4000);
            outflow.put("Mar", 5000);

            testBankAccount.setCurrentBalance(new BigDecimal("15000.00"));
            testBankAccount.setLastUpdateDate(LocalDateTime.now());

            when(dateFormatUtil.getLocalDateTimeAsString(any(LocalDateTime.class), eq("dd-MM-yyyy")))
                    .thenReturn("05-12-2025");

            DashBoardBankDataModel result = bankAccountService.getBankBalanceList(testBankAccount, inflow, outflow);

            assertThat(result).isNotNull();
            assertThat(result.getData()).hasSize(3);
            assertThat(result.getBalance()).isEqualTo(new BigDecimal("15000.00"));
            assertThat(result.getAccount_name()).isEqualTo("Test Bank Account");
            assertThat(result.getUpdatedDate()).isEqualTo("05-12-2025");
            assertThat(result.getLabels()).hasSize(3);
        }

        @Test
        @DisplayName("Should handle empty inflow and outflow")
        void shouldHandleEmptyInflowAndOutflow() {
            Map<Object, Number> emptyInflow = new HashMap<>();
            Map<Object, Number> emptyOutflow = new HashMap<>();

            DashBoardBankDataModel result = bankAccountService.getBankBalanceList(
                    testBankAccount, emptyInflow, emptyOutflow);

            assertThat(result).isNotNull();
            assertThat(result.getData()).isEmpty();
            assertThat(result.getLabels()).isEmpty();
        }

        @Test
        @DisplayName("Should handle null last update date")
        void shouldHandleNullLastUpdateDate() {
            testBankAccount.setLastUpdateDate(null);
            Map<Object, Number> inflow = new HashMap<>();
            Map<Object, Number> outflow = new HashMap<>();

            DashBoardBankDataModel result = bankAccountService.getBankBalanceList(
                    testBankAccount, inflow, outflow);

            assertThat(result).isNotNull();
            assertThat(result.getUpdatedDate()).isNull();
        }

        @Test
        @DisplayName("Should calculate correct balance differences")
        void shouldCalculateCorrectBalanceDifferences() {
            Map<Object, Number> inflow = new HashMap<>();
            inflow.put("Jan", 10000);
            Map<Object, Number> outflow = new HashMap<>();
            outflow.put("Jan", 3000);

            DashBoardBankDataModel result = bankAccountService.getBankBalanceList(
                    testBankAccount, inflow, outflow);

            assertThat(result).isNotNull();
            assertThat(result.getData()).hasSize(1);
            assertThat(result.getData().get(0).doubleValue()).isEqualTo(7000.0);
        }

        @Test
        @DisplayName("Should handle negative balance")
        void shouldHandleNegativeBalance() {
            Map<Object, Number> inflow = new HashMap<>();
            inflow.put("Jan", 1000);
            Map<Object, Number> outflow = new HashMap<>();
            outflow.put("Jan", 5000);

            DashBoardBankDataModel result = bankAccountService.getBankBalanceList(
                    testBankAccount, inflow, outflow);

            assertThat(result).isNotNull();
            assertThat(result.getData().get(0).doubleValue()).isEqualTo(-4000.0);
        }
    }

    @Nested
    @DisplayName("getAllBankAccountsTotalBalance() Tests")
    class GetAllBankAccountsTotalBalanceTests {

        @Test
        @DisplayName("Should get total balance of all bank accounts")
        void shouldGetTotalBalanceOfAllBankAccounts() {
            BigDecimal expectedTotal = new BigDecimal("50000.00");
            when(bankAccountDao.getAllBankAccountsTotalBalance()).thenReturn(expectedTotal);

            BigDecimal result = bankAccountService.getAllBankAccountsTotalBalance();

            assertThat(result).isNotNull();
            assertThat(result).isEqualByComparingTo(expectedTotal);
            verify(bankAccountDao, times(1)).getAllBankAccountsTotalBalance();
        }

        @Test
        @DisplayName("Should return zero when no accounts exist")
        void shouldReturnZeroWhenNoAccountsExist() {
            when(bankAccountDao.getAllBankAccountsTotalBalance()).thenReturn(BigDecimal.ZERO);

            BigDecimal result = bankAccountService.getAllBankAccountsTotalBalance();

            assertThat(result).isNotNull();
            assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle null total balance")
        void shouldHandleNullTotalBalance() {
            when(bankAccountDao.getAllBankAccountsTotalBalance()).thenReturn(null);

            BigDecimal result = bankAccountService.getAllBankAccountsTotalBalance();

            assertThat(result).isNull();
        }

        @Test
        @DisplayName("Should handle large total balance")
        void shouldHandleLargeTotalBalance() {
            BigDecimal largeBalance = new BigDecimal("999999999.99");
            when(bankAccountDao.getAllBankAccountsTotalBalance()).thenReturn(largeBalance);

            BigDecimal result = bankAccountService.getAllBankAccountsTotalBalance();

            assertThat(result).isEqualByComparingTo(largeBalance);
        }

        @Test
        @DisplayName("Should handle negative total balance")
        void shouldHandleNegativeTotalBalance() {
            BigDecimal negativeBalance = new BigDecimal("-5000.00");
            when(bankAccountDao.getAllBankAccountsTotalBalance()).thenReturn(negativeBalance);

            BigDecimal result = bankAccountService.getAllBankAccountsTotalBalance();

            assertThat(result).isEqualByComparingTo(negativeBalance);
        }
    }

    @Nested
    @DisplayName("getBankNameList() Tests")
    class GetBankNameListTests {

        @Test
        @DisplayName("Should get list of bank names")
        void shouldGetListOfBankNames() {
            List<BankDetails> expectedBankDetails = Arrays.asList(
                    createTestBankDetails(1, "Bank A"),
                    createTestBankDetails(2, "Bank B"),
                    createTestBankDetails(3, "Bank C")
            );

            when(bankDetailsRepository.findAll()).thenReturn(expectedBankDetails);

            List<BankDetails> result = bankAccountService.getBankNameList();

            assertThat(result).isNotNull();
            assertThat(result).hasSize(3);
            assertThat(result).containsExactlyElementsOf(expectedBankDetails);
            verify(bankDetailsRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no bank details exist")
        void shouldReturnEmptyListWhenNoBankDetailsExist() {
            when(bankDetailsRepository.findAll()).thenReturn(Collections.emptyList());

            List<BankDetails> result = bankAccountService.getBankNameList();

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should handle single bank detail")
        void shouldHandleSingleBankDetail() {
            List<BankDetails> singleBank = Collections.singletonList(
                    createTestBankDetails(1, "Single Bank")
            );
            when(bankDetailsRepository.findAll()).thenReturn(singleBank);

            List<BankDetails> result = bankAccountService.getBankNameList();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getBankName()).isEqualTo("Single Bank");
        }
    }

    @Nested
    @DisplayName("Service Behavior Tests")
    class ServiceBehaviorTests {

        @Test
        @DisplayName("Should be annotated with @Service")
        void shouldBeAnnotatedWithService() {
            assertThat(bankAccountService.getClass().isAnnotationPresent(
                    org.springframework.stereotype.Service.class)).isTrue();
        }

        @Test
        @DisplayName("Should have correct service name")
        void shouldHaveCorrectServiceName() {
            org.springframework.stereotype.Service annotation =
                    bankAccountService.getClass().getAnnotation(
                            org.springframework.stereotype.Service.class);
            assertThat(annotation.value()).isEqualTo("bankAccountService");
        }

        @Test
        @DisplayName("Should be annotated with @Transactional")
        void shouldBeAnnotatedWithTransactional() {
            assertThat(bankAccountService.getClass().isAnnotationPresent(
                    org.springframework.transaction.annotation.Transactional.class)).isTrue();
        }

        @Test
        @DisplayName("Should extend BankAccountService")
        void shouldExtendBankAccountService() {
            assertThat(bankAccountService)
                    .isInstanceOf(com.simpleaccounts.service.BankAccountService.class);
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle bank account with zero balance")
        void shouldHandleBankAccountWithZeroBalance() {
            testBankAccount.setCurrentBalance(BigDecimal.ZERO);
            when(bankAccountDao.getBankAccountById(bankAccountId)).thenReturn(testBankAccount);

            BankAccount result = bankAccountService.getBankAccountById(bankAccountId);

            assertThat(result.getCurrentBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Should handle bank account with negative balance")
        void shouldHandleBankAccountWithNegativeBalance() {
            testBankAccount.setCurrentBalance(new BigDecimal("-1000.00"));
            when(bankAccountDao.getBankAccountById(bankAccountId)).thenReturn(testBankAccount);

            BankAccount result = bankAccountService.getBankAccountById(bankAccountId);

            assertThat(result.getCurrentBalance()).isNegative();
        }

        @Test
        @DisplayName("Should handle very large account number")
        void shouldHandleVeryLargeAccountNumber() {
            testBankAccount.setAccountNumber("99999999999999999999");
            when(bankAccountDao.getBankAccountById(bankAccountId)).thenReturn(testBankAccount);

            BankAccount result = bankAccountService.getBankAccountById(bankAccountId);

            assertThat(result.getAccountNumber()).hasSize(20);
        }

        @Test
        @DisplayName("Should handle bank account with special characters in name")
        void shouldHandleBankAccountWithSpecialCharactersInName() {
            testBankAccount.setBankAccountName("Test & Account <Special>");
            when(bankAccountDao.getBankAccountById(bankAccountId)).thenReturn(testBankAccount);

            BankAccount result = bankAccountService.getBankAccountById(bankAccountId);

            assertThat(result.getBankAccountName()).contains("&", "<", ">");
        }
    }
}
