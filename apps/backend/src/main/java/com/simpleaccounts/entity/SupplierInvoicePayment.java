package com.simpleaccounts.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.*;

import com.simpleaccounts.entity.bankaccount.Transaction;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.simpleaccounts.entity.converter.DateConverter;

import lombok.Data;

/**
 * @author S@urabh : Middle table between Supplier invoice and Payment to
 *         provide Many to Many mapping
 */

@NamedQueries({
		@NamedQuery(name = "findForSupplierInvoice", query = "SELECT s FROM SupplierInvoicePayment  s where  s.supplierInvoice.id = :id and  s.deleteFlag=false ORDER BY s.id DESC"),
		@NamedQuery(name = "findForPayment", query = "SELECT s FROM SupplierInvoicePayment  s where  s.payment.paymentId = :id and  s.deleteFlag=false ORDER BY s.id DESC"),
		@NamedQuery(name = "findBySupplierInvoiceId", query = "SELECT c FROM SupplierInvoicePayment  c where  c.supplierInvoice.id = :supplierInvoice") })
@Entity
@Table(name = "SUPPLIER_INVOICE_PAYMENT")
@Data
public class SupplierInvoicePayment {

	@Id
	@Column(name = "SUPPLIER_INVOICE_PAYMENT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="SUPPLIER_INVOICE_PAYMENT_SEQ", sequenceName="SUPPLIER_INVOICE_PAYMENT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="SUPPLIER_INVOICE_PAYMENT_SEQ")
	private long id;

	@ManyToOne
	@JoinColumn(name = "SUPPLIER_INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SUPP_INVOICE_PAYMENT_SUPP_INVOICE_ID_SUPP_INVOICE"))
	private Invoice supplierInvoice;

	@ManyToOne
	@JoinColumn(name = "PAYMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SUPPLIER_INVOICE_PAYMENT_PAYMENT_ID_PAYMENT"))
	private Payment payment;

	@Basic(optional = false)
	@Column(name = "PAID_AMOUNT")
	private BigDecimal paidAmount;

	@Basic(optional = false)
	@Column(name = "DUE_AMOUNT")
	private BigDecimal dueAmount;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@CreationTimestamp
	//@Convert(converter = DateConverter.class)
	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")
	@UpdateTimestamp
	//@Convert(converter = DateConverter.class)
	private LocalDateTime lastUpdateDate;

	@OneToOne
	@JoinColumn(name = "TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SUPPLIER_INVOICE_PAYMENT_TRANSACTION_ID_TRANSACTION"))
	private Transaction transaction;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;
}
