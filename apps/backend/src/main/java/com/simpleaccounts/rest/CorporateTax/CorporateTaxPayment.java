package com.simpleaccounts.rest.CorporateTax;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "CORPORATE_TAX_PAYMENT")
@Data
public class CorporateTaxPayment implements Serializable {
	private static final long serialVersionUID = 1L;
    @Id
    @Column(name = "CORPORATE_TAX_PAYMENT_ID", updatable = false, nullable = false)
    @SequenceGenerator(name="CORPORATE_TAX_PAYMENT_SEQ", sequenceName="CORPORATE_TAX_PAYMENT_SEQ", allocationSize=1, initialValue = 10000)
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CORPORATE_TAX_PAYMENT_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CORPORATE_TAX_FILING_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CORPORATE_TAX_PAYMENT_CORPORATE_TAX_FILING_ID_CORPORATE_TAX_FILING"))
    @JsonManagedReference
    private CorporateTaxFiling corporateTaxFiling;

    @OneToOne
    @JoinColumn(name = "TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CORPORATE_TAX_PAYMENT_TRANSACTION_ID_TRANSACTION"))
    private Transaction transaction;

    @Basic
    @Column(name = "PAYMENT_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDate PaymentDate;

    @Basic
    @Column(name = "reference_number")
    private String referenceNumber;

    @Basic
    @Column(name = "AMOUNT_PAID")
    @ColumnDefault(value = "0.00")
    private BigDecimal amountPaid;

    @Basic
    @Column(name = "BALANCE_DUE")
    @ColumnDefault(value = "0.00")
    private BigDecimal balanceDue;

    @Basic
    @Column(name = "TOTAL_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalAmount;

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
    private Integer lastUpdatedBy;

    @Column(name = "LAST_UPDATE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @ManyToOne
    @JoinColumn(name = "DEPOSIT_TO_TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CORPORATE_TAX_PAYMENT_DEPOSIT_TO_TRAX_CATEGORY_ID_TRAX_CATEGORY"))
    private TransactionCategory depositToTransactionCategory;

//    @Column(name = "VERSION_NUMBER")
//    @ColumnDefault(value = "1")
//    @Basic(optional = false)
//    @Version
//    private Integer versionNumber = 1;

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
