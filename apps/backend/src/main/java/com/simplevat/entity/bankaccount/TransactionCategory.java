package com.simplevat.entity.bankaccount;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import com.simplevat.entity.VatCategory;
import com.simplevat.entity.converter.DateConverter;

import lombok.Data;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
		@NamedQuery(name = "findAllTransactionCategory", query = "SELECT t FROM TransactionCategory t where t.deleteFlag=false ORDER BY t.defaltFlag DESC , t.transactionCategoryName ASC"),
		@NamedQuery(name = "findAllTransactionCategoryBychartOfAccount", query = "SELECT t FROM TransactionCategory t where t.deleteFlag=FALSE AND t.chartOfAccount.chartOfAccountId =:chartOfAccountId ORDER BY t.defaltFlag DESC , t.orderSequence,t.transactionCategoryName ASC"),
		@NamedQuery(name = "findAllTransactionCategoryByUserId", query = "SELECT t FROM TransactionCategory t where t.deleteFlag=false and (t.createdBy = :createdBy or t.createdBy = 1) ORDER BY t.defaltFlag DESC , t.orderSequence,t.transactionCategoryName ASC"),
		@NamedQuery(name = "findMaxTnxCodeByChartOfAccId", query = "SELECT t FROM TransactionCategory t where chartOfAccount =:chartOfAccountId ORDER BY transactionCategoryId  DESC"),
		@NamedQuery(name = "findTnxCatForReicpt", query = "SELECT t FROM TransactionCategory t WHERE t.chartOfAccount.chartOfAccountId =8  and t.deleteFlag=false "),
		@NamedQuery(name = "getTransactionCategoryListForPurchaseProduct", query = "SELECT t FROM TransactionCategory t WHERE t.chartOfAccount.chartOfAccountId in ('11','16','17','18','15','10','13','19') AND t.transactionCategoryId not in ('18','99','101','103','118','119','84','153') and t.deleteFlag=false "),
		@NamedQuery(name = "getTransactionCategoryListForSalesProduct", query = "SELECT t FROM TransactionCategory t WHERE t.chartOfAccount.chartOfAccountId in ('15') AND t.transactionCategoryId in ('80','84') and t.deleteFlag=false"),
		@NamedQuery(name = "getTransactionCategoryListManualJornal", query = "SELECT t FROM TransactionCategory t WHERE t.deleteFlag=false"),
		@NamedQuery(name = "getTransactionCategoryListForInventory", query = "SELECT t FROM TransactionCategory t WHERE t.chartOfAccount.chartOfAccountId in ('20') AND t.transactionCategoryId in ('150')"),
})

@Entity
@Table(name = "TRANSACTION_CATEGORY")
@Data
public class TransactionCategory implements Serializable {

	private static final long serialVersionUID = 848122185643690684L;

	@Id
	@Column(name = "TRANSACTION_CATEGORY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="TRANSACTION_CATEGORY_SEQ", sequenceName="TRANSACTION_CATEGORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTION_CATEGORY_SEQ")
	private Integer transactionCategoryId;

	@Basic(optional = false)
	@Column(name = "TRANSACTION_CATEGORY_NAME")
	private String transactionCategoryName;

	@Basic
	@Column(name = "TRANSACTION_CATEGORY_DESCRIPTION")
	private String transactionCategoryDescription;

	@Basic
	@Column(name = "TRANSACTION_CATEGORY_CODE")
	private String transactionCategoryCode;

	@OneToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "CHART_OF_ACCOUNT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_CATEGORY_CHART_OF_ACCOUNT_ID_CHART_OF_ACCOUNT"))
	private ChartOfAccount chartOfAccount;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANX_CATEGORY_PARENT_TRANX_CATEGORY_CODE_TRANX_CATEGORY"))
	private TransactionCategory parentTransactionCategory;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "VAT_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTION_CATEGORY_VAT_CATEGORY_CODE_VAT_CATEGORY"))
	private VatCategory vatCategory;

	@Column(name = "DEFAULT_FLAG")
	@ColumnDefault(value = "'N'")
	@Basic(optional = false)
	private Character defaltFlag;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

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

	@Column(name = "SELECTABLE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean selectableFlag = Boolean.FALSE;

	@Column(name = "EDITABLE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean editableFlag = Boolean.FALSE;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_MIGRATED_RECORD")
	private Boolean isMigratedRecord = false;


}
