/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.contactcontroller;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

/**
 *
 * @author admin
 */
@Data
@Builder
@AllArgsConstructor
public class ContactPersistModel implements Serializable {

    private Integer contactId;

    private String firstName;

    private String middleName;

    private String lastName;

    private Integer contactType;

    private String organization;

    private String poBoxNumber;

    private String email;

    private String telephone;

    private String mobileNumber;

    private String addressLine1;

    private String addressLine2;

    private String addressLine3;

    private Integer countryId;

    private String postZipCode;

    private String billingEmail;

    private Integer stateId;

    private String city;

    private String fax;

    private String contractPoNumber;

    private String vatRegistrationNumber;

    private Integer currencyCode;

    private Integer createdBy = 0;

    private Integer lastUpdatedBy;

    private Boolean isActive;

    private Boolean isRegisteredForVat = false;

    private Integer taxTreatmentId;

    private Integer shippingCountryId;
    private String shippingCountryName;

    private Integer shippingStateId;
    private String shippingStateName;

    private String shippingCity;

    private String shippingPostZipCode;

    private String shippingTelephone;

    private String shippingFax;

    private String website;

    private Boolean isBillingAndShippingAddressSame = Boolean.FALSE;

    private String billingTelephone;

    private  String billingCountryName;
    private  String billingStateName;

    private String billingPoBoxNumber;

    private String shippingPoBoxNumber;

}
