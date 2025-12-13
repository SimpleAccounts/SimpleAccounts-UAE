package com.simpleaccounts.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.*;

import com.simpleaccounts.entity.bankaccount.Transaction;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.Data;

/**
 * @author S@urabh : Middle table between Customer invoice and receipt to
 *         provide Many to Many mapping
 */

@NamedQueries({
		@NamedQuery(name = "findForInvoice", query = "SELECT c FROM CustomerInvoiceReceipt  c where  c.customerInvoice.id = :id and  c.deleteFlag=false ORDER BY c.id DESC"),
		@NamedQuery(name = "findForReceipt", query = "SELECT c FROM CustomerInvoiceReceipt  c where  c.receipt.id = :id and  c.deleteFlag=false ORDER BY c.id DESC") ,
		@NamedQuery(name = "findByCustomerInvoiceId", query = "SELECT c FROM CustomerInvoiceReceipt  c where  c.customerInvoice.id = :customerInvoice") })
@Entity
@Table(name = "CUSTOMER_INVOICE_RECEIPT")
@Data
public class CustomerInvoiceReceipt {

	@Id
	@Column(name = "CUSTOMER_INVOICE_RECEIPT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="CUSTOMER_INVOICE_RECEIPT_SEQ", sequenceName="CUSTOMER_INVOICE_RECEIPT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CUSTOMER_INVOICE_RECEIPT_SEQ")
	private long id;

	@ManyToOne
	@JoinColumn(name = "CUSTOMER_INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CUST_INVOICE_RECEIPT_CUST_INVOICE_ID_CUST_INVOICE"))
	private Invoice customerInvoice;

	@ManyToOne
	@JoinColumn(name = "RECEIPT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CUST_INVOICE_RECEIPT_RECEIPT_ID_RECEIPT"))
	private Receipt receipt;

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

	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdateBy;

	@Column(name = "LAST_UPDATE_DATE")
	@UpdateTimestamp

	private LocalDateTime lastUpdateDate;

	@OneToOne
	@JoinColumn(name = "TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CUSTOMER_INVOICE_RECEIPT_TRANSACTION_ID_TRANSACTION"))
	private Transaction transaction;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

}
