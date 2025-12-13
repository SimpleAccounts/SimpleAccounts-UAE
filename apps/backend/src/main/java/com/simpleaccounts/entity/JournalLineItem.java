package com.simpleaccounts.entity;

import com.simpleaccounts.constant.CommonConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;

import lombok.Data;

/**
 * Created by saurabhg.
 */
@Entity
@Table(name = "JOURNAL_LINE_ITEM")
@Data
@NamedQueries({
		@NamedQuery(name = "getListByFrmToDateWthPagintion", query = " select jn from JournalLineItem jn INNER join Journal j on j.id = jn.journal.id where j.journalDate BETWEEN :startDate and :endDate"),
		@NamedQuery(name = "totalSupplierInvoiceAmount", query = "SELECT new " + CommonConstant.OVERDUE_MODEL_PACKAGE + "(Sum(jl.creditAmount),Sum(jl.debitAmount)) " + "FROM JournalLineItem jl, Invoice i WHERE jl.referenceId=i.id AND jl.referenceType= :referenceType AND (jl.transactionCategory.chartOfAccount.parentChartOfAccount.chartOfAccountId in (1,2,4) OR (jl.transactionCategory.chartOfAccount.parentChartOfAccount.chartOfAccountId in (1) AND  jl.transactionCategory.transactionCategoryId = 150))  AND i.type=:type AND i.status in (3,5) AND i.deleteFlag=false and i.invoiceDueDate <:currentDate"),
		@NamedQuery(name = "totalCustomerInvoiceAmount", query = "SELECT new " + CommonConstant.OVERDUE_MODEL_PACKAGE + "(Sum(jl.creditAmount),Sum(jl.debitAmount)) " + "FROM JournalLineItem jl, Invoice i WHERE jl.referenceId=i.id AND jl.referenceType= :referenceType AND jl.transactionCategory.chartOfAccount.parentChartOfAccount.chartOfAccountId in (1,2,3) AND (jl.transactionCategory.chartOfAccount.chartOfAccountId not in (20)) AND i.type=:type AND i.status in (3,5)  AND i.deleteFlag=false AND i.invoiceDueDate<:currentDate"),
		@NamedQuery(name = "totalCustomerInvoiceAmountWeeklyMonthly", query = "SELECT new " + CommonConstant.OVERDUE_MODEL_PACKAGE + "(Sum(jl.creditAmount),Sum(jl.debitAmount)) " + " FROM JournalLineItem jl, Invoice i WHERE jl.referenceId=i.id AND jl.referenceType=:referenceType AND jl.transactionCategory.chartOfAccount.parentChartOfAccount.chartOfAccountId in (1,2,3) And jl.transactionCategory.chartOfAccount.chartOfAccountId not in (20) AND i.type=:type   AND i.deleteFlag=false and i.invoiceDueDate between :startDate and :endDate"),
		@NamedQuery(name = "totalSupplierInvoiceAmountWeeklyMonthly", query = "SELECT new " + CommonConstant.OVERDUE_MODEL_PACKAGE + "(Sum(jl.creditAmount),Sum(jl.debitAmount)) " + " FROM JournalLineItem jl, Invoice i WHERE jl.referenceId=i.id AND jl.referenceType=:referenceType AND (jl.transactionCategory.chartOfAccount.parentChartOfAccount.chartOfAccountId in (1,2,4) OR (jl.transactionCategory.chartOfAccount.parentChartOfAccount.chartOfAccountId in (1) AND  jl.transactionCategory.transactionCategoryId = 150)) AND i.type=:type   AND i.deleteFlag=false and i.invoiceDueDate between :startDate and :endDate"),
		@NamedQuery(name = "totalInvoiceReceiptAmount", query = "SELECT Sum(jl.creditAmount) FROM JournalLineItem jl, Receipt r,Invoice i WHERE jl.referenceId=r.id and r.invoice.id=i.id AND r.deleteFlag=false and jl.referenceType=:referenceType AND  jl.transactionCategory.parentTransactionCategory=:transactionCategory AND i.type=:type AND i.status in(5)  AND i.deleteFlag=false and i.invoiceDueDate <:currentDate"),
		@NamedQuery(name = "totalInvoiceReceiptAmountWeeklyMonthly", query = "SELECT Sum(jl.creditAmount) FROM JournalLineItem jl, Invoice i, Receipt r WHERE jl.referenceId=r.id and r.deleteFlag=false and r.invoice.id=i.id and jl.referenceType=:referenceType AND  jl.transactionCategory.parentTransactionCategory=:transactionCategory AND i.type=:type   AND i.deleteFlag=false and i.invoiceDueDate between :startDate and :endDate"),
		@NamedQuery(name = "totalInvoicePaymentAmount", query = "SELECT Sum(jl.creditAmount) FROM JournalLineItem jl, Payment r,Invoice i WHERE jl.referenceId=r.id AND r.deleteFlag=false and r.invoice.id=i.id and jl.referenceType=:referenceType AND  jl.transactionCategory!=:transactionCategory  AND i.type=:type AND i.status in(5) AND i.deleteFlag=false and i.invoiceDueDate <:currentDate "),
		@NamedQuery(name = "totalInputVatAmountAndOutputVatAmount",query = "SELECT Sum(jl.debitAmount) AS TotalInputVat,SUM(jl.creditAmount) AS TotalOutputVat FROM JournalLineItem jl where jl.transactionCategory.transactionCategoryId in (88,94)  and jl.journal.transactionDate between :startDate and :endDate"),
//vat-report
		@NamedQuery(name = "totalInputVatAmountValueOfExpense",query = "SELECT SUM(jl.debitAmount)-SUM(jl.creditAmount) AS TotalInputVat FROM JournalLineItem jl,Expense e where e.expenseId=jl.referenceId AND jl.referenceType IN ('REVERSE_EXPENSE','EXPENSE') AND e.status not in(1) AND e.vatClaimable=true AND  jl.transactionCategory.transactionCategoryId =:transactionCategoryId  and jl.journal.transactionDate between :startDate and :endDate"),
		@NamedQuery(name = "totalInputVatAmountValue",query = "SELECT SUM(jl.debitAmount)-SUM(jl.creditAmount) AS TotalInputVat FROM JournalLineItem jl,Invoice i where i.id=jl.referenceId AND jl.referenceType IN('INVOICE','REVERSE_INVOICE') AND i.status not in (2) AND jl.transactionCategory.transactionCategoryId =:transactionCategoryId  and jl.journal.transactionDate between :startDate and :endDate"),
		@NamedQuery(name = "totalInputVatAmountValueDebitNote",query = "SELECT SUM(jl.debitAmount)-SUM(jl.creditAmount) AS TotalInputVat FROM JournalLineItem jl,CreditNote i where i.creditNoteId=jl.referenceId AND jl.referenceType IN('DEBIT_NOTE','REVERSE_DEBIT_NOTE') AND i.status not in (2) AND jl.transactionCategory.transactionCategoryId =:transactionCategoryId and jl.reversalFlag = false and jl.journal.transactionDate between :startDate and :endDate"),
		@NamedQuery(name = "totalOutputVatAmountValue",query ="SELECT SUM(jl.creditAmount)-SUM(jl.debitAmount) AS TotalOutputVat FROM JournalLineItem jl where jl.transactionCategory.transactionCategoryId =:transactionCategoryId and jl.journal.transactionDate between :startDate and :endDate"),
//
		@NamedQuery(name = "IdsForTotalInputVatExpense",query = "SELECT jl.referenceId AS Id, jl.referenceType AS Type FROM JournalLineItem jl,Expense e\n" +
				"where jl.referenceId=e.expenseId AND e.status=3 AND jl.transactionCategory.transactionCategoryId =:transactionCategoryId  \n" +
				"AND e.vatClaimable=true AND jl.referenceType In('EXPENSE') and jl.journal.transactionDate between :startDate and :endDate"),
		@NamedQuery(name = "IdsAndTypeInTotalInputVat",query = "SELECT jl.referenceId AS Id, jl.referenceType AS Type FROM JournalLineItem jl,Invoice e\n" +
				"where jl.referenceId=e.id AND e.status not in (2) AND jl.transactionCategory.transactionCategoryId =:transactionCategoryId \n" +
				"AND e.type=1 AND jl.referenceType In('INVOICE') and " +
				"jl.journal.transactionDate between :startDate and :endDate"),
		@NamedQuery(name = "IdsAndTypeInTotalOutputVat",query ="SELECT jl.referenceId AS Id, jl.referenceType AS Type FROM JournalLineItem jl where jl.transactionCategory.transactionCategoryId =:transactionCategoryId AND jl.referenceType='INVOICE' and jl.journal.transactionDate between :startDate and :endDate"),

		@NamedQuery(name = "totalInvoicePaymentAmountWeeklyMonthly", query = "SELECT Sum(jl.creditAmount) FROM JournalLineItem jl, Invoice i, Payment r WHERE jl.referenceId=r.id AND r.deleteFlag=false and r.invoice.id=i.id and jl.referenceType=:referenceType AND  jl.transactionCategory!=:transactionCategory AND i.type=:type  AND i.deleteFlag=false and i.invoiceDueDate between :startDate and :endDate"),
		@NamedQuery(name = "getListByTransactionCategory", query = " select jn from JournalLineItem jn where jn.transactionCategory = :transactionCategory") })
