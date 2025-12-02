package com.simplevat.service.impl;

import com.simplevat.constant.dbfilter.CurrencyFilterEnum;
import com.simplevat.dao.CurrencyDao;
import com.simplevat.entity.Currency;
import com.simplevat.entity.CurrencyConversion;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.CurrencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Created by mohsin on 3/11/2017.
 */
@Service("currencyService")
public class CurrencyServiceImpl extends CurrencyService {

	@Autowired
	CurrencyDao currencyDao;

	@Override
	public List<Currency> getCurrencies() {
		return getDao().getCurrencies();
	}

	@Override
	public List<Currency> getCurrenciesProfile() {
		return getDao().getCurrenciesProfile();
	}
	@Override
	public  List<Currency> getCompanyCurrencies()
	{
		return getDao().getCompanyCurrencies();
	}
	@Override
	public List<Currency> getActiveCurrencies() {
		return getDao().getActiveCurrencies();
	}

	public void updateCurrencyProfile(Integer currencyCode){
		Currency currentCurrency = getDefaultCurrency();
		if(currentCurrency != null){
			currentCurrency.setDeleteFlag(Boolean.TRUE);
			getDao().update(currentCurrency);
		}
		Currency newCurrency = getCurrency(currencyCode);
		newCurrency.setDeleteFlag(Boolean.FALSE);
		getDao().update(newCurrency);
	}
	@Override
	public void updateCurrency(Integer currencyCode){
		getDao().updateCurrency(currencyCode);
	}
	@Override
	public Currency getCurrency(final int currencyCode) {
		return getDao().getCurrency(currencyCode);
	}

	@Override
	public Currency getDefaultCurrency() {
		return getDao().getDefaultCurrency();
	}

	@Override
	public CurrencyDao getDao() {
		return currencyDao;
	}

	@Override
	public CurrencyConversion getCurrencyRateFromCurrencyConversion(int currencyCode) {
		return currencyDao.getCurrencyRateFromCurrencyConversion(currencyCode);
	}

	public String getCountryCodeAsString(String CountryCode) {
		return currencyDao.getCountryCodeAsString(CountryCode);
	}

	public List<String> getCountryCodeString() {
		return currencyDao.getCountryCodeString();
	}

	public List<Currency> getCurrencyList(Currency currency) {
		return currencyDao.getCurrencyList(currency);
	}

	public Boolean isCurrencyDataAvailableOnTodayDate() {
		return currencyDao.isCurrencyDataAvailableOnTodayDate();
	}

	@Override
	public PaginationResponseModel getCurrencies(Map<CurrencyFilterEnum, Object> filterDataMap,
												 PaginationModel paginationModel) {
		return currencyDao.getCurrencies(filterDataMap, paginationModel);

	}
}
