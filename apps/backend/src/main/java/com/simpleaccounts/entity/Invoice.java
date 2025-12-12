package com.simpleaccounts.entity;

import com.simpleaccounts.constant.CommonConstant;

import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.constant.InvoiceDuePeriodEnum;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;

import org.hibernate.annotations.ColumnDefault;

/**
 * Created by ashish .
 */
@Data
@Entity
@Table(name = "INVOICE")
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
@NoArgsConstructor
@AllArgsConstructor
@NamedQueries({
		@NamedQuery(name = "allInvoices", query = "from Invoice i where i.deleteFlag = false order by i.lastUpdateDate desc"),
		@NamedQuery(name = "allInvoicesByPlaceOfSupply", query = "SELECT Sum(i.totalAmount) as TOTAL_AMOUNT,Sum(i.totalVatAmount) as TOTAL_VAT_AMOUNT, i.placeOfSupplyId as PLACE_OF_SUPPLY_ID from Invoice i,PlaceOfSupply p where i.placeOfSupplyId = p.id and i.type=2 group by  i.placeOfSupplyId "),
		@NamedQuery(name = "invoiceForDropdown", query = "SELECT new " + CommonConstant.DROPDOWN_MODEL_PACKAGE
				+ "(i.id , i.referenceNumber )" + " FROM Invoice i where i.deleteFlag = FALSE and i.type=:type and i.status in (6) and i.cnCreatedOnPaidInvoice=false order by i.id desc"),
		@NamedQuery(name = "updateStatus", query = "Update Invoice i set i.status = :status where id = :id "),
		@NamedQuery(name = "lastInvoice", query = "from Invoice i where i.type = :type order by i.id desc"),
		@NamedQuery(name = "activeInvoicesByDateRange", query = "from Invoice i where i.invoiceDate between :startDate and :endDate and  i.type in(1,2)  and i.deleteFlag = false"),
		@NamedQuery(name = "overDueAmount", query = "SELECT Sum(i.totalAmount) from Invoice i where i.type = :type and i.invoiceDueDate < :currentDate and i.status in (3) and i.deleteFlag = false"),
		@NamedQuery(name = "getTotalPaidCustomerInvoice",query = "SELECT Sum(i.totalAmount) from Invoice i where i.type = 2 and i.invoiceDueDate < :currentDate and i.status in (6) and i.deleteFlag = false"),
		@NamedQuery(name = "overDueAmountWeeklyMonthly", query = "SELECT Sum(i.totalAmount) from Invoice i where i.type = :type and i.status in (3) and i.deleteFlag = false and i.invoiceDueDate between :startDate and :endDate"),
		@NamedQuery(name = "getPaidCustomerInvoiceEarningsWeeklyMonthly",query = "SELECT Sum(i.totalAmount) from Invoice i where i.type = 2 and i.status in (6) and i.deleteFlag = false and i.invoiceDueDate between :startDate and :endDate"),
		@NamedQuery(name = "unpaidInvoices", query = "from Invoice i where i.status in :status and i.contact.contactId = :id and i.type =:type and i.deleteFlag = false order by i.id desc"),
		@NamedQuery(name = "suggestionExplainedInvoices", query = "Select i from Invoice i where i.status in :status and i.id in (Select ts.invoice.id from TransactionStatus ts ) and  i.contact.contactId = :id and  i.type =:type and i.deleteFlag = false and i.currency.currencyCode = :currency and i.createdBy = :userId order by i.id desc "),
		@NamedQuery(name = "totalInputVatAmount", query = "SELECT SUM (i.totalVatAmount) AS TOTAL_VAT_AMOUNT FROM Invoice i WHERE i.type=2 and i.deleteFlag = false and i.invoiceDate between :startDate and :endDate "),
		@NamedQuery(name = "totalOutputVatAmount", query = "SELECT SUM(i.totalVatAmount) AS TOTAL_VAT_AMOUNT FROM Invoice i WHERE i.type=1 and i.deleteFlag = false and i.invoiceDate between :startDate and :endDate "),
		@NamedQuery(name = "getListByPlaceOfSupply",query = "SELECT SUM(i.totalAmount) AS TOTAL_AMOUNT,SUM(i.totalVatAmount) AS TOTAL_VAT_AMOUNT, " +
				"i.placeOfSupplyId AS PLACE_OF_SUPPLY_ID FROM Invoice i, PlaceOfSupply p WHERE i.placeOfSupplyId = p.id " +
				"and i.type=2 and i.totalVatAmount > 0 AND i.invoiceDate between :startDate AND :endDate GROUP By i.placeOfSupplyId "),
		@NamedQuery(name = "getSumOfTotalAmountWithVatForRCM", query = "SELECT SUM(i.totalAmount) AS TOTAL_AMOUNT, SUM(i.totalVatAmount) AS TOTAL_VAT_AMOUNT FROM Invoice i WHERE i.status not in(2) AND i.type=1 AND i.isReverseChargeEnabled=True AND i.deleteFlag=false AND i.invoiceDate between :startDate and :endDate"),
		//@NamedQuery(name = "suggestionUnpaidInvoices", query = "Select i from Invoice i where i.status in :status  and  i.contact.contactId = :id and  i.type =:type and (i.currency.currencyCode=:currency or 0=:currency) and i.deleteFlag = false  and i.createdBy = :userId  order by i.id desc "),
		@NamedQuery(name = "suggestionUnpaidInvoices", query = "Select i from Invoice i where i.status in :status  and  i.contact.contactId = :id and  i.type =:type and i.currency.currencyCode in :currency  and i.deleteFlag = false  and i.createdBy = :userId  order by i.id desc "),
		//@NamedQuery(name = "suggestionUnpaidInvoicesAdmin", query = "Select i from Invoice i where i.status in :status  and  i.contact.contactId = :id and  i.type =:type and (i.currency.currencyCode=:currency or 0=:currency) and i.deleteFlag = false order by i.id desc ")
		@NamedQuery(name = "suggestionUnpaidInvoicesAdmin", query = "Select i from Invoice i where i.status in :status  and  i.contact.contactId = :id and  i.type =:type and (i.currency.currencyCode in :currency or 0 in :currency) and i.deleteFlag = false order by i.id desc ")
})
@NamedNativeQueries({
		@NamedNativeQuery(name = "InvoiceAmoutDetails",
				query = "SELECT i.INVOICE_ID AS id, il.SUB_TOTAL AS  totalAmount, il.VAT_AMOUNT AS  totalVatAmount, p.PLACE_OF_SUPPLY AS  placeOfSupply,c.CURRENCY_ISO_CODE AS currency, i.REFERENCE_NUMBER as referenceNumber, i.INVOICE_DATE as invoiceDate, i.TAX_TYPE AS exclusiveVat FROM Invoice i,currency c, place_of_supply p,invoice_line_item il WHERE i.INVOICE_ID = il.INVOICE_ID AND c.CURRENCY_CODE = i.CURRENCY_CODE AND il.VAT_ID in (1) AND il.VAT_ID not in (3) AND i.EDIT_FLAG =:editFlag AND i.PLACE_OF_SUPPLY_ID = p.PLACE_OF_SUPPLY_ID AND i.type=2 AND i.DELETE_FLAG=false AND i.PLACE_OF_SUPPLY_ID =:placeOfSupplyId AND i.INVOICE_DATE BETWEEN :fromDate AND :toDate",
				resultSetMapping = "InvoiceAmoutResultSet"),
		@NamedNativeQuery(name = "ZeroRatedSupplies",
				query = "SELECT  i.INVOICE_ID AS id, il.SUB_TOTAL AS totalAmount, il.VAT_AMOUNT AS totalVatAmount, i.PLACE_OF_SUPPLY_ID AS  placeOfSupply,c.CURRENCY_ISO_CODE AS currency, i.REFERENCE_NUMBER as referenceNumber, i.INVOICE_DATE as invoiceDate, i.TAX_TYPE AS exclusiveVat FROM invoice i,currency c, invoice_line_item il WHERE  i.STATUS NOT IN(2) AND i.EDIT_FLAG =:editFlag AND c.CURRENCY_CODE = i.CURRENCY_CODE AND i.TYPE=2 AND (i.PLACE_OF_SUPPLY_ID is null OR i.PLACE_OF_SUPPLY_ID is not null ) AND i.INVOICE_ID =il.INVOICE_ID AND c.CURRENCY_CODE = i.CURRENCY_CODE AND il.VAT_ID IN(2) AND i.INVOICE_DATE BETWEEN :fromDate AND :toDate",
				resultSetMapping = "InvoiceAmoutResultSet"),
		@NamedNativeQuery(name = "ExemptSupplies",
				query = "SELECT  i.INVOICE_ID AS id, il.SUB_TOTAL AS totalAmount, il.VAT_AMOUNT AS totalVatAmount, p.PLACE_OF_SUPPLY AS  placeOfSupply,c.CURRENCY_ISO_CODE AS currency, i.REFERENCE_NUMBER as referenceNumber, i.INVOICE_DATE as invoiceDate, i.TAX_TYPE AS exclusiveVat FROM invoice i,currency c, invoice_line_item il, place_of_supply p WHERE  i.STATUS NOT IN(2) AND i.EDIT_FLAG =:editFlag AND c.CURRENCY_CODE = i.CURRENCY_CODE AND i.TYPE=2 AND i.PLACE_OF_SUPPLY_ID = p.PLACE_OF_SUPPLY_ID AND i.INVOICE_ID =il.INVOICE_ID AND il.VAT_ID IN(3) AND i.INVOICE_DATE BETWEEN :fromDate AND :toDate",
				resultSetMapping = "InvoiceAmoutResultSet"),
		@NamedNativeQuery(name = "ReverseChargeProvisions",
				query = "SELECT i.INVOICE_ID AS id,il.SUB_TOTAL AS totalAmount, il.VAT_AMOUNT AS totalVatAmount, i.PLACE_OF_SUPPLY_ID AS  placeOfSupply,c.CURRENCY_ISO_CODE AS currency, i.REFERENCE_NUMBER as referenceNumber, i.INVOICE_DATE as invoiceDate, i.TAX_TYPE AS exclusiveVat FROM invoice i,currency c,invoice_line_item il WHERE i.PLACE_OF_SUPPLY_ID is null  AND i.INVOICE_ID = il.INVOICE_ID AND i.STATUS NOT IN(2) AND i.EDIT_FLAG =:editFlag AND c.CURRENCY_CODE = i.CURRENCY_CODE AND i.TYPE=1 AND i.IS_REVERSE_CHARGE_ENABLED=TRUE AND i.DELETE_FLAG=false AND i.INVOICE_DATE BETWEEN :fromDate AND :toDate",
				resultSetMapping = "InvoiceAmoutResultSet"),
		@NamedNativeQuery(name = "StanderdRatedInvoice",
				query = "SELECT i.INVOICE_ID AS id, il.SUB_TOTAL AS totalAmount, il.VAT_AMOUNT AS totalVatAmount, i.PLACE_OF_SUPPLY_ID AS  placeOfSupply,c.CURRENCY_ISO_CODE AS currency, i.REFERENCE_NUMBER as referenceNumber, i.INVOICE_DATE as invoiceDate, i.TAX_TYPE AS exclusiveVat FROM invoice i,currency c,invoice_line_item il WHERE i.PLACE_OF_SUPPLY_ID is null AND i.INVOICE_ID = il.INVOICE_ID AND il.VAT_ID in (1) AND i.STATUS NOT IN(2) AND i.EDIT_FLAG =:editFlag AND c.CURRENCY_CODE = i.CURRENCY_CODE AND i.TYPE=1 AND i.IS_REVERSE_CHARGE_ENABLED=FALSE AND i.DELETE_FLAG=false AND i.TOTAL_AMOUNT >0 AND i.INVOICE_DATE BETWEEN :fromDate AND :toDate",
				resultSetMapping = "InvoiceAmoutResultSet"),
		@NamedNativeQuery(name = "StanderdRatedExpense",
				query = "SELECT e.EXPENSE_ID AS Id, e.EXPENSE_AMOUNT AS totalAmount, e.EXPENSE_VAT_AMOUNT AS totalVatAmount , e.PLACE_OF_SUPPLY_ID AS  placeOfSupply,c.CURRENCY_ISO_CODE AS currency, e.EXPENSE_NUMBER AS referenceNumber, e.EXPENSE_DATE AS invoiceDate, e.EXCLUSIVE_VAT AS exclusiveVat FROM expense e,currency c WHERE e.PLACE_OF_SUPPLY_ID is null AND e.VAT_ID IN(1) AND e.IS_REVERSE_CHARGE_ENABLED=false AND e.EDIT_FLAG =:editFlag AND c.CURRENCY_CODE = e.CURRENCY_CODE AND e.VAT_CLAIMABLE=true AND e.DELETE_FLAG=false AND e.STATUS NOT IN(1) AND e.EXPENSE_DATE BETWEEN :fromDate AND :toDate",
				resultSetMapping = "InvoiceAmoutResultSet"),
		@NamedNativeQuery(name = "ReverseChargeEnabledExpense",
				query = "SELECT e.EXPENSE_ID AS Id, e.EXPENSE_AMOUNT AS totalAmount, e.EXPENSE_VAT_AMOUNT AS totalVatAmount , e.PLACE_OF_SUPPLY_ID AS  placeOfSupply,c.CURRENCY_ISO_CODE AS currency, e.EXPENSE_NUMBER AS referenceNumber, e.EXPENSE_DATE AS invoiceDate, e.EXCLUSIVE_VAT AS exclusiveVat FROM expense e,currency c WHERE e.PLACE_OF_SUPPLY_ID is null AND e.VAT_ID IN(1,2) AND e.IS_REVERSE_CHARGE_ENABLED=true AND e.EDIT_FLAG =:editFlag AND c.CURRENCY_CODE = e.CURRENCY_CODE AND e.VAT_CLAIMABLE=true AND e.DELETE_FLAG=false AND e.STATUS NOT IN(1) AND e.EXPENSE_DATE BETWEEN :fromDate AND :toDate",
				resultSetMapping = "InvoiceAmoutResultSet"),

})
@SqlResultSetMappings({
    @SqlResultSetMapping(name = "InvoiceAmoutResultSet",
        columns = {
        		@ColumnResult(name = "Id", type = Integer.class),
        		@ColumnResult(name = "TotalAmount", type = BigDecimal.class),
        		@ColumnResult(name = "TotalVatAmount", type = BigDecimal.class),
 	            @ColumnResult(name = "PlaceOfSupply", type = String.class),
 	            @ColumnResult(name = "ReferenceNumber", type = String.class),
 	            @ColumnResult(name = "InvoiceDate", type = String.class),
				@ColumnResult(name = "currency", type = String.class),
				@ColumnResult(name = "exclusiveVat", type = Boolean.class),
        }),
    @SqlResultSetMapping(name = "ExpenseAmoutResultSet",
    	columns = {
    			@ColumnResult(name = "Id", type = Integer.class),
    			@ColumnResult(name = "TotalAmount", type = BigDecimal.class),
    			@ColumnResult(name = "TotalVatAmount", type = BigDecimal.class),
	            @ColumnResult(name = "ExpenseNumber", type = String.class),
	            @ColumnResult(name = "ExpenseDate", type = String.class),
				@ColumnResult(name = "currency", type = String.class),
				@ColumnResult(name = "exclusiveVat", type = Boolean.class),
    })
})
public class Invoice implements Serializable {

