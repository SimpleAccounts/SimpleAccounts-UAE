package com.simpleaccounts.rest.currencycontroller.dto;

import lombok.Data;

/**
 * DTO for Currency create/update operations.
 * Using DTO instead of JPA entity to avoid exposing persistent entities in REST API.
 */
@Data
public class CurrencyDTO {

    private Integer currencyCode;
    private String currencyName;
    private String currencyDescription;
    private String currencyIsoCode;
    private String currencySymbol;
    private Character defaultFlag;
    private Integer orderSequence;
}
