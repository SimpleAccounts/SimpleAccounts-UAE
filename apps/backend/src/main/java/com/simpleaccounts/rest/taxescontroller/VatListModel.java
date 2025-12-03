package com.simpleaccounts.rest.taxescontroller;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@Setter
public class VatListModel {
    private Integer id;
    private String date;
    private String vatType;
    private String referenceType;
    private BigDecimal amount;
    private BigDecimal vatAmount;
    private String customerName;
    private String countryName;
    private String invoiceDate;
    private String invoiceNumber;
    private String productDescription;
    private String taxRegistrationNo;



}
