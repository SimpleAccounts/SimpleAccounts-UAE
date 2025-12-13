package com.simpleaccounts.rfq_po;

import com.simpleaccounts.constant.DiscountType;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class PoQuatationLineItemRequestModel {
    private int id;
    private Integer quantity;
    private Integer remainingQuantity;
    private Integer grnReceivedQuantity;
    private Integer poQuantity;
    private BigDecimal unitPrice;
    private String description;
    private String vatCategoryId;
    private Integer vatPercentage;
    private BigDecimal subTotal;
    private Integer productId;
    private String productName;
    private Integer exciseTaxId;
    private BigDecimal exciseAmount;
    private BigDecimal vatAmount;
    private Boolean isExciseTaxExclusive;
    private Integer transactionCategoryId;
    private String transactionCategoryLabel;
    private DiscountType discountType = DiscountType.NONE;
    private BigDecimal discount;
    private String unitType;
    private Integer unitTypeId;
    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }
}
