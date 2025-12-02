package com.simplevat.rfq_po;

import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.entity.converter.DateConverter;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@Entity
@Table(name = "RFQ_PO_GRN_RELATION")
public class RfqPoGrnRelation {

    	@Id
    @Column(name = "RFQ_PO_GRN_RELATION_ID")
	@SequenceGenerator(name="RFQ_PO_GRN_RELATION_SEQ", sequenceName="RFQ_PO_GRN_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="RFQ_PO_GRN_RELATION_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_RFQ_PO_GRN_RELATION_PARENT_ID_RFQ_PO_GRN"))
    private PoQuatation parentID;

    @Column(name = "PARENT_TYPE")
    @Basic
    private Integer parentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CHILD_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_RFQ_PO_GRN_RELATION_CHILD_ID_RFQ_PO_GRN"))
    private PoQuatation childID;

    @Column(name = "CHILD_TYPE")
    @Basic
    private Integer childType;

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
   //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
   //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
