package com.simpleaccounts.entity.bankaccount;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;

import javax.persistence.*;

import com.simpleaccounts.entity.*;
import org.hibernate.annotations.ColumnDefault;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.simpleaccounts.constant.TransactionCreationMode;
import com.simpleaccounts.constant.TransactionExplinationStatusEnum;

import lombok.Data;

/**
 * Created by mohsinh on 2/26/2017.
 */
@Entity
@Table(name = "TRANSACTION")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
@NamedQueries({
		@NamedQuery(name = "getByBankId", query = "from Transaction t where t.bankAccount.id = :id order by t.transactionId desc") })
public class Transaction implements Serializable {

	private static final long serialVersionUID = 848122185643690684L;

	@Id
	@Column(name = "TRANSACTION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="TRANSACTION_SEQ", sequenceName="TRANSACTION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_SEQ")
	private Integer transactionId;

	@Basic
	@Column(name = "TRANSACTION_DATE")
	private LocalDateTime transactionDate;

	@Basic
	@Column(name = "TRANSACTION_DESCRIPTION")
	private String transactionDescription;

	@Basic
	@Column(name = "TRANSACTION_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal transactionAmount;

	@Basic
	@Column(name = "TRANSACTION_DUE_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal transactionDueAmount;

	@Basic
	@Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
	private BigDecimal exchangeRate;

	@Basic
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "TRANSACTION_TYPE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_TRANSACTION_TYPE_CODE_TRANSACTION_TYPE"))
	private ChartOfAccount chartOfAccount;

	@Basic
	@Column(name = "RECEIPT_NUMBER")
	private String receiptNumber;

	@Basic(optional = false)
	@Column(name = "DEBIT_CREDIT_FLAG")
	private Character debitCreditFlag;

//	@ManyToOne(fetch = FetchType.LAZY)
//	@JoinColumn(name = "EXPLAINED_PROJECT_ID")
//	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EXPLAINED_TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANX_EXPLAINED_TRANX_CATEGORY_CODE_TRANX_CATEGORY"))
	private TransactionCategory explainedTransactionCategory;

	@Basic
	@Column(name = "EXPLAINED_TRANSACTION_DESCRIPTION")
	private String explainedTransactionDescription;

	@Basic
	@Column(name = "EXPLAINED_TRANSACTION_ATTACHEMENT_DESCRIPTION")
	private String explainedTransactionAttachementDescription;

	@Basic(optional = true)
	@Lob
	@Column(name = "EXPLAINED_TRANSACTION_ATTACHEMENT")
	private byte[] explainedTransactionAttachement;

	@Basic
	@Column(name = "EXPLAINED_TRANSACTION_ATTACHEMENT_FILE_NAME")
	private String explainedTransactionAttachmentFileName;

	@Basic
	@Column(name = "EXPLAINED_TRANSACTION_ATTACHEMENT_PATH")
	private String explainedTransactionAttachmentPath;

	@Basic
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BANK_ACCOUNT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_BANK_ACCOUNT_TRANSACTION_BANK_ACCOUNT_ID_BANK_ACCOUNT"))
	private BankAccount bankAccount;

//	@OneToMany(fetch = FetchType.LAZY)
//	@JoinColumn(name = "EXPLANATION_STATUS_CODE")
//	private List<TransactionStatus> transactionStatus;

	@Basic(optional = false)
	@Column(name = "CURRENT_BALANCE")
	@ColumnDefault(value = "0.00")
	private BigDecimal currentBalance;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EXPLANATION_BANK_ACCOUNT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLANATION_BANK_ACCOUNT_ID_BANK_ACCOUNT"))
	private BankAccount explinationBankAccount;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EXPLANATION_VENDOR_CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLANATION_VENDOR_CONTACT_ID_CONTACT"))
	private Contact explinationVendor;

	@Basic
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EXPLANATION_CUSTOMER_CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLANATION_CUSTOMER_CONTACT_ID_CONTACT"))
	private Contact explinationCustomer;

	@Basic
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EXPLANATION_EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLANATION_EMPLOYEE_ID_EMPLOYEE"))
	private Employee explinationEmployee;

	@Basic
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EXPLANATION_USER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_EXPLANATION_USER_ID_SA_USER"))
	private User explainationUser;

	@Basic
	@Column(name = "TRANSACTION_CREATION_MODE", columnDefinition = "varchar(32) default 'MANUAL'")
	@Enumerated(EnumType.STRING)
	private TransactionCreationMode creationMode;

	@Column(name = "TRANSACTION_EXPLINATION_STATUS", columnDefinition = "varchar(32) default 'NOT_EXPLAIN'")
	@Enumerated(EnumType.STRING)
	private TransactionExplinationStatusEnum transactionExplinationStatusEnum;

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

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

	@Column(name = "ENTRY_TYPE")
	private Integer entryType;

//	@Column(name = "REFERENCE_ID")
//	private Integer referenceId;
//
//	@Column(name = "REFERENCE_TYPE")
//	private Integer referenceType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_PARENT_TRANSACTION_ID_TRANSACTION"))
	private Transaction parentTransaction;

	@JsonIgnore
	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "parentTransaction")
	private Collection<Transaction> childTransactionList;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "VAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_VAT_ID_VAT"))
	private VatCategory vatCategory;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "COA_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_COA_CATEGORY_ID_COA_CATEGORY"))
	private ChartOfAccountCategory coaCategory;

	@Column(name = "REFERENCE_STR")
	private String referenceStr;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "FILE_ATTACHMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_FILE_ATTACHMENT_ID_FILE_ATTACHMENT"))
	private FileAttachment fileAttachment;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

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
