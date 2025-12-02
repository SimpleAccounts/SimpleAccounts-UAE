package com.simplevat.entity;


import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "EMPLOYEE_SALARY_COMPONENT_RELATION")
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class EmployeeSalaryComponentRelation implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "EMPLOYEE_SALARY_COMPONENT_RELATION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="EMPLOYEE_SALARY_COMPONENT_RELATION_SEQ", sequenceName="EMPLOYEE_SALARY_COMPONENT_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMPLOYEE_SALARY_COMPONENT_RELATION_SEQ")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_SALARY_COMPONENT_RELATION_EMPLOYEE_ID_EMPLOYEE"))
    private Employee employeeId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SALARY_COMPONENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMP_SALARY_COMP_RELATION_SALARY_COMP_ID_SALARY_COMP"))
    private SalaryComponent salaryComponentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SALARY_STRUCTURE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMP_SALARY_COMP_RELATION_SALARY_STRUCT_ID_SALARY_STRUCT"))
    private SalaryStructure salaryStructure;

    @Basic
    @Column(name="DESCRIPTION")
    private String description;

    @Basic
    @Column(name="FORMULA")
    private String formula;


    @Column(name = "NO_OF_DAYS")
    @ColumnDefault(value = "30")
    private BigDecimal noOfDays;

    @Basic
    @Column(name="FLAT_AMOUNT")
    private String flatAmount;

    @Column(name = "MONTHLY_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal monthlyAmount;

    @Column(name = "YEARLY_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal yearlyAmount;

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
