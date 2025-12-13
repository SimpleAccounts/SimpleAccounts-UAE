package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class ReceivableInvoiceDetailResponseModel {

    private List<List<ReceivableInvoiceDetailModel>> resultObject;
    private Map<String ,List<ReceivableInvoiceDetailModel>> receivableInvoiceDetailModelMap;
    private BigDecimal totalAmount;
    private BigDecimal totalBalance;
    private BigDecimal totalVatAmount;

}
