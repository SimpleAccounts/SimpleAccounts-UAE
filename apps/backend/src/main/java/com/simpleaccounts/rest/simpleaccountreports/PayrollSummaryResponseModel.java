package com.simpleaccounts.rest.simpleaccountreports;

import java.math.BigDecimal;
import java.util.List;
import lombok.Data;

@Data
public class PayrollSummaryResponseModel {

    List<PayrollSummaryModel> payrollSummaryModelList;
    private BigDecimal totalAmount;
    private BigDecimal totalBalance;

}