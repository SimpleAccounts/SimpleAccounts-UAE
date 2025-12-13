package com.simpleaccounts.service.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.dao.bankaccount.BankAccountDao;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.BankDetails;
import com.simpleaccounts.entity.bankaccount.BankDetailsRepository;
import com.simpleaccounts.model.DashBoardBankDataModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
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

    @BeforeEach
    void setUp() {
        testBankAccount = new BankAccount();
        testBankAccount.setBankAccountId(1);
        testBankAccount.setBankAccountName("Test Account");
        testBankAccount.setAccountNumber("1234567890");
        testBankAccount.setBankName("Test Bank");
        testBankAccount.setCurrentBalance(new BigDecimal("1000.00"));
        testBankAccount.setOpeningBalance(new BigDecimal("500.00"));
        testBankAccount.setOpeningDate(LocalDateTime.now().minusMonths(1));
        testBankAccount.setCreatedBy(1);
        testBankAccount.setCreatedDate(LocalDateTime.now().minusMonths(1));
    }

    @Nested
    @DisplayName("getBankAccounts Tests")
    class GetBankAccountsTests {

        @Test
        @DisplayName("Should return all bank accounts")
        void shouldReturnAllBankAccounts() {
            List<BankAccount> expectedAccounts = Arrays.asList(testBankAccount, createBankAccount(2, "Second Account"));
            when(bankAccountDao.getBankAccounts()).thenReturn(expectedAccounts);

            List<BankAccount> result = bankAccountService.getBankAccounts();

            assertThat(result).isNotNull().hasSize(2);
            verify(bankAccountDao).getBankAccounts();
        }

        @Test
        @DisplayName("Should return empty list when no bank accounts exist")
        void shouldReturnEmptyListWhenNoAccounts() {
            when(bankAccountDao.getBankAccounts()).thenReturn(Collections.emptyList());

            List<BankAccount> result = bankAccountService.getBankAccounts();

            assertThat(result).isNotNull().isEmpty();
            verify(bankAccountDao).getBankAccounts();
        }
    }

    @Nested
    @DisplayName("getBankAccountByUser Tests")
    class GetBankAccountByUserTests {

        @Test
        @DisplayName("Should return bank accounts for specific user")
        void shouldReturnBankAccountsForUser() {
            int userId = 1;
            List<BankAccount> userAccounts = Collections.singletonList(testBankAccount);
            when(bankAccountDao.getBankAccountByUser(userId)).thenReturn(userAccounts);

            List<BankAccount> result = bankAccountService.getBankAccountByUser(userId);

            assertThat(result).isNotNull().hasSize(1);
            assertThat(result.get(0).getBankAccountId()).isEqualTo(testBankAccount.getBankAccountId());
            verify(bankAccountDao).getBankAccountByUser(userId);
        }

        @Test
        @DisplayName("Should return empty list when user has no accounts")
        void shouldReturnEmptyListWhenUserHasNoAccounts() {
            int userId = 999;
            when(bankAccountDao.getBankAccountByUser(userId)).thenReturn(Collections.emptyList());

            List<BankAccount> result = bankAccountService.getBankAccountByUser(userId);

            assertThat(result).isNotNull().isEmpty();
            verify(bankAccountDao).getBankAccountByUser(userId);
        }
    }

    @Nested
    @DisplayName("getBankAccountById Tests")
    class GetBankAccountByIdTests {

        @Test
        @DisplayName("Should return bank account by id")
        void shouldReturnBankAccountById() {
            when(bankAccountDao.getBankAccountById(1)).thenReturn(testBankAccount);

            BankAccount result = bankAccountService.getBankAccountById(1);

            assertThat(result).isNotNull();
            assertThat(result.getBankAccountId()).isEqualTo(1);
            verify(bankAccountDao).getBankAccountById(1);
        }

        @Test
        @DisplayName("Should return null when bank account not found")
        void shouldReturnNullWhenNotFound() {
            when(bankAccountDao.getBankAccountById(999)).thenReturn(null);

            BankAccount result = bankAccountService.getBankAccountById(999);

            assertThat(result).isNull();
            verify(bankAccountDao).getBankAccountById(999);
        }
    }

    @Nested
    @DisplayName("deleteByIds Tests")
    class DeleteByIdsTests {

        @Test
        @DisplayName("Should delete bank accounts by ids")
        void shouldDeleteBankAccountsByIds() {
            List<Integer> ids = Arrays.asList(1, 2, 3);

            bankAccountService.deleteByIds(ids);

            verify(bankAccountDao).deleteByIds(ids);
        }

        @Test
        @DisplayName("Should handle empty list of ids")
        void shouldHandleEmptyIdList() {
            List<Integer> ids = Collections.emptyList();

            bankAccountService.deleteByIds(ids);

            verify(bankAccountDao).deleteByIds(ids);
        }
    }

    @Nested
    @DisplayName("getBankAccounts with filters Tests")
    class GetBankAccountsWithFiltersTests {

        @Test
        @DisplayName("Should return filtered bank accounts")
        void shouldReturnFilteredBankAccounts() {
            Map<BankAccounrFilterEnum, Object> filterMap = new EnumMap<>(BankAccounrFilterEnum.class);
            filterMap.put(BankAccounrFilterEnum.DELETE_FLAG, false);

            PaginationModel paginationModel = new PaginationModel();
            paginationModel.setPageNo(0);
            paginationModel.setPageSize(10);

            PaginationResponseModel expectedResponse = new PaginationResponseModel(1, new HashMap<>());
            when(bankAccountDao.getBankAccounts(filterMap, paginationModel)).thenReturn(expectedResponse);

            PaginationResponseModel result = bankAccountService.getBankAccounts(filterMap, paginationModel);

            assertThat(result).isNotNull();
            assertThat(result.getCount()).isEqualTo(1);
            verify(bankAccountDao).getBankAccounts(filterMap, paginationModel);
        }
    }

    @Nested
    @DisplayName("getBankBalanceList Tests")
    class GetBankBalanceListTests {

        @Test
        @DisplayName("Should return dashboard bank data model")
        void shouldReturnDashboardBankDataModel() {
            testBankAccount.setLastUpdateDate(LocalDateTime.now());
            Map<Object, Number> inflow = new LinkedHashMap<>();
            inflow.put("Jan", 1000.0);
            inflow.put("Feb", 1500.0);

            Map<Object, Number> outflow = new LinkedHashMap<>();
            outflow.put("Jan", 500.0);
            outflow.put("Feb", 700.0);

            when(dateFormatUtil.getLocalDateTimeAsString(any(), any())).thenReturn("01-01-2024");

            DashBoardBankDataModel result = bankAccountService.getBankBalanceList(testBankAccount, inflow, outflow);

            assertThat(result).isNotNull();
            assertThat(result.getAccount_name()).isEqualTo("Test Account");
            assertThat(result.getBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
            assertThat(result.getData()).hasSize(2);
            assertThat(result.getLabels()).hasSize(2);
        }

        @Test
        @DisplayName("Should calculate correct net flow")
        void shouldCalculateCorrectNetFlow() {
            Map<Object, Number> inflow = new LinkedHashMap<>();
            inflow.put("Jan", 2000.0);

            Map<Object, Number> outflow = new LinkedHashMap<>();
            outflow.put("Jan", 500.0);

            DashBoardBankDataModel result = bankAccountService.getBankBalanceList(testBankAccount, inflow, outflow);

            assertThat(result.getData()).hasSize(1);
            assertThat(result.getData().get(0).doubleValue()).isEqualTo(1500.0);
        }

        @Test
        @DisplayName("Should handle null last update date")
        void shouldHandleNullLastUpdateDate() {
            testBankAccount.setLastUpdateDate(null);
            Map<Object, Number> inflow = new LinkedHashMap<>();
            inflow.put("Jan", 1000.0);

            Map<Object, Number> outflow = new LinkedHashMap<>();
            outflow.put("Jan", 500.0);

            DashBoardBankDataModel result = bankAccountService.getBankBalanceList(testBankAccount, inflow, outflow);

            assertThat(result.getUpdatedDate()).isNull();
        }
    }

    @Nested
    @DisplayName("getAllBankAccountsTotalBalance Tests")
    class GetAllBankAccountsTotalBalanceTests {

        @Test
        @DisplayName("Should return total balance of all bank accounts")
        void shouldReturnTotalBalance() {
            BigDecimal expectedTotal = new BigDecimal("5000.00");
            when(bankAccountDao.getAllBankAccountsTotalBalance()).thenReturn(expectedTotal);

            BigDecimal result = bankAccountService.getAllBankAccountsTotalBalance();

            assertThat(result).isEqualByComparingTo(expectedTotal);
            verify(bankAccountDao).getAllBankAccountsTotalBalance();
        }

        @Test
        @DisplayName("Should return null when no accounts exist")
        void shouldReturnNullWhenNoAccounts() {
            when(bankAccountDao.getAllBankAccountsTotalBalance()).thenReturn(null);

            BigDecimal result = bankAccountService.getAllBankAccountsTotalBalance();

            assertThat(result).isNull();
            verify(bankAccountDao).getAllBankAccountsTotalBalance();
        }
    }

    @Nested
    @DisplayName("getBankNameList Tests")
    class GetBankNameListTests {

        @Test
        @DisplayName("Should return list of bank details")
        void shouldReturnBankDetailsList() {
            BankDetails bankDetails1 = new BankDetails();
            bankDetails1.setBankName("Bank 1");
            BankDetails bankDetails2 = new BankDetails();
            bankDetails2.setBankName("Bank 2");

            List<BankDetails> expectedList = Arrays.asList(bankDetails1, bankDetails2);
            when(bankDetailsRepository.findAll()).thenReturn(expectedList);

            List<BankDetails> result = bankAccountService.getBankNameList();

            assertThat(result).isNotNull().hasSize(2);
            verify(bankDetailsRepository).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no bank details exist")
        void shouldReturnEmptyListWhenNoBankDetails() {
            when(bankDetailsRepository.findAll()).thenReturn(Collections.emptyList());

            List<BankDetails> result = bankAccountService.getBankNameList();

            assertThat(result).isNotNull().isEmpty();
            verify(bankDetailsRepository).findAll();
        }
    }

    @Nested
    @DisplayName("getDao Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return bank account dao")
        void shouldReturnBankAccountDao() {
            assertThat(bankAccountService.getDao()).isEqualTo(bankAccountDao);
        }
    }

    private BankAccount createBankAccount(Integer id, String name) {
        BankAccount account = new BankAccount();
        account.setBankAccountId(id);
        account.setBankAccountName(name);
        account.setCurrentBalance(BigDecimal.ZERO);
        return account;
    }
}
