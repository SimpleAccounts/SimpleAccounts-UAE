package com.simpleaccounts.rest.simpleaccountreports.FTA;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
@Data
public class FtaAuditResponseModel {

    //Company Information Table
    private String companyName;
    private String taxablePersonNameEn;
    private String taxablePersonNameAr;
    private String taxRegistrationNumber;
    private String taxAgencyName;
    private String taxAgencyNumber;
    private String taxAgentName;
    private String taxAgencyAgentNumber;
    private String startDate;
    private String endDate;
    private String productVersion;
    private LocalDateTime creationDate;
    private String fafVersion;

    private List<CustomerDataResponseModel> customerDataResponseModels;

    private List<SupplierDataResponseModel> supplierDataResponseModels;

    //Customer Supply Listing Table
    private List<CustomerSupplyListingResponseModel> customerSupplyListingResponseModel;

    //Customer Supply Listing Total
    private Integer customerTransactionCountTotal;
    private BigDecimal supplyTotal;
    private BigDecimal customerVATTotal;
    private BigDecimal  customerExciseTotal;

    //Supplier Purchase Listing Table
    private List<SupplierSupplyListingResponseModel> supplierSupplyListingResponseModels;

    //Supplier Purchase Listing Total
    private Integer supplierTransactionCountTotal;
    private BigDecimal purchaseTotal;
    private BigDecimal supplierVATTotal;
    private BigDecimal  supplierExciseTotal;

    //General Ledger Table
    private  List<GeneralLedgerListingResponseModel> generalLedgerListingResponseModels;

    //General Ledger Table Total
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private Integer transactionCountTotal;
    private String GLTCurrency;


}
