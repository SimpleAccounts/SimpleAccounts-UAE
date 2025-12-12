package com.simpleaccounts.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import lombok.Data;

import javax.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsinh on 2/26/2017.
 */
@Entity
@Table(name = "PURCHASE_LINE_ITEM")
@Data
public class PurchaseLineItem implements Serializable {

    private static final long serialVersionUID = 848122185643690684L;
    	@Id
	@SequenceGenerator(name="PURCHASE_LINE_ITEM_SEQ", sequenceName="PURCHASE_LINE_ITEM_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PURCHASE_LINE_ITEM_SEQ")
    @Column(name = "PURCHASE_LINE_ITEM_ID", updatable = false, nullable = false)
    private int purchaseLineItemId;
    @Basic
    @Column(name = "PURCHASE_LINE_ITEM_QUANTITY")
    private Integer purchaseLineItemQuantity;
    @Basic
    @Column(name = "PURCHASE_LINE_ITEM_DESCRIPTION")
    private String purchaseLineItemDescription;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PURCHASE_LINE_ITEM_PRODUCT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PUR_LINE_ITEM_PUR_LINE_ITEM_PROD_ID_PUR_LINE_ITEM_PROD"))
    private Product purchaseLineItemProductService;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PURCHASE_LINE_ITEM_VAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PUR_LINE_ITEM_PUR_LINE_ITEM_VAT_ID_PUR_LINE_ITEM_VAT"))
    private VatCategory purchaseLineItemVat;
    @Basic
    @Column(name = "PURCHASE_LINE_ITEM_UNIT_PRICE")
    private BigDecimal purchaseLineItemUnitPrice;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "PURCHASE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PURCHASE_LINE_ITEM_PURCHASE_ID_PURCHASE"))
    private Purchase purchase;
    @Column(name = "PURCHASE_PRODUCT_NAME")
    private String productName;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

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
    private LocalDateTime lastUpdateDate = LocalDateTime.now();
}
