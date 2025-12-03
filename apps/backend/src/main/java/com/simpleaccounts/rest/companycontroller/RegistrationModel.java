package com.simpleaccounts.rest.companycontroller;

import lombok.Data;

import javax.persistence.Basic;
import javax.persistence.Column;
import java.util.Date;

@Data
public class RegistrationModel {
    private String companyName;
    private Integer companyTypeCode;
    private Integer industryTypeCode;
    private Integer currencyCode;
    private String firstName;
    private String lastName;
    private String password;
    private String email;
    private String timeZone;
    private String loginUrl;
    private Boolean IsRegisteredVat = Boolean.FALSE;
    private Boolean IsDesignatedZone = Boolean.FALSE;
    private Date vatRegistrationDate;
    private Integer countryId;
    private Integer stateId;
    private String TaxRegistrationNumber;
    private String companyAddressLine1;
    private String companyAddressLine2;
    private String phoneNumber;
}

