package com.simpleaccounts.rest.usercontroller;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserModel {

    private Integer id;

    private String firstName;

    private String lastName;

    private Boolean active;

    private Boolean userPhotoChange;

    private String dob;

    private Integer roleId;

    private String roleName;

    private Integer companyId;

    private String companyName;

    private String password;

    private String currentPassword;

    private String email;

    private String token;
    private MultipartFile profilePic;

    private byte[] profilePicByteArray;

    private Boolean isAlreadyAvailableEmployee = Boolean.FALSE;

    private Boolean isNewEmployee = Boolean.FALSE;

    private Integer employeeId;

    private String empFirstName;

    private String empMiddleName;

    private String empLastName;

    private String empEmail;

    private Integer designationId;

    private Integer salaryRoleId;

    private String url;

    //saurabhg 2/1/2020
    private Date empDob;
    private String loginUrl;

    public String getFullName() {
        StringBuilder sb = new StringBuilder();
        if (firstName != null && !firstName.isEmpty()) {
            sb.append(firstName).append(" ");
        }
        if (lastName != null && !lastName.isEmpty()) {
            sb.append(lastName);
        }
        return sb.toString();
    }
    private String timeZone;

}
