package com.simpleaccounts.rest.currencyconversioncontroller;

import com.simpleaccounts.entity.CurrencyConversion;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Collections;

@Component
public class CurrencyConversionHelper {

    public List<CurrencyConversionResponseModel> getListOfConvertedCurrency(List<CurrencyConversion> currencyConversionList) {
        List<CurrencyConversionResponseModel> currencyConversionResponseModelList = new ArrayList<>();
        if (currencyConversionList!=null) {
            for (CurrencyConversion currencyConversion : currencyConversionList) {
                CurrencyConversionResponseModel currencyConversionResponseModel = new CurrencyConversionResponseModel();
                currencyConversionResponseModel.setCurrencyConversionId(currencyConversion.getCurrencyConversionId());
                currencyConversionResponseModel.setCurrencyCode(currencyConversion.getCurrencyCode().getCurrencyCode());
                currencyConversionResponseModel.setCurrencyIsoCode(currencyConversion.getCurrencyCode().getCurrencyIsoCode());
                currencyConversionResponseModel.setCurrencySymbol(currencyConversion.getCurrencyCode().getCurrencySymbol());
                currencyConversionResponseModel.setDescription(currencyConversion.getCurrencyCodeConvertedTo().getCurrencyName());
                currencyConversionResponseModel.setExchangeRate(currencyConversion.getExchangeRate());
                currencyConversionResponseModel.setCurrencyName(currencyConversion.getCurrencyCode().getCurrencyName());
                currencyConversionResponseModel.setIsActive(currencyConversion.getIsActive());
                currencyConversionResponseModelList.add(currencyConversionResponseModel);
            }
        } Collections.reverse(currencyConversionResponseModelList);
        return currencyConversionResponseModelList;
    }
}

