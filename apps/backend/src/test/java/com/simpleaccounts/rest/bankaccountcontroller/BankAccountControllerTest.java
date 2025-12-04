package com.simpleaccounts.rest.bankaccountcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.BankAccountType;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.BankAccountStatusService;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.service.BankAccountTypeService;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import com.simpleaccounts.service.bankaccount.TransactionService;
import com.simpleaccounts.rest.bankaccountcontroller.BankAccountRestHelper;
import java.util.Date;
import java.util.EnumMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class BankAccountControllerTest {

    @Mock private BankAccountService bankAccountService;
    @Mock private JournalService journalService;
    @Mock private CoacTransactionCategoryService coacTransactionCategoryService;
    @Mock private TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;
    @Mock private TransactionCategoryBalanceService transactionCategoryBalanceService;
    @Mock private BankAccountStatusService bankAccountStatusService;
    @Mock(name = "userServiceNew") private UserService userServiceNew;
    @Mock private CurrencyService currencyService;
    @Mock private BankAccountTypeService bankAccountTypeService;
    @Mock private BankAccountRestHelper bankAccountRestHelper;
    @Mock private TransactionCategoryService transactionCategoryService;
    @Mock private ExpenseService expenseService;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private TransactionService transactionService;
    @Mock private CurrencyExchangeService currencyExchangeService;
    @Mock private UserService userService;

    @InjectMocks
    private BankAccountController controller;

    @Test
    void getBankAccountListShouldBuildFilterMapAndReturnResponse() {
        BankAccountFilterModel filterModel = new BankAccountFilterModel();
        filterModel.setBankName("Main Bank");
        filterModel.setBankAccountName("Operating");
        filterModel.setAccountNumber("123");
        filterModel.setBankAccountTypeId(7);
        filterModel.setCurrencyCode(1);
        filterModel.setTransactionDate(new Date());

        HttpServletRequest request = org.mockito.Mockito.mock(HttpServletRequest.class);
        User user = new User();
        user.setUserId(10);

        when(jwtTokenUtil.getUserIdFromHttpRequest(request)).thenReturn(10);
        when(userService.findByPK(10)).thenReturn(user);
        BankAccountType accountType = new BankAccountType();
        when(bankAccountTypeService.findByPK(7)).thenReturn(accountType);
        Currency currency = new Currency();
        when(currencyService.findByPK(1)).thenReturn(currency);

        PaginationResponseModel pagination = new PaginationResponseModel(0, null);
        when(bankAccountService.getBankAccounts(any(), eq(filterModel))).thenReturn(pagination);
        when(bankAccountRestHelper.getListModel(pagination)).thenReturn(pagination);

        ResponseEntity<PaginationResponseModel> response =
                controller.getBankAccountList(filterModel, request);

        assertThat(response.getBody()).isSameAs(pagination);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(bankAccountService).getBankAccounts(captor.capture(), eq(filterModel));
        Map<BankAccounrFilterEnum, Object> filterData = captor.getValue();
        assertThat(filterData).containsEntry(BankAccounrFilterEnum.BANK_ACCOUNT_NAME, "Operating");
        assertThat(filterData).containsEntry(BankAccounrFilterEnum.BANK_BNAME, "Main Bank");
        assertThat(filterData).containsEntry(BankAccounrFilterEnum.ACCOUNT_NO, "123");
        assertThat(filterData).containsEntry(BankAccounrFilterEnum.BANK_ACCOUNT_TYPE, accountType);
        assertThat(filterData).containsEntry(BankAccounrFilterEnum.CURRENCY_CODE, currency);
    }
}

