package com.simpleaccounts.entity;

import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.entity.converter.DateConverter;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Created by Zain Khan.
 */
@Entity
@Table(name = "CREDIT_NOTE_LINE_ITEM")
@Getter
@Setter
public class CreditNoteLineItem {
    	@Id
	@SequenceGenerator(name="CREDIT_NOTE_LINE_ITEM_SEQ", sequenceName="CREDIT_NOTE_LINE_ITEM_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CREDIT_NOTE_LINE_ITEM_SEQ")
    @Column(name = "CREDIT_NOTE_LINE_ITEM_ID", updatable = false, nullable = false)
    private int id;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @CreationTimestamp
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

    @Basic
    @Column(name = "DESCRIPTION")
    private String description;

    @Basic(optional = false)
    @Column(name = "QUANTITY")
    private Integer quantity;

    @Basic
    @Column(name = "SUB_TOTAL")
    @ColumnDefault(value = "0.00")
    private BigDecimal subTotal;

    @Basic
    @Column(name = "UNIT_PRICE")
    @ColumnDefault(value = "0.00")
    private BigDecimal unitPrice;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @ManyToOne
    @JoinColumn(name = "CREDIT_NOTE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_LINE_ITEM_CREDIT_NOTE_ID_CREDIT_NOTE"))
    private CreditNote creditNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_LINE_ITEM_VAT_ID_VAT"))
    private VatCategory vatCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PRODUCT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_LINE_ITEM_PRODUCT_ID_PRODUCT"))
    private Product product;

    @ManyToOne
    @JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_LINE_ITEM_TRANX_CAT_ID_TRANX_CAT"))
    private TransactionCategory transactionCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "DISCOUNT_TYPE")
    private DiscountType discountType;

    @Column(name = "DISCOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal discount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXCISE_TAX_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_LINE_ITEM_EXCISE_TAX_ID_EXCISE_TAX"))
    private ExciseTax exciseCategory;

    @Column(name = "EXCISE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal exciseAmount;

    @Column(name = "VAT_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal vatAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UNIT_TYPE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_LINE_ITEM_UNIT_TYPE_ID_UNIT_TYPE"))
    private UnitType unitTypeId;

    @Column(name = "UNIT_TYPE")
    private String unitType;
}
