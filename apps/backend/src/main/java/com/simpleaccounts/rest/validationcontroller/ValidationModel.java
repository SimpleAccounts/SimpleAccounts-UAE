package com.simpleaccounts.rest.validationcontroller;

import lombok.Data;

@Data
public class ValidationModel {
    private Integer moduleType;
    private String name;
    private Integer checkId;
    private String productCode;
    private  Integer currencyCode;
}
