package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;

import java.io.Serializable;

import lombok.Data;

import javax.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
    @NamedQuery(name = "allPurchase",
            query = "SELECT p "
            + "FROM Purchase p where p.deleteFlag = FALSE")
})

@Entity
@Table(name = "PURCHASE")
@Data

public class Purchase implements Serializable {

    private static final long serialVersionUID = 1L;

    	@Id
    @Column(name = "PURCHASE_ID" , updatable = false, nullable = false)
	@SequenceGenerator(name="PURCHASE_SEQ", sequenceName="PURCHASE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PURCHASE_SEQ")
    private Integer purchaseId;

    @Basic
    @Column(name = "PURCHASE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal purchaseAmount;

    @Basic
    @Column(name = "PURCHASE_DUE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal purchaseDueAmount;

    @Basic
    @Column(name = "PURCHASE_DATE")

    private LocalDateTime purchaseDate;

    @Basic
    @Column(name = "PURCHASE_DUE_DATE")

    private LocalDateTime purchaseDueDate;

    @Basic(optional = false)
    @Column(name = "PURCHASE_DUE_ON")
    @ColumnDefault(value = "0")
    private Integer purchaseDueOn;

    @Basic
    @Column(name = "PURCHASE_DESCRIPTION")
    private String purchaseDescription;

    @Basic
    @Column(name = "RECEIPT_NUMBER", length = 20)
    private String receiptNumber;

    @Basic
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CLAIMANT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PURCHASE_CLAIMANT_ID_CLAIMANT"))
    private User user;

    @Basic
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRANSACTION_TYPE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_PURCHASE_TRANSACTION_TYPE_CODE_TRANSACTION_TYPE"))
    private ChartOfAccount transactionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_PURCHASE_TRANSACTION_CATEGORY_CODE_TRANSACTION_CATEGORY"))
    private TransactionCategory transactionCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_PURCHASE_CURRENCY_CODE_CURRENCY"))
    private Currency currency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROJECT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PURCHASE_PROJECT_ID_PROJECT"))
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PURCHASE_CONTACT_ID_CONTACT"))
    private Contact purchaseContact;

    @Basic
    @Column(name = "RECEIPT_ATTACHMENT_PATH")
    private String receiptAttachmentPath;

    @Basic
    @Column(name = "RECEIPT_ATTACHMENT_DESCRIPTION")
    private String receiptAttachmentDescription;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

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

    @Basic
    @Lob
    @Column(name = "RECEIPT_ATTACHMENT")
    private byte[] receiptAttachmentBinary;

    @Column(name = "STATUS")
    private Integer status;

    @Column(name = "PAYMENTMODE")
    private Integer paymentMode;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "purchase", orphanRemoval = true)
    @org.hibernate.annotations.ForeignKey(name = "none")
    private Collection<PurchaseLineItem> purchaseLineItems;

    public void addPurchaseItem( final PurchaseLineItem purchaseLineItem) {
        if (null == this.purchaseLineItems) {
          purchaseLineItems = new ArrayList<>();
        }
        purchaseLineItems.add(purchaseLineItem);
    }

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