@NamedQuery(name = "getVatTransationList",query =  "select jn FROM JournalLineItem jn WHERE jn.transactionCategory.transactionCategoryId IN (88,94) and jn.deleteFlag=false ")

@NamedNativeQueries({
		@NamedNativeQuery(name = "CustomerInv",
				query = "SELECT SUM(CASE WHEN COALESCE( i.STATUS,pi.STATUS) in (3,5) AND COALESCE(i.INVOICE_DUE_DATE,pi.INVOICE_DUE_DATE) <CURRENT_DATE AND COALESCE(i.TYPE,pi.TYPE) =2 THEN ( CASE WHEN REFERENCE_TYPE= 'INVOICE' THEN DEBIT_AMOUNT ELSE -CREDIT_AMOUNT END) END )  AS TotalOverdue, SUM(CASE WHEN COALESCE( i.STATUS,pi.STATUS) in (3,5) AND date_part('week',COALESCE(i.INVOICE_DUE_DATE,pi.INVOICE_DUE_DATE)) = date_part('week',CURRENT_DATE) AND COALESCE(i.TYPE,pi.TYPE) =2 THEN ( CASE WHEN REFERENCE_TYPE= 'INVOICE' THEN DEBIT_AMOUNT ELSE -CREDIT_AMOUNT END ) END)  AS ThisWeekOverdue, SUM(CASE WHEN COALESCE( i.STATUS,pi.STATUS) in (3,5) AND date_part('month',COALESCE(i.INVOICE_DUE_DATE,pi.INVOICE_DUE_DATE)) = date_part('month',NOW()) AND COALESCE(i.TYPE,pi.TYPE) =2 THEN ( CASE WHEN REFERENCE_TYPE= 'INVOICE' THEN DEBIT_AMOUNT ELSE -CREDIT_AMOUNT END ) END)  AS ThisMonthOverdue from journal_line_item ji LEFT join invoice i on (ji.REFERENCE_ID = i.INVOICE_ID AND ji.REFERENCE_TYPE = 'INVOICE') inner join TRANSACTION_CATEGORY tc on ji.TRANSACTION_CATEGORY_CODE = tc.TRANSACTION_CATEGORY_ID LEFT JOIN receipt r on (ji.REFERENCE_ID=r.RECEIPT_ID AND ji.REFERENCE_TYPE = 'RECEIPT') LEFT JOIN invoice pi on r.INVOICE_ID = pi.INVOICE_ID where ji.REVERSAL_FLAG = false  AND  REFERENCE_TYPE in ('INVOICE', 'REVERSE_INVOICE','RECEIPT','REVERSE_RECEIPT')AND tc.PARENT_TRANSACTION_CATEGORY_CODE in (1,2,3) ",
				resultSetMapping = "InvoiceDueAmountResultSet"),
		@NamedNativeQuery(name = "SupplierInvoiceDueAmount",
				query = "SELECT SUM(CASE WHEN COALESCE( i.STATUS,pi.STATUS) in (3,5) AND COALESCE(i.INVOICE_DUE_DATE,pi.INVOICE_DUE_DATE)< CURRENT_DATE AND COALESCE(i.TYPE,pi.TYPE) =1 THEN ( CASE WHEN REFERENCE_TYPE= 'INVOICE' THEN CREDIT_AMOUNT ELSE -DEBIT_AMOUNT END) END ) as TotalOverdue, SUM(CASE WHEN COALESCE( i.STATUS,pi.STATUS) in (3,5) AND date_part('week',COALESCE(i.INVOICE_DUE_DATE,pi.INVOICE_DUE_DATE)) = date_part('week',CURRENT_DATE) AND COALESCE(i.TYPE,pi.TYPE) =1 THEN ( CASE WHEN REFERENCE_TYPE= 'INVOICE' THEN CREDIT_AMOUNT ELSE -DEBIT_AMOUNT END ) END) as ThisWeekOverdue, SUM(CASE WHEN COALESCE( i.STATUS,pi.STATUS) in (3,5) AND date_part('month',COALESCE(i.INVOICE_DUE_DATE,pi.INVOICE_DUE_DATE)) = date_part('month',NOW()) AND COALESCE(i.TYPE,pi.TYPE) =1 THEN ( CASE WHEN REFERENCE_TYPE= 'INVOICE' THEN CREDIT_AMOUNT ELSE -DEBIT_AMOUNT END ) END) as ThisMonthOverdue from journal_line_item ji LEFT join invoice i on (ji.REFERENCE_ID = i.INVOICE_ID AND ji.REFERENCE_TYPE = 'INVOICE') inner join TRANSACTION_CATEGORY tc on ji.TRANSACTION_CATEGORY_CODE = tc.TRANSACTION_CATEGORY_ID LEFT JOIN payment p on (ji.REFERENCE_ID=p.PAYMENT_ID AND ji.REFERENCE_TYPE = 'PAYMENT') LEFT JOIN invoice pi on p.INVOICE_ID = pi.INVOICE_ID where ji.REVERSAL_FLAG = false  AND REFERENCE_TYPE in ('INVOICE', 'REVERSE_INVOICE','PAYMENT','REVERSE_PAYMENT')AND tc.PARENT_TRANSACTION_CATEGORY_CODE in (1,2,4)",
				resultSetMapping = "InvoiceDueAmountResultSet"),
})
@SqlResultSetMappings({
		@SqlResultSetMapping(name = "InvoiceDueAmountResultSet",
				columns = {
						@ColumnResult(name = "TotalOverdue", type = BigDecimal.class),
						@ColumnResult(name = "ThisWeekOverdue", type = BigDecimal.class),
						@ColumnResult(name = "ThisMonthOverdue", type = BigDecimal.class),
				})
})
public class JournalLineItem implements Serializable {
	/**
	 *
	 */
	private static final long serialVersionUID = 7790907788120167278L;

