package com.simplevat.entity;

import com.simplevat.constant.DiscountType;
import com.simplevat.entity.converter.DateConverter;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Collection;

@Entity
@Table(name = "CREDIT_NOTE")
@Data
public class CreditNote implements Serializable {
    	@Id
    @Column(name = "CREDIT_NOTE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="CREDIT_NOTE_SEQ", sequenceName="CREDIT_NOTE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CREDIT_NOTE_SEQ")
    private Integer creditNoteId;

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

    @Basic
    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "TOTAL_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalAmount;

    @Column(name = "TOTAL_VAT_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalVatAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_VAT_ID_VAT"))
    private VatCategory vatCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_CURRENCY_CODE_CURRENCY"))
    private Currency currency;

    @Basic
    @Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
    private BigDecimal exchangeRate;

    @Column(name = "NOTES")
    private String notes;

    @Column(name = "TYPE")
    @Basic
    private Integer type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_CONTACT_ID_CONTACT"))
    private Contact contact;

    @Column(name = "DUE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal dueAmount;

    @Column(name = "CREDIT_NOTE__DATE")
    private OffsetDateTime creditNoteDate;

    @Column(name = "CREDIT_NOTE_NUMBER")
    private String creditNoteNumber;

    @Column(name = "DISCOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal discount;

    @Column(name = "DISCOUNT_PERCENTAGE")
    @ColumnDefault(value = "0.00")
    private double discountPercentage;

    @Column(name = "PLACE_OF_SUPPLY_ID")
    private Integer placeOfSupplyId;

    @Column(name = "CN_CREATED_ON_PAID_INVOICE")
    @ColumnDefault(value = "false")
    @Basic
    private Boolean cnCreatedOnPaidInvoice = Boolean.FALSE;

    @Column(name = "INVOICE_ID")
    private Integer invoiceId;

    @Column(name = "TOTAL_EXCISE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalExciseAmount;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_CN_WITHOUT_PRODUCT")
    private Boolean isCNWithoutProduct;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "TAX_TYPE")
    private Boolean taxType  = Boolean.FALSE;

    @Column(name = "REFERENCE_NO")
    private String referenceNo;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_REVERSE_CHARGE_ENABLED")
    private Boolean isReverseChargeEnabled = false;

//    @Column(name = "VERSION_NUMBER")
//    @ColumnDefault(value = "1")
//    @Basic(optional = false)
//    @Version
//    private Integer versionNumber = 1;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "creditNote")
    @org.hibernate.annotations.ForeignKey(name = "none")
    private Collection<CreditNoteLineItem> creditNoteLineItems;
}
