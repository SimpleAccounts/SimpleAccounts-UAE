package com.simpleaccounts.rest.simpleaccountreports.FTA;

import lombok.Data;

import java.util.List;

@Data
public class CustomerDataResponseModel {

    private String customerName;
    private String GlId;
    private String customerCountry;
    private String customerTRN;
    private String ReverseCharge;

}
