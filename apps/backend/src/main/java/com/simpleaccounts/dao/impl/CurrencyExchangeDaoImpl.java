package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CurrencyExchangeDao;
import com.simpleaccounts.entity.CurrencyConversion;
import java.util.List;
import javax.persistence.TypedQuery;

import org.springframework.stereotype.Repository;




@Repository
public class CurrencyExchangeDaoImpl extends AbstractDao<Integer, CurrencyConversion> implements CurrencyExchangeDao {

//

//

	@Override
	public CurrencyConversion getExchangeRate(Integer currencyCode){
		TypedQuery<CurrencyConversion> query = getEntityManager().createQuery(
				" SELECT cc FROM CurrencyConversion cc WHERE cc.currencyCode.currencyCode=:currencyCode",
				CurrencyConversion.class);
		query.setParameter("currencyCode", currencyCode);
		if (query.getResultList() != null && !query.getResultList().isEmpty()) {
			return query.getSingleResult();
		}
		return null;
	}
	@Override
	public List<CurrencyConversion> getCurrencyConversionList(){
		return this.executeNamedQuery("listOfCurrency");
	}

	@Override
	public List<CurrencyConversion> getActiveCurrencyConversionList(){
		return this.executeNamedQuery("listOfActiveCurrency");
	}

}
