package com.simpleaccounts.rest.currencyconversioncontroller;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class CurrencyConversionRequestModel {
    private Integer id;
    private Integer currencyCode;
    private BigDecimal exchangeRate;
    private Boolean isActive;

}
