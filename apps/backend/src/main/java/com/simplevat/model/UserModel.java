/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.model;

import com.simplevat.entity.Role;
import java.io.Serializable;
import lombok.Data;

/**
 *
 * @author Sonu
 */
@Data
public class UserModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer userId;

    private String firstName;

    private String userEmail;

    private String lastName;

    private String dateOfBirth;

    private Boolean isActive;

    private Role role;
    
    private String password;

    private String profileImageBinary;
}
