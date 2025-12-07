package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CompanyDao;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.DropdownModel;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("CompanyServiceImpl Unit Tests")
class CompanyServiceImplTest {

  @Mock private CompanyDao companyDao;

  @InjectMocks private CompanyServiceImpl companyService;

  @Test
  @DisplayName("Should find company by ID")
  void findByIdReturnsCompany() {
    Integer companyId = 1;
    Company expectedCompany = createCompany(companyId, "Test Company");

    when(companyDao.findByPK(companyId)).thenReturn(expectedCompany);

    Company result = companyService.findByPK(companyId);

    assertThat(result).isNotNull();
    assertThat(result.getCompanyId()).isEqualTo(companyId);
    verify(companyDao).findByPK(companyId);
  }

  @Test
  @DisplayName("Should throw exception when company not found")
  void findByIdThrowsExceptionWhenNotFound() {
    Integer companyId = 999;

    when(companyDao.findByPK(companyId)).thenReturn(null);

    assertThatThrownBy(() -> companyService.findByPK(companyId))
        .isInstanceOf(ServiceException.class);
  }

  @Test
  @DisplayName("Should return company")
  void getCompanyReturnsCompany() {
    Company expectedCompany = createCompany(1, "Test Company");

    when(companyDao.getCompany()).thenReturn(expectedCompany);

    Company result = companyService.getCompany();

    assertThat(result).isNotNull();
    assertThat(result.getCompanyName()).isEqualTo("Test Company");
  }

  @Test
  @DisplayName("Should return null when no company exists")
  void getCompanyReturnsNull() {
    when(companyDao.getCompany()).thenReturn(null);

    Company result = companyService.getCompany();

    assertThat(result).isNull();
  }

  @Test
  @DisplayName("Should return companies for dropdown")
  void getCompaniesForDropdownReturnsList() {
    List<DropdownModel> expectedList =
        Arrays.asList(new DropdownModel(1, "Company A"), new DropdownModel(2, "Company B"));

    when(companyDao.getCompaniesForDropdown()).thenReturn(expectedList);

    List<DropdownModel> result = companyService.getCompaniesForDropdown();

    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
  }

  @Test
  @DisplayName("Should return company currency")
  void getCompanyCurrencyReturnsCurrency() {
    Currency expectedCurrency = new Currency();
    expectedCurrency.setCurrencyCode(1);
    expectedCurrency.setCurrencyName("UAE Dirham");

    when(companyDao.getCompanyCurrency()).thenReturn(expectedCurrency);

    Currency result = companyService.getCompanyCurrency();

    assertThat(result).isNotNull();
    assertThat(result.getCurrencyName()).isEqualTo("UAE Dirham");
  }

  @Test
  @DisplayName("Should return DB connection check")
  void getDbConnectionReturnsValue() {
    when(companyDao.getDbConncection()).thenReturn(1);

    Integer result = companyService.getDbConncection();

    assertThat(result).isEqualTo(1);
  }

  private Company createCompany(Integer id, String name) {
    Company company = new Company();
    company.setCompanyId(id);
    company.setCompanyName(name);
    company.setDeleteFlag(false);
    return company;
  }
}
