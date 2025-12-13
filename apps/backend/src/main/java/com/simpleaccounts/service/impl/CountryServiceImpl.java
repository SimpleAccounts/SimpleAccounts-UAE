package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.CountryDao;
import com.simpleaccounts.entity.Country;
import com.simpleaccounts.service.CountryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class CountryServiceImpl extends CountryService {

    private final CountryDao countryDao;

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
