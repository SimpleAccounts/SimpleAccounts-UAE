package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class PayableInvoiceDetailResponseModel {

    private List<List<PayableInvoiceDetailModel>> resultObject;
    private Map<String ,List<PayableInvoiceDetailModel>> payableInvoiceDetailModelMap;
    private BigDecimal totalAmount;
    private BigDecimal totalBalance;
    private BigDecimal totalVatAmount;


}
