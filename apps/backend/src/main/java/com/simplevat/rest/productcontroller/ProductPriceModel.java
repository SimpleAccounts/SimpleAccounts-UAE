package com.simplevat.rest.productcontroller;

import java.math.BigDecimal;

import com.simplevat.constant.ProductPriceType;
import lombok.Data;

@Data
public class ProductPriceModel {
	private Integer id;
	private String name;
	private String description;
	private String vatPercentage;
	private BigDecimal unitPrice;
	private Integer unitTypeId;
	private String unitType;
	private Integer vatCategoryId;
	private Integer transactionCategoryId;
	private String transactionCategoryLabel;
	private Integer stockOnHand;
	private Boolean isInventoryEnabled;
	private String excisePercentage = "0";
	private Integer exciseTaxId = 0;
	private Boolean isExciseTaxExclusive = Boolean.FALSE;
	private BigDecimal exciseAmount;
	private String discountType;
	private String productType;
}
