package com.simpleaccounts.rest.simpleaccountreports.FTA;

import lombok.Data;

@Data
public class CustomerDataResponseModel {

    private String customerName;
    private String GlId;
    private String customerCountry;
    private String customerTRN;
    private String ReverseCharge;

}
