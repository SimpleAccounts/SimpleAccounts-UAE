package com.simpleaccounts.rfq_po;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuatationListModel {

    private Integer id;
    private Integer supplierId;
    private String supplierName;
    private String quatationNumber;

    private String status;
    private String type;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private String currencyIsoCode;
    private String currencyName;
    private String customerName;
    private String quotaionExpiration;
    private String termsAndCondition;
    private String paymentTerms;
    private String product;
    private Integer quantity;
    private String quotationCreatedDate;
    private BigDecimal unitPrice;

    private BigDecimal subTotal;

    private BigDecimal untaxedAmount;

    private String VatRegistrationNumber;

}