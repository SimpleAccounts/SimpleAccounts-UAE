/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.rest.contactcontroller;

import com.simpleaccounts.constant.ContactTypeEnum;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.service.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
	@Component
	@SuppressWarnings("java:S6809")
	@RequiredArgsConstructor
public class ContactHelper {

	private final ContactService contactService;

	private final CountryService countryService;

	private final CurrencyService currencyService;

	private final StateService stateService;

	private final TaxTreatmentService taxTreatmentService;

	private final TransactionCategoryService transactionCategoryService;

	private final ContactTransactionCategoryService contactTransactionCategoryService;

	public ContactListModel getModel(Contact contact) {
		return ContactListModel.builder().id(contact.getContactId()).contactType(contact.getContactType())
				.currencySymbol(contact.getCurrency() != null ? contact.getCurrency().getCurrencySymbol() : null)
				.email(contact.getEmail()).firstName(contact.getFirstName()).middleName(contact.getMiddleName())
				.lastName(contact.getLastName())
				.organization(contact.getOrganization())
				.currencyCode(contact.getCurrency().getCurrencyCode())
				.taxTreatment(contact.getTaxTreatment().getTaxTreatment())
				.taxTreatmentId(contact.getTaxTreatment().getId())
				.currencyIso(contact.getCurrency().getCurrencyIsoCode())
				.currencyName(contact.getCurrency().getCurrencyName())
				.contactTypeString(contact.getContactType() != null
						? ContactTypeEnum.getContactTypeByValue(contact.getContactType())
						: null)
				.currencyCode(contact.getCurrency().getCurrencyCode())
				.taxTreatment(contact.getTaxTreatment().getTaxTreatment())
				.taxTreatmentId(contact.getTaxTreatment().getId())
				.currencyIso(contact.getCurrency().getCurrencyIsoCode())
				.currencyName(contact.getCurrency().getCurrencyName())
				.isActive(contact.getIsActive())
				.mobileNumber(contact.getMobileNumber()).build();

	}
	@Transactional(rollbackFor = Exception.class)
	public Contact getEntity(ContactPersistModel contactPersistModel) {
		Contact contact = new Contact();
		if (contactPersistModel.getContactId() != null) {
			contact = contactService.findByPK(contactPersistModel.getContactId());
			contact.setContactId(contactPersistModel.getContactId());
		}
		contact.setContactType(contactPersistModel.getContactType());
		contact.setContractPoNumber(contactPersistModel.getContractPoNumber());
		if (contactPersistModel.getCountryId() != null) {
			contact.setCountry(countryService.getCountry(contactPersistModel.getCountryId()));
		}
		if (contactPersistModel.getCurrencyCode() != null) {
			contact.setCurrency(currencyService.getCurrency(contactPersistModel.getCurrencyCode()));
		}
		if (contactPersistModel.getIsActive()!=null){
			contact.setIsActive(contactPersistModel.getIsActive());
		}
		if (contactPersistModel.getIsRegisteredForVat()!=null){
			contact.setIsRegisteredForVat(contactPersistModel.getIsRegisteredForVat());
		}
		if (contactPersistModel.getTaxTreatmentId()!=null){
			TaxTreatment taxTreatment = taxTreatmentService.getTaxTreatment(contactPersistModel.getTaxTreatmentId());
			contact.setTaxTreatment(taxTreatment);
		}
		if (contactPersistModel.getShippingCountryId()!=null){
			Country country = countryService.findByPK(contactPersistModel.getShippingCountryId());
			contact.setShippingCountry(country);
		}
		if (contactPersistModel.getShippingStateId()!=null){
			State state = stateService.findByPK(contactPersistModel.getShippingStateId());
			contact.setShippingState(state);
		}
		if (contactPersistModel.getShippingCity()!=null){
			contact.setShippingCity(contactPersistModel.getShippingCity());
		}
		if (contactPersistModel.getShippingPostZipCode()!=null){
			contact.setShippingPostZipCode(contactPersistModel.getShippingPostZipCode());
		}
		if (contactPersistModel.getShippingTelephone()!=null){
			contact.setShippingTelephone(contactPersistModel.getShippingTelephone());
		}
		if (contactPersistModel.getFax()!=null){
			contact.setFax(contactPersistModel.getFax());
		}
		if (contactPersistModel.getShippingFax()!=null){
			contact.setShippingFax(contactPersistModel.getShippingFax());
		}
		if (contactPersistModel.getWebsite()!=null){
			contact.setWebsite(contactPersistModel.getWebsite());
		}
		contact.setBillingTelephone(contactPersistModel.getBillingTelephone());

		contact.setIsBillingandShippingAddressSame(contactPersistModel.getIsBillingAndShippingAddressSame());

		contact.setEmail(contactPersistModel.getEmail());
		contact.setFirstName(contactPersistModel.getFirstName());
		contact.setMiddleName(contactPersistModel.getMiddleName());
		contact.setLastName(contactPersistModel.getLastName());
		contact.setAddressLine1(contactPersistModel.getAddressLine1());
		contact.setAddressLine2(contactPersistModel.getAddressLine2());
		contact.setAddressLine3(contactPersistModel.getAddressLine3());
		contact.setMobileNumber(contactPersistModel.getMobileNumber());
		contact.setOrganization(contactPersistModel.getOrganization());
		contact.setPoBoxNumber(contactPersistModel.getBillingPoBoxNumber());

		contact.setShippingPostZipCode(contactPersistModel.getShippingPostZipCode());
		contact.setBillingEmail(contactPersistModel.getBillingEmail());
		if(contact.getBillingEmail() == null || contact.getBillingEmail().isEmpty()){
			contact.setBillingEmail(contactPersistModel.getEmail());
		}
		contact.setState(
				contactPersistModel.getStateId() != null ? stateService.findByPK(contactPersistModel.getStateId())
						: null);
		contact.setCity(contactPersistModel.getCity());
		contact.setPostZipCode(contactPersistModel.getPostZipCode());
		contact.setTelephone(contactPersistModel.getTelephone());
		contact.setVatRegistrationNumber(contactPersistModel.getVatRegistrationNumber());
		return contact;
	}

