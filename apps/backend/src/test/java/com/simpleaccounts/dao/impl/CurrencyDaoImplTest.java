package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.Query;
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

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Currency> currencyTypedQuery;

    @Mock
    private TypedQuery<CurrencyConversion> conversionTypedQuery;

    @Mock
    private TypedQuery<String> stringTypedQuery;

    @Mock
    private Query query;

    @InjectMocks
    private CurrencyDaoImpl currencyDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(currencyDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(currencyDao, "entityClass", Currency.class);
    }

    @Test
    @DisplayName("Should return list of all currencies")
    void getCurrenciesReturnsAllCurrencies() {
        // Arrange
        List<Currency> expectedCurrencies = createCurrencyList(5);

        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(expectedCurrencies);

        // Act
        List<Currency> result = currencyDao.getCurrencies();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedCurrencies);
    }

    @Test
    @DisplayName("Should return currencies for profile")
    void getCurrenciesProfileReturnsCurrencies() {
        // Arrange
        List<Currency> expectedCurrencies = createCurrencyList(3);

        when(entityManager.createNamedQuery("allCurrenciesProfile", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(expectedCurrencies);

        // Act
        List<Currency> result = currencyDao.getCurrenciesProfile();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return company currencies")
    void getCompanyCurrenciesReturnsCurrencies() {
        // Arrange
        List<Currency> expectedCurrencies = createCurrencyList(2);

        when(entityManager.createNamedQuery("allCompanyCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(expectedCurrencies);

        // Act
        List<Currency> result = currencyDao.getCompanyCurrencies();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return active currencies only")
    void getActiveCurrenciesReturnsActiveCurrencies() {
        // Arrange
        List<Currency> expectedCurrencies = createCurrencyList(4);

        when(entityManager.createNamedQuery("allActiveCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(expectedCurrencies);

        // Act
        List<Currency> result = currencyDao.getActiveCurrencies();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
    }

    @Test
    @DisplayName("Should return default currency as first in list")
    void getDefaultCurrencyReturnsFirstCurrency() {
        // Arrange
        Currency firstCurrency = createCurrency(1, "AED", "United Arab Emirates Dirham");
        Currency secondCurrency = createCurrency(2, "USD", "US Dollar");
        List<Currency> currencies = Arrays.asList(firstCurrency, secondCurrency);

        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(currencies);

        // Act
        Currency result = currencyDao.getDefaultCurrency();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(firstCurrency);
        assertThat(result.getCurrencyIsoCode()).isEqualTo("AED");
    }

    @Test
    @DisplayName("Should return null when no currencies exist for default")
    void getDefaultCurrencyReturnsNullWhenEmpty() {
        // Arrange
        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Currency result = currencyDao.getDefaultCurrency();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when currencies list is null for default")
    void getDefaultCurrencyReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        Currency result = currencyDao.getDefaultCurrency();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return currency by code")
    void getCurrencyReturnsCurrencyByCode() {
        // Arrange
        int currencyCode = 1;
        Currency expectedCurrency = createCurrency(currencyCode, "AED", "UAE Dirham");

        when(entityManager.find(Currency.class, currencyCode))
            .thenReturn(expectedCurrency);

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

        when(entityManager.find(Currency.class, currencyCode))
            .thenReturn(null);

        // Act
        Currency result = currencyDao.getCurrency(currencyCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return currency conversion rate for currency code")
    void getCurrencyRateFromCurrencyConversionReturnsRate() {
        // Arrange
        int currencyCode = 1;
        CurrencyConversion expectedConversion = new CurrencyConversion();
        expectedConversion.setCurrencyCodeConvertedTo(currencyCode);
        expectedConversion.setConversionRate(3.67);

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CURRENCY_CODE), eq(currencyCode)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CREATED_DATE), any(LocalDateTime.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(expectedConversion));

        // Act
        CurrencyConversion result = currencyDao.getCurrencyRateFromCurrencyConversion(currencyCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCurrencyCodeConvertedTo()).isEqualTo(currencyCode);
    }

    @Test
    @DisplayName("Should return null when no currency conversion found")
    void getCurrencyRateFromCurrencyConversionReturnsNullWhenNotFound() {
        // Arrange
        int currencyCode = 2;

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CURRENCY_CODE), eq(currencyCode)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CREATED_DATE), any(LocalDateTime.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        CurrencyConversion result = currencyDao.getCurrencyRateFromCurrencyConversion(currencyCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return true when currency data available for today")
    void isCurrencyDataAvailableOnTodayDateReturnsTrue() {
        // Arrange
        List<CurrencyConversion> conversions = Collections.singletonList(new CurrencyConversion());

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CREATED_DATE), any(LocalDateTime.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.getResultList())
            .thenReturn(conversions);

        // Act
        Boolean result = currencyDao.isCurrencyDataAvailableOnTodayDate();

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should return false when no currency data for today")
    void isCurrencyDataAvailableOnTodayDateReturnsFalse() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CREATED_DATE), any(LocalDateTime.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Boolean result = currencyDao.isCurrencyDataAvailableOnTodayDate();

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should return country codes as comma-separated string")
    void getCountryCodeAsStringReturnsCommaSeparatedString() {
        // Arrange
        String countryCode = "AED";
        List<String> codes = Arrays.asList("USD", "EUR", "GBP");

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(eq(CommonColumnConstants.CURRENCY_CODE), eq(countryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(codes);

        // Act
        String result = currencyDao.getCountryCodeAsString(countryCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo("USD,EUR,GBP");
    }

    @Test
    @DisplayName("Should return currency list excluding given currency")
    void getCurrencyListExcludesGivenCurrency() {
        // Arrange
        Currency excludedCurrency = createCurrency(1, "AED", "UAE Dirham");
        List<Currency> otherCurrencies = Arrays.asList(
            createCurrency(2, "USD", "US Dollar"),
            createCurrency(3, "EUR", "Euro")
        );

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(eq(CommonColumnConstants.CURRENCY_CODE), eq("AED")))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(otherCurrencies);

        // Act
        List<Currency> result = currencyDao.getCurrencyList(excludedCurrency);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).doesNotContain(excludedCurrency);
    }

    @Test
    @DisplayName("Should return list of country code strings")
    void getCountryCodeStringReturnsListOfCodes() {
        // Arrange
        List<String> expectedCodes = Arrays.asList("AED", "USD", "EUR", "GBP");

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(expectedCodes);

        // Act
        List<String> result = currencyDao.getCountryCodeString();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
        assertThat(result).containsExactlyElementsOf(expectedCodes);
    }

    @Test
    @DisplayName("Should update currency delete flag")
    void updateCurrencyExecutesUpdate() {
        // Arrange
        Integer currencyCode = 1;

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(eq(CommonColumnConstants.CURRENCY_CODE), eq(currencyCode)))
            .thenReturn(query);
        when(query.executeUpdate())
            .thenReturn(5);

        // Act
        currencyDao.updateCurrency(currencyCode);

        // Assert
        verify(query).executeUpdate();
        verify(query).setParameter(CommonColumnConstants.CURRENCY_CODE, currencyCode);
    }

    @Test
    @DisplayName("Should handle empty currency list")
    void getCurrenciesHandlesEmptyList() {
        // Arrange
        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Currency> result = currencyDao.getCurrencies();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle single currency in list")
    void getCurrenciesHandlesSingleCurrency() {
        // Arrange
        List<Currency> currencies = Collections.singletonList(
            createCurrency(1, "AED", "UAE Dirham")
        );

        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(currencies);

        // Act
        List<Currency> result = currencyDao.getCurrencies();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCurrencyIsoCode()).isEqualTo("AED");
    }

    @Test
    @DisplayName("Should use correct named query for allCurrencies")
    void getCurrenciesUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyDao.getCurrencies();

        // Assert
        verify(entityManager).createNamedQuery("allCurrencies", Currency.class);
    }

    @Test
    @DisplayName("Should use correct named query for allCurrenciesProfile")
    void getCurrenciesProfileUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allCurrenciesProfile", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyDao.getCurrenciesProfile();

        // Assert
        verify(entityManager).createNamedQuery("allCurrenciesProfile", Currency.class);
    }

    @Test
    @DisplayName("Should use correct named query for allCompanyCurrencies")
    void getCompanyCurrenciesUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allCompanyCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyDao.getCompanyCurrencies();

        // Assert
        verify(entityManager).createNamedQuery("allCompanyCurrencies", Currency.class);
    }

    @Test
    @DisplayName("Should use correct named query for allActiveCurrencies")
    void getActiveCurrenciesUsesCorrectNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allActiveCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyDao.getActiveCurrencies();

        // Assert
        verify(entityManager).createNamedQuery("allActiveCurrencies", Currency.class);
    }

    @Test
    @DisplayName("Should handle large list of currencies")
    void getCurrenciesHandlesLargeList() {
        // Arrange
        List<Currency> currencies = createCurrencyList(150);

        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(currencies);

        // Act
        List<Currency> result = currencyDao.getCurrencies();

        // Assert
        assertThat(result).hasSize(150);
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls to getCurrencies")
    void getCurrenciesReturnsConsistentResults() {
        // Arrange
        List<Currency> currencies = createCurrencyList(5);

        when(entityManager.createNamedQuery("allCurrencies", Currency.class))
            .thenReturn(currencyTypedQuery);
        when(currencyTypedQuery.getResultList())
            .thenReturn(currencies);

        // Act
        List<Currency> result1 = currencyDao.getCurrencies();
        List<Currency> result2 = currencyDao.getCurrencies();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should verify entity manager find is called for getCurrency")
    void getCurrencyCallsEntityManagerFind() {
        // Arrange
        int currencyCode = 5;

        when(entityManager.find(Currency.class, currencyCode))
            .thenReturn(createCurrency(currencyCode, "EUR", "Euro"));

        // Act
        currencyDao.getCurrency(currencyCode);

        // Assert
        verify(entityManager).find(Currency.class, currencyCode);
    }

    @Test
    @DisplayName("Should handle null result for currency conversion")
    void getCurrencyRateFromCurrencyConversionHandlesNullResult() {
        // Arrange
        int currencyCode = 3;

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CURRENCY_CODE), eq(currencyCode)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CREATED_DATE), any(LocalDateTime.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        CurrencyConversion result = currencyDao.getCurrencyRateFromCurrencyConversion(currencyCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle false when currency data list is null")
    void isCurrencyDataAvailableOnTodayDateHandlesNullList() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.setParameter(eq(CommonColumnConstants.CREATED_DATE), any(LocalDateTime.class)))
            .thenReturn(conversionTypedQuery);
        when(conversionTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        Boolean result = currencyDao.isCurrencyDataAvailableOnTodayDate();

        // Assert
        assertThat(result).isFalse();
    }

    @Test
    @DisplayName("Should return empty string when no country codes found")
    void getCountryCodeAsStringReturnsEmptyStringWhenNoCodes() {
        // Arrange
        String countryCode = "XYZ";

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(eq(CommonColumnConstants.CURRENCY_CODE), eq(countryCode)))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        String result = currencyDao.getCountryCodeAsString(countryCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty list for getCurrencyList")
    void getCurrencyListHandlesEmptyResult() {
        // Arrange
        Currency currency = createCurrency(1, "AED", "UAE Dirham");

        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter(eq(CommonColumnConstants.CURRENCY_CODE), eq("AED")))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Currency> result = currencyDao.getCurrencyList(currency);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    private List<Currency> createCurrencyList(int count) {
        List<Currency> currencies = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            currencies.add(createCurrency(i + 1, "CUR" + (i + 1), "Currency " + (i + 1)));
        }
        return currencies;
    }

    private Currency createCurrency(int code, String isoCode, String name) {
        Currency currency = new Currency();
        currency.setCurrencyCode(code);
        currency.setCurrencyIsoCode(isoCode);
        currency.setCurrencyName(name);
        return currency;
    }
}
