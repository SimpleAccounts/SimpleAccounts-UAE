package com.simpleaccounts.model;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class VatReportResponseModel {
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private BigDecimal totalAmountForDubai;
    private  String nameForDubai;
    private BigDecimal totalVatForDubai;
    private BigDecimal totalAmountForAbuDhabi;
    private String nameForAbuDhabi;
    private BigDecimal totalVatForAbuDhabi;
    private BigDecimal totalAmountForFujairah;
    private String nameForFujairah;
    private BigDecimal totalVatForFujairah;
    private BigDecimal totalAmountForSharjah;
    private String nameForSharjah;
    private BigDecimal totalVatForSharjah;
    private BigDecimal totalAmountForAjman;
    private String nameForAjman;
    private BigDecimal totalVatForAjman;
    private BigDecimal totalAmountForUmmAlQuwain;
    private String nameForUmmAlQuwain;
    private BigDecimal totalVatForUmmAlQuwain;
    private BigDecimal totalAmountForRasAlKhalmah;
    private String nameForRasAlKhalmah;
    private BigDecimal totalVatForRasAlKhalmah;
    private BigDecimal exemptSupplies;
    private BigDecimal totalAmountWithVatForSupplierInvoice;
    private BigDecimal totalVatAmountForSupplierInvoice;
   // private BigDecimal totalAmountWithoutVatForSupplierInvoice;
    private BigDecimal totalAmountForExpense;
    private BigDecimal totalVatAmountForExpense;
    private BigDecimal zeroRatedSupplies;
    private BigDecimal standardRatedExpensesTotalAmount;
    private BigDecimal standardRatedExpensesVatAmount;
    private BigDecimal reverseChargeProvisionsTotalAmount;
    private BigDecimal reverseChargeProvisionsVatAmount;
    private BigDecimal totalValueOfDueTaxForThePeriod;
    private BigDecimal totalValueOfRecoverableTaxForThePeriod;
    private BigDecimal netVatPayableOrReclaimableForThePeriod;
    private BigDecimal totalVatOnExpensesAndAllOtherInputs;
    private BigDecimal totalAmountVatOnExpensesAndAllOtherInputs;
    private BigDecimal debitNoteSales;
    private BigDecimal debitNoteSalesVat;

}