	public ContactPersistModel getContactPersistModel(Contact contact) {
		ContactPersistModel.ContactPersistModelBuilder builder = ContactPersistModel.builder()
				.contactId(contact.getContactId()).contactType(contact.getContactType())
				.contractPoNumber(contact.getContractPoNumber()).email(contact.getEmail())
				.firstName(contact.getFirstName()).middleName(contact.getMiddleName()).lastName(contact.getLastName())
				.mobileNumber(contact.getMobileNumber()).organization(contact.getOrganization())
				.poBoxNumber(contact.getPoBoxNumber()).shippingPoBoxNumber(contact.getPoBoxNumber()).postZipCode(contact.getPostZipCode()).shippingPostZipCode(contact.getShippingPostZipCode())
				.billingEmail(contact.getBillingEmail())
				.stateId(contact.getState() != null ? contact.getState().getId() : null).city(contact.getCity())
				.addressLine1(contact.getAddressLine1()).addressLine2(contact.getAddressLine2())
				.addressLine3(contact.getAddressLine3()).telephone(contact.getTelephone())
				.vatRegistrationNumber(contact.getVatRegistrationNumber()).isActive(contact.getIsActive())
				.isBillingAndShippingAddressSame(contact.getIsBillingandShippingAddressSame())
				.billingTelephone(contact.getBillingTelephone())
				.billingCountryName(contact.getCountry().getCountryName())
				.billingStateName(contact.getState().getStateName());

		if (contact.getCountry() != null) {
			builder.countryId(contact.getCountry().getCountryCode());
		}
		if (contact.getCurrency() != null) {
			builder.currencyCode(contact.getCurrency().getCurrencyCode());
		}
        if (contact.getIsRegisteredForVat()!=null){
        	builder.isRegisteredForVat(contact.getIsRegisteredForVat());
		}
        if (contact.getTaxTreatment()!=null){
        	builder.taxTreatmentId(contact.getTaxTreatment().getId());
		}
		if (contact.getShippingCountry() != null) {
			builder.shippingCountryId(contact.getShippingCountry().getCountryCode());
			builder.shippingCountryName(contact.getShippingCountry().getCountryName());
		}
		if (contact.getShippingState() != null) {
			builder.shippingStateId(contact.getShippingState().getId());
			builder.shippingStateName(contact.getShippingState().getStateName());
		}
		if (contact.getShippingPostZipCode() != null) {
			builder.shippingPostZipCode(contact.getShippingPostZipCode());
		}
        if(contact.getFax()!=null) builder.fax(contact.getFax());
        if(contact.getShippingFax()!=null) builder.shippingFax(contact.getShippingFax());
        if(contact.getShippingCity()!=null) builder.shippingCity(contact.getShippingCity());
        if(contact.getWebsite()!=null) builder.website(contact.getWebsite());
        if(contact.getShippingTelephone()!=null) builder.shippingTelephone(contact.getShippingTelephone());
		return builder.build();
	}

	public List<ContactListModel> getModelList(Object conctactList) {

		List<ContactListModel> modelList = new ArrayList<>();

		if (conctactList != null) {
			for (Contact contact : (List<Contact>) conctactList) {
				modelList.add(getModel(contact));
			}
		}
		return modelList;
	}

}
