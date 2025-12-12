package com.simpleaccounts.rfq_po;

import com.simpleaccounts.entity.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;

/**
 * Created By Zain Khan
 */
@Data
@Entity
@Table(name = "PO_QUATATION")
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
@NoArgsConstructor
@AllArgsConstructor
@NamedQueries({
        @NamedQuery(name = "getRfqPoForDropDown",query = "SELECT i FROM PoQuatation i where i.deleteFlag = FALSE and i.status in (4)  and i.type=:type order by i.createdDate ")
})
public class PoQuatation {
    	@Id
    @Column(name = "ID", updatable = false, nullable = false)
	@SequenceGenerator(name="PO_QUATATION_SEQ", sequenceName="PO_QUATATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PO_QUATATION_SEQ")
    private Integer id;

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

    @Column(name = "NOTES")
    private String notes;

    @Column(name = "ATTACHMENT_DESCRIPTION")
    private String attachmentDescription;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SUPPLIER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PO_QUATATION_SUPPLIER_ID_SUPPLIER"))
    private Contact supplierId ;

    @Column(name = "RFQ_NUMBER")
    private String rfqNumber;

    @Column(name = "RFQ_RECEIVE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime rfqReceiveDate;

    @Column(name = "RFQ_EXPIRY_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime rfqExpiryDate;

    @Column(name = "PO_NUMBER")
    private String poNumber;

    @Column(name = "PO_APPROVE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime poApproveDate;

    @Column(name = "PO_RECEIVE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime poReceiveDate;

    @Column(name = "GRN_NUMBER")
    private String grnNumber;

    @Column(name = "GRN_RECEIVE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime grnReceiveDate;

    @Column(name = "GRN_REMARKS")
    private String grnRemarks;

    @Column(name = "TOTAL_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalAmount;

    @Column(name = "TOTAL_VAT_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalVatAmount;

    @Column(name = "QUOTATION_NUMBER")
    private String QuotationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CUSTOMER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PO_QUATATION_CUSTOMER_ID_CUSTOMER"))
    private Contact customer;

    @Column(name="QUOTATION_EXPIRATION_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime quotaionExpiration;

    @Column(name="QUOTATION_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime quotaionDate;

    @Basic
    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "TYPE")
    @Basic
    private Integer type;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "EXCISE_TYPE")
    private Boolean taxType = Boolean.FALSE;

    @Column(name = "TOTAL_EXCISE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalExciseAmount;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "poQuatation")
    private Collection<PoQuatationLineItem> poQuatationLineItems;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FILE_ATTACHMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PO_QUATATION_FILE_ATTACHMENT_ID_FILE_ATTACHMENT"))
    private FileAttachment AttachmentFileName;

    @Column(name = "REFERENCE_NUMBER")
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_PO_QUATATION_CURRENCY_CODE_CURRENCY"))
    private Currency currency;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_MIGRATED_RECORD")
    private Boolean isMigratedRecord = Boolean.FALSE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PLACE_OF_SUPPLY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PO_QUATATION_PLACE_OF_SUPPLY_ID_PLACE_OF_SUPPLY"))
    private PlaceOfSupply placeOfSupplyId;

    @Column(name = "DISCOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal discount;

    @Basic
    @Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
    private BigDecimal exchangeRate;

    @Basic
    @Column(name = "TERMS_AND_CONDITIONS")
    private String termsAndConditions;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
