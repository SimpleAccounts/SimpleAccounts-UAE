package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CountryDao;
import com.simpleaccounts.entity.Country;
import java.util.List;
import javax.persistence.TypedQuery;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.stereotype.Repository;

/**
 * Created by mohsinh on 3/10/2017.
 */
@Repository
public class CountryDaoImpl extends AbstractDao<Integer, Country> implements CountryDao {

	@Override
	public List<Country> getCountries() {
		return this.executeNamedQuery("allCountries");
	}

	@Override
	public Country getCountry(Integer countryId) {
		return this.findByPK(countryId);
	}

	@Override
	public Country getDefaultCountry() {
		List<Country> countries = getCountries();
		if (CollectionUtils.isNotEmpty(countries)) {
			return countries.get(0);
		}
		return null;
	}
	@Override

	public	Integer getCountryIdByValue(String val){
		TypedQuery<Integer> query = getEntityManager().createNamedQuery("getCountryIdByInputColoumnValue", Integer.class);
		query.setParameter("val", val);
		query.setMaxResults(1);
		if (query.getSingleResult()!=null){
			return query.getSingleResult();
		}
		return null;
	}
}
