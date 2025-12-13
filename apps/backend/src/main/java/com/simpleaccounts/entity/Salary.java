package com.simpleaccounts.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "SALARY")
@Data

public class Salary implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "SALARY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="SALARY_SEQ", sequenceName="SALARY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="SALARY_SEQ")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SALARY_EMPLOYEE_ID_EMPLOYEE"))
    private Employee employeeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SALARY_COMPONENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SALARY_SALARY_COMPONENT_ID_SALARY_COMPONENT"))
    private SalaryComponent salaryComponent;

    @Column(name = "TYPE")
    @Basic
    private Integer type;

    @Basic(optional = false)
    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    private Integer createdBy = 0;

    @Basic(optional = false)
    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")

    private LocalDateTime createdDate = LocalDateTime.now();

    @Basic
    @Column(name = "NO_OF_DAYS")
    private BigDecimal noOfDays;

    @Basic
    @Column(name = "LOP_DAYS")
    private BigDecimal lopDays;

    @Column(name = "TOTAL_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalAmount;

    @Basic
    @Column(name = "SALARY_DATE")

    private LocalDateTime salaryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PAYROLL_ID",referencedColumnName="PAYROLL_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SALARY_PAYROLL_ID_PAYROLL"))
    private Payroll payrollId;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

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
