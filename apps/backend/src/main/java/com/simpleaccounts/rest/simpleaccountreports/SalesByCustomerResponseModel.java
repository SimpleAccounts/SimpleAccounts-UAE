package com.simpleaccounts.rest.simpleaccountreports;


import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class SalesByCustomerResponseModel {


    List<SalesByCustomerModel> sBCustomerList;
    BigDecimal totalExcludingVat;
    BigDecimal totalAmount;

}
