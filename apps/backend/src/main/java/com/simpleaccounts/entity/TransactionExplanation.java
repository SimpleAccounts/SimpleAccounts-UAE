package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;

/**
 * @author Muzammil
 */
@Data
@Entity
@Table(name = "TRANSACTION_EXPLANATION")
public class TransactionExplanation {

    	@Id
    @Column(name = "TRANSACTION_EXPLANATION_ID", updatable = false, nullable = false)
    @Basic(optional = false)
	@SequenceGenerator(name="TRANSACTION_EXPLANATION_SEQ", sequenceName="TRANSACTION_EXPLANATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_EXPLANATION_SEQ")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLANATION_"))
    private Transaction transaction;

    @Column(name = "REMAINING_BALANCE")
    @ColumnDefault(value = "0.00")
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Basic(optional = false)
    @Column(name = "PAID_AMOUNT")
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EXPLAINED_TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANX_EXP_EXP_TRANX_CAT_CODE_TRANX_CAT"))
    private TransactionCategory explainedTransactionCategory;

    @Basic
    @Column(name = "EXPLANATION_CONTACT_ID")
    private Integer explanationContact;

    @Basic
    @Column(name = "EXPLANATION_EMPLOYEE_ID")
    private Integer explanationEmployee;

    @Basic
    @Column(name = "VAT_ID")
    private Integer vatCategory;

    @Basic
    @Column(name = "EXPLANATION_USER_ID")
    private Integer explanationUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COA_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLANATION_COA_CATEGORY_ID_COA_CATEGORY"))
    private ChartOfAccountCategory coaCategory;

    @Basic
    @Column(name = "TRANSACTION_DESCRIPTION")
    private String transactionDescription;

    @Column(name = "REFERENCE_STR")
    private String referenceStr;

    @Basic
    @Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
    private BigDecimal exchangeRate;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FILE_ATTACHMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLANATION_FILE_ATTACHMENT_ID_FILE_ATTACHMENT"))
    private FileAttachment fileAttachment;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "transactionExplanation")
    @org.hibernate.annotations.ForeignKey(name = "none")
    private Collection<TransactionExplinationLineItem> explanationLineItems;

    @Column(name = "EXCHANGE_GAIN_OR_LOSS_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal exchangeGainOrLossAmount = BigDecimal.ZERO;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

}
