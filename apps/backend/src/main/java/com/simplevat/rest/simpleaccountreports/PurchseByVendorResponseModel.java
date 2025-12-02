package com.simplevat.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PurchseByVendorResponseModel {


    List<PurchaseByVendorModel> pByVendorList;
    BigDecimal totalExcludingVat;
    BigDecimal totalAmount;
}
