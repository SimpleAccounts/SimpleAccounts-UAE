package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CurrencyExchangeDao;
import com.simpleaccounts.entity.CurrencyConversion;
import java.util.List;
import javax.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CurrencyExchangeDao;

import com.simpleaccounts.entity.CurrencyConversion;

import javax.persistence.TypedQuery;

@Repository
public class CurrencyExchangeDaoImpl extends AbstractDao<Integer, CurrencyConversion> implements CurrencyExchangeDao {

	private final Logger logger = LoggerFactory.getLogger(CurrencyExchangeDaoImpl.class);

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

////		TypedQuery<CurrencyConversion> query = getEntityManager().createQuery("SELECT cc.currencyCode, cc.exchangeRate FROM CurrencyConversion cc where cc.currencyCode IN (select c.currencyCode from Currency c)", CurrencyConversion.class);
////		List<CurrencyConversion> currencyList = query.getResultList();
////		if (currencyList != null && !currencyList.isEmpty()) {
////			return currencyList;
////		}
//	//	return this.executeNamedQuery("getcompanyCurrency");
//	}
}
