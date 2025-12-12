package com.simpleaccounts.entity;

import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

import java.io.Serializable;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Created by ashish.
 */
@Entity
@Table(name = "INVOICE_LINE_ITEM")
@Getter
@Setter
public class InvoiceLineItem implements Serializable {

	private static final long serialVersionUID = 848122185643690684L;

	@Id
	@SequenceGenerator(name="INVOICE_LINE_ITEM_SEQ", sequenceName="INVOICE_LINE_ITEM_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="INVOICE_LINE_ITEM_SEQ")
	@Column(name = "INVOICE_LINE_ITEM_ID", updatable = false, nullable = false)
	private int id;

	@Basic(optional = false)
	@Column(name = "QUANTITY")
	private Integer quantity;

	@Basic
	@Column(name = "DESCRIPTION")
	private String description;

	@Basic
	@Column(name = "UNIT_PRICE")
	@ColumnDefault(value = "0.00")
	private BigDecimal unitPrice;

	@Basic
	@Column(name = "SUB_TOTAL")
	@ColumnDefault(value = "0.00")
	private BigDecimal subTotal;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "VAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_LINE_ITEM_VAT_ID_VAT"))
	private VatCategory vatCategory;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PRODUCT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_LINE_ITEM_PRODUCT_ID_PRODUCT"))
	private Product product;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@CreationTimestamp
	//@Convert(converter = DateConverter.class)
	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@ManyToOne
	@JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_LINE_ITEM_INVOICE_ID_INVOICE"))
	private Invoice invoice;

	@ManyToOne
	@JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_LINE_ITEM_TRANX_CAT_ID_TRANX_CAT"))
	private TransactionCategory trnsactioncCategory;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_MIGRATED_RECORD")
	private Boolean isMigratedRecord = false;

	@Enumerated(EnumType.STRING)
	@Column(name = "DISCOUNT_TYPE")
	private DiscountType discountType;

	@Column(name = "DISCOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal discount;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EXCISE_TAX_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_LINE_ITEM_EXCISE_TAX_ID_EXCISE_TAX"))
	private ExciseTax exciseCategory;

	@Column(name = "EXCISE_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal exciseAmount;

	@Column(name = "VAT_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal vatAmount;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "UNIT_TYPE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_LINE_ITEM_UNIT_TYPE_ID_UNIT_TYPE"))
	private UnitType unitTypeId;

	@Column(name = "UNIT_TYPE")
	private String unitType;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;
}
