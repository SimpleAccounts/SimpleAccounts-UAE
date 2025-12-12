package com.simpleaccounts.rest.invoicecontroller;

import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.constant.InvoiceDuePeriodEnum;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class InvoiceRequestModel {

    private Integer invoiceId;
    private String referenceNumber;
    private Integer projectId;
    private Integer contactId;
    private Date invoiceDate;
    private Date invoiceDueDate;
    private Integer placeOfSupplyId;

    private Integer currencyCode;
    private String currencyName;
    private String currencyIsoCode;
    private  String currencySymbol;
    private BigDecimal exchangeRate;
    private String contactPoNumber;    
    private MultipartFile attachmentFile;
    private String receiptAttachmentDescription;
    private String receiptNumber;
    private String notes;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private String lineItemsString;
    private String type;
    private String taxIdentificationNumber;
    private List<InvoiceLineItemModel> invoiceLineItems;
    private String status;
    private String statusEnum;
    private String fileName;
    private Integer fileAttachmentId;
    private InvoiceDuePeriodEnum term;
    
    private DiscountType discountType;
    private BigDecimal discount;
    private Double discountPercentage;
    private Integer createdBy = 0;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Integer lastUpdatedBy;
    private LocalDateTime lastUpdateDate;
    private Boolean deleteFlag = Boolean.FALSE;
    private Boolean active;
    private Integer versionNumber = 1;
    private BigDecimal dueAmount;
    
    private String organisationName;
    private String name;
    private String address;
    private String email;
    private String taxRegistrationNo;
    private String taxTreatment;
    
    //if true while creating create payment
    private boolean markAsPaid;
    private BigDecimal remainingInvoiceAmount;
    private  Boolean isCnCreatedOnPaidInvoice;
    private BigDecimal totalExciseAmount;
    private Boolean isReverseChargeEnabled  = Boolean.FALSE;
    private Boolean taxType  = Boolean.FALSE;
    private String baseCurrencyIsoCode;

    private Boolean changeShippingAddress = false;
    private String shippingAddress;

    private Integer shippingCountry;
    private String shippingCountryName;
    private Integer shippingState;
    private String shippingStateName;

    private String shippingCity;

    private String shippingPostZipCode;

    private String shippingTelephone;

    private String shippingFax;

    private Integer quotationId;

    private String footNote;
    private LocalDateTime receiptDate;
    private String contactName;
    private String dueDate;
    private String date;
}
