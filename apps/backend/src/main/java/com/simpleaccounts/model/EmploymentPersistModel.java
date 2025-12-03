package com.simpleaccounts.model;

import com.simpleaccounts.entity.Country;
import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.State;
import com.simpleaccounts.entity.converter.DateConverter;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

/**
 *
 * @author admin
 */
@Getter
@Setter
public class EmploymentPersistModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private String employeeCode;
    private String department;
    private String dateOfJoining;
    private String contractType;
    private String labourCard;
    private Integer availedLeaves;
    private Integer leavesAvailed;
    private String passportNumber;
    private String passportExpiryDate;
    private String visaNumber;
    private String  visaExpiryDate;
    private Integer employee;
    private BigDecimal grossSalary;
    private Integer salaryRoleId;
    private String agentId;
}
