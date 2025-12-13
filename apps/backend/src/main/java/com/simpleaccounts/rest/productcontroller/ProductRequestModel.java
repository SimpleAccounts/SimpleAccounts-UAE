package com.simpleaccounts.rest.productcontroller;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.constant.ProductType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequestModel {

	private Integer productID;
	private Integer productCategoryId;
	private String productName;
	private Integer vatCategoryId;
	private Integer productWarehouseId;
	private String productCode;
	private Integer createdBy = 0;
	private LocalDateTime createdDate;
	private Integer lastUpdatedBy;
	private LocalDateTime lastUpdateDate;
	private Boolean deleteFlag = Boolean.FALSE;
	private Boolean active;
	private Integer versionNumber = 1;
	private Boolean vatIncluded = Boolean.FALSE;
	private Boolean isActive;

	// new Added
	private ProductPriceType productPriceType;
	private ProductType productType;

	private BigDecimal salesUnitPrice;
	private String salesDescription;
	private Integer salesTransactionCategoryId;
	private String salesTransactionCategoryLabel;
	
	private BigDecimal purchaseUnitPrice;
	private String purchaseDescription;
	private Integer purchaseTransactionCategoryId;
	private String purchaseTransactionCategoryLabel;

	private Boolean isInventoryEnabled = Boolean.FALSE;
	private Integer inventoryId;
	private Integer inventoryQty;
	private Float inventoryPurchasePrice;
	private Integer inventoryReorderLevel;
    private Integer contactId;
    private Integer transactionCategoryId;
	private String transactionCategoryName;
	private Integer exciseTaxId;

	private Boolean exciseType = Boolean.FALSE;
	private BigDecimal exciseAmount;
	private Integer unitTypeId;
	private Boolean exciseTaxCheck = Boolean.FALSE;
}
