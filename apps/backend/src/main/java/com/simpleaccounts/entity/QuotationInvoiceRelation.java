package com.simpleaccounts.entity;

import com.simpleaccounts.rfq_po.PoQuatation;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@Entity
@Table(name = "QUOTATION_INVOICE_RELATION")
public class QuotationInvoiceRelation<Q> {
    	@Id
    @Column(name = "QUOTATION_INVOICE_RELATION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="QUOTATION_INVOICE_RELATION_SEQ", sequenceName="QUOTATION_INVOICE_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="QUOTATION_INVOICE_RELATION_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "QUOTATION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_QUOTATION_INVOICE_RELATION_QUOTATION_ID_QUOTATION"))
    @ToString.Exclude
    private PoQuatation poQuatation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INVOICE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_QUOTATION_INVOICE_RELATION_INVOICE_ID"))
    @ToString.Exclude
    private Invoice invoice;

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

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;
}
