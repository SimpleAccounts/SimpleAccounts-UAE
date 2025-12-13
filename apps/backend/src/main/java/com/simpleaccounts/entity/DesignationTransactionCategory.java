package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created By Zain Khan
 */
@Entity
@Table(name = "DESIGNATION_TRANSACTION_CATEGORY")
@Data
@NamedQueries({@NamedQuery(name = "getListByDesignationId",query = "SELECT dtc FROM DesignationTransactionCategory dtc WHERE dtc.designation.id=:designationId") })
public class DesignationTransactionCategory {
    	@Id
    @Column(name = "DESIGNATION_TRANSACTION_CATEGORY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="DESIGNATION_TRANSACTION_CATEGORY_SEQ", sequenceName="DESIGNATION_TRANSACTION_CATEGORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="DESIGNATION_TRANSACTION_CATEGORY_SEQ")
    private Integer id;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_DESIG_TRANX_CAT_TRANSX_CAT_ID_TRANX_CAT"))
    private TransactionCategory transactionCategory;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "DESIGNATION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_DESIG_TRANX_CAT_DESIG_ID_DESIG"))
    private EmployeeDesignation designation;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;
}
