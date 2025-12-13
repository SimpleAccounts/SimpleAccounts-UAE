package com.simpleaccounts.rfq_po;

import java.math.BigDecimal;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

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
