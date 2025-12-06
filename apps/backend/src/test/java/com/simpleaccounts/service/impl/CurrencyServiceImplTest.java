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

import com.simpleaccounts.constant.dbfilter.CurrencyFilterEnum;
import com.simpleaccounts.dao.CurrencyDao;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
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
class CurrencyServiceImplTest {

    @Mock
    private CurrencyDao currencyDao;

    @InjectMocks
    private CurrencyServiceImpl currencyService;

    private Currency testCurrency;
    private Currency defaultCurrency;
    private CurrencyConversion testConversion;

    @BeforeEach
    void setUp() {
        testCurrency = new Currency();
        testCurrency.setCurrencyCode(784); // AED
        testCurrency.setCurrencyName("UAE Dirham");
        testCurrency.setDeleteFlag(false);
        testCurrency.setCurrencySymbol("د.إ");
        testCurrency.setExchangeRate(BigDecimal.valueOf(3.67));

        defaultCurrency = new Currency();
        defaultCurrency.setCurrencyCode(840); // USD
        defaultCurrency.setCurrencyName("US Dollar");
        defaultCurrency.setDeleteFlag(false);
        defaultCurrency.setCurrencySymbol("$");

        testConversion = new CurrencyConversion();
        testConversion.setId(1);
        testConversion.setCurrencyCode(784);
        testConversion.setExchangeRate(BigDecimal.valueOf(3.67));
        testConversion.setCreatedDate(LocalDateTime.now());
    }

    // ========== getCurrencies Tests ==========

