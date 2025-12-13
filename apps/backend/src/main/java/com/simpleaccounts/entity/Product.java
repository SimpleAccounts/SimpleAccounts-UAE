package com.simpleaccounts.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.util.List;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.constant.ProductType;

import lombok.Data;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
		@NamedQuery(name = "allProduct", query = "SELECT p FROM Product p where p.createdBy = :createdBy and p.deleteFlag = FALSE ") })
@Entity
@Table(name = "PRODUCT")
@Data

public class Product implements Serializable {

	private static final long serialVersionUID = 1L;
	@Id
	@SequenceGenerator(name="PRODUCT_SEQ", sequenceName="PRODUCT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PRODUCT_SEQ")
	@Column(name = "PRODUCT_ID", updatable = false, nullable = false)
	private Integer productID;

	@Basic
	@Column(name = "PRODUCT_NAME")
	private String productName;

	@Basic
	@Column(name = "PRODUCT_DESCRIPTION")
	private String productDescription;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRODUCT_VAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PRODUCT_PRODUCT_VAT_ID_PRODUCT_VAT"))
	private VatCategory vatCategory;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRODUCT_EXCISE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PRODUCT_PRODUCT_EXCISE_IDPRODUCT_EXCISE"))
	private ExciseTax exciseTax;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRODUCT_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PRODUCT_PRODUCT_CATEGORY_ID_PRODUCT_CATEGORY"))
	private ProductCategory productCategory;

	@Basic
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRODUCT_WAREHOUSE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PRODUCT_PRODUCT_WAREHOUSE_ID_PRODUCT_WAREHOUSE"))
	private ProductWarehouse productWarehouse;

	@Basic
	@Column(name = "PRODUCT_CODE")
	private String productCode;

	@Basic
	@Column(name = "UNIT_PRICE")
	private BigDecimal unitPrice;

	@Column(name = "VAT_INCLUDED")
	@ColumnDefault(value = "false")
	private Boolean vatIncluded = Boolean.FALSE;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "product")
	@org.hibernate.annotations.ForeignKey(name = "none")
	private List<ProductLineItem> lineItemList;

	@Enumerated(EnumType.STRING)
	@Column(name = "PRODUCT_TYPE")
	private ProductType productType;

	// determine product price type
	@Enumerated(EnumType.STRING)
	@Column(name = "PRICE_TYPE")
	private ProductPriceType priceType;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")

	@Basic(optional = false)

	private LocalDateTime createdDate;

	@Basic
	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdatedBy;
	@Basic

	@Column(name = "LAST_UPDATE_DATE")

	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	private Boolean deleteFlag = Boolean.FALSE;

	@Column(name = "IS_INVENTORY_ENABLED")
	@ColumnDefault(value = "false")
	private Boolean isInventoryEnabled = Boolean.FALSE;

	@Column(name = "IS_ACTIVE")
	@Basic
	private Boolean isActive;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Version
	private Integer versionNumber = 1;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_MIGRATED_RECORD")
	private Boolean isMigratedRecord = false;

	@Basic
	@Column(name = "AVG_PURCHASE_COST")
	private BigDecimal avgPurchaseCost;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "EXCISE_STATUS")
	private Boolean exciseStatus;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "EXCISE_FLAG")
	private Boolean exciseType;

	@Basic
	@Column(name = "EXCISE_AMOUNT")
	private BigDecimal exciseAmount;

	@Basic
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "UNIT_TYPE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PRODUCT_UNIT_TYPE_ID_UNIT_TYPE"))
	private UnitType unitType;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

	public String getDescription() {
		String desc = "";
		for (ProductLineItem item : lineItemList)
			if (item.getPriceType().equals(ProductPriceType.SALES))
				desc = item.getDescription();
		return desc;

	}

	public BigDecimal getUnitPrice() {
		for (ProductLineItem item : lineItemList)
			if (item.getPriceType().equals(ProductPriceType.SALES))
				return item.getUnitPrice();
		return null;
	}
}
