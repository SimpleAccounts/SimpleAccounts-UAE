package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
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
@DisplayName("CurrencyExchangeDaoImpl Unit Tests")
class CurrencyExchangeDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<CurrencyConversion> currencyConversionTypedQuery;

    @InjectMocks
    private CurrencyExchangeDaoImpl currencyExchangeDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(currencyExchangeDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(currencyExchangeDao, "entityClass", CurrencyConversion.class);
    }

    @Test
    @DisplayName("Should return exchange rate when currency code exists")
    void getExchangeRateReturnsCurrencyConversionWhenExists() {
        // Arrange
        Integer currencyCode = 1;
        CurrencyConversion conversion = createCurrencyConversion(1, 1, 2, BigDecimal.valueOf(1.5));

        when(entityManager.createQuery(
            " SELECT cc FROM CurrencyConversion cc WHERE cc.currencyCode.currencyCode=:currencyCode",
            CurrencyConversion.class
        )).thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter("currencyCode", currencyCode))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(conversion));
        when(currencyConversionTypedQuery.getSingleResult())
            .thenReturn(conversion);

        // Act
        CurrencyConversion result = currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(conversion);
        verify(currencyConversionTypedQuery).setParameter("currencyCode", currencyCode);
    }

    @Test
    @DisplayName("Should return null when currency code does not exist")
    void getExchangeRateReturnsNullWhenNotExists() {
        // Arrange
        Integer currencyCode = 999;

        when(entityManager.createQuery(
            " SELECT cc FROM CurrencyConversion cc WHERE cc.currencyCode.currencyCode=:currencyCode",
            CurrencyConversion.class
        )).thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter("currencyCode", currencyCode))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        CurrencyConversion result = currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when result list is null")
    void getExchangeRateReturnsNullWhenResultListIsNull() {
        // Arrange
        Integer currencyCode = 1;

        when(entityManager.createQuery(
            " SELECT cc FROM CurrencyConversion cc WHERE cc.currencyCode.currencyCode=:currencyCode",
            CurrencyConversion.class
        )).thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter("currencyCode", currencyCode))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        CurrencyConversion result = currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should execute correct query for getExchangeRate")
    void getExchangeRateExecutesCorrectQuery() {
        // Arrange
        Integer currencyCode = 1;

        when(entityManager.createQuery(
            " SELECT cc FROM CurrencyConversion cc WHERE cc.currencyCode.currencyCode=:currencyCode",
            CurrencyConversion.class
        )).thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter("currencyCode", currencyCode))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        verify(entityManager).createQuery(
            " SELECT cc FROM CurrencyConversion cc WHERE cc.currencyCode.currencyCode=:currencyCode",
            CurrencyConversion.class
        );
    }

    @Test
    @DisplayName("Should set correct parameter value for getExchangeRate")
    void getExchangeRateSetsCorrectParameterValue() {
        // Arrange
        Integer currencyCode = 5;

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter(anyString(), any()))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        verify(currencyConversionTypedQuery).setParameter("currencyCode", currencyCode);
    }

    @Test
    @DisplayName("Should return single result when list has one element")
    void getExchangeRateReturnsSingleResultWhenListHasOneElement() {
        // Arrange
        Integer currencyCode = 1;
        CurrencyConversion conversion = createCurrencyConversion(1, 1, 2, BigDecimal.valueOf(2.0));

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter(anyString(), any()))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(conversion));
        when(currencyConversionTypedQuery.getSingleResult())
            .thenReturn(conversion);

        // Act
        CurrencyConversion result = currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        assertThat(result).isEqualTo(conversion);
        verify(currencyConversionTypedQuery).getSingleResult();
    }

    @Test
    @DisplayName("Should return currency conversion list from named query")
    void getCurrencyConversionListReturnsListFromNamedQuery() {
        // Arrange
        List<CurrencyConversion> conversions = createCurrencyConversionList(5);
        when(entityManager.createNamedQuery("listOfCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(conversions);

        // Act
        List<CurrencyConversion> result = currencyExchangeDao.getCurrencyConversionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(conversions);
    }

    @Test
    @DisplayName("Should return empty list when no currency conversions exist")
    void getCurrencyConversionListReturnsEmptyListWhenNoneExist() {
        // Arrange
        when(entityManager.createNamedQuery("listOfCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<CurrencyConversion> result = currencyExchangeDao.getCurrencyConversionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use listOfCurrency named query")
    void getCurrencyConversionListUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("listOfCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyExchangeDao.getCurrencyConversionList();

        // Assert
        verify(entityManager).createNamedQuery("listOfCurrency", CurrencyConversion.class);
    }

    @Test
    @DisplayName("Should return active currency conversion list from named query")
    void getActiveCurrencyConversionListReturnsActiveList() {
        // Arrange
        List<CurrencyConversion> activeConversions = createCurrencyConversionList(3);
        when(entityManager.createNamedQuery("listOfActiveCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(activeConversions);

        // Act
        List<CurrencyConversion> result = currencyExchangeDao.getActiveCurrencyConversionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(activeConversions);
    }

    @Test
    @DisplayName("Should return empty list when no active currency conversions exist")
    void getActiveCurrencyConversionListReturnsEmptyListWhenNoneExist() {
        // Arrange
        when(entityManager.createNamedQuery("listOfActiveCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<CurrencyConversion> result = currencyExchangeDao.getActiveCurrencyConversionList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use listOfActiveCurrency named query")
    void getActiveCurrencyConversionListUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("listOfActiveCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyExchangeDao.getActiveCurrencyConversionList();

        // Assert
        verify(entityManager).createNamedQuery("listOfActiveCurrency", CurrencyConversion.class);
    }

    @Test
    @DisplayName("Should handle multiple currency conversions in list")
    void getCurrencyConversionListHandlesMultipleConversions() {
        // Arrange
        List<CurrencyConversion> conversions = Arrays.asList(
            createCurrencyConversion(1, 1, 2, BigDecimal.valueOf(1.5)),
            createCurrencyConversion(2, 1, 3, BigDecimal.valueOf(2.0)),
            createCurrencyConversion(3, 2, 3, BigDecimal.valueOf(1.33))
        );
        when(entityManager.createNamedQuery("listOfCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(conversions);

        // Act
        List<CurrencyConversion> result = currencyExchangeDao.getCurrencyConversionList();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getExchangeRate()).isEqualByComparingTo(BigDecimal.valueOf(1.5));
        assertThat(result.get(1).getExchangeRate()).isEqualByComparingTo(BigDecimal.valueOf(2.0));
    }

    @Test
    @DisplayName("Should return correct exchange rate value")
    void getExchangeRateReturnsCorrectValue() {
        // Arrange
        Integer currencyCode = 1;
        BigDecimal expectedRate = BigDecimal.valueOf(3.67);
        CurrencyConversion conversion = createCurrencyConversion(1, 1, 2, expectedRate);

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter(anyString(), any()))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(conversion));
        when(currencyConversionTypedQuery.getSingleResult())
            .thenReturn(conversion);

        // Act
        CurrencyConversion result = currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        assertThat(result.getExchangeRate()).isEqualByComparingTo(expectedRate);
    }

    @Test
    @DisplayName("Should handle zero exchange rate")
    void getExchangeRateHandlesZeroRate() {
        // Arrange
        Integer currencyCode = 1;
        CurrencyConversion conversion = createCurrencyConversion(1, 1, 2, BigDecimal.ZERO);

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter(anyString(), any()))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(conversion));
        when(currencyConversionTypedQuery.getSingleResult())
            .thenReturn(conversion);

        // Act
        CurrencyConversion result = currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getExchangeRate()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should handle null currency code gracefully")
    void getExchangeRateHandlesNullCurrencyCode() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter(anyString(), any()))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        CurrencyConversion result = currencyExchangeDao.getExchangeRate(null);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return large list of currency conversions")
    void getCurrencyConversionListHandlesLargeList() {
        // Arrange
        List<CurrencyConversion> conversions = createCurrencyConversionList(100);
        when(entityManager.createNamedQuery("listOfCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(conversions);

        // Act
        List<CurrencyConversion> result = currencyExchangeDao.getCurrencyConversionList();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should return large list of active currency conversions")
    void getActiveCurrencyConversionListHandlesLargeList() {
        // Arrange
        List<CurrencyConversion> conversions = createCurrencyConversionList(50);
        when(entityManager.createNamedQuery("listOfActiveCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(conversions);

        // Act
        List<CurrencyConversion> result = currencyExchangeDao.getActiveCurrencyConversionList();

        // Assert
        assertThat(result).hasSize(50);
    }

    @Test
    @DisplayName("Should maintain exchange rate precision")
    void getExchangeRateMaintainsPrecision() {
        // Arrange
        Integer currencyCode = 1;
        BigDecimal preciseRate = new BigDecimal("1.234567890123456789");
        CurrencyConversion conversion = createCurrencyConversion(1, 1, 2, preciseRate);

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter(anyString(), any()))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(conversion));
        when(currencyConversionTypedQuery.getSingleResult())
            .thenReturn(conversion);

        // Act
        CurrencyConversion result = currencyExchangeDao.getExchangeRate(currencyCode);

        // Assert
        assertThat(result.getExchangeRate()).isEqualByComparingTo(preciseRate);
    }

    @Test
    @DisplayName("Should call getResultList exactly once for getCurrencyConversionList")
    void getCurrencyConversionListCallsGetResultListOnce() {
        // Arrange
        when(entityManager.createNamedQuery("listOfCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyExchangeDao.getCurrencyConversionList();

        // Assert
        verify(currencyConversionTypedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call getResultList exactly once for getActiveCurrencyConversionList")
    void getActiveCurrencyConversionListCallsGetResultListOnce() {
        // Arrange
        when(entityManager.createNamedQuery("listOfActiveCurrency", CurrencyConversion.class))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        currencyExchangeDao.getActiveCurrencyConversionList();

        // Assert
        verify(currencyConversionTypedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should handle different currency codes correctly")
    void getExchangeRateHandlesDifferentCurrencyCodes() {
        // Arrange
        Integer currencyCode1 = 1;
        Integer currencyCode2 = 2;

        CurrencyConversion conversion1 = createCurrencyConversion(1, 1, 2, BigDecimal.valueOf(1.5));
        CurrencyConversion conversion2 = createCurrencyConversion(2, 2, 3, BigDecimal.valueOf(2.0));

        when(entityManager.createQuery(anyString(), eq(CurrencyConversion.class)))
            .thenReturn(currencyConversionTypedQuery);
        when(currencyConversionTypedQuery.setParameter(anyString(), any()))
            .thenReturn(currencyConversionTypedQuery);

        when(currencyConversionTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(conversion1))
            .thenReturn(Collections.singletonList(conversion2));
        when(currencyConversionTypedQuery.getSingleResult())
            .thenReturn(conversion1)
            .thenReturn(conversion2);

        // Act
        CurrencyConversion result1 = currencyExchangeDao.getExchangeRate(currencyCode1);
        CurrencyConversion result2 = currencyExchangeDao.getExchangeRate(currencyCode2);

        // Assert
        assertThat(result1.getExchangeRate()).isEqualByComparingTo(BigDecimal.valueOf(1.5));
        assertThat(result2.getExchangeRate()).isEqualByComparingTo(BigDecimal.valueOf(2.0));
    }

    private CurrencyConversion createCurrencyConversion(int id, int fromCurrencyCode,
                                                        int toCurrencyCode, BigDecimal rate) {
        CurrencyConversion conversion = new CurrencyConversion();
        conversion.setCurrencyConversionId(id);
        conversion.setExchangeRate(rate);
        conversion.setCreatedDate(LocalDateTime.now());

        Currency fromCurrency = new Currency();
        fromCurrency.setCurrencyCode(String.valueOf(fromCurrencyCode));
        conversion.setCurrencyCode(fromCurrency);

        Currency toCurrency = new Currency();
        toCurrency.setCurrencyCode(String.valueOf(toCurrencyCode));
        conversion.setCurrencyCodeConvertedTo(toCurrency);

        return conversion;
    }

    private List<CurrencyConversion> createCurrencyConversionList(int count) {
        List<CurrencyConversion> conversions = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            conversions.add(createCurrencyConversion(
                i + 1,
                1,
                i + 2,
                BigDecimal.valueOf(1.0 + (i * 0.1))
            ));
        }
        return conversions;
    }
}
