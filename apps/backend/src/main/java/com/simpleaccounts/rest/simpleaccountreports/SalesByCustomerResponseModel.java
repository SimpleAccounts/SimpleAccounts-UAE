package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class SalesByCustomerResponseModel {

    List<SalesByCustomerModel> sBCustomerList;
    BigDecimal totalExcludingVat;
    BigDecimal totalAmount;

}
