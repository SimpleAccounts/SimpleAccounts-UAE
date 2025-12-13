package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class PurchseByVendorResponseModel {

    List<PurchaseByVendorModel> pByVendorList;
    BigDecimal totalExcludingVat;
    BigDecimal totalAmount;
}
