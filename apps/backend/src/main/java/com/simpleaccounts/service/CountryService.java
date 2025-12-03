package com.simpleaccounts.service;

import com.simpleaccounts.entity.Country;
import java.util.List;

/**
 * Created by mohsinh on 3/10/2017.
 */
public abstract class CountryService extends SimpleAccountsService<Integer, Country> {

	public abstract List<Country> getCountries();
    
	public abstract Country getCountry(Integer countryId);
    
	public abstract Country getDefaultCountry();

    public abstract Integer getCountryIdByValue(String val);
}
