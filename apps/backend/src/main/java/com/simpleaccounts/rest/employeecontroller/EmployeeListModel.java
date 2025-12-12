package com.simpleaccounts.rest.employeecontroller;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *
 * @author admin
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeListModel implements Serializable{

    private Integer id;
    private Boolean isEmployeeDeletable;

    private String employeeCode;

    private String firstName;

    private String middleName;

    private String lastName;
    private String countryName;
    private String email;

    private String password;

    private Integer countryId;

    private LocalDateTime dob;

    private String maritalStatus;

    private String gender;

    private String mobileNumber;

    private String bloodGroup;

    private Integer stateId;

    private String stateName;

    private String city;

    private Integer pincode;

    private Integer salaryRoleId;

    private String salaryRoleName;

    private String presentAddress;

    private String permanentAddress;

    private Integer employeeDesignationId;

    private String employeeDsignationName;
    private Boolean isActive;
    public String getFullName() {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && !firstName.isEmpty()) {
            sb.append(firstName).append(" ");
        }
        if (middleName != null && !middleName.isEmpty()) {
            sb.append(middleName).append(" ");
        }
        if (lastName != null && !lastName.isEmpty()) {
            sb.append(lastName);
        }
        return sb.toString();
    }
    private byte[] profileImageBinary;

    private Integer createdBy = 0;

    private String createdDate;

    private Integer lastUpdatedBy;

    private String lastUpdateDate;

    //saurabhg 2/1/2020
    private String department;
    private Integer parentId;
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
    //Muhammad ali khan
    private String accountHolderName;
    private String accountNumber;
    private String iban;
    private String bankName;
    private String branch;
    private String swiftCode;
    private String routingCode;
    private Integer parentType;

    private Integer childID;

    private Integer childType;
    //suraj 07/12/2021
    private Integer employmentId;
    private Integer employeeBankDetailsId;
    private Integer bankId;
    //Kishor requirement
    private String  homeAddress;
    private String  emergencyContactName1;
    private String emergencyContactNumber1;
    private String  emergencyContactRelationship1;
    private String  emergencyContactName2;
    private String emergencyContactNumber2;
    private String  emergencyContactRelationship2;
    // Educational details section
    private  String university;
    private String qualification;
    private  String qualificationYearOfCompletionDate;
    private  String  agentId;
    private  String  ctcType;

    private Boolean employeeChildActivitiesPresentOrNot;
}
