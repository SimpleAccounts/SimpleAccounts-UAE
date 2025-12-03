package com.simpleaccounts.entity;


import com.simpleaccounts.entity.converter.DateConverter;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * @author Zain Khan : Middle Table Between Receipt And Credit Note To Provide Many To Many Mapping
 */
@Entity
@Table(name = "RECEIPT_CREDIT_NOTE_RELATION")
@Data
public class ReceiptCreditNoteRelation {
    	@Id
    @Column(name = "RECEIPT_CREDIT_NOTE_RELATION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="RECEIPT_CREDIT_NOTE_RELATION_SEQ", sequenceName="RECEIPT_CREDIT_NOTE_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="RECEIPT_CREDIT_NOTE_RELATION_SEQ")
    private Integer id;

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
    @UpdateTimestamp
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

    @ManyToOne
    @JoinColumn(name = "RECEIPT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_RECEIPT_CREDIT_NOTE_RELATION_ID_RECEIPT"))
    private Receipt receipt;

    @Basic(optional = false)
    @Column(name = "RECEIPT_AMOUNT_AFTER_APPLYING_CREDITS")
    private BigDecimal receiptAmountAfterApplyingCredits;

    @ManyToOne
    @JoinColumn(name = "CREDIT_NOTE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_RECEIPT_CREDIT_NOTE_RELATION_CREDIT_NOTE_ID_CREDIT_NOTE"))
    private CreditNote creditNote;

    @Basic(optional = false)
    @Column(name = "APPLIED_CREDITS")
    private BigDecimal appliedCNAmount;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;
}
