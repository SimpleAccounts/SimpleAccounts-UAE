package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CurrencyExchangeDao;
import com.simpleaccounts.entity.CurrencyConversion;
import java.util.List;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository
public class CurrencyExchangeDaoImpl extends AbstractDao<Integer, CurrencyConversion> implements CurrencyExchangeDao {

//

//

	@Override
	public CurrencyConversion getExchangeRate(Integer currencyCode){
		// Filter by both currencyCode and currencyCodeConvertedTo to get self-conversion (rate = 1.0)
		// Also order by createdDate descending to get the most recent one
		TypedQuery<CurrencyConversion> query = getEntityManager().createQuery(
				" SELECT cc FROM CurrencyConversion cc WHERE cc.currencyCode.currencyCode=:currencyCode " +
				"AND cc.currencyCodeConvertedTo.currencyCode=:currencyCode ORDER BY cc.createdDate DESC",
				CurrencyConversion.class);
		query.setParameter("currencyCode", currencyCode);
		query.setMaxResults(1); // Limit to 1 result
		List<CurrencyConversion> results = query.getResultList();
		if (results != null && !results.isEmpty()) {
			return results.get(0);
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
