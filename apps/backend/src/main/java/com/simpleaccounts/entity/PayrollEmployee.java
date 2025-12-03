
package com.simpleaccounts.entity;


import com.simpleaccounts.entity.converter.DateConverter;
import lombok.Data;
import javax.persistence.*;

import com.simpleaccounts.rest.payroll.dto.PayrollEmployeeDto;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@Entity
@Table(name = "PAYROLL_EMPLOYEE")
@NamedNativeQueries({
@NamedNativeQuery(name = "PayrollEmployee",
            query = "SELECT DISTINCT pe.PAYROLL_EMPLOYEE_ID AS id, e.EMPLOYEE_ID AS empId, e.FIRST_NAME AS empFirstName, e.LAST_NAME AS empLastName, em.EMPLOYEE_CODE AS empCode, s.LOP_DAYS AS lopDays ,s.NO_OF_DAYS AS noOfDays FROM payroll_employee pe INNER JOIN payroll p on p.PAYROLL_ID=pe.PAYROLL_ID INNER JOIN employee e on e.EMPLOYEE_ID = pe.EMPLOYEE_ID INNER JOIN employment em on e.EMPLOYEE_ID = em.EMPLOYEE_ID INNER JOIN salary s on e.EMPLOYEE_ID = s.EMPLOYEE_ID AND s.PAYROLL_ID = pe.PAYROLL_ID WHERE pe.PAYROLL_ID=:payrollId AND s.TYPE=:type",
            resultSetMapping = "payrollEmployeeResultSet"),
@NamedNativeQuery(name = "PayrollEmployeeDetails",
query = "SELECT pe.PAYROLL_EMPLOYEE_ID AS id, e.EMPLOYEE_ID AS empId, e.FIRST_NAME AS empFirstName, e.LAST_NAME AS empLastName, em.EMPLOYEE_CODE AS empCode FROM payroll_employee pe INNER JOIN payroll p on p.PAYROLL_ID=pe.PAYROLL_ID INNER JOIN employee e on e.EMPLOYEE_ID = pe.EMPLOYEE_ID INNER JOIN employment em on e.EMPLOYEE_ID = em.EMPLOYEE_ID WHERE pe.PAYROLL_ID=:payrollId",
resultSetMapping = "payrollEmployeeResultDetailsSet")
})

@SqlResultSetMappings({
    @SqlResultSetMapping(name = "payrollEmployeeResultSet",
        columns = {
        		@ColumnResult(name = "Id", type = Integer.class),
        		@ColumnResult(name = "EmpId", type = String.class),
 	            @ColumnResult(name = "EmpFirstName", type = String.class),
 	            @ColumnResult(name = "EmpLastName", type = String.class),
 	            @ColumnResult(name = "EmpCode", type = String.class),
 				@ColumnResult(name = "LopDays", type = BigDecimal.class),
 				@ColumnResult(name = "NoOfDays", type = BigDecimal.class)
        }),
    @SqlResultSetMapping(name = "payrollEmployeeResultDetailsSet",
    columns = {
    	 @ColumnResult(name = "Id", type = Integer.class),
    	 @ColumnResult(name = "EmpId", type = String.class),
         @ColumnResult(name = "EmpFirstName", type = String.class),
         @ColumnResult(name = "EmpLastName", type = String.class),
         @ColumnResult(name = "EmpCode", type = String.class),

    })
})
public class PayrollEmployee {

    	@Id
    @Column(name = "PAYROLL_EMPLOYEE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="PAYROLL_EMPLOYEE_SEQ", sequenceName="PAYROLL_EMPLOYEE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PAYROLL_EMPLOYEE_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMPLOYEE_ID",referencedColumnName="EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYROLL_EMPLOYEE_EMPLOYEE_ID_EMPLOYEE"))
    private Employee employeeID;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PAYROLL_ID",referencedColumnName="PAYROLL_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYROLL_EMPLOYEE_PAYROLL_ID_PAYROLL"))
    private Payroll payrollId;

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

