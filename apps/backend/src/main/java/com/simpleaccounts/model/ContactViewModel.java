/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.model;

import java.math.BigDecimal;
import java.util.Date;
import lombok.Data;

/**
 *
 * @author admin
 */
@Data
public class ContactViewModel {

    private Integer contactId;

    private String firstName;

    private String middleName;

    private String lastName;

    private String organization;

    private String email;

    private String telephone;

    private String currencySymbol;

    private String title;

    private ContactType contactType;

    private Date nextDueDate;

    private BigDecimal dueAmount;
    
    private Boolean selected = Boolean.FALSE;

    public String getFullName() {
        StringBuilder sb = new StringBuilder();
        if (title != null) {
            sb.append(title).append(" ");
        }
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
}
