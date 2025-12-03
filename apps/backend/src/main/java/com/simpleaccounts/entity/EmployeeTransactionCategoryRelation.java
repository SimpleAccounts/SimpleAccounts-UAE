package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * Created By Zain Khan
 */
@Entity
@Table(name = "EMPLOYEE_TRANSACTION_CATEGORY_RELATION")
@Data
@NamedQueries({})
public class EmployeeTransactionCategoryRelation {
    	@Id
    @Column(name = "EMPLOYEE_TRANSACTION_CATEGORY_RELATION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="EMPLOYEE_TRANSACTION_CATEGORY_RELATION_SEQ", sequenceName="EMPLOYEE_TRANSACTION_CATEGORY_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMPLOYEE_TRANSACTION_CATEGORY_RELATION_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRANSACTION_CATEGORY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMP_SALARY_COM_RELATION_TRANX_CAT_ID_TRANX_CAT"))
    private TransactionCategory transactionCategory;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMP_TRANX_CAT_RELATION_EMP_ID_EMP"))
    private Employee employee;

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
