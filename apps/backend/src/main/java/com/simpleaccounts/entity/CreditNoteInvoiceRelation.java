package com.simpleaccounts.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Table(name = "CREDIT_NOTE_INVOICE_RELATION")
public class CreditNoteInvoiceRelation {
    	@Id
    @Column(name = "CREDIT_NOTE_INVOICE_RELATION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="CREDIT_NOTE_INVOICE_RELATION_SEQ", sequenceName="CREDIT_NOTE_INVOICE_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CREDIT_NOTE_INVOICE_RELATION_SEQ")
    private Integer id;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @CreationTimestamp

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREDIT_NOTE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CREDIT_NOTE_ID_CREDIT_NOTE"))
    private CreditNote creditNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_ID_INVOICE"))
    private Invoice invoice;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @Column(name = "APPLIED_BY_INVOICE_AMOUNT")
    @Basic(optional = true)
    private BigDecimal appliedByInvoiceAmount;
}
