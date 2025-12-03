package com.simpleaccounts.dao;

import java.util.List;

import com.simpleaccounts.entity.Country;

/**
 * Created by mohsinh on 3/10/2017.
 */
public interface CountryDao extends Dao<Integer, Country> {

    List<Country> getCountries();
    
    Country getCountry(Integer countryId);

	Country getDefaultCountry();

    Integer getCountryIdByValue(String val);
}
