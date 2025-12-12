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

//

//

//

//
//            JSONArray jsonRules = new JSONArray(responseString);
//            // iterate over the rules

//

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
