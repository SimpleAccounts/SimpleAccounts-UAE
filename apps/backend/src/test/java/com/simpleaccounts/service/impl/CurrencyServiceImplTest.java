package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.CurrencyDao;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("CurrencyServiceImpl Unit Tests")
class CurrencyServiceImplTest {

    @Mock
    private CurrencyDao currencyDao;

    @InjectMocks
    private CurrencyServiceImpl currencyService;

    @Test
    @DisplayName("Should find currency by ID")
    void findByIdReturnsCurrency() {
        Integer currencyCode = 1;
        Currency expectedCurrency = createCurrency(currencyCode, "UAE Dirham", "AED", "د.إ");

        when(currencyDao.findByPK(currencyCode)).thenReturn(expectedCurrency);

        Currency result = currencyService.findByPK(currencyCode);

        assertThat(result).isNotNull();
        assertThat(result.getCurrencyCode()).isEqualTo(currencyCode);
        verify(currencyDao).findByPK(currencyCode);
    }

    @Test
    @DisplayName("Should throw exception when currency not found")
    void findByIdThrowsExceptionWhenNotFound() {
        Integer currencyCode = 999;

        when(currencyDao.findByPK(currencyCode)).thenReturn(null);

        assertThatThrownBy(() -> currencyService.findByPK(currencyCode))
            .isInstanceOf(ServiceException.class);
    }

    @Test
    @DisplayName("Should return currencies profile")
    void getCurrenciesProfileReturnsList() {
        List<Currency> expectedCurrencies = Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ"),
            createCurrency(2, "US Dollar", "USD", "$")
        );

        when(currencyDao.getCurrenciesProfile()).thenReturn(expectedCurrencies);

        List<Currency> result = currencyService.getCurrenciesProfile();

        assertThat(result).isNotNull().hasSize(2);
        verify(currencyDao).getCurrenciesProfile();
    }

    @Test
    @DisplayName("Should return empty list when no currencies profile")
    void getCurrenciesProfileReturnsEmptyList() {
        when(currencyDao.getCurrenciesProfile()).thenReturn(Collections.emptyList());

        List<Currency> result = currencyService.getCurrenciesProfile();

        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return active currencies")
    void getActiveCurrenciesReturnsList() {
        List<Currency> expectedCurrencies = Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ")
        );

        when(currencyDao.getActiveCurrencies()).thenReturn(expectedCurrencies);

        List<Currency> result = currencyService.getActiveCurrencies();

        assertThat(result).isNotNull().hasSize(1);
    }

    @Test
    @DisplayName("Should return company currencies")
    void getCompanyCurrenciesReturnsList() {
        List<Currency> expectedCurrencies = Arrays.asList(
            createCurrency(1, "UAE Dirham", "AED", "د.إ")
        );

        when(currencyDao.getCompanyCurrencies()).thenReturn(expectedCurrencies);

        List<Currency> result = currencyService.getCompanyCurrencies();

        assertThat(result).isNotNull().hasSize(1);
    }

    @Test
    @DisplayName("Should get currency by code")
    void getCurrencyReturnsCurrency() {
        Currency expectedCurrency = createCurrency(1, "UAE Dirham", "AED", "د.إ");

        when(currencyDao.getCurrency(1)).thenReturn(expectedCurrency);

        Currency result = currencyService.getCurrency(1);

        assertThat(result).isNotNull();
        assertThat(result.getCurrencyName()).isEqualTo("UAE Dirham");
    }

    private Currency createCurrency(Integer code, String name, String isoCode, String symbol) {
        Currency currency = new Currency();
        currency.setCurrencyCode(code);
        currency.setCurrencyName(name);
        currency.setCurrencyIsoCode(isoCode);
        currency.setCurrencySymbol(symbol);
        currency.setDeleteFlag(false);
        return currency;
    }
}
