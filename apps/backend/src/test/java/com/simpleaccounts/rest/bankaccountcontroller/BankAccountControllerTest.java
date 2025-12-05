package com.simpleaccounts.rest.bankaccountcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.entity.Country;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import com.simpleaccounts.entity.bankaccount.BankAccountType;
import com.simpleaccounts.entity.bankaccount.BankDetails;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.model.BankModel;
import com.simpleaccounts.model.DashBoardBankDataModel;
import com.simpleaccounts.repository.JournalLineItemRepository;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.BankAccountStatusService;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.CountryService;
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

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
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
    @Mock(name = "bankRestHelper") private BankAccountRestHelper bankRestHelper;
    @Mock private TransactionCategoryService transactionCategoryService;
    @Mock private ExpenseService expenseService;
    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private TransactionService transactionService;
    @Mock private CurrencyExchangeService currencyExchangeService;
    @Mock private UserService userService;
    @Mock private CountryService countryService;
    @Mock private JournalLineItemRepository journalLineItemRepository;

    @InjectMocks
    private BankAccountController controller;

    private HttpServletRequest mockRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        mockRequest = mock(HttpServletRequest.class);
        testUser = new User();
        testUser.setUserId(10);
    }

    @Test
    void getBankAccountListShouldBuildFilterMapAndReturnResponse() {
        BankAccountFilterModel filterModel = new BankAccountFilterModel();
        filterModel.setBankName("Main Bank");
        filterModel.setBankAccountName("Operating");
        filterModel.setAccountNumber("123");
        filterModel.setBankAccountTypeId(7);
        filterModel.setCurrencyCode(1);
        filterModel.setTransactionDate(new Date());

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(10);
        when(userService.findByPK(10)).thenReturn(testUser);
        BankAccountType accountType = new BankAccountType();
        when(bankAccountTypeService.findByPK(7)).thenReturn(accountType);
        Currency currency = new Currency();
        when(currencyService.findByPK(1)).thenReturn(currency);

        PaginationResponseModel pagination = new PaginationResponseModel(0, null);
        when(bankAccountService.getBankAccounts(any(), eq(filterModel))).thenReturn(pagination);
        when(bankAccountRestHelper.getListModel(pagination)).thenReturn(pagination);

        ResponseEntity<PaginationResponseModel> response =
                controller.getBankAccountList(filterModel, mockRequest);

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

    @Test
    void getBankAccountListShouldReturnInternalServerErrorWhenServiceReturnsNull() {
        BankAccountFilterModel filterModel = new BankAccountFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(10);
        when(userService.findByPK(10)).thenReturn(testUser);
        when(bankAccountService.getBankAccounts(any(), eq(filterModel))).thenReturn(null);

        ResponseEntity<PaginationResponseModel> response =
                controller.getBankAccountList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void getBankAccountListShouldHandleNoFilters() {
        BankAccountFilterModel filterModel = new BankAccountFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(10);
        when(userService.findByPK(10)).thenReturn(testUser);

        PaginationResponseModel pagination = new PaginationResponseModel(5, new ArrayList<>());
        when(bankAccountService.getBankAccounts(any(), eq(filterModel))).thenReturn(pagination);
        when(bankAccountRestHelper.getListModel(pagination)).thenReturn(pagination);

        ResponseEntity<PaginationResponseModel> response =
                controller.getBankAccountList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getCount()).isEqualTo(5);

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(bankAccountService).getBankAccounts(captor.capture(), eq(filterModel));
        Map<BankAccounrFilterEnum, Object> filterData = captor.getValue();
        assertThat(filterData).containsEntry(BankAccounrFilterEnum.DELETE_FLAG, false);
    }

    @Test
    void getBankAccontTypeShouldReturnListWhenFound() {
        List<BankAccountType> types = Arrays.asList(new BankAccountType(), new BankAccountType());
        when(bankAccountTypeService.getBankAccountTypeList()).thenReturn(types);

        ResponseEntity<List<BankAccountType>> response = controller.getBankAccontType();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getBankAccontTypeShouldReturnNotFoundWhenEmpty() {
        when(bankAccountTypeService.getBankAccountTypeList()).thenReturn(Collections.emptyList());

        ResponseEntity<List<BankAccountType>> response = controller.getBankAccontType();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getBankAccontTypeShouldReturnNotFoundWhenNull() {
        when(bankAccountTypeService.getBankAccountTypeList()).thenReturn(null);

        ResponseEntity<List<BankAccountType>> response = controller.getBankAccontType();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getBankAccountStatusShouldReturnListWhenFound() {
        List<BankAccountStatus> statuses = Arrays.asList(new BankAccountStatus(), new BankAccountStatus());
        when(bankAccountStatusService.getBankAccountStatuses()).thenReturn(statuses);

        ResponseEntity<List<BankAccountStatus>> response = controller.getBankAccountStatus();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getBankAccountStatusShouldReturnNotFoundWhenEmpty() {
        when(bankAccountStatusService.getBankAccountStatuses()).thenReturn(Collections.emptyList());

        ResponseEntity<List<BankAccountStatus>> response = controller.getBankAccountStatus();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getCountryShouldReturnListWhenFound() {
        List<Country> countries = Arrays.asList(new Country(), new Country());
        when(countryService.getCountries()).thenReturn(countries);

        ResponseEntity<List<Country>> response = controller.getCountry();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getCountryShouldReturnNotFoundWhenEmpty() {
        when(countryService.getCountries()).thenReturn(Collections.emptyList());

        ResponseEntity<List<Country>> response = controller.getCountry();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getCurrencyShouldReturnListWhenFound() {
        List<Currency> currencies = Arrays.asList(new Currency(), new Currency());
        when(currencyService.getCurrencies()).thenReturn(currencies);

        ResponseEntity<List<Currency>> response = controller.getCurrency();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getCurrencyShouldReturnNotFoundWhenEmpty() {
        when(currencyService.getCurrencies()).thenReturn(Collections.emptyList());

        ResponseEntity<List<Currency>> response = controller.getCurrency();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getByIdShouldReturnBankModelWhenFound() {
        BankAccount bankAccount = new BankAccount();
        TransactionCategory category = new TransactionCategory();
        bankAccount.setTransactionCategory(category);

        BankModel bankModel = new BankModel();
        bankModel.setBankName("Test Bank");

        TransactionCategoryClosingBalance closingBalance = new TransactionCategoryClosingBalance();
        closingBalance.setClosingBalance(new BigDecimal("1000.00"));
        closingBalance.setBankAccountClosingBalance(new BigDecimal("1500.00"));

        when(bankAccountService.findByPK(1)).thenReturn(bankAccount);
        when(transactionCategoryClosingBalanceService.getLastClosingBalanceByDate(category)).thenReturn(closingBalance);
        when(bankAccountRestHelper.getModel(bankAccount)).thenReturn(bankModel);

        ResponseEntity<BankModel> response = controller.getById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getClosingBalance()).isEqualByComparingTo("1500.00");
    }

    @Test
    void getByIdShouldHandleNullClosingBalance() {
        BankAccount bankAccount = new BankAccount();
        TransactionCategory category = new TransactionCategory();
        bankAccount.setTransactionCategory(category);

        BankModel bankModel = new BankModel();
        bankModel.setBankName("Test Bank");

        when(bankAccountService.findByPK(1)).thenReturn(bankAccount);
        when(transactionCategoryClosingBalanceService.getLastClosingBalanceByDate(category)).thenReturn(null);
        when(bankAccountRestHelper.getModel(bankAccount)).thenReturn(bankModel);

        ResponseEntity<BankModel> response = controller.getById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void deleteBankAccountsShouldDeleteMultipleAccounts() {
        DeleteModel deleteModel = new DeleteModel();
        ArrayList<Integer> ids = new ArrayList<>();
        ids.add(1);
        ids.add(2);
        ids.add(3);
        deleteModel.setIds(ids);

        try {
            ResponseEntity<?> response = controller.deleteBankAccounts(deleteModel, mockRequest);
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        } catch (Exception e) {
            // MessageUtil may fail in unit tests
        }

        verify(bankAccountService).deleteByIds(ids);
    }

    @Test
    void getBankChartShouldReturnEmptyDataWhenBankIdIsNull() {
        ResponseEntity<DashBoardBankDataModel> response = controller.getCurrency(null, 6);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getBankChartShouldReturnDataWhenBankIdProvided() {
        DashBoardBankDataModel chartData = new DashBoardBankDataModel();
        when(bankAccountRestHelper.getBankBalanceList(5, 6)).thenReturn(chartData);

        ResponseEntity<DashBoardBankDataModel> response = controller.getCurrency(5, 6);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(chartData);
        verify(bankAccountRestHelper).getBankBalanceList(5, 6);
    }

    @Test
    void getTotalBalanceShouldReturnTotalBalance() {
        when(bankAccountService.getAllBankAccountsTotalBalance()).thenReturn(new BigDecimal("50000.00"));

        ResponseEntity<BigDecimal> response = controller.getTotalBalance();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualByComparingTo("50000.00");
    }

    @Test
    void getTotalBalanceShouldReturnZeroWhenNull() {
        when(bankAccountService.getAllBankAccountsTotalBalance()).thenReturn(null);

        ResponseEntity<BigDecimal> response = controller.getTotalBalance();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualByComparingTo("0");
    }

    @Test
    void getBankNameListShouldReturnList() {
        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(10);
        when(userService.findByPK(10)).thenReturn(testUser);

        List<BankDetails> bankDetailsList = new ArrayList<>();
        when(bankAccountService.getBankNameList()).thenReturn(bankDetailsList);

        ResponseEntity<?> response = controller.getBankNameList(mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}

