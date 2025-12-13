package com.simpleaccounts.service.impl.bankaccount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.criteria.bankaccount.ChartOfAccountCriteria;
import com.simpleaccounts.criteria.bankaccount.ChartOfAccountFilter;
import com.simpleaccounts.dao.bankaccount.ChartOfAccountDao;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ChartOfAccountImplTest {

    @Mock
    private ChartOfAccountDao chartOfAccountDao;

    @InjectMocks
    private ChartOfAccountImpl chartOfAccountService;

    private ChartOfAccount testChartOfAccount;
    private ChartOfAccountCriteria testCriteria;

    @BeforeEach
    void setUp() {
        testChartOfAccount = new ChartOfAccount();
        testChartOfAccount.setChartOfAccountId(1);
        testChartOfAccount.setChartOfAccountName("Test Account");
        testChartOfAccount.setChartOfAccountCode("1001");
        testChartOfAccount.setChartOfAccountDescription("Test Description");
        testChartOfAccount.setDebitCreditFlag('D');
        testChartOfAccount.setDefaltFlag('Y');
        testChartOfAccount.setOrderSequence(1);
        testChartOfAccount.setDeleteFlag(false);
        testChartOfAccount.setCreatedBy(1);
        testChartOfAccount.setCreatedDate(LocalDateTime.now());

        testCriteria = new ChartOfAccountCriteria();
        testCriteria.setChartOfAccountId(1);
        testCriteria.setActive(true);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnChartOfAccountDaoWhenGetDaoCalled() {
        assertThat(chartOfAccountService.getDao()).isEqualTo(chartOfAccountDao);
    }

    // ========== getChartOfAccountByCriteria Tests ==========

    @Test
    void shouldReturnChartOfAccountListWhenValidCriteriaProvided() {
        List<ChartOfAccount> expectedList = Arrays.asList(testChartOfAccount);
        when(chartOfAccountDao.filter(any(ChartOfAccountFilter.class))).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.getChartOfAccountByCriteria(testCriteria);

        assertThat(result).isNotNull().hasSize(1).containsExactly(testChartOfAccount);
        verify(chartOfAccountDao, times(1)).filter(any(ChartOfAccountFilter.class));
    }

    @Test
    void shouldReturnEmptyListWhenNoCriteriaMatches() {
        when(chartOfAccountDao.filter(any(ChartOfAccountFilter.class))).thenReturn(Collections.emptyList());

        List<ChartOfAccount> result = chartOfAccountService.getChartOfAccountByCriteria(testCriteria);

        assertThat(result).isNotNull().isEmpty();
        verify(chartOfAccountDao, times(1)).filter(any(ChartOfAccountFilter.class));
    }

    @Test
    void shouldReturnMultipleChartOfAccountsWhenMultipleMatch() {
        ChartOfAccount account2 = new ChartOfAccount();
        account2.setChartOfAccountId(2);
        account2.setChartOfAccountName("Second Account");
        account2.setChartOfAccountCode("1002");

        ChartOfAccount account3 = new ChartOfAccount();
        account3.setChartOfAccountId(3);
        account3.setChartOfAccountName("Third Account");
        account3.setChartOfAccountCode("1003");

        List<ChartOfAccount> expectedList = Arrays.asList(testChartOfAccount, account2, account3);
        when(chartOfAccountDao.filter(any(ChartOfAccountFilter.class))).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.getChartOfAccountByCriteria(testCriteria);

        assertThat(result).isNotNull().hasSize(3).containsExactly(testChartOfAccount, account2, account3);
        verify(chartOfAccountDao, times(1)).filter(any(ChartOfAccountFilter.class));
    }

    @Test
    void shouldHandleNullCriteriaGracefully() {
        when(chartOfAccountDao.filter(any(ChartOfAccountFilter.class))).thenReturn(Collections.emptyList());

        List<ChartOfAccount> result = chartOfAccountService.getChartOfAccountByCriteria(null);

        assertThat(result).isNotNull();
        verify(chartOfAccountDao, times(1)).filter(any(ChartOfAccountFilter.class));
    }

    @Test
    void shouldFilterByActiveStatus() {
        testCriteria.setActive(true);
        List<ChartOfAccount> expectedList = Arrays.asList(testChartOfAccount);
        when(chartOfAccountDao.filter(any(ChartOfAccountFilter.class))).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.getChartOfAccountByCriteria(testCriteria);

        assertThat(result).isNotNull().hasSize(1);
        verify(chartOfAccountDao, times(1)).filter(any(ChartOfAccountFilter.class));
    }

    // ========== updateOrCreateChartOfAccount Tests ==========

    @Test
    void shouldUpdateExistingChartOfAccount() {
        testChartOfAccount.setChartOfAccountName("Updated Account");
        when(chartOfAccountDao.updateOrCreateTransaction(testChartOfAccount)).thenReturn(testChartOfAccount);

        ChartOfAccount result = chartOfAccountService.updateOrCreateChartOfAccount(testChartOfAccount);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountName()).isEqualTo("Updated Account");
        verify(chartOfAccountDao, times(1)).updateOrCreateTransaction(testChartOfAccount);
    }

    @Test
    void shouldCreateNewChartOfAccount() {
        ChartOfAccount newAccount = new ChartOfAccount();
        newAccount.setChartOfAccountName("New Account");
        newAccount.setChartOfAccountCode("2001");
        newAccount.setDebitCreditFlag('C');
        newAccount.setDefaltFlag('N');

        when(chartOfAccountDao.updateOrCreateTransaction(newAccount)).thenReturn(newAccount);

        ChartOfAccount result = chartOfAccountService.updateOrCreateChartOfAccount(newAccount);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountName()).isEqualTo("New Account");
        assertThat(result.getChartOfAccountCode()).isEqualTo("2001");
        verify(chartOfAccountDao, times(1)).updateOrCreateTransaction(newAccount);
    }

    @Test
    void shouldHandleUpdateWithParentChartOfAccount() {
        ChartOfAccount parent = new ChartOfAccount();
        parent.setChartOfAccountId(100);
        parent.setChartOfAccountName("Parent Account");

        testChartOfAccount.setParentChartOfAccount(parent);
        when(chartOfAccountDao.updateOrCreateTransaction(testChartOfAccount)).thenReturn(testChartOfAccount);

        ChartOfAccount result = chartOfAccountService.updateOrCreateChartOfAccount(testChartOfAccount);

        assertThat(result).isNotNull();
        assertThat(result.getParentChartOfAccount()).isNotNull();
        assertThat(result.getParentChartOfAccount().getChartOfAccountId()).isEqualTo(100);
        verify(chartOfAccountDao, times(1)).updateOrCreateTransaction(testChartOfAccount);
    }

    @Test
    void shouldUpdateChartOfAccountWithAllFields() {
        testChartOfAccount.setChartOfAccountName("Complete Update");
        testChartOfAccount.setChartOfAccountDescription("Complete Description");
        testChartOfAccount.setOrderSequence(5);
        testChartOfAccount.setDefaltFlag('N');

        when(chartOfAccountDao.updateOrCreateTransaction(testChartOfAccount)).thenReturn(testChartOfAccount);

        ChartOfAccount result = chartOfAccountService.updateOrCreateChartOfAccount(testChartOfAccount);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountName()).isEqualTo("Complete Update");
        assertThat(result.getOrderSequence()).isEqualTo(5);
        verify(chartOfAccountDao, times(1)).updateOrCreateTransaction(testChartOfAccount);
    }

    @Test
    void shouldHandleNullChartOfAccountUpdate() {
        when(chartOfAccountDao.updateOrCreateTransaction(null)).thenReturn(null);

        ChartOfAccount result = chartOfAccountService.updateOrCreateChartOfAccount(null);

        assertThat(result).isNull();
        verify(chartOfAccountDao, times(1)).updateOrCreateTransaction(null);
    }

    // ========== getChartOfAccount Tests ==========

    @Test
    void shouldReturnChartOfAccountWhenValidIdProvided() {
        when(chartOfAccountDao.getChartOfAccount(1)).thenReturn(testChartOfAccount);

        ChartOfAccount result = chartOfAccountService.getChartOfAccount(1);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountId()).isEqualTo(1);
        assertThat(result.getChartOfAccountName()).isEqualTo("Test Account");
        verify(chartOfAccountDao, times(1)).getChartOfAccount(1);
    }

    @Test
    void shouldReturnNullWhenChartOfAccountNotFound() {
        when(chartOfAccountDao.getChartOfAccount(999)).thenReturn(null);

        ChartOfAccount result = chartOfAccountService.getChartOfAccount(999);

        assertThat(result).isNull();
        verify(chartOfAccountDao, times(1)).getChartOfAccount(999);
    }

    @Test
    void shouldHandleNullIdInGetChartOfAccount() {
        when(chartOfAccountDao.getChartOfAccount(null)).thenReturn(null);

        ChartOfAccount result = chartOfAccountService.getChartOfAccount(null);

        assertThat(result).isNull();
        verify(chartOfAccountDao, times(1)).getChartOfAccount(null);
    }

    @Test
    void shouldRetrieveDifferentChartOfAccounts() {
        ChartOfAccount account2 = new ChartOfAccount();
        account2.setChartOfAccountId(2);
        account2.setChartOfAccountName("Different Account");

        when(chartOfAccountDao.getChartOfAccount(1)).thenReturn(testChartOfAccount);
        when(chartOfAccountDao.getChartOfAccount(2)).thenReturn(account2);

        ChartOfAccount result1 = chartOfAccountService.getChartOfAccount(1);
        ChartOfAccount result2 = chartOfAccountService.getChartOfAccount(2);

        assertThat(result1).isNotNull();
        assertThat(result1.getChartOfAccountId()).isEqualTo(1);
        assertThat(result2).isNotNull();
        assertThat(result2.getChartOfAccountId()).isEqualTo(2);
        verify(chartOfAccountDao, times(1)).getChartOfAccount(1);
        verify(chartOfAccountDao, times(1)).getChartOfAccount(2);
    }

    // ========== findAll Tests ==========

    @Test
    void shouldReturnAllChartOfAccounts() {
        ChartOfAccount account2 = new ChartOfAccount();
        account2.setChartOfAccountId(2);
        account2.setChartOfAccountName("Second Account");

        List<ChartOfAccount> expectedList = Arrays.asList(testChartOfAccount, account2);
        when(chartOfAccountDao.findAll()).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.findAll();

        assertThat(result).isNotNull().hasSize(2).containsExactly(testChartOfAccount, account2);
        verify(chartOfAccountDao, times(1)).findAll();
    }

    @Test
    void shouldReturnEmptyListWhenNoChartOfAccountsExist() {
        when(chartOfAccountDao.findAll()).thenReturn(Collections.emptyList());

        List<ChartOfAccount> result = chartOfAccountService.findAll();

        assertThat(result).isNotNull().isEmpty();
        verify(chartOfAccountDao, times(1)).findAll();
    }

    @Test
    void shouldReturnSingleChartOfAccount() {
        List<ChartOfAccount> expectedList = Collections.singletonList(testChartOfAccount);
        when(chartOfAccountDao.findAll()).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.findAll();

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getChartOfAccountId()).isEqualTo(1);
        verify(chartOfAccountDao, times(1)).findAll();
    }

    @Test
    void shouldHandleLargeNumberOfChartOfAccounts() {
        List<ChartOfAccount> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ChartOfAccount account = new ChartOfAccount();
            account.setChartOfAccountId(i);
            account.setChartOfAccountName("Account " + i);
            largeList.add(account);
        }

        when(chartOfAccountDao.findAll()).thenReturn(largeList);

        List<ChartOfAccount> result = chartOfAccountService.findAll();

        assertThat(result).isNotNull().hasSize(100);
        assertThat(result.get(0).getChartOfAccountId()).isEqualTo(1);
        assertThat(result.get(99).getChartOfAccountId()).isEqualTo(100);
        verify(chartOfAccountDao, times(1)).findAll();
    }

    // ========== findByText Tests ==========

    @Test
    void shouldReturnChartOfAccountsMatchingText() {
        List<ChartOfAccount> expectedList = Arrays.asList(testChartOfAccount);
        when(chartOfAccountDao.findByText("Test")).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.findByText("Test");

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getChartOfAccountName()).contains("Test");
        verify(chartOfAccountDao, times(1)).findByText("Test");
    }

    @Test
    void shouldReturnEmptyListWhenNoTextMatches() {
        when(chartOfAccountDao.findByText("NonExistent")).thenReturn(Collections.emptyList());

        List<ChartOfAccount> result = chartOfAccountService.findByText("NonExistent");

        assertThat(result).isNotNull().isEmpty();
        verify(chartOfAccountDao, times(1)).findByText("NonExistent");
    }

    @Test
    void shouldHandleNullTextSearch() {
        when(chartOfAccountDao.findByText(null)).thenReturn(Collections.emptyList());

        List<ChartOfAccount> result = chartOfAccountService.findByText(null);

        assertThat(result).isNotNull();
        verify(chartOfAccountDao, times(1)).findByText(null);
    }

    @Test
    void shouldHandleEmptyTextSearch() {
        when(chartOfAccountDao.findByText("")).thenReturn(Collections.emptyList());

        List<ChartOfAccount> result = chartOfAccountService.findByText("");

        assertThat(result).isNotNull();
        verify(chartOfAccountDao, times(1)).findByText("");
    }

    @Test
    void shouldReturnMultipleAccountsMatchingText() {
        ChartOfAccount account2 = new ChartOfAccount();
        account2.setChartOfAccountId(2);
        account2.setChartOfAccountName("Test Account 2");

        ChartOfAccount account3 = new ChartOfAccount();
        account3.setChartOfAccountId(3);
        account3.setChartOfAccountName("Test Account 3");

        List<ChartOfAccount> expectedList = Arrays.asList(testChartOfAccount, account2, account3);
        when(chartOfAccountDao.findByText("Test")).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.findByText("Test");

        assertThat(result).isNotNull().hasSize(3);
        verify(chartOfAccountDao, times(1)).findByText("Test");
    }

    // ========== getDefaultChartOfAccount Tests ==========

    @Test
    void shouldReturnDefaultChartOfAccount() {
        testChartOfAccount.setDefaltFlag('Y');
        when(chartOfAccountDao.getDefaultChartOfAccount()).thenReturn(testChartOfAccount);

        ChartOfAccount result = chartOfAccountService.getDefaultChartOfAccount();

        assertThat(result).isNotNull();
        assertThat(result.getDefaltFlag()).isEqualTo('Y');
        assertThat(result.getChartOfAccountId()).isEqualTo(1);
        verify(chartOfAccountDao, times(1)).getDefaultChartOfAccount();
    }

    @Test
    void shouldReturnNullWhenNoDefaultChartOfAccount() {
        when(chartOfAccountDao.getDefaultChartOfAccount()).thenReturn(null);

        ChartOfAccount result = chartOfAccountService.getDefaultChartOfAccount();

        assertThat(result).isNull();
        verify(chartOfAccountDao, times(1)).getDefaultChartOfAccount();
    }

    @Test
    void shouldVerifyDefaultFlagIsSet() {
        testChartOfAccount.setDefaltFlag('Y');
        when(chartOfAccountDao.getDefaultChartOfAccount()).thenReturn(testChartOfAccount);

        ChartOfAccount result = chartOfAccountService.getDefaultChartOfAccount();

        assertThat(result).isNotNull();
        assertThat(result.getDefaltFlag()).isEqualTo('Y');
        verify(chartOfAccountDao, times(1)).getDefaultChartOfAccount();
    }

    // ========== findAllChild Tests ==========

    @Test
    void shouldReturnAllChildChartOfAccounts() {
        ChartOfAccount parent = new ChartOfAccount();
        parent.setChartOfAccountId(100);
        parent.setChartOfAccountName("Parent Account");

        ChartOfAccount child1 = new ChartOfAccount();
        child1.setChartOfAccountId(2);
        child1.setChartOfAccountName("Child Account 1");
        child1.setParentChartOfAccount(parent);

        ChartOfAccount child2 = new ChartOfAccount();
        child2.setChartOfAccountId(3);
        child2.setChartOfAccountName("Child Account 2");
        child2.setParentChartOfAccount(parent);

        List<ChartOfAccount> expectedList = Arrays.asList(child1, child2);
        when(chartOfAccountDao.findAllChild()).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.findAllChild();

        assertThat(result).isNotNull().hasSize(2).containsExactly(child1, child2);
        verify(chartOfAccountDao, times(1)).findAllChild();
    }

    @Test
    void shouldReturnEmptyListWhenNoChildAccountsExist() {
        when(chartOfAccountDao.findAllChild()).thenReturn(Collections.emptyList());

        List<ChartOfAccount> result = chartOfAccountService.findAllChild();

        assertThat(result).isNotNull().isEmpty();
        verify(chartOfAccountDao, times(1)).findAllChild();
    }

    @Test
    void shouldReturnSingleChildChartOfAccount() {
        ChartOfAccount parent = new ChartOfAccount();
        parent.setChartOfAccountId(100);
        parent.setChartOfAccountName("Parent Account");

        ChartOfAccount child = new ChartOfAccount();
        child.setChartOfAccountId(2);
        child.setChartOfAccountName("Child Account");
        child.setParentChartOfAccount(parent);

        List<ChartOfAccount> expectedList = Collections.singletonList(child);
        when(chartOfAccountDao.findAllChild()).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.findAllChild();

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getParentChartOfAccount()).isNotNull();
        verify(chartOfAccountDao, times(1)).findAllChild();
    }

    @Test
    void shouldVerifyChildAccountsHaveParent() {
        ChartOfAccount parent = new ChartOfAccount();
        parent.setChartOfAccountId(100);

        ChartOfAccount child = new ChartOfAccount();
        child.setChartOfAccountId(2);
        child.setParentChartOfAccount(parent);

        List<ChartOfAccount> expectedList = Collections.singletonList(child);
        when(chartOfAccountDao.findAllChild()).thenReturn(expectedList);

        List<ChartOfAccount> result = chartOfAccountService.findAllChild();

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).getParentChartOfAccount()).isNotNull();
        assertThat(result.get(0).getParentChartOfAccount().getChartOfAccountId()).isEqualTo(100);
        verify(chartOfAccountDao, times(1)).findAllChild();
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleChartOfAccountWithMinimalData() {
        ChartOfAccount minimalAccount = new ChartOfAccount();
        minimalAccount.setChartOfAccountId(999);
        minimalAccount.setChartOfAccountName("Minimal");
        minimalAccount.setChartOfAccountCode("9999");
        minimalAccount.setDebitCreditFlag('D');

        when(chartOfAccountDao.getChartOfAccount(999)).thenReturn(minimalAccount);

        ChartOfAccount result = chartOfAccountService.getChartOfAccount(999);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountId()).isEqualTo(999);
        assertThat(result.getChartOfAccountName()).isEqualTo("Minimal");
        verify(chartOfAccountDao, times(1)).getChartOfAccount(999);
    }

    @Test
    void shouldHandleChartOfAccountWithSpecialCharacters() {
        testChartOfAccount.setChartOfAccountName("Test & Special @ Account");
        testChartOfAccount.setChartOfAccountDescription("Description with <special> characters!");

        when(chartOfAccountDao.updateOrCreateTransaction(testChartOfAccount)).thenReturn(testChartOfAccount);

        ChartOfAccount result = chartOfAccountService.updateOrCreateChartOfAccount(testChartOfAccount);

        assertThat(result).isNotNull();
        assertThat(result.getChartOfAccountName()).contains("&");
        assertThat(result.getChartOfAccountDescription()).contains("<special>");
        verify(chartOfAccountDao, times(1)).updateOrCreateTransaction(testChartOfAccount);
    }

    @Test
    void shouldHandleMultipleCallsToGetDao() {
        assertThat(chartOfAccountService.getDao()).isEqualTo(chartOfAccountDao);
        assertThat(chartOfAccountService.getDao()).isEqualTo(chartOfAccountDao);
        assertThat(chartOfAccountService.getDao()).isEqualTo(chartOfAccountDao);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleFindAllCalls() {
        List<ChartOfAccount> expectedList = Arrays.asList(testChartOfAccount);
        when(chartOfAccountDao.findAll()).thenReturn(expectedList);

        chartOfAccountService.findAll();
        chartOfAccountService.findAll();

        verify(chartOfAccountDao, times(2)).findAll();
    }
}
