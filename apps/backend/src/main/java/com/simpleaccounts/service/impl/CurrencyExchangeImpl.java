package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.CurrencyExchangeDao;

import com.simpleaccounts.entity.CurrencyConversion;
import com.simpleaccounts.service.CurrencyExchangeService;

import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service("currencyExchangeImpl")
public class CurrencyExchangeImpl extends CurrencyExchangeService {
	private final Logger logger = LoggerFactory.getLogger(CurrencyExchangeImpl.class);
    private static String accesskey = "c6267cc9e9bd2735a5a2637aa778d61a";
    @Autowired
    CurrencyExchangeDao currencyExchangeDao;

    HashMap<String, Integer> currencyIdMap = new HashMap<>();

//    @Override
//    public void saveExchangeCurrencies(Currency baseCurrency, List<Currency> convertCurrenies) {
//
//        for (Currency currency : convertCurrenies) {
//            currencyIdMap.put(currency.getCurrencyIsoCode(), currency.getCurrencyCode());
//        }
//
//        CloseableHttpClient httpClient = HttpClientBuilder.create().build();
//        try {
//            String url = "https://us-central1-simpleaccounts-web-app.cloudfunctions.net/getExchangeRate";
//
//            HttpPost httpPost = new HttpPost(url);
//            httpPost.addHeader("Accept", "application/json");
//            httpPost.addHeader("Content-Type", "application/x-www-form-urlencoded");
//            List<NameValuePair> params = new ArrayList<>();
//            params.add(new BasicNameValuePair("currencyCode", baseCurrency.getCurrencyIsoCode()));
//            httpPost.setEntity(new UrlEncodedFormEntity(params));
//            CloseableHttpResponse response = httpClient.execute(httpPost);
//            String responseString = EntityUtils.toString(response.getEntity(), "UTF-8");
//            Calendar cal = Calendar.getInstance();
//            cal.set(Calendar.HOUR_OF_DAY, 0);
//            cal.set(Calendar.MINUTE, 0);
//            cal.set(Calendar.SECOND, 0);
//            cal.set(Calendar.MILLISECOND, 0);
//            Date dateWithoutTime = cal.getTime();
//
//            JSONArray jsonRules = new JSONArray(responseString);
//            // iterate over the rules
//            for (int i = 0; i < jsonRules.length(); i++) {
//                JSONObject obj = jsonRules.getJSONObject(i);
//                System.out.println("====obj====" + obj);
//                String currencyCode = obj.getString("currencyCode");
//                System.out.println("===id is===: " + currencyCode);
//                CurrencyConversion currencyConversion = new CurrencyConversion();
//                currencyConversion.setCurrencyCode(baseCurrency.getCurrencyCode());
//                currencyConversion.setCurrencyCodeConvertedTo(currencyIdMap.get(currencyCode));
//                currencyConversion.setCreatedDate(LocalDateTime.ofInstant(dateWithoutTime.toInstant(), ZoneId.systemDefault()));
//                currencyConversion.setExchangeRate(new BigDecimal(obj.getString("exchangeRate")));
//                persist(currencyConversion);
//            }
//
//        } catch (Exception e) {
//        	logger.error("Error", e);
//        }
//    }

    @Override
    protected CurrencyExchangeDao getDao() {
        return currencyExchangeDao;
    }

    @Override
    public  CurrencyConversion getExchangeRate(Integer currencyCode){
        return currencyExchangeDao.getExchangeRate(currencyCode);
    }
    @Override
    public  List<CurrencyConversion> getCurrencyConversionList(){
       return currencyExchangeDao.getCurrencyConversionList();
}
    @Override
    public  List<CurrencyConversion> getActiveCurrencyConversionList() {
        return currencyExchangeDao.getActiveCurrencyConversionList();
    }
   /* @Override
    public List<CurrencyConversion> getCompanyCurrency(){
        return currencyExchangeDao.getCompanyCurrency();
    }*/

}
