package com.simpleaccounts.rfq_po;

import com.simpleaccounts.constant.DiscountType;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
public class  PoQuatationRequestModel {

    private Integer rfqId;
    private Integer poId;
    private Integer grnId;
    private Integer createdBy = 0;
    private LocalDateTime createdDate = LocalDateTime.now();
    private Integer currencyCode;
    private String currencySymbol;
    private String currencyName;
    private String currencyIsoCode;
    private Integer lastUpdatedBy;
    private LocalDateTime lastUpdateDate;
    private Boolean deleteFlag = Boolean.FALSE;
    private MultipartFile attachmentFile;
    private Integer id;
    private String notes;
    private Integer supplierId;
    private String supplierName;
    private String supplierReferenceNumber;
    private String rfqNumber;
    private Date rfqReceiveDate;
    private Date rfqExpiryDate;
    private String poNumber;
    private Date poApproveDate;
    private Date poReceiveDate;
    private String status;
    private Date grnReceiveDate;
    private String grnNumber;
    private String grnRemarks;
    private String lineItemsString;
    private List<PoQuatationLineItemRequestModel> poQuatationLineItemRequestModelList;
    private BigDecimal totalAmount;
    private BigDecimal totalVatAmount;
    private String type;
    private String VatRegistrationNumber;
    private String taxtreatment;
    private String receiptNumber;
    private String attachmentDescription;

    //customer Quotation
    private String quotationNumber;
    private Integer customerId;
    private String customerName;
    private Date quotationdate;
    private Date quotaionExpiration;
    private String termsAndCondition;
    private String paymentTerms;
    private BigDecimal subTotal;
    private BigDecimal untaxedAmount;
    private String customerReferenceNumber;
    private String organisationName;
    private Integer placeOfSupplyId;
    private String placeOfSupply;
    private Boolean taxType  = Boolean.FALSE;
    private BigDecimal totalExciseAmount;
    private BigDecimal exchangeRate;
    private DiscountType discountType = DiscountType.NONE;
    private BigDecimal discount;
    private Double discountPercentage;
    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }
}
