package com.simpleaccounts.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VatReportModel {
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private String placeOfSupplyName;
    private Integer placeOfSupplyId;
    private BigDecimal zeroRatedSupplies;
    private BigDecimal totalAmountWithVatForSupplierInvoice;
    private BigDecimal totalVatAmountForSupplierInvoice;
    private BigDecimal totalAmountForExpense;
    private BigDecimal totalVatAmountForExpense;
    private BigDecimal standardRatedExpenses;
    private BigDecimal totalValueOfDueTaxForThePeriod;
    private BigDecimal totalValueOfRecoverableTaxForThePeriod;
    private BigDecimal netVatPayableOrReclaimableForThePeriod;
    private BigDecimal reverseChargeProvisionsTotalAmount;
    private BigDecimal reverseChargeProvisionsVatAmount;

}
