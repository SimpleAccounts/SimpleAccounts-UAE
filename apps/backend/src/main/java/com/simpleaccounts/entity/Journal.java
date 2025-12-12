package com.simpleaccounts.entity;

import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import lombok.Data;

/**
 * @author saurabhg.
 */
@Entity
@Table(name = "JOURNAL")
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
@NamedQueries({
		@NamedQuery(name = "getJournalByReferenceId", query = "select j from Journal j ,JournalLineItem jn where jn.journal.id = j.id and jn.deleteFlag = false and jn.referenceId = :referenceId"),
		@NamedQuery(name = "getJournalByReferenceIdAndType", query = "select j from Journal j ,JournalLineItem jn where jn.journal.id = j.id and jn.deleteFlag = false and jn.referenceId = :referenceId and jn.referenceType = :referenceType")})

public class Journal implements Serializable {

	/**
	 *
	 */
	private static final long serialVersionUID = -6038849464759772457L;

	@Id
	@SequenceGenerator(name="JOURNAL_SEQ", sequenceName="JOURNAL_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="JOURNAL_SEQ")
	@Column(name = "JOURNAL_ID", updatable = false, nullable = false)
	private int id;

	@Basic
	@Column(name = "JOURNAL_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDate journalDate;

	@Basic
	@Column(name = "JOURNAL_REFERENCE_NO")
	private String journlReferencenNo;

	@Basic
	@Column(name = "DESCRIPTION")
	private String description;

	@OneToOne
	@JoinColumn(name = "CURRENCY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_JOURNAL_CURRENCY_ID_CURRENCY"))
	private Currency currency;

	@Basic
	@Column(name = "SUB_TOTAL_DEBIT_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal subTotalDebitAmount;

	@Basic
	@Column(name = "TOTAL_DEBIT_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal totalDebitAmount;

	@Basic
	@Column(name = "TOTAL_CREDIT_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal totalCreditAmount;

	@Basic
	@Column(name = "SUB_TOTAL_CREDIT_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal subTotalCreditAmount;

	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "journal")
	@org.hibernate.annotations.ForeignKey(name = "none")
	private Collection<JournalLineItem> journalLineItems;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	//@Convert(converter = DateConverter.class)
	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@Column(name = "REFERENCE_TYPE")
	@Basic(optional = false)
	@Enumerated(value = EnumType.STRING)
	private PostingReferenceTypeEnum postingReferenceType;

	@Basic
	@Column(name = "TRANSACTION_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDate transactionDate;

//	@Column(name = "VERSION_NUMBER")
//	@ColumnDefault(value = "1")
//	@Basic(optional = false)
//	@Version
//	private Integer versionNumber = 1;

	@Column(name = "REVERSAL_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean reversalFlag = Boolean.FALSE;

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
