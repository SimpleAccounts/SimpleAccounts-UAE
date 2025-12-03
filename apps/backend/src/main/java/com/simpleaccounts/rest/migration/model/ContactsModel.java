package com.simpleaccounts.rest.migration.model;

import lombok.Data;

@Data
public class ContactsModel {

	String lastModifiedTime;
	String displayName;
	String companyName;
	String lastName;
	String emailID;
	String mobilePhone;
	String phone;
	String billingAddress;
	String billingStreet2;
	String billingCity;
	String billingState;
	String billingCountry;
	String contactType;
	String currencyCode;
	String placeOfSupply;

}
