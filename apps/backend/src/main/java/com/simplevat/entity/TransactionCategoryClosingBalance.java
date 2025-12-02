package com.simplevat.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import com.simplevat.entity.bankaccount.TransactionCategory;

import lombok.Data;

@Entity
@Table(name = "TRANSACTION_CATEGORY_CLOSING_BALANCE")
@Data
@NamedQueries({
        @NamedQuery(name = "getListByFrmToDate", query = " select tcb from TransactionCategoryClosingBalance tcb where tcb.closingBalanceDate BETWEEN :startDate and :endDate and tcb.transactionCategory =:transactionCategory order by tcb.closingBalanceDate ASC"),
        @NamedQuery(name = "getListByFrmDate", query = " select tcb from TransactionCategoryClosingBalance tcb where tcb.closingBalanceDate > :endDate and tcb.transactionCategory =:transactionCategory"),
        @NamedQuery(name = "getListByForDate", query = " select tcb from TransactionCategoryClosingBalance tcb where tcb.closingBalanceDate <= :endDate and tcb.transactionCategory =:transactionCategory order by tcb.closingBalanceDate DESC"),
        @NamedQuery(name = "getLastClosingBalanceByDate", query = " select tcb from TransactionCategoryClosingBalance tcb where tcb.transactionCategory =:transactionCategory order by tcb.closingBalanceDate DESC")})
public class TransactionCategoryClosingBalance {
    	@Id
    @Column(name = "TRANSACTION_CATEGORY_CLOSING_BALANCE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="TRANSACTION_CATEGORY_CLOSING_BALANCE_SEQ", sequenceName="TRANSACTION_CATEGORY_CLOSING_BALANCE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_CATEGORY_CLOSING_BALANCE_SEQ")
    private Integer id;

    @OneToOne
    @JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANX_CAT_CLOSING_BALANCE_TRANX_CAT_ID_TRANX_CAT"))
    @Basic(optional = false)
    private TransactionCategory transactionCategory;

    @Basic
    @Column(name = "TRANSACTION_CATEGORY_CLOSING_BALANCE_DATE")
    private LocalDateTime closingBalanceDate;

    @Column(name = "OPENING_BALANCE")
    @ColumnDefault(value = "0.00")
    @Basic(optional = false)
    private BigDecimal openingBalance = BigDecimal.ZERO;


    @Column(name = "CLOSING_BALANCE")
    @ColumnDefault(value = "0.00")
    @Basic(optional = false)
    private BigDecimal closingBalance = BigDecimal.ZERO;

    @Column(name = "BANK_ACCOUNT_OPENING_BALANCE")
    @ColumnDefault(value = "0.00")
    @Basic(optional = false)
    private BigDecimal bankAccountOpeningBalance = BigDecimal.ZERO;

    @Column(name = "BANK_ACCOUNT_CLOSING_BALANCE")
    @ColumnDefault(value = "0.00")
    @Basic(optional = false)
    private BigDecimal bankAccountClosingBalance = BigDecimal.ZERO;

    @Column(name = "EFFECTIVE_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    private Date effectiveDate;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdDate;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
   //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
