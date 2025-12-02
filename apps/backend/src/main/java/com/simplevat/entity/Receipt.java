package com.simplevat.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;

import com.simplevat.constant.PayMode;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.entity.converter.DateConverter;

import lombok.Data;

/**
 * @author Saurabhg
 */
@Entity
@Table(name = "RECEIPT")
@Data
public class Receipt {

	@Id
	@Column(name = "RECEIPT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="RECEIPT_SEQ", sequenceName="RECEIPT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="RECEIPT_SEQ")
	private Integer id;

	@Basic
	@Column(name = "RECEIPT_NO")
	private String receiptNo;

	@Basic
	@Column(name = "RECEIPT_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDateTime receiptDate;

	@Basic
	@Column(name = "REFERENCE_CODE")
	private String referenceCode;

	@OneToOne
	@JoinColumn(name = "CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_RECEIPT_CONTACT_ID_CONTACT"))
	private Contact contact;

	@OneToOne
	@JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_RECEIPT_INVOICE_ID_INVOICE"))
	private Invoice invoice;

	@Basic
	@Column(name = "AMOUNT")
	@ColumnDefault(value = "0.00")
	private BigDecimal amount;

	@Column(name = "CREATED_BY")
	@Basic(optional = false)
	private Integer createdBy = 0;

	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")
	@Basic(optional = false)
	//@Convert(converter = DateConverter.class)
	private LocalDateTime createdDate;

	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdatedBy;

	@Column(name = "LAST_UPDATE_DATE")
	//@Convert(converter = DateConverter.class)
	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@Basic
	@Column(name = "NOTES")
	private String notes;

	@Enumerated(EnumType.STRING)
	@Column(name = "PAY_MODE")
	private PayMode payMode;

	@ManyToOne
	@JoinColumn(name = "DEPOSIT_TO_TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_RECEIPT_DEPOSIT_TO_TRANX_CATEGORY_ID_TRANX_CATEGORY"))
	private TransactionCategory depositeToTransactionCategory;

	@Basic
	@Column(name = "RECEIPT_ATTACHMENT_PATH")
	private String receiptAttachmentPath;

	@Basic
	@Column(name = "RECEIPT_ATTACHMENT_FILE_NAME")
	private String receiptAttachmentFileName;

	@Basic
	@Column(name = "RECEIPT_ATTACHMENT_DESCRIPTION")
	private String receiptAttachmentDescription;

	@Column(name = "VERSION_NUMBER")
	@ColumnDefault(value = "1")
	@Basic(optional = false)
	@Version
	private Integer versionNumber = 1;

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
