package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.CompanyFilterEnum;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.rest.DropdownModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompanyDaoImpl Unit Tests")
class CompanyDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Company> companyTypedQuery;

    @Mock
    private TypedQuery<Currency> currencyTypedQuery;

    @Mock
    private TypedQuery<DropdownModel> dropdownTypedQuery;

    @Mock
    private Query query;

    @InjectMocks
    private CompanyDaoImpl companyDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(companyDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(companyDao, "entityClass", Company.class);
    }

    @Test
    @DisplayName("Should return first company when companies exist")
    void getCompanyReturnsFirstCompanyWhenCompaniesExist() {
        // Arrange
        List<Company> companies = createCompanyList(3);
        when(entityManager.createQuery("SELECT c FROM Company c", Company.class))
            .thenReturn(companyTypedQuery);
        when(companyTypedQuery.getResultList())
            .thenReturn(companies);

        // Act
        Company result = companyDao.getCompany();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(companies.get(0));
    }

    @Test
    @DisplayName("Should return null when no companies exist")
    void getCompanyReturnsNullWhenNoCompaniesExist() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Company c", Company.class))
            .thenReturn(companyTypedQuery);
        when(companyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Company result = companyDao.getCompany();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when company list is null")
    void getCompanyReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Company c", Company.class))
            .thenReturn(companyTypedQuery);
        when(companyTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        Company result = companyDao.getCompany();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should execute correct query for getCompany")
    void getCompanyExecutesCorrectQuery() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Company c", Company.class))
            .thenReturn(companyTypedQuery);
        when(companyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyDao.getCompany();

        // Assert
        verify(entityManager).createQuery("SELECT c FROM Company c", Company.class);
    }

    @Test
    @DisplayName("Should return database connection value when records exist")
    void getDbConnectionReturnsValueWhenRecordsExist() {
        // Arrange
        List<Integer> results = Collections.singletonList(1);
        when(entityManager.createQuery("SELECT 1 FROM Company cc"))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(results);

        // Act
        Integer result = companyDao.getDbConncection();

        // Assert
        assertThat(result).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return null when no database connection records exist")
    void getDbConnectionReturnsNullWhenNoRecordsExist() {
        // Arrange
        when(entityManager.createQuery("SELECT 1 FROM Company cc"))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Integer result = companyDao.getDbConncection();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when database connection list is null")
    void getDbConnectionReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createQuery("SELECT 1 FROM Company cc"))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(null);

        // Act
        Integer result = companyDao.getDbConncection();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should execute database connection query")
    void getDbConnectionExecutesQuery() {
        // Arrange
        when(entityManager.createQuery("SELECT 1 FROM Company cc"))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyDao.getDbConncection();

        // Assert
        verify(entityManager).createQuery("SELECT 1 FROM Company cc");
    }

    @Test
    @DisplayName("Should return companies for dropdown")
    void getCompaniesForDropdownReturnsDropdownModels() {
        // Arrange
        List<DropdownModel> dropdownModels = createDropdownModelList(5);
        when(entityManager.createNamedQuery("companiesForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(dropdownModels);

        // Act
        List<DropdownModel> result = companyDao.getCompaniesForDropdown();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(dropdownModels);
    }

    @Test
    @DisplayName("Should return empty dropdown list when no companies")
    void getCompaniesForDropdownReturnsEmptyListWhenNoCompanies() {
        // Arrange
        when(entityManager.createNamedQuery("companiesForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<DropdownModel> result = companyDao.getCompaniesForDropdown();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use companiesForDropdown named query")
    void getCompaniesForDropdownUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("companiesForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyDao.getCompaniesForDropdown();

        // Assert
        verify(entityManager).createNamedQuery("companiesForDropdown", DropdownModel.class);
    }

    @Test
    @DisplayName("Should soft delete companies by setting delete flag")
    void deleteByIdsSetsDeleteFlagOnCompanies() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        Company company1 = createCompany(1, "Company1");
        Company company2 = createCompany(2, "Company2");
        Company company3 = createCompany(3, "Company3");

        when(entityManager.find(Company.class, 1)).thenReturn(company1);
        when(entityManager.find(Company.class, 2)).thenReturn(company2);
        when(entityManager.find(Company.class, 3)).thenReturn(company3);
        when(entityManager.merge(any(Company.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        companyDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(3)).merge(any(Company.class));
        assertThat(company1.getDeleteFlag()).isTrue();
        assertThat(company2.getDeleteFlag()).isTrue();
        assertThat(company3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNotDeleteWhenListEmpty() {
        // Arrange
        List<Integer> emptyIds = new ArrayList<>();

        // Act
        companyDao.deleteByIds(emptyIds);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNotDeleteWhenListNull() {
        // Act
        companyDao.deleteByIds(null);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should delete single company")
    void deleteByIdsDeletesSingleCompany() {
        // Arrange
        List<Integer> ids = Collections.singletonList(1);
        Company company = createCompany(1, "Test Company");

        when(entityManager.find(Company.class, 1)).thenReturn(company);
        when(entityManager.merge(any(Company.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        companyDao.deleteByIds(ids);

        // Assert
        verify(entityManager).merge(company);
        assertThat(company.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should find and update each company by ID")
    void deleteByIdsFindsAndUpdatesEachCompany() {
        // Arrange
        List<Integer> ids = Arrays.asList(5, 10);
        Company company1 = createCompany(5, "Company5");
        Company company2 = createCompany(10, "Company10");

        when(entityManager.find(Company.class, 5)).thenReturn(company1);
        when(entityManager.find(Company.class, 10)).thenReturn(company2);
        when(entityManager.merge(any(Company.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        companyDao.deleteByIds(ids);

        // Assert
        verify(entityManager).find(Company.class, 5);
        verify(entityManager).find(Company.class, 10);
        verify(entityManager, times(2)).merge(any(Company.class));
    }

    @Test
    @DisplayName("Should return company currency when currency exists")
    void getCompanyCurrencyReturnsCurrencyWhenExists() {
        // Arrange
        List<Currency> currencies = createCurrencyList(2);
        when(entityManager.createQuery(
            "select c from Currency c where c.currencyCode IN(SELECT cc.currencyCode FROM Company cc)",
            Currency.class
        )).thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(currencies);

        // Act
        Currency result = companyDao.getCompanyCurrency();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(currencies.get(0));
    }

    @Test
    @DisplayName("Should return null when no currency exists")
    void getCompanyCurrencyReturnsNullWhenNoCurrency() {
        // Arrange
        when(entityManager.createQuery(
            "select c from Currency c where c.currencyCode IN(SELECT cc.currencyCode FROM Company cc)",
            Currency.class
        )).thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Currency result = companyDao.getCompanyCurrency();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when currency list is null")
    void getCompanyCurrencyReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createQuery(
            "select c from Currency c where c.currencyCode IN(SELECT cc.currencyCode FROM Company cc)",
            Currency.class
        )).thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        Currency result = companyDao.getCompanyCurrency();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should execute correct query for company currency")
    void getCompanyCurrencyExecutesCorrectQuery() {
        // Arrange
        when(entityManager.createQuery(
            "select c from Currency c where c.currencyCode IN(SELECT cc.currencyCode FROM Company cc)",
            Currency.class
        )).thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyDao.getCompanyCurrency();

        // Assert
        verify(entityManager).createQuery(
            "select c from Currency c where c.currencyCode IN(SELECT cc.currencyCode FROM Company cc)",
            Currency.class
        );
    }

    @Test
    @DisplayName("Should return first currency from list")
    void getCompanyCurrencyReturnsFirstCurrency() {
        // Arrange
        Currency currency1 = createCurrency("USD");
        Currency currency2 = createCurrency("EUR");
        List<Currency> currencies = Arrays.asList(currency1, currency2);

        when(entityManager.createQuery(
            "select c from Currency c where c.currencyCode IN(SELECT cc.currencyCode FROM Company cc)",
            Currency.class
        )).thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(currencies);

        // Act
        Currency result = companyDao.getCompanyCurrency();

        // Assert
        assertThat(result).isEqualTo(currency1);
        assertThat(result.getCurrencyCode()).isEqualTo("USD");
    }

    @Test
    @DisplayName("Should handle only first company when multiple exist")
    void getCompanyHandlesMultipleCompanies() {
        // Arrange
        Company firstCompany = createCompany(1, "First");
        Company secondCompany = createCompany(2, "Second");
        List<Company> companies = Arrays.asList(firstCompany, secondCompany);

        when(entityManager.createQuery("SELECT c FROM Company c", Company.class))
            .thenReturn(companyTypedQuery);
        when(companyTypedQuery.getResultList())
            .thenReturn(companies);

        // Act
        Company result = companyDao.getCompany();

        // Assert
        assertThat(result).isEqualTo(firstCompany);
        assertThat(result.getCompanyName()).isEqualTo("First");
    }

    @Test
    @DisplayName("Should call getResultList once for getCompany")
    void getCompanyCallsGetResultListOnce() {
        // Arrange
        when(entityManager.createQuery("SELECT c FROM Company c", Company.class))
            .thenReturn(companyTypedQuery);
        when(companyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyDao.getCompany();

        // Assert
        verify(companyTypedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle large number of IDs for deletion")
    void deleteByIdsHandlesLargeNumberOfIds() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
            when(entityManager.find(Company.class, i))
                .thenReturn(createCompany(i, "Company" + i));
        }
        when(entityManager.merge(any(Company.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        companyDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(100)).find(eq(Company.class), any(Integer.class));
        verify(entityManager, times(100)).merge(any(Company.class));
    }

    @Test
    @DisplayName("Should return consistent results for getCompany")
    void getCompanyReturnsConsistentResults() {
        // Arrange
        List<Company> companies = createCompanyList(1);
        when(entityManager.createQuery("SELECT c FROM Company c", Company.class))
            .thenReturn(companyTypedQuery);
        when(companyTypedQuery.getResultList())
            .thenReturn(companies);

        // Act
        Company result1 = companyDao.getCompany();
        Company result2 = companyDao.getCompany();

        // Assert
        assertThat(result1).isSameAs(result2);
    }

    @Test
    @DisplayName("Should return correct dropdown model structure")
    void getCompaniesForDropdownReturnsCorrectStructure() {
        // Arrange
        DropdownModel model1 = new DropdownModel(1, "Company 1");
        DropdownModel model2 = new DropdownModel(2, "Company 2");
        List<DropdownModel> models = Arrays.asList(model1, model2);

        when(entityManager.createNamedQuery("companiesForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(models);

        // Act
        List<DropdownModel> result = companyDao.getCompaniesForDropdown();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("Company 1");
    }

    @Test
    @DisplayName("Should handle delete flag properly")
    void deleteByIdsSetsDeleteFlagProperly() {
        // Arrange
        Company company = createCompany(1, "Test");
        company.setDeleteFlag(Boolean.FALSE);

        when(entityManager.find(Company.class, 1)).thenReturn(company);
        when(entityManager.merge(any(Company.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        companyDao.deleteByIds(Collections.singletonList(1));

        // Assert
        assertThat(company.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should call merge for each company in deleteByIds")
    void deleteByIdsCallsMergeForEachCompany() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2);
        when(entityManager.find(eq(Company.class), any(Integer.class)))
            .thenReturn(createCompany(1, "Test"));
        when(entityManager.merge(any(Company.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // Act
        companyDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(2)).merge(any(Company.class));
    }

    @Test
    @DisplayName("Should return first currency even when multiple currencies exist")
    void getCompanyCurrencyReturnsFirstWhenMultipleExist() {
        // Arrange
        List<Currency> currencies = createCurrencyList(5);
        when(entityManager.createQuery(
            "select c from Currency c where c.currencyCode IN(SELECT cc.currencyCode FROM Company cc)",
            Currency.class
        )).thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(currencies);

        // Act
        Currency result = companyDao.getCompanyCurrency();

        // Assert
        assertThat(result).isEqualTo(currencies.get(0));
    }

    private List<Company> createCompanyList(int count) {
        List<Company> companies = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            companies.add(createCompany(i + 1, "Company " + (i + 1)));
        }
        return companies;
    }

    private Company createCompany(int id, String name) {
        Company company = new Company();
        company.setCompanyId(id);
        company.setCompanyName(name);
        company.setDeleteFlag(Boolean.FALSE);
        return company;
    }

    private List<Currency> createCurrencyList(int count) {
        List<Currency> currencies = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            currencies.add(createCurrency("CUR" + (i + 1)));
        }
        return currencies;
    }

    private Currency createCurrency(String code) {
        Currency currency = new Currency();
        currency.setCurrencyCode(code);
        currency.setCurrencyName("Currency " + code);
        return currency;
    }

    private List<DropdownModel> createDropdownModelList(int count) {
        List<DropdownModel> models = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            models.add(new DropdownModel(i + 1, "Option " + (i + 1)));
        }
        return models;
    }
}
