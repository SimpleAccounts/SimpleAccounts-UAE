package com.simpleaccounts.entity.bankaccount;

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
@Table(name = "IMPORTED_DRAFT_TRANSACTON")
@Data
public class ImportedDraftTransaction implements Serializable {

    private static final long serialVersionUID = 848122185643690684L;
    	@Id
    @Column(name = "IMPORTED_TRANSACTION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="IMPORTED_DRAFT_TRANSACTON_SEQ", sequenceName="IMPORTED_DRAFT_TRANSACTON_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="IMPORTED_DRAFT_TRANSACTON_SEQ")
    private int importedTransactionId;
    @Basic
    @Column(name = "IMPORTED_TRANSACTION_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime importedTransactionDate;
    @Basic
    @Column(name = "IMPORTED_TRANSACTION_DESCRIPTION")
    private String importedTransactionDescription;

    @Basic
    @ColumnDefault(value = "0.00")
    @Column(name = "IMPORTED_TRANSACTION_AMOUNT")
    private BigDecimal importedTransactionAmount;

    @Basic(optional = false)
    @Column(name = "IMPORTED_DEBIT_CREDIT_FLAG")
    private Character importedDebitCreditFlag;

    @Basic
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BANK_ACCOUNT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_IMPORTED_DRAFT_TRANSACTON_BANK_ACCOUNT_ID_BANK_ACCOUNT"))
    private BankAccount bankAccount;

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

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @PrePersist
    public void updateDates() {
        createdDate = LocalDateTime.now();
        lastUpdateDate = LocalDateTime.now();
    }

    @PreUpdate
    public void updateLastUpdatedDate() {
        lastUpdateDate = LocalDateTime.now();
    }

}