    @Test
    void shouldGetCurrenciesSuccessfully() {
        List<Currency> expectedCurrencies = Arrays.asList(testCurrency, defaultCurrency);
        when(currencyDao.getCurrencies()).thenReturn(expectedCurrencies);

        List<Currency> result = currencyService.getCurrencies();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testCurrency, defaultCurrency);
        verify(currencyDao, times(1)).getCurrencies();
    }

    @Test
    void shouldReturnEmptyListWhenNoCurrenciesExist() {
        when(currencyDao.getCurrencies()).thenReturn(Collections.emptyList());

        List<Currency> result = currencyService.getCurrencies();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(currencyDao, times(1)).getCurrencies();
    }

    @Test
    void shouldReturnNullWhenCurrenciesDaoReturnsNull() {
        when(currencyDao.getCurrencies()).thenReturn(null);

        List<Currency> result = currencyService.getCurrencies();

        assertThat(result).isNull();
        verify(currencyDao, times(1)).getCurrencies();
    }

    // ========== getCurrenciesProfile Tests ==========

    @Test
    void shouldGetCurrenciesProfileSuccessfully() {
        List<Currency> expectedCurrencies = Arrays.asList(testCurrency);
        when(currencyDao.getCurrenciesProfile()).thenReturn(expectedCurrencies);

        List<Currency> result = currencyService.getCurrenciesProfile();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCurrencyCode()).isEqualTo(784);
        verify(currencyDao, times(1)).getCurrenciesProfile();
    }

    @Test
    void shouldReturnEmptyListWhenNoCurrenciesProfile() {
        when(currencyDao.getCurrenciesProfile()).thenReturn(Collections.emptyList());

        List<Currency> result = currencyService.getCurrenciesProfile();

        assertThat(result).isEmpty();
        verify(currencyDao, times(1)).getCurrenciesProfile();
    }

    // ========== getCompanyCurrencies Tests ==========

    @Test
    void shouldGetCompanyCurrenciesSuccessfully() {
        List<Currency> expectedCurrencies = Arrays.asList(testCurrency, defaultCurrency);
        when(currencyDao.getCompanyCurrencies()).thenReturn(expectedCurrencies);

        List<Currency> result = currencyService.getCompanyCurrencies();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(currencyDao, times(1)).getCompanyCurrencies();
    }

    @Test
    void shouldReturnEmptyListWhenNoCompanyCurrencies() {
        when(currencyDao.getCompanyCurrencies()).thenReturn(Collections.emptyList());

        List<Currency> result = currencyService.getCompanyCurrencies();

        assertThat(result).isEmpty();
        verify(currencyDao, times(1)).getCompanyCurrencies();
    }

    // ========== getActiveCurrencies Tests ==========

    @Test
    void shouldGetActiveCurrenciesSuccessfully() {
        List<Currency> activeCurrencies = Arrays.asList(testCurrency, defaultCurrency);
        when(currencyDao.getActiveCurrencies()).thenReturn(activeCurrencies);

        List<Currency> result = currencyService.getActiveCurrencies();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDeleteFlag()).isFalse();
        verify(currencyDao, times(1)).getActiveCurrencies();
    }

    @Test
    void shouldReturnEmptyListWhenNoActiveCurrencies() {
        when(currencyDao.getActiveCurrencies()).thenReturn(Collections.emptyList());

        List<Currency> result = currencyService.getActiveCurrencies();

        assertThat(result).isEmpty();
        verify(currencyDao, times(1)).getActiveCurrencies();
    }

    // ========== updateCurrencyProfile Tests ==========

    @Test
    void shouldUpdateCurrencyProfileSuccessfully() {
        when(currencyDao.getDefaultCurrency()).thenReturn(defaultCurrency);
        when(currencyDao.getCurrency(784)).thenReturn(testCurrency);
        when(currencyDao.update(any(Currency.class))).thenReturn(defaultCurrency, testCurrency);

        currencyService.updateCurrencyProfile(784);

        assertThat(defaultCurrency.getDeleteFlag()).isTrue();
        assertThat(testCurrency.getDeleteFlag()).isFalse();
        verify(currencyDao, times(1)).getDefaultCurrency();
        verify(currencyDao, times(1)).getCurrency(784);
        verify(currencyDao, times(2)).update(any(Currency.class));
    }

    @Test
    void shouldUpdateCurrencyProfileWhenNoDefaultCurrency() {
        when(currencyDao.getDefaultCurrency()).thenReturn(null);
        when(currencyDao.getCurrency(784)).thenReturn(testCurrency);
        when(currencyDao.update(testCurrency)).thenReturn(testCurrency);

        currencyService.updateCurrencyProfile(784);

        assertThat(testCurrency.getDeleteFlag()).isFalse();
        verify(currencyDao, times(1)).getDefaultCurrency();
        verify(currencyDao, times(1)).getCurrency(784);
        verify(currencyDao, times(1)).update(testCurrency);
    }

    @Test
    void shouldHandleMultipleCurrencyProfileUpdates() {
        Currency euroCurrency = new Currency();
        euroCurrency.setCurrencyCode(978);
        euroCurrency.setCurrencyName("Euro");

        when(currencyDao.getDefaultCurrency())
                .thenReturn(defaultCurrency)
                .thenReturn(testCurrency);
        when(currencyDao.getCurrency(784)).thenReturn(testCurrency);
        when(currencyDao.getCurrency(978)).thenReturn(euroCurrency);
        when(currencyDao.update(any(Currency.class)))
                .thenReturn(defaultCurrency, testCurrency, testCurrency, euroCurrency);

        currencyService.updateCurrencyProfile(784);
        currencyService.updateCurrencyProfile(978);

        verify(currencyDao, times(2)).getDefaultCurrency();
        verify(currencyDao, times(4)).update(any(Currency.class));
    }

    // ========== updateCurrency Tests ==========

    @Test
    void shouldUpdateCurrencySuccessfully() {
        currencyService.updateCurrency(784);

        verify(currencyDao, times(1)).updateCurrency(784);
    }

    @Test
    void shouldUpdateCurrencyWithDifferentCodes() {
        currencyService.updateCurrency(840);
        currencyService.updateCurrency(978);

        verify(currencyDao, times(1)).updateCurrency(840);
        verify(currencyDao, times(1)).updateCurrency(978);
    }

    // ========== getCurrency Tests ==========

    @Test
    void shouldGetCurrencyByCodeSuccessfully() {
        when(currencyDao.getCurrency(784)).thenReturn(testCurrency);

        Currency result = currencyService.getCurrency(784);

        assertThat(result).isNotNull();
        assertThat(result.getCurrencyCode()).isEqualTo(784);
        assertThat(result.getCurrencyName()).isEqualTo("UAE Dirham");
        verify(currencyDao, times(1)).getCurrency(784);
    }

    @Test
    void shouldReturnNullWhenCurrencyNotFound() {
        when(currencyDao.getCurrency(999)).thenReturn(null);

        Currency result = currencyService.getCurrency(999);

        assertThat(result).isNull();
        verify(currencyDao, times(1)).getCurrency(999);
    }

    @Test
    void shouldGetMultipleCurrenciesByCode() {
        when(currencyDao.getCurrency(784)).thenReturn(testCurrency);
        when(currencyDao.getCurrency(840)).thenReturn(defaultCurrency);

        Currency result1 = currencyService.getCurrency(784);
        Currency result2 = currencyService.getCurrency(840);

        assertThat(result1.getCurrencyName()).isEqualTo("UAE Dirham");
        assertThat(result2.getCurrencyName()).isEqualTo("US Dollar");
        verify(currencyDao, times(1)).getCurrency(784);
        verify(currencyDao, times(1)).getCurrency(840);
    }

    // ========== getDefaultCurrency Tests ==========

    @Test
    void shouldGetDefaultCurrencySuccessfully() {
        when(currencyDao.getDefaultCurrency()).thenReturn(defaultCurrency);

        Currency result = currencyService.getDefaultCurrency();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(defaultCurrency);
        assertThat(result.getDeleteFlag()).isFalse();
        verify(currencyDao, times(1)).getDefaultCurrency();
    }

    @Test
    void shouldReturnNullWhenNoDefaultCurrency() {
        when(currencyDao.getDefaultCurrency()).thenReturn(null);

        Currency result = currencyService.getDefaultCurrency();

        assertThat(result).isNull();
        verify(currencyDao, times(1)).getDefaultCurrency();
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnCurrencyDaoFromGetDao() {
        assertThat(currencyService.getDao()).isEqualTo(currencyDao);
    }

    // ========== getCurrencyRateFromCurrencyConversion Tests ==========

    @Test
    void shouldGetCurrencyRateFromConversionSuccessfully() {
        when(currencyDao.getCurrencyRateFromCurrencyConversion(784)).thenReturn(testConversion);

        CurrencyConversion result = currencyService.getCurrencyRateFromCurrencyConversion(784);

        assertThat(result).isNotNull();
        assertThat(result.getCurrencyCode()).isEqualTo(784);
        assertThat(result.getExchangeRate()).isEqualByComparingTo(BigDecimal.valueOf(3.67));
        verify(currencyDao, times(1)).getCurrencyRateFromCurrencyConversion(784);
    }

    @Test
    void shouldReturnNullWhenConversionRateNotFound() {
        when(currencyDao.getCurrencyRateFromCurrencyConversion(999)).thenReturn(null);

        CurrencyConversion result = currencyService.getCurrencyRateFromCurrencyConversion(999);

        assertThat(result).isNull();
        verify(currencyDao, times(1)).getCurrencyRateFromCurrencyConversion(999);
    }

    // ========== getCountryCodeAsString Tests ==========

    @Test
    void shouldGetCountryCodeAsStringSuccessfully() {
        when(currencyDao.getCountryCodeAsString("AE")).thenReturn("United Arab Emirates");

        String result = currencyService.getCountryCodeAsString("AE");

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo("United Arab Emirates");
        verify(currencyDao, times(1)).getCountryCodeAsString("AE");
    }

    @Test
    void shouldReturnNullWhenCountryCodeNotFound() {
        when(currencyDao.getCountryCodeAsString("XX")).thenReturn(null);

        String result = currencyService.getCountryCodeAsString("XX");

        assertThat(result).isNull();
        verify(currencyDao, times(1)).getCountryCodeAsString("XX");
    }

    @Test
    void shouldHandleEmptyCountryCode() {
        when(currencyDao.getCountryCodeAsString("")).thenReturn("");

        String result = currencyService.getCountryCodeAsString("");

        assertThat(result).isEmpty();
        verify(currencyDao, times(1)).getCountryCodeAsString("");
    }

    // ========== getCountryCodeString Tests ==========

    @Test
    void shouldGetCountryCodeStringListSuccessfully() {
        List<String> countryCodes = Arrays.asList("AE", "US", "GB", "IN");
        when(currencyDao.getCountryCodeString()).thenReturn(countryCodes);

        List<String> result = currencyService.getCountryCodeString();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(4);
        assertThat(result).containsExactly("AE", "US", "GB", "IN");
        verify(currencyDao, times(1)).getCountryCodeString();
    }

    @Test
    void shouldReturnEmptyListWhenNoCountryCodes() {
        when(currencyDao.getCountryCodeString()).thenReturn(Collections.emptyList());

        List<String> result = currencyService.getCountryCodeString();

        assertThat(result).isEmpty();
        verify(currencyDao, times(1)).getCountryCodeString();
    }

    // ========== getCurrencyList Tests ==========

    @Test
    void shouldGetCurrencyListByCriteriaSuccessfully() {
        List<Currency> expectedCurrencies = Arrays.asList(testCurrency);
        when(currencyDao.getCurrencyList(testCurrency)).thenReturn(expectedCurrencies);

        List<Currency> result = currencyService.getCurrencyList(testCurrency);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testCurrency);
        verify(currencyDao, times(1)).getCurrencyList(testCurrency);
    }

    @Test
    void shouldReturnEmptyListWhenNoCurrenciesMatchCriteria() {
        when(currencyDao.getCurrencyList(testCurrency)).thenReturn(Collections.emptyList());

        List<Currency> result = currencyService.getCurrencyList(testCurrency);

        assertThat(result).isEmpty();
        verify(currencyDao, times(1)).getCurrencyList(testCurrency);
    }

    @Test
    void shouldHandleNullCurrencyCriteria() {
        when(currencyDao.getCurrencyList(null)).thenReturn(Collections.emptyList());

        List<Currency> result = currencyService.getCurrencyList(null);

        assertThat(result).isNotNull();
        verify(currencyDao, times(1)).getCurrencyList(null);
    }

    // ========== isCurrencyDataAvailableOnTodayDate Tests ==========

    @Test
    void shouldReturnTrueWhenCurrencyDataAvailableToday() {
        when(currencyDao.isCurrencyDataAvailableOnTodayDate()).thenReturn(true);

        Boolean result = currencyService.isCurrencyDataAvailableOnTodayDate();

        assertThat(result).isTrue();
        verify(currencyDao, times(1)).isCurrencyDataAvailableOnTodayDate();
    }

    @Test
    void shouldReturnFalseWhenCurrencyDataNotAvailableToday() {
        when(currencyDao.isCurrencyDataAvailableOnTodayDate()).thenReturn(false);

        Boolean result = currencyService.isCurrencyDataAvailableOnTodayDate();

        assertThat(result).isFalse();
        verify(currencyDao, times(1)).isCurrencyDataAvailableOnTodayDate();
    }

    @Test
    void shouldReturnNullWhenCurrencyDataCheckReturnsNull() {
        when(currencyDao.isCurrencyDataAvailableOnTodayDate()).thenReturn(null);

        Boolean result = currencyService.isCurrencyDataAvailableOnTodayDate();

        assertThat(result).isNull();
        verify(currencyDao, times(1)).isCurrencyDataAvailableOnTodayDate();
    }

    // ========== getCurrencies with filters and pagination Tests ==========

    @Test
    void shouldGetCurrenciesWithFilterAndPaginationSuccessfully() {
        Map<CurrencyFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(CurrencyFilterEnum.DELETE_FLAG, false);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalCount(2);
        expectedResponse.setData(Arrays.asList(testCurrency, defaultCurrency));

        when(currencyDao.getCurrencies(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = currencyService.getCurrencies(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(2);
        assertThat(result.getData()).hasSize(2);
        verify(currencyDao, times(1)).getCurrencies(filterMap, paginationModel);
    }

    @Test
    void shouldGetCurrenciesWithMultipleFilters() {
        Map<CurrencyFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(CurrencyFilterEnum.DELETE_FLAG, false);
        filterMap.put(CurrencyFilterEnum.CURRENCY_CODE, 784);

        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(5);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalCount(1);
        expectedResponse.setData(Arrays.asList(testCurrency));

        when(currencyDao.getCurrencies(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = currencyService.getCurrencies(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(1);
        assertThat(result.getData()).hasSize(1);
        verify(currencyDao, times(1)).getCurrencies(filterMap, paginationModel);
    }

    @Test
    void shouldHandleEmptyFilterMap() {
        Map<CurrencyFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalCount(0);
        expectedResponse.setData(Collections.emptyList());

        when(currencyDao.getCurrencies(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = currencyService.getCurrencies(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalCount()).isEqualTo(0);
        verify(currencyDao, times(1)).getCurrencies(filterMap, paginationModel);
    }

    @Test
    void shouldHandleNullFilterMapAndPagination() {
        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        when(currencyDao.getCurrencies(null, null)).thenReturn(expectedResponse);

        PaginationResponseModel result = currencyService.getCurrencies(null, null);

        assertThat(result).isNotNull();
        verify(currencyDao, times(1)).getCurrencies(null, null);
    }

    @Test
    void shouldHandleLargePaginationSize() {
        Map<CurrencyFilterEnum, Object> filterMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(100);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        when(currencyDao.getCurrencies(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = currencyService.getCurrencies(filterMap, paginationModel);

        assertThat(result).isNotNull();
        verify(currencyDao, times(1)).getCurrencies(filterMap, paginationModel);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleUpdateCurrencyProfileWithSameCurrency() {
        defaultCurrency.setDeleteFlag(false);
        when(currencyDao.getDefaultCurrency()).thenReturn(defaultCurrency);
        when(currencyDao.getCurrency(840)).thenReturn(defaultCurrency);
        when(currencyDao.update(defaultCurrency)).thenReturn(defaultCurrency);

        currencyService.updateCurrencyProfile(840);

        verify(currencyDao, times(2)).update(defaultCurrency);
    }

    @Test
    void shouldHandleCurrencyWithNullSymbol() {
        Currency currencyWithoutSymbol = new Currency();
        currencyWithoutSymbol.setCurrencyCode(100);
        currencyWithoutSymbol.setCurrencyName("Test Currency");
        currencyWithoutSymbol.setCurrencySymbol(null);

        when(currencyDao.getCurrency(100)).thenReturn(currencyWithoutSymbol);

        Currency result = currencyService.getCurrency(100);

        assertThat(result).isNotNull();
        assertThat(result.getCurrencySymbol()).isNull();
    }

    @Test
    void shouldHandleZeroCurrencyCode() {
        when(currencyDao.getCurrency(0)).thenReturn(null);

        Currency result = currencyService.getCurrency(0);

        assertThat(result).isNull();
        verify(currencyDao, times(1)).getCurrency(0);
    }

    @Test
    void shouldHandleNegativeCurrencyCode() {
        when(currencyDao.getCurrency(-1)).thenReturn(null);

        Currency result = currencyService.getCurrency(-1);

        assertThat(result).isNull();
        verify(currencyDao, times(1)).getCurrency(-1);
    }
}
