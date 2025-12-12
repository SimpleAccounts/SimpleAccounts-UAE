package com.simpleaccounts.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "EMPLOYMENT")
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class Employment   implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "EMPLOYMENT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="EMPLOYMENT_SEQ", sequenceName="EMPLOYMENT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMPLOYMENT_SEQ")
    private Integer id;

    @Basic
    @Column(name = "DEPARTMENT")
    private String department;

    @Basic
    @Column(name = "EMPLOYEE_CODE")
    private String employeeCode;

    @Column(name = "DATE_OF_JOINING")
    @Basic(optional = false)
    private LocalDateTime dateOfJoining;

    @Basic
    @Column(name = "CONTRACT_TYPE")
    private String contractType;

    @Basic
    @Column(name = "LABOUR_CARD")
    private String labourCard;

    @Basic
    @Column(name = "AVAILABLE_LEAVES")
    private Integer availedLeaves;

    @Basic
    @Column(name = "LEAVES_AVAILED")
    private Integer leavesAvailed;

    @Basic
    @Column(name = "PASSPORT_NUMBER")
    private String passportNumber;

    @Column(name = "PASSPORT_EXPIRY_DATE")
    @Basic(optional = false)
    private LocalDateTime passportExpiryDate;

    @Basic
    @Column(name = "VISA_NUMBER")
    private String visaNumber;

    @Column(name = "VISA_EXPIRY_DATE")
    @Basic(optional = false)
    private LocalDateTime  visaExpiryDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYMENT_EMPLOYEE_ID_EMPLOYEE"))
    private Employee employee;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Basic
    @Column(name = "GROSS_SALARY")
    private BigDecimal grossSalary = BigDecimal.ZERO;

    /**
     * ctcTypes :
     *          Annualy
     *          Monthly
     */
    @Column(name = "CTC_TYPE")
    private String ctcType;

    @Basic
    @Column(name = "AGENT_ID")
    private String agentId;

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

