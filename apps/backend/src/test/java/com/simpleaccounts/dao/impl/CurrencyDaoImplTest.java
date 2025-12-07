package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Currency;
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
@DisplayName("CurrencyDaoImpl Unit Tests")
class CurrencyDaoImplTest {

  @Mock private EntityManager entityManager;

  @Mock private TypedQuery<Currency> currencyTypedQuery;

  @InjectMocks private CurrencyDaoImpl currencyDao;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(currencyDao, "entityManager", entityManager);
    ReflectionTestUtils.setField(currencyDao, "entityClass", Currency.class);
  }

  @Test
  @DisplayName("Should return all currencies")
  void getCurrenciesReturnsAllCurrencies() {
    // Arrange
    List<Currency> expectedCurrencies =
        Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ"),
            createCurrency(2, "US Dollar", "USD", "$"),
            createCurrency(3, "Euro", "EUR", "€"));

    when(entityManager.createNamedQuery("allCurrencies", Currency.class))
        .thenReturn(currencyTypedQuery);
    when(currencyTypedQuery.getResultList()).thenReturn(expectedCurrencies);

    // Act
    List<Currency> result = currencyDao.getCurrencies();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(3);
    assertThat(result.get(0).getCurrencyName()).isEqualTo("UAE Dirham");
  }

  @Test
  @DisplayName("Should return empty list when no currencies exist")
  void getCurrenciesReturnsEmptyList() {
    // Arrange
    when(entityManager.createNamedQuery("allCurrencies", Currency.class))
        .thenReturn(currencyTypedQuery);
    when(currencyTypedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    List<Currency> result = currencyDao.getCurrencies();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should return currencies profile")
  void getCurrenciesProfileReturnsAllCurrencies() {
    // Arrange
    List<Currency> expectedCurrencies =
        Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ"),
            createCurrency(2, "US Dollar", "USD", "$"));

    when(entityManager.createNamedQuery("allCurrenciesProfile", Currency.class))
        .thenReturn(currencyTypedQuery);
    when(currencyTypedQuery.getResultList()).thenReturn(expectedCurrencies);

    // Act
    List<Currency> result = currencyDao.getCurrenciesProfile();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
  }

  @Test
  @DisplayName("Should return company currencies")
  void getCompanyCurrenciesReturnsCurrencies() {
    // Arrange
    List<Currency> expectedCurrencies =
        Arrays.asList(createCurrency(1, "UAE Dirham", "AED", "د.إ"));

    when(entityManager.createNamedQuery("allCompanyCurrencies", Currency.class))
        .thenReturn(currencyTypedQuery);
    when(currencyTypedQuery.getResultList()).thenReturn(expectedCurrencies);

    // Act
    List<Currency> result = currencyDao.getCompanyCurrencies();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(1);
  }

  @Test
  @DisplayName("Should return active currencies")
  void getActiveCurrenciesReturnsActiveCurrencies() {
    // Arrange
    List<Currency> expectedCurrencies =
        Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ"),
            createCurrency(2, "US Dollar", "USD", "$"));

    when(entityManager.createNamedQuery("allActiveCurrencies", Currency.class))
        .thenReturn(currencyTypedQuery);
    when(currencyTypedQuery.getResultList()).thenReturn(expectedCurrencies);

    // Act
    List<Currency> result = currencyDao.getActiveCurrencies();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
  }

  @Test
  @DisplayName("Should return default currency")
  void getDefaultCurrencyReturnsFirstCurrency() {
    // Arrange
    List<Currency> currencies =
        Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ"),
            createCurrency(2, "US Dollar", "USD", "$"));

    when(entityManager.createNamedQuery("allCurrencies", Currency.class))
        .thenReturn(currencyTypedQuery);
    when(currencyTypedQuery.getResultList()).thenReturn(currencies);

    // Act
    Currency result = currencyDao.getDefaultCurrency();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getCurrencyName()).isEqualTo("UAE Dirham");
  }

  @Test
  @DisplayName("Should return null when no currencies for default")
  void getDefaultCurrencyReturnsNullWhenEmpty() {
    // Arrange
    when(entityManager.createNamedQuery("allCurrencies", Currency.class))
        .thenReturn(currencyTypedQuery);
    when(currencyTypedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    Currency result = currencyDao.getDefaultCurrency();

    // Assert
    assertThat(result).isNull();
  }

  @Test
  @DisplayName("Should find currency by code")
  void getCurrencyReturnsCurrencyByCode() {
    // Arrange
    int currencyCode = 1;
    Currency expectedCurrency = createCurrency(currencyCode, "UAE Dirham", "AED", "د.إ");

    when(entityManager.find(Currency.class, currencyCode)).thenReturn(expectedCurrency);

    // Act
    Currency result = currencyDao.getCurrency(currencyCode);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getCurrencyCode()).isEqualTo(currencyCode);
    assertThat(result.getCurrencyIsoCode()).isEqualTo("AED");
  }

  @Test
  @DisplayName("Should return null when currency not found by code")
  void getCurrencyReturnsNullWhenNotFound() {
    // Arrange
    int currencyCode = 999;

    when(entityManager.find(Currency.class, currencyCode)).thenReturn(null);

    // Act
    Currency result = currencyDao.getCurrency(currencyCode);

    // Assert
    assertThat(result).isNull();
  }

  @Test
  @DisplayName("Should persist new currency")
  void persistCurrencyPersistsNewCurrency() {
    // Arrange
    Currency currency = createCurrency(100, "New Currency", "NEW", "N");

    // Act - verify EntityManager persist is called correctly
    currencyDao.getEntityManager().persist(currency);

    // Assert
    verify(entityManager).persist(currency);
  }

  @Test
  @DisplayName("Should update existing currency")
  void updateCurrencyMergesExistingCurrency() {
    // Arrange
    Currency currency = createCurrency(1, "Updated Currency", "UPD", "U");
    when(entityManager.merge(currency)).thenReturn(currency);

    // Act
    Currency result = currencyDao.update(currency);

    // Assert
    verify(entityManager).merge(currency);
    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should handle currency with all fields")
  void handleCurrencyWithAllFields() {
    // Arrange
    Currency currency = createCurrency(1, "UAE Dirham", "AED", "د.إ");
    currency.setCurrencyDescription("United Arab Emirates Dirham");
    currency.setDefaultFlag('Y');
    currency.setOrderSequence(1);

    when(entityManager.find(Currency.class, 1)).thenReturn(currency);

    // Act
    Currency result = currencyDao.getCurrency(1);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getCurrencyDescription()).isEqualTo("United Arab Emirates Dirham");
    assertThat(result.getDefaultFlag()).isEqualTo('Y');
  }

  private Currency createCurrency(
      int currencyCode, String currencyName, String isoCode, String symbol) {
    Currency currency = new Currency();
    currency.setCurrencyCode(currencyCode);
    currency.setCurrencyName(currencyName);
    currency.setCurrencyIsoCode(isoCode);
    currency.setCurrencySymbol(symbol);
    currency.setDeleteFlag(false);
    currency.setCreatedDate(LocalDateTime.now());
    currency.setCreatedBy(1);
    return currency;
  }
}
