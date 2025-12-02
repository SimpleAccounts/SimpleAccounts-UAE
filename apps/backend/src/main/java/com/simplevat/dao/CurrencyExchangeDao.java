package com.simplevat.dao;

import com.simplevat.entity.Currency;
import com.simplevat.entity.CurrencyConversion;

import java.math.BigDecimal;
import java.util.List;

/**
 * Created by mohsin on 3/11/2017.
 */
public interface CurrencyExchangeDao extends Dao<Integer, CurrencyConversion> {
//    void saveExchangeCurrencies(Currency baseCurrency,List<Currency> convertCurrenies);
    public CurrencyConversion getExchangeRate(Integer currencyCode);
    public List<CurrencyConversion> getCurrencyConversionList();
    public List<CurrencyConversion> getActiveCurrencyConversionList();
    //public List<CurrencyConversion> getCompanyCurrency();
}
