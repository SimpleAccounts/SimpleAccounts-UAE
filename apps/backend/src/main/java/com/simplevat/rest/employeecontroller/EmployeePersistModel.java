package com.simplevat.rest.employeecontroller;

import java.math.BigDecimal;
import java.util.List;

import com.simplevat.rest.payroll.SalaryTemplatePersistModel;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author admin
 */
@AllArgsConstructor
@Getter
@Setter
@Builder
public class EmployeePersistModel {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private String salaryTemplatesString;
    private List<SalaryTemplatePersistModel> salaryTemplatePersistModelList;
    private String employeeCode;
    private MultipartFile profileImageBinary;

    private String firstName;

    private String middleName;

    private String lastName;

    private String email;

    private Integer createdBy = 0;

    private String createdDate;

    private Integer lastUpdatedBy;

    private String lastUpdateDate;

    //saurabhg 2/1/2020
    private String dob;
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
    private String gender;
    private String maritalStatus;
    private String mobileNumber;

    private String bloodGroup;

    private Integer stateId;
    private Integer countryId;
    private String city;

    private Integer pincode;

    private Integer salaryRoleId;

    private Boolean isActive;

    private String presentAddress;

    private String permanentAddress;

    private Integer employeeDesignationId;

    private String accountHolderName;
    private String accountNumber;
    private String iban;
    private String bankName;
    private String branch;
    private String swiftCode;
    private String routingCode;
    private Integer salaryStructureId;
    private String  description;
    private String  formula;
    private Integer employeeId;
    private Integer salaryTemplateId;
    //Kishor requirement
    private String  homeAddress;
    private String  emergencyContactName1;
    private String emergencyContactNumber1;
    private String  emergencyContactRelationship1;
    private String  emergencyContactName2;
    private String emergencyContactNumber2;
    private String  emergencyContactRelationship2;
    //private Integer nationality;
    // Educational details section
    private  String university;
    private String qualification;
    private  String qualificationYearOfCompletionDate;

}
