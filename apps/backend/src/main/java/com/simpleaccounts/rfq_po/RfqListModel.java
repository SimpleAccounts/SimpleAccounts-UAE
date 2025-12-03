package com.simpleaccounts.rfq_po;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Getter
@Setter
public class RfqListModel {
    private Integer id;
    private Integer supplierId;
    private String supplierName;
    private List<String> poList;
    private String rfqNumber;
    private String rfqReceiveDate;
    private String rfqExpiryDate;
    private String status;
    private Integer statusEnum;
    private String type;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private String currencyCode;
    private String currencyName;
    private String VatRegistrationNumber;


}
