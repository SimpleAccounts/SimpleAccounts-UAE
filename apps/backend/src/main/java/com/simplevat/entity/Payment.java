package com.simplevat.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.simplevat.constant.PayMode;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.entity.converter.DateConverter;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import javax.persistence.*;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Created by Ashish on 13/12/2019.
 */
@NamedQueries({
		@NamedQuery(name = "allPayments", query = "SELECT p FROM Payment p where p.deleteFlag = FALSE  ORDER BY p.paymentDate DESC"),
		@NamedQuery(name = "getAmountByInvoiceId", query = "SELECT p FROM Payment p where p.invoice.id = :id and  p.deleteFlag  = FALSE ") })

@Entity
@Table(name = "PAYMENT")
@Data
public class Payment implements Serializable {

	private static final long serialVersionUID = 1L;
	@Id
	@SequenceGenerator(name="PAYMENT_SEQ", sequenceName="PAYMENT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PAYMENT_SEQ")
	@Basic(optional = false)
	@Column(name = "PAYMENT_ID", updatable = false, nullable = false)
	private Integer paymentId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SUPPLIER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYMENT_SUPPLIER_ID_SUPPLIER"))
	private Contact supplier;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYMENT_CURRENCY_CODE_CURRENCY"))
	@JsonManagedReference
	private Currency currency;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PROJECT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYMENT_PROJECT_ID_PROJECT"))
	@JsonManagedReference
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "BANK_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYMENT_BANK_ID_BANK"))
	@JsonManagedReference
	private BankAccount bankAccount;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYMENT_INVOICE_ID_INVOICE"))
	@JsonManagedReference
	private Invoice invoice;

	@Basic
	@Column(name = "PAYMENT_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDate paymentDate;

	@Basic
	@Column(name = "DESCRIPTION")
	private String description;

	@Basic
	@Column(name = "INVOICE_AMOUNT")
	private BigDecimal invoiceAmount;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

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
	@UpdateTimestamp
	//@Convert(converter = DateConverter.class)
	private LocalDateTime lastUpdateDate;

	@Basic
	@Column(name = "PAYMENT_NO")
	private String paymentNo;

	@Basic
	@Column(name = "REFERENCE_NO")
	private String referenceNo;

	@Basic
	@Column(name = "NOTES")
	private String notes;

	@Enumerated(EnumType.STRING)
	@Column(name = "PAY_MODE")
	private PayMode payMode;

	@ManyToOne
	@JoinColumn(name = "DEPOSIT_TO_TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYMENT_DEPOSIT_TO_TRANX_CAT_ID_TRANX_CAT"))
	private TransactionCategory depositeToTransactionCategory;

	@Basic
	@Column(name = "ATTACHMENT_PATH")
	private String attachmentPath;

	@Basic
	@Column(name = "ATTACHMENT_FILE_NAME")
	private String attachmentFileName;

	@Basic
	@Column(name = "ATTACHMENT_DESCRIPTION")
	private String attachmentDescription;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
