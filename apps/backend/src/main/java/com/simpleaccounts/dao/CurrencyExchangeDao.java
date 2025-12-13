package com.simpleaccounts.dao;

import com.simpleaccounts.entity.CurrencyConversion;
import java.util.List;

/**
 * Created by mohsin on 3/11/2017.
 */
public interface CurrencyExchangeDao extends Dao<Integer, CurrencyConversion> {

    public CurrencyConversion getExchangeRate(Integer currencyCode);
    public List<CurrencyConversion> getCurrencyConversionList();
    public List<CurrencyConversion> getActiveCurrencyConversionList();

}
