package com.simpleaccounts.entity.bankaccount;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "RECONCILE_STATUS")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Data
public class ReconcileStatus implements Serializable  {

    	@Id
    @Column(name = "RECONCILE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="RECONCILESTATUS_SEQ", sequenceName="RECONCILESTATUS_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="RECONCILESTATUS_SEQ")
    private Integer reconcileId;

    @Basic
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BANK_ACCOUNT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_RECONCILE_STATUS_BANK_ACCOUNT_ID_BANK_ACCOUNT"))
    private BankAccount bankAccount;

    @Basic
    @Column(name = "RECONCILED_START_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime reconciledStartDate;

    @Basic
    @Column(name = "RECONCILED_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime reconciledDate;

    @Basic
    @Column(name = "RECONCILED_DURATION")
    private String reconciledDuration;

    @Basic
    @Column(name = "CLOSING_BALANCE")
    @ColumnDefault(value = "0.00")
    private BigDecimal closingBalance;

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

    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
