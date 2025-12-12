package com.simpleaccounts.service;

import com.simpleaccounts.entity.CurrencyConversion;

import java.util.List;

/**
 * Created by mohsin on 3/11/2017.
 */
public abstract class CurrencyExchangeService extends SimpleAccountsService<Integer, CurrencyConversion> {
//	public abstract void saveExchangeCurrencies(Currency baseCurrency,List<Currency> convertCurrenies);
	public abstract CurrencyConversion getExchangeRate(Integer currencyCode);
	public abstract List<CurrencyConversion> getCurrencyConversionList();
	public abstract List<CurrencyConversion> getActiveCurrencyConversionList();

	//public abstract List<CurrencyConversion> getCompanyCurrency();
}
