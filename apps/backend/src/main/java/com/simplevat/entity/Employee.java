package com.simplevat.entity;

import com.simplevat.constant.CommonConstant;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.entity.converter.DateConverter;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Type;

import javax.persistence.*;

@NamedQueries({
    @NamedQuery(name = "employeesForDropdown", query = "SELECT  new " + CommonConstant.DROPDOWN_MODEL_PACKAGE + "(c.id , CONCAT(c.firstName,' ', c.lastName)) "
            + " FROM Employee c where c.deleteFlag = FALSE order by c.firstName, c.lastName ")
    ,
		@NamedQuery(name = "allEmployees", query = "SELECT c "
            + "FROM Employee c where c.deleteFlag = FALSE order by c.firstName, c.lastName")
    ,
		@NamedQuery(name = "employeeByEmail", query = "SELECT c " + "FROM Employee c where c.email =:email")
    ,
		@NamedQuery(name = "employeesByName", query = "SELECT c FROM Employee c WHERE (c.firstName LIKE :name or c.lastName LIKE :name) and c.deleteFlag = FALSE order by c.firstName, c.lastName")})
@Entity
@Table(name = "EMPLOYEE")
@NamedNativeQueries({
        @NamedNativeQuery(name = "AllActiveCompleteEmployee",
                query = "SELECT DISTINCT em.EMPLOYMENT_ID AS id, e.EMPLOYEE_ID AS empId, e.FIRST_NAME AS empFirstName, e.LAST_NAME AS empLastName, em.EMPLOYEE_CODE AS empCode FROM employee e INNER JOIN employment em on e.EMPLOYEE_ID=em.EMPLOYEE_ID INNER JOIN employee_salary_component_relation esc on e.EMPLOYEE_ID=esc.EMPLOYEE_ID WHERE e.IS_ACTIVE = true AND esc.YEARLY_AMOUNT > 0 AND esc.MONTHLY_AMOUNT > 0 and e.DELETE_FLAG=false ORDER BY empCode;",
                resultSetMapping = "payrollEmployeeResultSetMapping")
        })
@SqlResultSetMappings({
        @SqlResultSetMapping(name = "payrollEmployeeResultSetMapping",
                columns = {
                        @ColumnResult(name = "Id", type = Integer.class),
                        @ColumnResult(name = "EmpId", type = String.class),
                        @ColumnResult(name = "EmpFirstName", type = String.class),
                        @ColumnResult(name = "EmpLastName", type = String.class),
                        @ColumnResult(name = "EmpCode", type = String.class),
                })
})
@Data
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class Employee implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "EMPLOYEE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="EMPLOYEE_SEQ", sequenceName="EMPLOYEE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMPLOYEE_SEQ")
    private Integer id;

    @Column(name = "PARENT_ID")
    private Integer parentId;

    @Basic
    @Column(name = "FIRST_NAME")
    private String firstName;
    @Basic
    @Column(name = "MIDDLE_NAME")
    private String middleName;
    @Basic
    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "DATE_OF_BIRTH")
    @Basic(optional = false)
    //@Convert(converter = DateConverter.class)
    private LocalDateTime dob;

    @Basic
    @Column(name = "EMAIL")
    private String email;

    @Basic
    @Column(name = "PRESENT_ADDRESS")
    private String presentAddress;

    @Basic
    @Lob
    @Type(type = "org.hibernate.type.ImageType")
    @Column(name = "PROFILE_IMAGE")
    private byte[] profileImageBinary;

    @Basic
    @Column(name = "PERMANENT_ADDRESS")
    private String permanentAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COUNTRY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_COUNTRY_CODE_COUNTRY"))
    private Country country;

    @OneToOne
    @JoinColumn(name = "STATE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_STATE_ID_STATE"))
    private State state;

    @Basic
    @Column(name = "CITY")
    private String city;

    @Basic
    @Column(name = "PIN_CODE")
    private Integer pincode;

    @Basic
    @Column(name = "HOME_ADDRESS")
    private String  homeAddress;

    @Basic
    @Column(name = "EMERGENCY_CONTACT_NAME_1")
    private String  emergencyContactName1;

    @Basic
    @Column(name = "EMERGENCY_CONTACT_NUMBER_1")
    private String emergencyContactNumber1;

    @Basic
    @Column(name = "EMERGENCY_CONTACT_RELATIONSHIP_1")
    private String  emergencyContactRelationship1;

    @Basic
    @Column(name = "EMERGENCY_CONTACT_NAME_2")
    private String  emergencyContactName2;

    @Basic
    @Column(name = "EMERGENCY_CONTACT_NUMBER_2")
    private String emergencyContactNumber2;

    @Basic
    @Column(name = "EMERGENCY_CONTACT_RELATIONSHIP_2")
    private String  emergencyContactRelationship2;
    //private Integer nationality;
    @Basic
    @Column(name = "UNIVERSITY")
    private  String university;

    @Basic
    @Column(name = "QUALIFICATION")
    private String qualification;

    @Basic
    @Column(name = "QUALIFICATION_YEAR_OF_COMPLETIONDATE")
    private  String qualificationYearOfCompletionDate;

    @Basic
    @Column(name = "GENDER")
    private String gender;

    @Basic
    @Column(name = "MOBILE_NUMBER")
    private String mobileNumber;

    @Basic
    @Column(name = "BLOOD_GROUP")
    private String bloodGroup;

    @Basic
    @Column(name = "MARITAL_STATUS")
    private String maritalStauts;


    @Basic
    @Column(name = "IS_ACTIVE")
    private Boolean isActive;

    @Basic(optional = false)
    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    private Integer createdBy = 0;

    @Basic(optional = false)
    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Basic
    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdatedBy;

    @Basic
    @Column(name = "LAST_UPDATE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMPLOYEE_DESIGNATION_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_EMPLOYEE_DESIGNATION_ID_EMPLOYEE_DESIGNATION"))
    private EmployeeDesignation employeeDesignationId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SALARY_ROLE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_SALARY_ROLE_ID_SALARY_ROLE"))
    private SalaryRole salaryRoleId;

    @OneToOne
    @JoinColumn(name = "TRANSACTION_CATEGORY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_TRANSACTION_CATEGORY_CODE_TRANSACTION_CATEGORY"))
    private TransactionCategory transactionCategory;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @PrePersist
    public void updateDates() {
        createdDate = LocalDateTime.now();
        lastUpdateDate = LocalDateTime.now();
    }

    @PreUpdate
    public void updateLastUpdatedDate() {
        lastUpdateDate = LocalDateTime.now();
    }

}
