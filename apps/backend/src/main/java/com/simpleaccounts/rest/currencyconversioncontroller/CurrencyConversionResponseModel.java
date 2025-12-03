package com.simpleaccounts.rest.currencyconversioncontroller;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CurrencyConversionResponseModel {
    private Integer currencyConversionId;
    private Integer currencyCode;
    private Integer currencyCodeConvertedTo;
    private BigDecimal exchangeRate;
    private String currencyName;
    private String currencyIsoCode;
    private String description;
    private String currencySymbol;
    private Boolean isActive;

}