	@Id
	@SequenceGenerator(name="JOURNAL_LINE_ITEM_SEQ", sequenceName="JOURNAL_LINE_ITEM_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="JOURNAL_LINE_ITEM_SEQ")
	@Column(name = "JOURNAL_LINE_ITEM_ID", updatable = false, nullable = false)
	private int id;

	@Basic
	@Column(name = "DESCRIPTION")
	private String description;

	@OneToOne
	@JoinColumn(name = "TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_JOURNAL_LINE_ITEM_TRANX_CAT_CODE_TRANX_CAT"))
	private TransactionCategory transactionCategory;

	@OneToOne
	@JoinColumn(name = "CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_JOURNAL_LINE_ITEM_CONTACT_ID_CONTACT"))
	private Contact contact;

	@OneToOne
	@JoinColumn(name = "VAT_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_JOURNAL_LINE_ITEM_VAT_CATEGORY_CODE_VAT_CATEGORY"))
	private VatCategory vatCategory;

	@Basic
	@Column(name = "DEBIT_AMOUNT")
	private BigDecimal debitAmount = BigDecimal.ZERO;

	@Basic
	@Column(name = "CREDIT_AMOUNT")
	private BigDecimal creditAmount = BigDecimal.ZERO;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)

	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")

	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@ManyToOne
	@JoinColumn(name = "JOURNAL_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_JOURNAL_LINE_ITEM_JOURNAL_ID_JOURNAL"))
	private Journal journal;

	@Column(name = "REFERENCE_ID")
	// commented to avoid error in journal save
	@Basic(optional = false)
	private Integer referenceId;

	@Column(name = "REFERENCE_TYPE")
	@Basic(optional = false)
	@Enumerated(value = EnumType.STRING)
	private PostingReferenceTypeEnum referenceType;

	@Basic(optional = false)
	@Column(name = "CURRENT_BALANCE")
	@ColumnDefault(value = "0.00")
	private BigDecimal currentBalance;

	@Column(name = "IS_CURRENCY_CONVERSION_ENABLED")
	@ColumnDefault(value = "false")
	private Boolean isCurrencyConversionEnabled = Boolean.FALSE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_JOURNAL_LINE_ITEM_CURRENCY_CODE_CURRENCY"))
	private Currency currencyCode;

	@Basic
	@Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
	private BigDecimal exchangeRate;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

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
