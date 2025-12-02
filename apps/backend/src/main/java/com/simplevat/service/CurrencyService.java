package com.simplevat.service;

import com.simplevat.constant.dbfilter.CurrencyFilterEnum;
import com.simplevat.entity.Currency;
import com.simplevat.entity.CurrencyConversion;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

/**
 * Created by mohsin on 3/11/2017.
 */
public abstract class CurrencyService extends SimpleVatService<Integer, Currency> {

	public abstract List<Currency> getCurrencies();

	public abstract List<Currency> getCurrenciesProfile();

	public abstract List<Currency> getCompanyCurrencies();

	public abstract List<Currency> getActiveCurrencies();

	public abstract Currency getCurrency(final int currencyCode);

	public abstract Currency getDefaultCurrency();

	public abstract CurrencyConversion getCurrencyRateFromCurrencyConversion(final int currencyCode);

	public abstract String getCountryCodeAsString(String CountryCode);

	public abstract List<Currency> getCurrencyList(Currency currency);

	public abstract List<String> getCountryCodeString();

	public abstract Boolean isCurrencyDataAvailableOnTodayDate();

	public abstract PaginationResponseModel getCurrencies(Map<CurrencyFilterEnum, Object> filterDataMap,
			PaginationModel paginationModel);

	public abstract void updateCurrencyProfile(Integer currencyCode);

	public abstract void updateCurrency(Integer currencyCode);

}
