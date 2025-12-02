package com.simplevat.rest.simpleaccountreports.FTA;

import lombok.Data;

@Data
public class SupplierDataResponseModel {

    private String supplierName;
    private String GlId;
    private String supplierCountry;
    private String supplierTRN;
    private String reverseCharge;

}
