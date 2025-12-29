/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.contactcontroller;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.util.Date;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author admin
 */
@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContactListModel {

    private Integer id;

    private String firstName;

    private String middleName;

    private String lastName;

    private String organization;

    private String email;

    private String mobileNumber;

    private String telephone;

    private String currencySymbol;

    private Integer currencyCode;

    private Integer exchangeRate;

    private String currencyName;

    private String currencyIso;

    private Integer taxTreatmentId;

    private String taxTreatment;

    private Integer contactType;

    private Date nextDueDate;

    private BigDecimal dueAmount;

    private String contactTypeString;

    private Boolean isActive;

    @com.fasterxml.jackson.annotation.JsonIgnore
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
}
