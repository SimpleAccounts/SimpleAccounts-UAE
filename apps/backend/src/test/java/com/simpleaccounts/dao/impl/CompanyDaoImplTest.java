package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.rest.DropdownModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

    @InjectMocks
    private CompanyDaoImpl companyDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(companyDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(companyDao, "entityClass", Company.class);
    }

    @Test
    @DisplayName("Should return company")
    void getCompanyReturnsCompany() {
        // Arrange
        Company expectedCompany = createCompany(1, "Test Company");

        when(entityManager.createQuery("SELECT c FROM Company c", Company.class))
            .thenReturn(companyTypedQuery);
        when(companyTypedQuery.getResultList())
            .thenReturn(Arrays.asList(expectedCompany));

        // Act
        Company result = companyDao.getCompany();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCompanyId()).isEqualTo(1);
        assertThat(result.getCompanyName()).isEqualTo("Test Company");
    }

    @Test
    @DisplayName("Should return null when no company exists")
    void getCompanyReturnsNullWhenEmpty() {
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
    @DisplayName("Should return companies for dropdown")
    void getCompaniesForDropdownReturnsDropdownList() {
        // Arrange
        List<DropdownModel> expectedList = Arrays.asList(
            new DropdownModel(1, "Company A"),
            new DropdownModel(2, "Company B")
        );

        when(entityManager.createNamedQuery("companiesForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(expectedList);

        // Act
        List<DropdownModel> result = companyDao.getCompaniesForDropdown();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return empty dropdown list when no companies")
    void getCompaniesForDropdownReturnsEmptyList() {
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
    @DisplayName("Should return company currency")
    void getCompanyCurrencyReturnsCurrency() {
        // Arrange
        Currency expectedCurrency = new Currency();
        expectedCurrency.setCurrencyCode(1);
        expectedCurrency.setCurrencyName("UAE Dirham");
        expectedCurrency.setCurrencyIsoCode("AED");

        when(entityManager.createQuery(anyString(), eq(Currency.class)))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(Arrays.asList(expectedCurrency));

        // Act
        Currency result = companyDao.getCompanyCurrency();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCurrencyIsoCode()).isEqualTo("AED");
    }

    @Test
    @DisplayName("Should return null when no company currency")
    void getCompanyCurrencyReturnsNullWhenEmpty() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(Currency.class)))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Currency result = companyDao.getCompanyCurrency();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find company by ID")
    void findByPKReturnsCompanyById() {
        // Arrange
        int companyId = 1;
        Company expectedCompany = createCompany(companyId, "Test Company");

        when(entityManager.find(Company.class, companyId))
            .thenReturn(expectedCompany);

        // Act
        Company result = companyDao.findByPK(companyId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCompanyId()).isEqualTo(companyId);
    }

    @Test
    @DisplayName("Should return null when company not found by ID")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        int companyId = 999;

        when(entityManager.find(Company.class, companyId))
            .thenReturn(null);

        // Act
        Company result = companyDao.findByPK(companyId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should persist new company")
    void persistCompanyPersistsNewCompany() {
        // Arrange
        Company company = createCompany(100, "New Company");

        // Act - verify EntityManager persist is called correctly
        companyDao.getEntityManager().persist(company);

        // Assert
        verify(entityManager).persist(company);
    }

    @Test
    @DisplayName("Should update existing company")
    void updateCompanyMergesExistingCompany() {
        // Arrange
        Company company = createCompany(1, "Updated Company");
        when(entityManager.merge(company)).thenReturn(company);

        // Act
        Company result = companyDao.update(company);

        // Assert
        verify(entityManager).merge(company);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should handle company with all fields")
    void handleCompanyWithAllFields() {
        // Arrange
        Company company = createCompany(1, "Full Company");
        company.setCompanyRegistrationNumber("REG123");
        company.setVatNumber("VAT456");
        company.setEmailAddress("test@company.com");
        company.setPhoneNumber("123456789");
        company.setWebsite("www.company.com");

        when(entityManager.find(Company.class, 1))
            .thenReturn(company);

        // Act
        Company result = companyDao.findByPK(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCompanyRegistrationNumber()).isEqualTo("REG123");
        assertThat(result.getVatNumber()).isEqualTo("VAT456");
        assertThat(result.getEmailAddress()).isEqualTo("test@company.com");
    }

    @Test
    @DisplayName("Should handle company with address fields")
    void handleCompanyWithAddressFields() {
        // Arrange
        Company company = createCompany(1, "Address Company");
        company.setCompanyAddressLine1("123 Test Street");
        company.setCompanyCity("Dubai");
        company.setCompanyStateRegion("Dubai");
        company.setCompanyPostZipCode("12345");

        when(entityManager.find(Company.class, 1))
            .thenReturn(company);

        // Act
        Company result = companyDao.findByPK(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCompanyAddressLine1()).isEqualTo("123 Test Street");
        assertThat(result.getCompanyCity()).isEqualTo("Dubai");
    }

    private Company createCompany(int companyId, String companyName) {
        Company company = new Company();
        company.setCompanyId(companyId);
        company.setCompanyName(companyName);
        company.setDeleteFlag(false);
        company.setCreatedDate(LocalDateTime.now());
        company.setCreatedBy(1);
        return company;
    }
}
