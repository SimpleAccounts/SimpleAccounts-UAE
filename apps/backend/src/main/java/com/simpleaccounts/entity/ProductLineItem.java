package com.simpleaccounts.entity;

import com.simpleaccounts.constant.ProductPriceType;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author S@urabh
 */
@Entity
@Table(name = "PRODUCT_LINE_ITEM")
@Getter
@Setter
public class ProductLineItem implements Serializable {
    private static final long serialVersionUID = 1L;

	@Id
	@SequenceGenerator(name="PRODUCT_LINE_ITEM_SEQ", sequenceName="PRODUCT_LINE_ITEM_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PRODUCT_LINE_ITEM_SEQ")
	@Column(name = "PRODUCT_LINE_ITEM_ID", updatable = false, nullable = false)
	private int id;

	@Basic
	@Column(name = "UNIT_PRICE")
	private BigDecimal unitPrice;

	@Enumerated(EnumType.STRING)
	@Column(name = "PRICE_TYPE")
	private ProductPriceType priceType;

	@Basic
	@Column(name = "DESCRIPTION")
	private String description;

	@ManyToOne
	@JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PROD_LINE_ITEM_TRANX_CAT_ID_TRANX_CAT"))
	private TransactionCategory transactioncategory;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@CreationTimestamp

	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@UpdateTimestamp
	@Column(name = "LAST_UPDATE_DATE")

	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

	@ManyToOne
	@JoinColumn(name = "PRODUCT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PRODUCT_LINE_ITEM_PRODUCT_ID_PRODUCT"))
	private Product product;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_MIGRATED_RECORD")
	private Boolean isMigratedRecord = false;

}
