package com.simpleaccounts.rest.simpleaccountreports.FTA;

import com.simpleaccounts.constant.ProductType;
import java.math.BigDecimal;
import java.util.Date;
import lombok.Data;

@Data
public class CustomerSupplyListingResponseModel {

    private String customerName;
    private String customerCountry;
    private String customerTRN;
    private Date invoiceDate;
    private String invoiceNo;
    private Integer transactionID = 0;
    private Integer permitNo = 0;
    private  Integer lineNo = 0;
    private String productName;
    private ProductType productType;
    private String productDescription = "-";
    private BigDecimal supplyValue;
    private BigDecimal VATValue = BigDecimal.ZERO;
    private BigDecimal ExciseTaxValue = BigDecimal.ZERO;
    private String ExciseCode = "-";
    private String taxCode = "-";
    private BigDecimal VATFCY = BigDecimal.ZERO;
    private BigDecimal ExciseTaxFCY = BigDecimal.ZERO;
    private BigDecimal SupplyFCY;
    private String FCYCode= "-";
}
