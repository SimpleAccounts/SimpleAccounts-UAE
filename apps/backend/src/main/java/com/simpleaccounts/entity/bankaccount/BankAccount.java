package com.simpleaccounts.entity.bankaccount;

import com.simpleaccounts.entity.Country;
import com.simpleaccounts.entity.Currency;
import com.simpleaccounts.entity.converter.DateConverter;
import java.io.Serializable;

import lombok.Data;

import org.springframework.transaction.annotation.Transactional;

import javax.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
		@NamedQuery(name = "allBankAccounts", query = "SELECT b FROM BankAccount b where b.deleteFlag = FALSE  ORDER BY b.bankAccountStatus.bankAccountStatusName,b.bankAccountName ASC"),
		@NamedQuery(name = "allBankAccountsTotalBalance", query = "SELECT sum(b.currentBalance) FROM BankAccount b where b.deleteFlag = FALSE") })

@Entity
@Table(name = "BANK_ACCOUNT")
@Data
@Transactional
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class BankAccount implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@Column(name = "BANK_ACCOUNT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="BANK_ACCOUNT_SEQ", sequenceName="BANK_ACCOUNT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="BANK_ACCOUNT_SEQ")
	private Integer bankAccountId;

	@Basic
	@Column(name = "BANK_ACCOUNT_NAME")
	private String bankAccountName;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BANK_ACCOUNT_CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_BANK_ACC_BANK_ACC_CURR_CODE_BANK_ACC_CURR"))
	private Currency bankAccountCurrency;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BANK_ACCOUNT_STATUS_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_BANK_ACC_BANK_ACC_STATUS_CODE_BANK_ACC_STATUS"))
	private BankAccountStatus bankAccountStatus;

	@Basic(optional = false)
	@ColumnDefault(value = "'C'")
	@Column(name = "PERSONAL_CORPORATE_ACCOUNT_IND", length = 1)
	private Character personalCorporateAccountInd;

	@Basic(optional = false)
//	@ColumnDefault(value = "1")
	@Column(name = "ISPRIMARY_ACCOUNT_FLAG")
	private Boolean isprimaryAccountFlag = Boolean.TRUE;

	@Basic
	@Column(name = "BANK_NAME")
	private String bankName;

	@Basic
	@Column(name = "ACCOUNT_NUMBER")
	private String accountNumber;

	@Basic
	@Column(name = "IFSC_CODE")
	private String ifscCode;
	@Basic
	@Column(name = "SWIFT_CODE")
	private String swiftCode;

	@Basic
	@ColumnDefault(value = "0.00")
	@Column(name = "OPENING_BALANCE")
	private BigDecimal openingBalance;

	@Basic
	@ColumnDefault(value = "0.00")
	@Column(name = "CURRENT_BALANCE")
	private BigDecimal currentBalance;

	@Basic
	@Column(name = "BANK_FEED_STATUS_CODE")
	private Integer bankFeedStatusCode;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BANK_COUNTRY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_BANK_ACC_BANK_CNT_CODE_BANK_CNT"))
	private Country bankCountry;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	//@Convert(converter = DateConverter.class)
	private LocalDateTime createdDate;

	@Column(name = "OPENING_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDateTime openingDate;

	@Basic
	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdatedBy;

	//need to remove
	@OneToOne
	@JoinColumn(name = "TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_BANK_ACCOUNT_TRANSACTION_CATEGORY_CODE_TRANSACTION_CATEGORY"))
	private TransactionCategory transactionCategory;

	@Basic
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BANK_ACCOUNT_TYPE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_BANK_ACCOUNT_BANK_ACCOUNT_TYPE_CODE_BANK_ACCOUNT_TYPE"))
	private BankAccountType bankAccountType;

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
