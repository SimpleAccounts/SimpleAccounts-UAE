package com.simplevat.rest.simpleaccountreports.FTA;

import com.simplevat.constant.ProductType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Data
public class SupplierSupplyListingResponseModel {

    private String supplierName;
    private String supplierCountry;
    private String supplierTRN;
    private Date invoiceDate;
    private String invoiceNo;
    private Integer permitNo;
    private Integer transactionID;
    private  Integer lineNo;
    private String productName;
    private ProductType productType;
    private String productDescription;
    private BigDecimal purchaseValue;
    private BigDecimal VATValue;
    private BigDecimal ExciseTaxValue;
    private String ExciseCode;
    private String taxCode;
    private BigDecimal VATFCY;
    private BigDecimal ExciseTaxFCY;
    private BigDecimal purchaseFCY;
    private String FCYCode;
}
