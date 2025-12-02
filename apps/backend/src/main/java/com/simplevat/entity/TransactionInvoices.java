package com.simplevat.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.persistence.*;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.simplevat.constant.TransactionExplinationStatusEnum;
import com.simplevat.entity.bankaccount.Transaction;
import com.simplevat.entity.converter.DateConverter;

import lombok.Data;

/**
 * Middle table for mapping between transaction and expense
 */
@Entity
@Table(name = "TRANSACTON_INVOICES")
@Data
public class TransactionInvoices {

    	@Id
	@SequenceGenerator(name="TRANSACTON_INVOICES_SEQ", sequenceName="TRANSACTON_INVOICES_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="TRANSACTON_INVOICES_SEQ")
    @Column(name = "TRANSACTON_INVOICES_ID", updatable = false, nullable = false)
    private int id;

    @Basic(optional = false)
    @Enumerated(EnumType.STRING)
    @Column(name = "EXPLANATION_STATUS_NAME")
    private TransactionExplinationStatusEnum explinationStatus;

    @Basic(optional = false)
    @Column(name = "REMAINING_TO_EXPLAIN_BALANCE")
    @ColumnDefault(value = "0.00")
    private BigDecimal remainingToExplain;

    @ManyToOne
    @JoinColumn(name = "TRANSACTION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTON_INVOICES_TRANSACTION_ID_TRANSACTION"))
    private Transaction transaction;

    @ManyToOne
    @JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_TRANSACTON_INVOICES_INVOICE_ID_INVOICE"))
    private Invoice invoice;

    @Column(name = "INVOICE_TYPE")
    private Integer invoiceType;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @CreationTimestamp
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
    @UpdateTimestamp
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
