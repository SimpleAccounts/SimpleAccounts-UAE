package com.simpleaccounts.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.simpleaccounts.constant.PayMode;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

import java.io.Serializable;

import lombok.Data;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Formula;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({ @NamedQuery(name = "allExpenses", query = "SELECT e FROM Expense e where e.deleteFlag = FALSE"),
		@NamedQuery(name = "getExpensesToMatch", query =  "SELECT e FROM Expense e WHERE e.expenseId NOT IN (SELECT expense.expenseId from TransactionExpenses ) and e.expenseAmount <= :amount and e.deleteFlag = FALSE and e.status in :status and e.createdBy = :userId order by e.expenseId desc"),
		@NamedQuery(name = "postedExpenses", query = "SELECT e FROM Expense e where e.deleteFlag = FALSE and e.status in :status and e.createdBy = :userId order by e.expenseId desc") })

@Entity
@Table(name = "EXPENSE")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)

public class Expense implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "EXPENSE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="EXPENSE_SEQ", sequenceName="EXPENSE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EXPENSE_SEQ")
	private Integer expenseId;

	@Column(name = "EXPENSE_NUMBER")
	private String expenseNumber;

	@Basic
	@Column(name = "EXPENSE_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal expenseAmount;

	@Column(name = "EXPENSE_VAT_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal expenseVatAmount;

	@Basic
	@Column(name = "EXPENSE_DATE")

	private LocalDate expenseDate;

	@Basic
	@Formula("date_trunc('day',EXPENSE_DATE)")
	private LocalDateTime expenseTruncDate;

	@Basic
	@Column(name = "EXPENSE_DESCRIPTION")
	private String expenseDescription;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_TRANSACTION_CATEGORY_CODE_TRANSACTION_CATEGORY"))
	@JsonManagedReference
	private TransactionCategory transactionCategory;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_CURRENCY_CODE_CURRENCY"))
	@JsonManagedReference
	private Currency currency;

	@Basic
	@Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
	private BigDecimal exchangeRate;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PROJECT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_PROJECT_ID_PROJECT"))
	@JsonManagedReference
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_EMPLOYEE_ID_EMPLOYEE"))
	@JsonManagedReference
	private Employee employee;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "USER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_USER_ID_USER"))
	private User userId;

	@Basic
	@Column(name = "RECEIPT_NUMBER", length = 20)
	private String receiptNumber;

	@Basic
	@Column(name = "RECEIPT_ATTACHMENT_PATH")
	private String receiptAttachmentPath;

	@Basic
	@Column(name = "RECEIPT_ATTACHMENT_FILE_NAME")
	private String receiptAttachmentFileName;

	@Basic
	@Column(name = "RECEIPT_ATTACHMENT_DESCRIPTION")
	private String receiptAttachmentDescription;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)

	private LocalDateTime createdDate;

	@Basic
	@Column(name = "STATUS", columnDefinition = "int default 1")
	private Integer status;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "VAT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_VAT_ID_VAT"))
	private VatCategory vatCategory;

	@Column(name = "PAY_MODE")
	@Enumerated(value = EnumType.STRING)

	private PayMode payMode;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BANK_ACCOUNT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_BANK_ACCOUNT_BANK_ACCOUNT_ID"))
	private BankAccount bankAccount;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")

	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@Column(name = "VAT_CLAIMABLE")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean vatClaimable = Boolean.FALSE;

	@Column(name = "EXCLUSIVE_VAT")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean exclusiveVat = Boolean.FALSE;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

	@Basic
	@Column(name = "PAYEE")
	private String payee;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "FILE_ATTACHMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_FILE_ATTACHMENT_ID_FILE_ATTACHMENT"))
	private FileAttachment fileAttachment;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_MIGRATED_RECORD")
	private Boolean isMigratedRecord = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "TAX_TREATMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_TAX_TREATMENT_ID_TAX_TREATMENT"))
	private TaxTreatment taxTreatment;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_REVERSE_CHARGE_ENABLED")
	private Boolean isReverseChargeEnabled  = Boolean.FALSE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PLACE_OF_SUPPLY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EXPENSE_PLACE_OF_SUPPLY_ID_PLACE_OF_SUPPLY"))
	private PlaceOfSupply placeOfSupplyId;

	@Column(name = "EDIT_FLAG")

	@Basic(optional = false)
	private Boolean editFlag = Boolean.TRUE;

	@Column(name = "EXPENSE_TYPE")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean expenseType;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

	@Basic
	@Column(name = "NOTES")
	private String notes;

	@Column(name = "BANK_GENERATED_EXPENSE")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean bankGenerated;
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
