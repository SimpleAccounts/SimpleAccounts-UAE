/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.entity.bankaccount;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 *
 * @author admin
 */
@Data
@Entity
@Table(name = "TRANSACTIONVIEW")
public class TransactionView implements Serializable {

    private static final long serialVersionUID = 1L;
    	@Id
    @Column(name = "TRANSACTION_ID")
    private int transactionId;
    @Column(name = "CURRENT_BALANCE")
    private BigDecimal currentBalance;
    @Column(name = "DEBIT_CREDIT_FLAG")
    private Character debitCreditFlag;
    @Column(name = "ENTRY_TYPE")
    private Integer entryType;
    @Column(name = "REFERENCE_ID")
    private Integer referenceId;
    @Column(name = "REFERENCE_TYPE")
    private Integer referenceType;
    @Column(name = "TRANSACTION_AMOUNT")
    private BigDecimal transactionAmount;
    @Column(name = "TRANSACTION_DATE")
    @Temporal(TemporalType.TIMESTAMP)
    private Date transactionDate;
    @Column(name = "TRANSACTION_DESCRIPTION")
    private String transactionDescription;
    @Column(name = "BANK_ACCOUNT_ID")
    private Integer bankAccountId;
    @Column(name = "PARENT_TRANSACTION")
    private Integer parentTransaction;
    @Column(name = "TRANSACTION_CATEGORY_NAME")
    private String transactionCategoryName;
    @Column(name = "TRANSACTION_TYPE_NAME")
    private String transactionTypeName;

    @Column(name = "EXPLANATION_STATUS_NAME")
    private String explanationStatusName;
    @Column(name = "REFERENCE_NAME")
    private String referenceName;
    @Column(name = "DUE_AMOUNT")
    private BigDecimal dueAmount;
    @Column(name = "CONTACT_NAME")
    private String contactName;
    @Column(name = "CURRENCY_SYMBOL")
    private String currencySymbol;
    @Column(name = "DUE_ON")
    @Temporal(TemporalType.TIMESTAMP)
    private Date dueOn;

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

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate = LocalDateTime.now();

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
