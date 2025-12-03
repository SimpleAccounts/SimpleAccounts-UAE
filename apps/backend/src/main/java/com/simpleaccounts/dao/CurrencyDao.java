package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.CurrencyFilterEnum;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

/**
 * Created by mohsin on 3/11/2017.
 */
public interface CurrencyDao extends Dao<Integer, Currency> {

    List<Currency> getCurrencies();

    List<Currency> getCurrenciesProfile();

    List<Currency> getCompanyCurrencies();

    List<Currency> getActiveCurrencies();

    Currency getCurrency(final int currencyCode);

    Currency getDefaultCurrency();

    CurrencyConversion getCurrencyRateFromCurrencyConversion(int currencyCode);

    String getCountryCodeAsString(String countryCode);

    List<String> getCountryCodeString();

    List<Currency> getCurrencyList(Currency currency);
    
    Boolean isCurrencyDataAvailableOnTodayDate();

    PaginationResponseModel getCurrencies(Map<CurrencyFilterEnum, Object> filterDataMap, PaginationModel paginationModel);

    void updateCurrency(Integer currencyCode);
}
