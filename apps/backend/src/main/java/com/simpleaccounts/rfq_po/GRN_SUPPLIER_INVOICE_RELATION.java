package com.simpleaccounts.rfq_po;

import com.simpleaccounts.entity.Invoice;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "GRN_SUPPLIER_INVOICE_RELATION")
public class GRN_SUPPLIER_INVOICE_RELATION {
    	@Id
    @Column(name = "GRN_SUPPLIER_INVOICE_RELATION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="GRN_SUPPLIER_INVOICE_RELATION_SEQ", sequenceName="GRN_SUPPLIER_INVOICE_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="GRN_SUPPLIER_INVOICE_RELATION_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "GRN_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_GRN_SUPPLIER_INVOICE_RELATION_GRN_ID_GRN"))
    private PoQuatation grnID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_GRN_SUPPLIER_INVOICE_RELATION_INVOICE_ID_INVOICE"))
    private Invoice invoiceID;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

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

    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;
}
