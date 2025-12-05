package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.CompanyFilterEnum;
import com.simpleaccounts.dao.CompanyDao;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.CompanyType;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.IndustryType;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.service.BankAccountService;
import com.simpleaccounts.service.BankAccountStatusService;
import com.simpleaccounts.service.BankAccountTypeService;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.CompanyTypeService;
import com.simpleaccounts.service.CurrencyExchangeService;
import com.simpleaccounts.service.CurrencyService;
import com.simpleaccounts.service.IndustryTypeService;
import com.simpleaccounts.service.JournalService;
import com.simpleaccounts.service.RoleService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CompanyServiceImplTest {

    @Mock
    private CompanyDao companyDao;

    @Mock
    private BankAccountService bankAccountService;

    @Mock
    private TransactionCategoryService transactionCategoryService;

    @Mock
    private JournalService journalService;

    @Mock
    private CoacTransactionCategoryService coacTransactionCategoryService;

    @Mock
    private BankAccountStatusService bankAccountStatusService;

    @Mock
    private CompanyService companyService;

    @Mock
    private CurrencyService currencyService;

    @Mock
    private CompanyTypeService companyTypeService;

    @Mock
    private IndustryTypeService industryTypeService;

    @Mock
    private RoleService roleService;

    @Mock
    private UserService userService;

    @Mock
    private CurrencyExchangeService currencyExchangeService;

    @Mock
    private BankAccountTypeService bankAccountTypeService;

    @InjectMocks
    private CompanyServiceImpl companyServiceImpl;

    private Company testCompany;
    private Currency testCurrency;

    @BeforeEach
    void setUp() {
        testCurrency = new Currency();
        testCurrency.setCurrencyCode("AED");
        testCurrency.setCurrencyName("UAE Dirham");

        testCompany = new Company();
        testCompany.setCompanyId(1);
        testCompany.setCompanyName("Test Company");
        testCompany.setCompanyExpenseBudget(BigDecimal.valueOf(1000.00));
        testCompany.setCompanyRevenueBudget(BigDecimal.valueOf(5000.00));
        testCompany.setCurrencyCode(testCurrency);
        testCompany.setCreatedBy(1);
        testCompany.setCreatedDate(LocalDateTime.now());
        testCompany.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnCompanyDaoWhenGetDaoCalled() {
        assertThat(companyServiceImpl.getDao()).isEqualTo(companyDao);
    }

    // ========== updateCompanyExpenseBudget Tests ==========

    @Test
    void shouldUpdateCompanyExpenseBudgetWhenPositiveAmountProvided() {
        BigDecimal initialBudget = testCompany.getCompanyExpenseBudget();
        BigDecimal expenseAmount = BigDecimal.valueOf(500.00);
        BigDecimal expectedBudget = initialBudget.add(expenseAmount);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyExpenseBudget(expenseAmount, testCompany);

        assertThat(testCompany.getCompanyExpenseBudget()).isEqualTo(expectedBudget);
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldUpdateCompanyExpenseBudgetWhenNegativeAmountProvided() {
        BigDecimal initialBudget = BigDecimal.valueOf(1000.00);
        testCompany.setCompanyExpenseBudget(initialBudget);
        BigDecimal expenseAmount = BigDecimal.valueOf(-200.00);
        BigDecimal expectedBudget = BigDecimal.valueOf(800.00);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyExpenseBudget(expenseAmount, testCompany);

        assertThat(testCompany.getCompanyExpenseBudget()).isEqualTo(expectedBudget);
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldUpdateCompanyExpenseBudgetWhenZeroAmountProvided() {
        BigDecimal initialBudget = testCompany.getCompanyExpenseBudget();
        BigDecimal expenseAmount = BigDecimal.ZERO;

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyExpenseBudget(expenseAmount, testCompany);

        assertThat(testCompany.getCompanyExpenseBudget()).isEqualTo(initialBudget);
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldHandleMultipleExpenseBudgetUpdates() {
        BigDecimal initialBudget = BigDecimal.valueOf(1000.00);
        testCompany.setCompanyExpenseBudget(initialBudget);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyExpenseBudget(BigDecimal.valueOf(100.00), testCompany);
        companyServiceImpl.updateCompanyExpenseBudget(BigDecimal.valueOf(200.00), testCompany);
        companyServiceImpl.updateCompanyExpenseBudget(BigDecimal.valueOf(300.00), testCompany);

        assertThat(testCompany.getCompanyExpenseBudget()).isEqualTo(BigDecimal.valueOf(1600.00));
        verify(companyDao, times(3)).update(testCompany);
    }

    @Test
    void shouldUpdateExpenseBudgetWithLargeDecimalValues() {
        testCompany.setCompanyExpenseBudget(BigDecimal.valueOf(999999999.99));
        BigDecimal largeAmount = BigDecimal.valueOf(1000000.50);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyExpenseBudget(largeAmount, testCompany);

        assertThat(testCompany.getCompanyExpenseBudget())
                .isEqualTo(BigDecimal.valueOf(1000999999.99).add(BigDecimal.valueOf(0.50)));
        verify(companyDao, times(1)).update(testCompany);
    }

    // ========== updateCompanyRevenueBudget Tests ==========

    @Test
    void shouldUpdateCompanyRevenueBudgetWhenPositiveAmountProvided() {
        BigDecimal initialBudget = testCompany.getCompanyRevenueBudget();
        BigDecimal revenueAmount = BigDecimal.valueOf(1000.00);
        BigDecimal expectedBudget = initialBudget.add(revenueAmount);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyRevenueBudget(revenueAmount, testCompany);

        assertThat(testCompany.getCompanyRevenueBudget()).isEqualTo(expectedBudget);
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldUpdateCompanyRevenueBudgetWhenNegativeAmountProvided() {
        BigDecimal initialBudget = BigDecimal.valueOf(5000.00);
        testCompany.setCompanyRevenueBudget(initialBudget);
        BigDecimal revenueAmount = BigDecimal.valueOf(-500.00);
        BigDecimal expectedBudget = BigDecimal.valueOf(4500.00);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyRevenueBudget(revenueAmount, testCompany);

        assertThat(testCompany.getCompanyRevenueBudget()).isEqualTo(expectedBudget);
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldUpdateCompanyRevenueBudgetWhenZeroAmountProvided() {
        BigDecimal initialBudget = testCompany.getCompanyRevenueBudget();
        BigDecimal revenueAmount = BigDecimal.ZERO;

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyRevenueBudget(revenueAmount, testCompany);

        assertThat(testCompany.getCompanyRevenueBudget()).isEqualTo(initialBudget);
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldHandleMultipleRevenueBudgetUpdates() {
        BigDecimal initialBudget = BigDecimal.valueOf(5000.00);
        testCompany.setCompanyRevenueBudget(initialBudget);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyRevenueBudget(BigDecimal.valueOf(500.00), testCompany);
        companyServiceImpl.updateCompanyRevenueBudget(BigDecimal.valueOf(750.00), testCompany);
        companyServiceImpl.updateCompanyRevenueBudget(BigDecimal.valueOf(250.00), testCompany);

        assertThat(testCompany.getCompanyRevenueBudget()).isEqualTo(BigDecimal.valueOf(6500.00));
        verify(companyDao, times(3)).update(testCompany);
    }

    @Test
    void shouldUpdateRevenueBudgetWithLargeDecimalValues() {
        testCompany.setCompanyRevenueBudget(BigDecimal.valueOf(888888888.88));
        BigDecimal largeAmount = BigDecimal.valueOf(111111111.12);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyRevenueBudget(largeAmount, testCompany);

        assertThat(testCompany.getCompanyRevenueBudget())
                .isEqualTo(BigDecimal.valueOf(1000000000.00));
        verify(companyDao, times(1)).update(testCompany);
    }

    // ========== getCompany Tests ==========

    @Test
    void shouldReturnCompanyWhenCompanyExists() {
        when(companyDao.getCompany()).thenReturn(testCompany);

        Company result = companyServiceImpl.getCompany();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCompany);
        assertThat(result.getCompanyId()).isEqualTo(1);
        assertThat(result.getCompanyName()).isEqualTo("Test Company");
        verify(companyDao, times(1)).getCompany();
    }

    @Test
    void shouldReturnNullWhenNoCompanyExists() {
        when(companyDao.getCompany()).thenReturn(null);

        Company result = companyServiceImpl.getCompany();

        assertThat(result).isNull();
        verify(companyDao, times(1)).getCompany();
    }

    @Test
    void shouldReturnCompanyWithAllFieldsPopulated() {
        CompanyType companyType = new CompanyType();
        companyType.setCompanyTypeCode("LLC");
        companyType.setCompanyTypeDescription("Limited Liability Company");

        IndustryType industryType = new IndustryType();
        industryType.setIndustryTypeCode("IT");
        industryType.setIndustryTypeDescription("Information Technology");

        testCompany.setCompanyTypeCode(companyType);
        testCompany.setIndustryTypeCode(industryType);
        testCompany.setVatNumber("VAT123456");
        testCompany.setEmailAddress("test@company.com");

        when(companyDao.getCompany()).thenReturn(testCompany);

        Company result = companyServiceImpl.getCompany();

        assertThat(result).isNotNull();
        assertThat(result.getCompanyTypeCode()).isEqualTo(companyType);
        assertThat(result.getIndustryTypeCode()).isEqualTo(industryType);
        assertThat(result.getVatNumber()).isEqualTo("VAT123456");
        assertThat(result.getEmailAddress()).isEqualTo("test@company.com");
        verify(companyDao, times(1)).getCompany();
    }

    // ========== getCompanyList Tests ==========

    @Test
    void shouldReturnCompanyListWhenValidFilterMapProvided() {
        Map<CompanyFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(CompanyFilterEnum.DELETE_FLAG, false);

        List<Company> expectedList = Arrays.asList(testCompany);
        when(companyDao.getCompanyList(filterMap)).thenReturn(expectedList);

        List<Company> result = companyServiceImpl.getCompanyList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testCompany);
        verify(companyDao, times(1)).getCompanyList(filterMap);
    }

    @Test
    void shouldReturnEmptyListWhenNoCompaniesMatchFilter() {
        Map<CompanyFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(CompanyFilterEnum.DELETE_FLAG, true);

        when(companyDao.getCompanyList(filterMap)).thenReturn(Collections.emptyList());

        List<Company> result = companyServiceImpl.getCompanyList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyDao, times(1)).getCompanyList(filterMap);
    }

    @Test
    void shouldReturnMultipleCompaniesWhenMultipleMatch() {
        Company company2 = new Company();
        company2.setCompanyId(2);
        company2.setCompanyName("Second Company");

        Company company3 = new Company();
        company3.setCompanyId(3);
        company3.setCompanyName("Third Company");

        Map<CompanyFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(CompanyFilterEnum.DELETE_FLAG, false);

        List<Company> expectedList = Arrays.asList(testCompany, company2, company3);
        when(companyDao.getCompanyList(filterMap)).thenReturn(expectedList);

        List<Company> result = companyServiceImpl.getCompanyList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testCompany, company2, company3);
        verify(companyDao, times(1)).getCompanyList(filterMap);
    }

    @Test
    void shouldHandleEmptyFilterMap() {
        Map<CompanyFilterEnum, Object> filterMap = new HashMap<>();
        List<Company> expectedList = Arrays.asList(testCompany);

        when(companyDao.getCompanyList(filterMap)).thenReturn(expectedList);

        List<Company> result = companyServiceImpl.getCompanyList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(companyDao, times(1)).getCompanyList(filterMap);
    }

    @Test
    void shouldHandleNullFilterMap() {
        List<Company> expectedList = Arrays.asList(testCompany);
        when(companyDao.getCompanyList(null)).thenReturn(expectedList);

        List<Company> result = companyServiceImpl.getCompanyList(null);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(companyDao, times(1)).getCompanyList(null);
    }

    // ========== getDbConnection Tests ==========

    @Test
    void shouldReturnConnectionValueWhenDatabaseConnected() {
        when(companyDao.getDbConncection()).thenReturn(1);

        Integer result = companyServiceImpl.getDbConncection();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(1);
        verify(companyDao, times(1)).getDbConncection();
    }

    @Test
    void shouldReturnNullWhenDatabaseNotConnected() {
        when(companyDao.getDbConncection()).thenReturn(null);

        Integer result = companyServiceImpl.getDbConncection();

        assertThat(result).isNull();
        verify(companyDao, times(1)).getDbConncection();
    }

    @Test
    void shouldVerifyDatabaseConnectionMultipleTimes() {
        when(companyDao.getDbConncection()).thenReturn(1);

        Integer result1 = companyServiceImpl.getDbConncection();
        Integer result2 = companyServiceImpl.getDbConncection();
        Integer result3 = companyServiceImpl.getDbConncection();

        assertThat(result1).isEqualTo(1);
        assertThat(result2).isEqualTo(1);
        assertThat(result3).isEqualTo(1);
        verify(companyDao, times(3)).getDbConncection();
    }

    // ========== deleteByIds Tests ==========

    @Test
    void shouldDeleteSingleCompanyById() {
        ArrayList<Integer> ids = new ArrayList<>();
        ids.add(1);

        companyServiceImpl.deleteByIds(ids);

        verify(companyDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteMultipleCompaniesByIds() {
        ArrayList<Integer> ids = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));

        companyServiceImpl.deleteByIds(ids);

        ArgumentCaptor<ArrayList<Integer>> captor = ArgumentCaptor.forClass(ArrayList.class);
        verify(companyDao, times(1)).deleteByIds(captor.capture());

        ArrayList<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(5);
        assertThat(capturedIds).containsExactly(1, 2, 3, 4, 5);
    }

    @Test
    void shouldHandleEmptyIdsList() {
        ArrayList<Integer> ids = new ArrayList<>();

        companyServiceImpl.deleteByIds(ids);

        verify(companyDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleLargeNumberOfIds() {
        ArrayList<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
        }

        companyServiceImpl.deleteByIds(ids);

        ArgumentCaptor<ArrayList<Integer>> captor = ArgumentCaptor.forClass(ArrayList.class);
        verify(companyDao, times(1)).deleteByIds(captor.capture());

        ArrayList<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(100);
        assertThat(capturedIds.get(0)).isEqualTo(1);
        assertThat(capturedIds.get(99)).isEqualTo(100);
    }

    // ========== getCompaniesForDropdown Tests ==========

    @Test
    void shouldReturnDropdownModelsWhenCompaniesExist() {
        DropdownModel dropdown1 = new DropdownModel(1, "Test Company");
        DropdownModel dropdown2 = new DropdownModel(2, "Second Company");
        List<DropdownModel> expectedList = Arrays.asList(dropdown1, dropdown2);

        when(companyDao.getCompaniesForDropdown()).thenReturn(expectedList);

        List<DropdownModel> result = companyServiceImpl.getCompaniesForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("Test Company");
        assertThat(result.get(1).getValue()).isEqualTo(2);
        assertThat(result.get(1).getLabel()).isEqualTo("Second Company");
        verify(companyDao, times(1)).getCompaniesForDropdown();
    }

    @Test
    void shouldReturnEmptyListWhenNoCompaniesForDropdown() {
        when(companyDao.getCompaniesForDropdown()).thenReturn(Collections.emptyList());

        List<DropdownModel> result = companyServiceImpl.getCompaniesForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyDao, times(1)).getCompaniesForDropdown();
    }

    @Test
    void shouldReturnSingleDropdownModel() {
        DropdownModel dropdown = new DropdownModel(1, "Test Company");
        List<DropdownModel> expectedList = Collections.singletonList(dropdown);

        when(companyDao.getCompaniesForDropdown()).thenReturn(expectedList);

        List<DropdownModel> result = companyServiceImpl.getCompaniesForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("Test Company");
        verify(companyDao, times(1)).getCompaniesForDropdown();
    }

    @Test
    void shouldHandleMultipleDropdownModels() {
        List<DropdownModel> expectedList = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            expectedList.add(new DropdownModel(i, "Company " + i));
        }

        when(companyDao.getCompaniesForDropdown()).thenReturn(expectedList);

        List<DropdownModel> result = companyServiceImpl.getCompaniesForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
        assertThat(result.get(0).getLabel()).isEqualTo("Company 1");
        assertThat(result.get(9).getLabel()).isEqualTo("Company 10");
        verify(companyDao, times(1)).getCompaniesForDropdown();
    }

    // ========== getCompanyCurrency Tests ==========

    @Test
    void shouldReturnCurrencyWhenCompanyHasCurrency() {
        when(companyDao.getCompanyCurrency()).thenReturn(testCurrency);

        Currency result = companyServiceImpl.getCompanyCurrency();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCurrency);
        assertThat(result.getCurrencyCode()).isEqualTo("AED");
        assertThat(result.getCurrencyName()).isEqualTo("UAE Dirham");
        verify(companyDao, times(1)).getCompanyCurrency();
    }

    @Test
    void shouldReturnNullWhenCompanyHasNoCurrency() {
        when(companyDao.getCompanyCurrency()).thenReturn(null);

        Currency result = companyServiceImpl.getCompanyCurrency();

        assertThat(result).isNull();
        verify(companyDao, times(1)).getCompanyCurrency();
    }

    @Test
    void shouldReturnDifferentCurrencies() {
        Currency usd = new Currency();
        usd.setCurrencyCode("USD");
        usd.setCurrencyName("US Dollar");

        when(companyDao.getCompanyCurrency()).thenReturn(usd);

        Currency result = companyServiceImpl.getCompanyCurrency();

        assertThat(result).isNotNull();
        assertThat(result.getCurrencyCode()).isEqualTo("USD");
        assertThat(result.getCurrencyName()).isEqualTo("US Dollar");
        verify(companyDao, times(1)).getCompanyCurrency();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindCompanyByPrimaryKey() {
        when(companyDao.findByPK(1)).thenReturn(testCompany);

        Company result = companyServiceImpl.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCompany);
        assertThat(result.getCompanyId()).isEqualTo(1);
        verify(companyDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenCompanyNotFoundByPK() {
        when(companyDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> companyServiceImpl.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(companyDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewCompany() {
        companyServiceImpl.persist(testCompany);

        verify(companyDao, times(1)).persist(testCompany);
    }

    @Test
    void shouldUpdateExistingCompany() {
        when(companyDao.update(testCompany)).thenReturn(testCompany);

        Company result = companyServiceImpl.update(testCompany);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testCompany);
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldUpdateCompanyAndReturnUpdatedEntity() {
        testCompany.setCompanyName("Updated Company Name");
        when(companyDao.update(testCompany)).thenReturn(testCompany);

        Company result = companyServiceImpl.update(testCompany);

        assertThat(result).isNotNull();
        assertThat(result.getCompanyName()).isEqualTo("Updated Company Name");
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldDeleteCompany() {
        companyServiceImpl.delete(testCompany);

        verify(companyDao, times(1)).delete(testCompany);
    }

    @Test
    void shouldFindCompaniesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("companyName", "Test Company");
        attributes.put("deleteFlag", false);

        List<Company> expectedList = Arrays.asList(testCompany);
        when(companyDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Company> result = companyServiceImpl.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testCompany);
        verify(companyDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("companyName", "Non-existent Company");

        when(companyDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Company> result = companyServiceImpl.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<Company> result = companyServiceImpl.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<Company> result = companyServiceImpl.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(companyDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleCompanyWithNullBudgets() {
        Company companyWithNullBudgets = new Company();
        companyWithNullBudgets.setCompanyId(2);
        companyWithNullBudgets.setCompanyName("Company with null budgets");
        companyWithNullBudgets.setCompanyExpenseBudget(BigDecimal.ZERO);
        companyWithNullBudgets.setCompanyRevenueBudget(BigDecimal.ZERO);

        when(companyDao.update(any(Company.class))).thenReturn(companyWithNullBudgets);

        companyServiceImpl.updateCompanyExpenseBudget(BigDecimal.valueOf(100), companyWithNullBudgets);

        assertThat(companyWithNullBudgets.getCompanyExpenseBudget()).isEqualTo(BigDecimal.valueOf(100));
        verify(companyDao, times(1)).update(companyWithNullBudgets);
    }

    @Test
    void shouldHandleVerySmallDecimalAmounts() {
        testCompany.setCompanyExpenseBudget(BigDecimal.valueOf(1000.00));
        BigDecimal verySmallAmount = BigDecimal.valueOf(0.01);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyExpenseBudget(verySmallAmount, testCompany);

        assertThat(testCompany.getCompanyExpenseBudget())
                .isEqualTo(BigDecimal.valueOf(1000.01));
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldHandleNegativeBudgetResults() {
        testCompany.setCompanyRevenueBudget(BigDecimal.valueOf(100.00));
        BigDecimal largeNegative = BigDecimal.valueOf(-200.00);

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyRevenueBudget(largeNegative, testCompany);

        assertThat(testCompany.getCompanyRevenueBudget())
                .isEqualTo(BigDecimal.valueOf(-100.00));
        verify(companyDao, times(1)).update(testCompany);
    }

    @Test
    void shouldHandleCompanyWithMinimalData() {
        Company minimalCompany = new Company();
        minimalCompany.setCompanyId(99);
        minimalCompany.setCompanyExpenseBudget(BigDecimal.ZERO);
        minimalCompany.setCompanyRevenueBudget(BigDecimal.ZERO);

        when(companyDao.getCompany()).thenReturn(minimalCompany);

        Company result = companyServiceImpl.getCompany();

        assertThat(result).isNotNull();
        assertThat(result.getCompanyId()).isEqualTo(99);
        assertThat(result.getCompanyName()).isNull();
        verify(companyDao, times(1)).getCompany();
    }

    @Test
    void shouldHandleConcurrentBudgetUpdates() {
        testCompany.setCompanyExpenseBudget(BigDecimal.valueOf(1000.00));
        testCompany.setCompanyRevenueBudget(BigDecimal.valueOf(5000.00));

        when(companyDao.update(any(Company.class))).thenReturn(testCompany);

        companyServiceImpl.updateCompanyExpenseBudget(BigDecimal.valueOf(100), testCompany);
        companyServiceImpl.updateCompanyRevenueBudget(BigDecimal.valueOf(500), testCompany);

        assertThat(testCompany.getCompanyExpenseBudget()).isEqualTo(BigDecimal.valueOf(1100.00));
        assertThat(testCompany.getCompanyRevenueBudget()).isEqualTo(BigDecimal.valueOf(5500.00));
        verify(companyDao, times(2)).update(testCompany);
    }

    @Test
    void shouldVerifyDaoInteractionForGetCompany() {
        when(companyDao.getCompany()).thenReturn(testCompany);

        companyServiceImpl.getCompany();
        companyServiceImpl.getCompany();

        verify(companyDao, times(2)).getCompany();
    }

    @Test
    void shouldHandleNullCompanyInBudgetUpdate() {
        Company nullCompany = new Company();
        nullCompany.setCompanyExpenseBudget(BigDecimal.ZERO);

        when(companyDao.update(any(Company.class))).thenReturn(nullCompany);

        companyServiceImpl.updateCompanyExpenseBudget(BigDecimal.TEN, nullCompany);

        assertThat(nullCompany.getCompanyExpenseBudget()).isEqualTo(BigDecimal.TEN);
        verify(companyDao, times(1)).update(nullCompany);
    }
}
