package com.simpleaccounts.rest.currencyconversioncontroller;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

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
