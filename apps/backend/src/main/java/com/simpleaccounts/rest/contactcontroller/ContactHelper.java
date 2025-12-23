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
		// Guard against null contact
		if (contact == null) {
			return null;
		}
		
		try {
			// Safely get contactTypeString
			String contactTypeString = null;
			if (contact.getContactType() != null) {
				try {
					contactTypeString = ContactTypeEnum.getContactTypeByValue(contact.getContactType());
				} catch (Exception e) {
					// If getContactTypeByValue fails, leave it as null
					contactTypeString = null;
				}
			}
			
			ContactListModel model = new ContactListModel();
			model.setId(contact.getContactId());
			model.setContactType(contact.getContactType());
			model.setEmail(contact.getEmail());
			model.setFirstName(contact.getFirstName());
			model.setMiddleName(contact.getMiddleName());
			model.setLastName(contact.getLastName());
			model.setOrganization(contact.getOrganization());
			model.setContactTypeString(contactTypeString);
			model.setIsActive(contact.getIsActive());
			model.setMobileNumber(contact.getMobileNumber());
			model.setTelephone(contact.getTelephone());

			// Handle currency with null check and lazy loading exception handling
			try {
				com.simpleaccounts.entity.Currency currency = contact.getCurrency();
				if (currency != null) {
					// Safely get currency fields, handling null values
					model.setCurrencySymbol(currency.getCurrencySymbol());
					model.setCurrencyCode(currency.getCurrencyCode());
					model.setCurrencyIso(currency.getCurrencyIsoCode());
					model.setCurrencyName(currency.getCurrencyName());
				}
			} catch (org.hibernate.LazyInitializationException e) {
				// Currency is lazy-loaded and session is closed, skip currency fields
			} catch (Exception e) {
				// Any other exception accessing currency, skip currency fields
			}

			// Handle taxTreatment with null check and lazy loading exception handling
			try {
				TaxTreatment taxTreatment = contact.getTaxTreatment();
				if (taxTreatment != null) {
					// Safely get taxTreatment fields, handling null values
					model.setTaxTreatment(taxTreatment.getTaxTreatment());
					model.setTaxTreatmentId(taxTreatment.getId());
				}
			} catch (org.hibernate.LazyInitializationException e) {
				// TaxTreatment is lazy-loaded and session is closed, skip taxTreatment fields
			} catch (Exception e) {
				// Any other exception accessing taxTreatment, skip taxTreatment fields
			}

			return model;
		} catch (Exception e) {
			// Log the exception and return a minimal model
			// Note: contact is guaranteed non-null here due to early return guard
			System.err.println("Error in getModel for contact " + contact.getContactId() + ": " + e.getMessage());
			System.err.println("Exception type: " + e.getClass().getName());
			if (e.getCause() != null) {
				System.err.println("Caused by: " + e.getCause().getMessage());
			}
			e.printStackTrace();
			// Return minimal model with just ID and basic fields
			try {
				ContactListModel model = new ContactListModel();
				model.setId(contact.getContactId());
				model.setFirstName(contact.getFirstName());
				model.setLastName(contact.getLastName());
				model.setEmail(contact.getEmail());
				return model;
			} catch (Exception e2) {
				System.err.println("Error creating minimal model: " + e2.getMessage());
				e2.printStackTrace();
				throw e; // Re-throw original exception
			}
		}
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
				.billingTelephone(contact.getBillingTelephone());

		// Handle country and state with null checks
		// Handle country with lazy loading exception handling
		try {
			if (contact.getCountry() != null) {
				builder.countryId(contact.getCountry().getCountryCode())
						.billingCountryName(contact.getCountry().getCountryName());
			}
		} catch (org.hibernate.LazyInitializationException e) {
			// Country is lazy-loaded and session is closed, skip country fields
		} catch (Exception e) {
			// Any other exception accessing country, skip country fields
		}
		
		// Handle state with lazy loading exception handling
		try {
			if (contact.getState() != null) {
				builder.billingStateName(contact.getState().getStateName());
			}
		} catch (org.hibernate.LazyInitializationException e) {
			// State is lazy-loaded and session is closed, skip state fields
		} catch (Exception e) {
			// Any other exception accessing state, skip state fields
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
		// Handle shippingCountry with lazy loading exception handling
		try {
			if (contact.getShippingCountry() != null) {
				builder.shippingCountryId(contact.getShippingCountry().getCountryCode());
				builder.shippingCountryName(contact.getShippingCountry().getCountryName());
			}
		} catch (org.hibernate.LazyInitializationException e) {
			// ShippingCountry is lazy-loaded and session is closed, skip shippingCountry fields
		} catch (Exception e) {
			// Any other exception accessing shippingCountry, skip shippingCountry fields
		}
		
		// Handle shippingState with lazy loading exception handling
		try {
			if (contact.getShippingState() != null) {
				builder.shippingStateId(contact.getShippingState().getId());
				builder.shippingStateName(contact.getShippingState().getStateName());
			}
		} catch (org.hibernate.LazyInitializationException e) {
			// ShippingState is lazy-loaded and session is closed, skip shippingState fields
		} catch (Exception e) {
			// Any other exception accessing shippingState, skip shippingState fields
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
			try {
				@SuppressWarnings("unchecked")
				List<Contact> contacts = (List<Contact>) conctactList;
				for (Contact contact : contacts) {
					try {
						if (contact != null) {
							ContactListModel model = getModel(contact);
							if (model != null) {
								modelList.add(model);
							}
						}
					} catch (Exception e) {
						// Log and skip this contact if there's an error converting it
						System.err.println("Error converting contact " + contact.getContactId() + ": " + e.getMessage());
						e.printStackTrace();
						// Continue with next contact
					}
				}
			} catch (ClassCastException e) {
				System.err.println("Error: conctactList is not a List<Contact>: " + e.getMessage());
				e.printStackTrace();
			} catch (Exception e) {
				System.err.println("Error in getModelList: " + e.getMessage());
				e.printStackTrace();
			}
		}
		return modelList;
	}

}
