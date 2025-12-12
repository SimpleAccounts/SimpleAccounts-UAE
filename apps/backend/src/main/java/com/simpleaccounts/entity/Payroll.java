
package com.simpleaccounts.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAYROLL")
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class Payroll implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "PAYROLL_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="PAYROLL_SEQ", sequenceName="PAYROLL_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PAYROLL_SEQ")
    private Integer id;

    @Column(name = "PAYROLL_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime payrollDate;

    @Basic
    @Column(name = "PAYROLL_SUBJECT")
    private String payrollSubject;

    @Basic
    @Column(name = "PAY_PERIOD")
    private String payPeriod;

    @Basic
    @Column(name = "EMPLOYEE_COUNT")
    private Integer employeeCount;

    @Basic
    @Column(name = "GENERATED_BY")
    private String generatedBy;

    @Basic
    @Column(name = "APPROVED_BY")
    private String approvedBy;

    @Basic
    @Column(name = "STATUS")
    private String status;

    @Column(name = "RUN_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime runDate;

    @Basic
    @Column(name = "COMMENT")
    private String comment;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Basic
    @Column(name = "IS_ACTIVE")
    private Boolean isActive;

    @Basic
    @Column(name = "PAYROLL_APPROVER")
    private Integer payrollApprover;

    @Column(name = "TOTAL_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalAmountPayroll;

    @Column(name = "DUE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal dueAmountPayroll;

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

//    @Column(name = "VERSION_NUMBER")
//    @ColumnDefault(value = "1")
//    @Basic(optional = false)
//    @Version
//    private Integer versionNumber = 1;

}

