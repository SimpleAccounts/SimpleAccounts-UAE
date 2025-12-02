package com.simplevat.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import com.simplevat.constant.TransactionExplinationStatusEnum;
import com.simplevat.entity.Journal;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.converter.DateConverter;

import lombok.Data;

@NamedQueries({
		@NamedQuery(name = "findAllTransactionStatues", query = "SELECT t FROM TransactionStatus t where t.deleteFlag = FALSE order by t.explinationStatus ASC"),
		@NamedQuery(name = "findAllTransactionStatuesByTrnxId", query = "SELECT t FROM TransactionStatus t where t.deleteFlag = FALSE and transaction.transactionId = :transactionId")})
@Entity
@Table(name = "EXPLANATION_STATUS")
@Data
public class TransactionStatus implements Serializable {

	private static final long serialVersionUID = 848122185643690684L;
	@Id
	@Column(name = "EXPLANATION_STATUS_CODE", updatable = false, nullable = false)
	@SequenceGenerator(name="EXPLANATION_STATUS_SEQ", sequenceName="EXPLANATION_STATUS_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EXPLANATION_STATUS_SEQ")
	private int explainationStatusCode;

	@Basic(optional = false)
	@Enumerated(EnumType.STRING)
	@Column(name = "EXPLANATION_STATUS_NAME")
	private TransactionExplinationStatusEnum explinationStatus;

	@Basic
	@Column(name = "EXPLANATION_STATUS_DESCRIPTION")
	private String explainationStatusDescriptions;

	@Basic(optional = false)
	@Column(name = "REMAINING_TO_EXPLAIN_BALANCE")
	@ColumnDefault(value = "0.00")
	private BigDecimal remainingToExplain;

	@Deprecated
	@OneToOne
	@JoinColumn(name = "RECONSILE_JOURNAL_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPLANATION_STATUS_RECONSILE_JOURNAL_ID_RECONSILE_JOURNAL"))
	private Journal reconsileJournal;

	@OneToOne
	@JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPLANATION_STATUS_INVOICE_ID_INVOICE"))
	private Invoice invoice;

	@OneToOne
	@JoinColumn(name = "TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPLANATION_STATUS_TRANSACTION_ID_TRANSACTION"))
	private Transaction transaction;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	//@Convert(converter = DateConverter.class)
	@CreationTimestamp
	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	private Boolean deleteFlag = Boolean.FALSE;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
