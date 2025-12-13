package com.simpleaccounts.model;

import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

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
