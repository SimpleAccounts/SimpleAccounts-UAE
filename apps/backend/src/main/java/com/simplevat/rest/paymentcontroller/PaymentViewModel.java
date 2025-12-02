package com.simplevat.rest.paymentcontroller;

import java.math.BigDecimal;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentViewModel {

    private Integer paymentId;
    private String invoiceNumber;
    private Integer supplierId;
    private String supplierName;
    private BigDecimal invoiceAmount;
    private String currencyIsoCode;
    private String bankName;
    private Date paymentDate;
    private String description;
    private Boolean deleteFlag = Boolean.FALSE;
    private String currencySymbol;
    private BigDecimal convertedInvoiceAmount;
}
