package com.simpleaccounts.rest.creditnotecontroller;


import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.rest.invoicecontroller.InvoiceLineItemModel;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

/**
 * Created By Zain Khan
 */
@Getter
@Setter
public class CreditNoteRequestModel {

    private Integer creditNoteId;
    private Integer contactId;
    private String contactName;
    private String email;
    private String creditNoteNumber;
    private String notes;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private BigDecimal dueAmount;
    private String lineItemsString;
    private String type;
    private List<InvoiceLineItemModel> invoiceLineItems;
    private String status;
    private DiscountType discountType;
    private BigDecimal discount;
    private double discountPercentage;
    private Date creditNoteDate;
    private String taxTreatment;
    //fields for Invoice
    private Integer invoiceId;
    private String invoiceNumber;
    private Integer currencyCode;
    private MultipartFile attachmentFile;
    private String receiptAttachmentDescription;
    private String receiptNumber;
    private Boolean cnCreatedOnPaidInvoice;
    private Integer placeOfSupplyId;
    private BigDecimal totalExciseTaxAmount = BigDecimal.ZERO;
    private Boolean exciseType;
    private Boolean isCreatedWithoutInvoice;
    private BigDecimal exchangeRate;
    private Integer vatCategoryId;
    private BigDecimal remainingInvoiceAmount;
    private String referenceNo;
    private Boolean isCreatedWIWP;
    private Boolean taxType;
    private Boolean isReverseChargeEnabled;
    private String organisationName;
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
}
