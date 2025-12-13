package com.simpleaccounts.rfq_po;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

import java.util.List;

@Getter
@Setter
public class POListModel {
    private Integer id;
    private Integer supplierId;
    private String supplierName;
    private String poNumber;
    private String poReceiveDate;
    private List<String> list;
    private String poApproveDate;
    private String supplierReferenceNumber;
    private String grnNumber;
    private String grnReceiveDate;
    private String grnRemarks;
    private Integer grnQuantity;
    private Integer poQuantity;
    private String status;
    private Integer statusEnum;
    private String type;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private String currencyCode;
    private String currencyName;
    private String VatRegistrationNumber;

}