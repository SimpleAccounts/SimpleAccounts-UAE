package com.simplevat.service.impl;

import com.simplevat.dao.CountryDao;
import com.simplevat.entity.Country;
import com.simplevat.service.CountryService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
public class CountryServiceImpl extends CountryService {

    @Autowired
    CountryDao countryDao;

    @Override
    public List<Country> getCountries() {
        List<Country> countries = getDao().getCountries();
        return countries;
    }

    @Override
    public Country getCountry(Integer countryId) {
        return getDao().getCountry(countryId);
    }

	@Override
	public Country getDefaultCountry() {
		return getDao().getDefaultCountry();
	}

	@Override
	public CountryDao getDao() {
		return countryDao;
	}

	@Override
    public  Integer getCountryIdByValue(String val){
        return countryDao.getCountryIdByValue(val);
    }
}
