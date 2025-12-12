package com.simpleaccounts.rfq_po;

import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Created By Zain Khan
 */

@Entity
@Table(name = "PO_QUATATION_LINE_ITEM")
@Getter
@Setter
public class PoQuatationLineItem {
    	@Id
	@SequenceGenerator(name="PO_QUATATION_LINE_ITEM_SEQ", sequenceName="PO_QUATATION_LINE_ITEM_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PO_QUATATION_LINE_ITEM_SEQ")
    @Column(name = "ID", updatable = false, nullable = false)
    private int id;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

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
    @JoinColumn(name = "PO_QUATATION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PO_QUATATION_PO_QUATATION_LINE_ITEM"))
    private PoQuatation poQuatation;

    @Basic(optional = false)
    @Column(name = "QUANTITY")
    private Integer quantity = 0;

    @Basic
    @Column(name = "UNIT_COST")
    @ColumnDefault(value = "0.00")
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Basic(optional = false)
    @Column(name = "REMAINING_QUANTITY")
    @ColumnDefault(value = "0")
    private Integer remainingQuantity = 0;

    @Basic
    @Column(name = "DESCRIPTION")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_PO_QUATATION_LINE_ITEM"))
    private VatCategory vatCategory;

    @Basic
    @Column(name = "SUB_TOTAL")
    @ColumnDefault(value = "0.00")
    private BigDecimal subTotal = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PRODUCT_PO_QUATATION_LINE_ITEM"))
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "DISCOUNT_TYPE")
    private DiscountType discountType;

    @Column(name = "DISCOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal discount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXCISE_TAX",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXCISE_TAX_PO_QUATATION_LINE_ITEM"))
    private ExciseTax exciseCategory;

    @Column(name = "EXCISE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal exciseAmount = BigDecimal.ZERO;

    @Column(name = "VAT_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_LINE_ITEM_TRANX_CAT_ID_TRANX_CAT"))
    private TransactionCategory trnsactioncCategory;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_MIGRATED_RECORD")
    private Boolean isMigratedRecord = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UNIT_TYPE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_UNIT_TYPE_PO_QUATATION_LINE_ITEM"))
    private UnitType unitTypeId;

    @Column(name = "UNIT_TYPE")
    private String unitType;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
