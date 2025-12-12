package com.simpleaccounts.entity;

import java.io.Serializable;

import lombok.Data;

import javax.persistence.*;

import java.util.Date;

import org.hibernate.annotations.ColumnDefault;
import org.springframework.lang.Nullable;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;

/**
 * Created by Uday
 */
@Data
@Entity
@Table(name = "LEADGER_ENTRY")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
////@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1)
public class LeadgerEntry implements Serializable {

    private static final long serialVersionUID = 848122185643690684L;

    	@Id
	@SequenceGenerator(name="LEADGER_ENTRY_SEQ", sequenceName="LEADGER_ENTRY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="LEADGER_ENTRY_SEQ")
    @Basic(optional = false)
    @Column(name = "LEADGER_ENTRY_ID", updatable = false, nullable = false)
    private Long id;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "type")
    private String type;

    @Nullable
    @ManyToOne
    @JoinColumn(name = "TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_LEADGER_ENTRY_TRANSACTION_CATEGORY_CODE_TRANSACTION_CATEGORY"))
    private TransactionCategory transactionCategory;

    @Column(name = "note")
    private String note;

    @Column(name = "balance")
    private Double balance;

    @Column(name = "created_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdTime;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    private Long createdBy;

    @Column(name = "updated_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedTime;

    @Column(name = "updated_by")
    private Long updatedBy;

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
