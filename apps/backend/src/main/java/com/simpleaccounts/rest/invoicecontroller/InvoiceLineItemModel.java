package com.simpleaccounts.rest.invoicecontroller;

import com.simpleaccounts.constant.DiscountType;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceLineItemModel {

	private Integer id;
	private Integer quantity;
	private String description;
	private Integer remainingQuantity;
	private Integer grnReceivedQuantity;
	private Integer poQuantity;
	private BigDecimal unitPrice;
	private String vatCategoryId;
	private BigDecimal subTotal;
	private Integer vatPercentage;
	private Integer productId;
	private String productName;
	private Integer transactionCategoryId;
	private String transactionCategoryLabel;
	private DiscountType discountType = DiscountType.NONE;
	private BigDecimal discount;
	private Integer exciseTaxId;
	private BigDecimal exciseAmount;
	private BigDecimal vatAmount;
	private Boolean isExciseTaxExclusive;
	private String unitType;
	private Integer unitTypeId;

	public DiscountType getDiscountType() {
		return discountType;
	}

	public void setDiscountType(DiscountType discountType) {
		this.discountType = discountType;
	}
}