	private static final long serialVersionUID = -8324261801367612269L;

	@Id
	@Column(name = "INVOICE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="INVOICE_SEQ", sequenceName="INVOICE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="INVOICE_SEQ")
	private Integer id;

	@Column(name = "REFERENCE_NUMBER")
	private String referenceNumber;

	@Column(name = "INVOICE_DATE")
//	//@Convert(converter = DateConverter.class)
	private LocalDate invoiceDate;

	@Column(name = "INVOICE_DUE_DATE")
//	//@Convert(converter = DateConverter.class)
	private LocalDate invoiceDueDate;

	@Column(name = "NOTES")
	private String notes;

	@Enumerated(EnumType.STRING)
	@Column(name = "DISCOUNT_TYPE")
	private DiscountType discountType;

	@Column(name = "DISCOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal discount;

	@Column(name = "DISCOUNT_PERCENTAGE")
	@ColumnDefault(value = "0.00")
	private double discountPercentage;

	@Column(name = "CONTACT_PO_NUMBER")
	private String contactPoNumber;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_CURRENCY_CODE_CURRENCY"))
	private Currency currency;

	@Basic
	@Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
	private BigDecimal exchangeRate;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	@ColumnDefault(value = "0")
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

	@Column(name = "FREEZE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean freeze = Boolean.FALSE;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_CONTACT_ID_CONTACT"))
	private Contact contact;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PROJECT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_PROJECT_ID_PROJECT"))
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "DOCUMENT_TEMPLATE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_DOCUMENT_TEMPLATE_ID_DOCUMENT_TEMPLATE"))
	private DocumentTemplate documentTemplate;

	@OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "invoice")
	@org.hibernate.annotations.ForeignKey(name = "none")
	private Collection<InvoiceLineItem> invoiceLineItems;

	@Column(name = "TOTAL_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal totalAmount;

	@Column(name = "TOTAL_VAT_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal totalVatAmount;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PLACE_OF_SUPPLY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_PLACE_OF_SUPPLY_ID_PLACE_OF_SUPPLY"))
	private PlaceOfSupply placeOfSupplyId;

	/**
	 * @see CommonStatusEnum
	 */
	@Basic
	@Column(name = "STATUS")
	private Integer status;

	@Basic
	@Column(name = "RECEIPT_NUMBER", length = 20)
	private String receiptNumber;

	@Basic
	@Column(name = "RECEIPT_ATTACHMENT_PATH")
	private String receiptAttachmentPath;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "FILE_ATTACHMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_FILE_ATTACHMENT_ID_FILE_ATTACHMENT"))
	private FileAttachment AttachmentFileName;

	@Basic
	@Column(name = "RECEIPT_ATTACHMENT_DESCRIPTION")
	private String receiptAttachmentDescription;

	@Basic
	@Column(name = "TAX_IDENTIFICATION_NUMBER")
	private String taxIdentificationNumber;

	@Column(name = "INVOICE_DUE_PERIOD", columnDefinition = "varchar(255) default 'NET_7'")
	@Enumerated(EnumType.STRING)
	private InvoiceDuePeriodEnum invoiceDuePeriod;

	/**
	 * Its compulsary field
	 *
	 * @see com.simpleaccounts.constant.ContactTypeEnum
	 */
	@Column(name = "TYPE")
	@Basic
	private Integer type;

	@Column(name = "DUE_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal dueAmount;

	@Column(name = "CN_CREATED_ON_PAID_INVOICE")
	@ColumnDefault(value = "false")
	@Basic
	private Boolean cnCreatedOnPaidInvoice = Boolean.FALSE;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_MIGRATED_RECORD")
	private Boolean isMigratedRecord = false;

	@Column(name = "TOTAL_EXCISE_AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal totalExciseAmount;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_REVERSE_CHARGE_ENABLED")
	private Boolean isReverseChargeEnabled = false;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "TAX_TYPE")
	private Boolean taxType  = Boolean.FALSE;

	@Basic
	@Column(name = "SHIPPING_ADDRESS")
	private String shippingAddress;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SHIPPING_COUNTRY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_SHIPPING_COUNTRY_CODE_COUNTRY"))
	private Country shippingCountry;

	@OneToOne
	@JoinColumn(name = "SHIPPING_STATE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_INVOICE_SHIPPING_STATE_ID_STATE"))
	private State shippingState;

	@Basic
	@Column(name = "SHIPPING_CITY")
	private String shippingCity;

	@Basic
	@Column(name = "SHIPPING_POST_ZIP_CODE")
	private String shippingPostZipCode;

	@Basic
	@Column(name = "SHIPPING_TELEPHONE")
	private String shippingTelephone;

	@Basic
	@Column(name = "SHIPPING_FAX")
	private String shippingFax;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "CHANGE_SHIPPING_ADDRESS")
	private Boolean changeShippingAddress = false;

	@Column(name = "EDIT_FLAG")
//	@ColumnDefault(value = "1")
	@Basic(optional = false)
	private Boolean editFlag = Boolean.TRUE;

	@Basic
	@Column(name = "FOOT_NOTES")
	private String footNote;

	@Column(name = "ORDER_SEQUENCE")
	@Basic(optional = true)
	private Integer orderSequence;

	@Column(name = "GENERATED_BY_SCAN")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean generatedByScan = Boolean.FALSE;

	@PrePersist
	public void updateDates() {
		createdDate = LocalDateTime.now();
		lastUpdateDate = LocalDateTime.now();
	}

	@PreUpdate
	public void updateLastUpdatedDate() {
		lastUpdateDate = LocalDateTime.now();
	}

	public Invoice(LocalDate invoiceDate, LocalDate invoiceDueDate, BigDecimal totalAmount, Integer type) {
		super();
		this.invoiceDate = invoiceDate;
		this.invoiceDueDate = invoiceDueDate;
		this.totalAmount = totalAmount;
		this.type = type;
	}

	public Invoice(Integer id) {
		super();
		this.id = id;
	}

}
