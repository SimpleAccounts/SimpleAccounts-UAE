package com.simpleaccounts.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import com.simpleaccounts.entity.bankaccount.Transaction;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "VAT_PAYMENT")
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class VatPayment implements Serializable {
    private static final long serialVersionUID = 1L;
    	@Id
    @Column(name = "VAT_PAYMENT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="VAT_PAYMENT_SEQ", sequenceName="VAT_PAYMENT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="VAT_PAYMENT_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VAT_REPORT_FILING_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_PAYMENT_VAT_REPORT_FILING_ID_VAT_REPORT_FILING"))
    @JsonManagedReference
    private VatReportFiling vatReportFiling;

    @OneToOne
    @JoinColumn(name = "TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_PAYMENT_TRANSACTION_ID_TRANSACTION"))
    private Transaction transaction;

    @Basic
    @Column(name = "VAT_PAYMENT_NO")
    private String vatPaymentNo;

    @Basic
    @Column(name = "VAT_PAYMENT_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime vatPaymentDate;

    @Basic
    @Column(name = "REFERENCE_CODE")
    private String referenceCode;

    @Basic
    @Column(name = "AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal amount;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

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

    @ManyToOne
    @JoinColumn(name = "DEPOSIT_TO_TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_PAYMENT_DEPOSIT_TO_TRAX_CATEGORY_ID_TRAX_CATEGORY"))
    private TransactionCategory depositToTransactionCategory;

    @Basic
    @Column(name = "RECEIPT_ATTACHMENT_PATH")
    private String receiptAttachmentPath;

    @Basic
    @Column(name = "RECEIPT_ATTACHMENT_FILE_NAME")
    private String receiptAttachmentFileName;

    @Basic
    @Column(name = "RECEIPT_ATTACHMENT_DESCRIPTION")
    private String receiptAttachmentDescription;

    @Column(name = "IS_VAT_RECLAIMABLE")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean isVatReclaimable = Boolean.FALSE;

//    @Column(name = "VERSION_NUMBER")
//    @ColumnDefault(value = "1")
//    @Basic(optional = false)
//    @Version
//    private Integer versionNumber = 1;

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
