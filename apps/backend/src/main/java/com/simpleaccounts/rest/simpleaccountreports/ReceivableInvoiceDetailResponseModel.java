package com.simpleaccounts.rest.simpleaccountreports;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ReceivableInvoiceDetailResponseModel {

    private List<List<ReceivableInvoiceDetailModel>> resultObject;
    private Map<String ,List<ReceivableInvoiceDetailModel>> receivableInvoiceDetailModelMap;
    private BigDecimal totalAmount;
    private BigDecimal totalBalance;
    private BigDecimal totalVatAmount;

}
