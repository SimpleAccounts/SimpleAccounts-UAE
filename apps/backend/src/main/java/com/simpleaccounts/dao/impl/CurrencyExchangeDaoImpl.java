package com.simpleaccounts.dao.impl;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.simpleaccounts.entity.RoleModuleRelation;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.CurrencyExchangeDao;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.CurrencyConversion;

import javax.persistence.TypedQuery;

@Repository
public class CurrencyExchangeDaoImpl extends AbstractDao<Integer, CurrencyConversion> implements CurrencyExchangeDao {

//	private static String accessKey = "c6267cc9e9bd2735a5a2637aa778d61a";
	private final Logger logger = LoggerFactory.getLogger(CurrencyExchangeDaoImpl.class);

//	@Override
//	public void saveExchangeCurrencies(Currency baseCurrency, List<Currency> convertCurrenies) {
//		try {
//			System.out.println("baseCurrency====" + baseCurrency.getCurrencyIsoCode());
//			System.out.println("convertCurrenies====" + convertCurrenies);
//			List<String> listOfCounteries = new ArrayList<>();
//			for (Currency currency : convertCurrenies) {
//				listOfCounteries.add(currency.getCurrencyIsoCode());
//			}
//
//			String currencyIsoName = StringUtils.join(listOfCounteries, ',');
//			System.out.println("currencyIsoName=" + currencyIsoName);
//			String url = "http://data.fixer.io/api/latest?access_key="
//					+ URLEncoder.encode( accessKey , StandardCharsets.UTF_8.toString()) + "&base="
//					+ URLEncoder.encode(baseCurrency.getCurrencyIsoCode(), "UTF-8") + "&symbols="
//					+ URLEncoder.encode(currencyIsoName, "UTF8");
//			CloseableHttpClient httpClient = HttpClientBuilder.create().build();
//			HttpGet httpGet = new HttpGet(url);
//			CloseableHttpResponse response = httpClient.execute(httpGet);
//			String responseString = EntityUtils.toString(response.getEntity(), "UTF-8");
//
//			JSONObject obj = new JSONObject(responseString);
//			JSONObject rates = obj.getJSONObject("rates");
//			for (Currency currency : convertCurrenies) {
//				try {
//					double value = rates.getDouble(currency.getCurrencyIsoCode());
//					System.out.println("responseString1==" + currency);
//					System.out.println("responseString2==" + value);
//					System.out.println("responseString==" + responseString);
//					CurrencyConversion currencyConversion = new CurrencyConversion();
//					currencyConversion.setCurrencyCode(baseCurrency.getCurrencyCode());
//					currencyConversion.setCurrencyCodeConvertedTo(currency.getCurrencyCode());
//					currencyConversion.setCreatedDate(LocalDateTime.now());
//					currencyConversion.setExchangeRate(BigDecimal.valueOf(value));
//					persist(currencyConversion);
//				} catch (Exception e) {
//					CurrencyConversion currencyConversion = new CurrencyConversion();
//					currencyConversion.setCurrencyCode(baseCurrency.getCurrencyCode());
//					currencyConversion.setCurrencyCodeConvertedTo(currency.getCurrencyCode());
//					currencyConversion.setCreatedDate(LocalDateTime.now());
//					currencyConversion.setExchangeRate(BigDecimal.ZERO);
//					persist(currencyConversion);
//				}
//			}
//		} catch (Exception e) {
//			logger.error("Error", e);
//		}


//	}
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
//	@Override
//	public List<CurrencyConversion> getCompanyCurrency() {
////		TypedQuery<CurrencyConversion> query = getEntityManager().createQuery("SELECT cc.currencyCode, cc.exchangeRate FROM CurrencyConversion cc where cc.currencyCode IN (select c.currencyCode from Currency c)", CurrencyConversion.class);
////		List<CurrencyConversion> currencyList = query.getResultList();
////		if (currencyList != null && !currencyList.isEmpty()) {
////			return currencyList;
////		}
//	//	return this.executeNamedQuery("getcompanyCurrency");
//	}
}
