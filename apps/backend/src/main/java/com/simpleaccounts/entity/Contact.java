package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsinh on 2/26/2017.
 */

@NamedQueries({
		@NamedQuery(name = "allContacts", query = "SELECT c "
				+ "FROM Contact c where c.deleteFlag = FALSE order by c.firstName, c.lastName"),
		@NamedQuery(name = "contactsByType", query = "SELECT c "
				+ "FROM Contact c where c.deleteFlag = FALSE and c.contactType = :contactType order by c.firstName, c.lastName"),
		@NamedQuery(name = "Contact.contactByEmail", query = "SELECT c " + "FROM Contact c where c.email =:email"),
		@NamedQuery(name = "Contact.contactByID", query = "SELECT c " + "FROM Contact c where c.contactId =:contactId"),
		@NamedQuery(name = "getCustomerContacts", query = "Select distinct c from Contact c ,Invoice i where i.contact.contactId = c.contactId and c.contactType in (2,3)  and i.status in (3,5) and c.deleteFlag=false and c.isActive=true"),
		@NamedQuery(name = "getSupplierContacts", query = "Select distinct c from Contact c ,Invoice i where i.contact.contactId = c.contactId and c.contactType in (1,3) and i.status in (3,5)  and c.deleteFlag=false and c.isActive=true"),
		@NamedQuery(name = "getCurrencyCodeByInputColoumnValue", query = "SELECT cr.currencyCode from  Currency cr  where cr.currencyIsoCode=:val"),
		@NamedQuery(name = "Contact.contactsByName", query = "SELECT c FROM Contact c WHERE  ((c.firstName LIKE :name or c.lastName LIKE :name) and c.deleteFlag = FALSE and c.contactType=:contactType) order by c.firstName, c.lastName"),
		@NamedQuery(name = "updateContact", query = "Update Contact c set c.contactType = :contactType where c.firstName =:firstName AND c.lastName =:lastName"),})

@Entity
@Table(name = "CONTACT")
@Data

public class Contact implements Serializable {

	private static final long serialVersionUID = 6914121175305098995L;

	@Id
	@Column(name = "CONTACT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="CONTACT_SEQ", sequenceName="CONTACT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CONTACT_SEQ")
	private Integer contactId;
	@Basic
	@Column(name = "FIRST_NAME")
	private String firstName;
	@Basic
	@Column(name = "MIDDLE_NAME")
	private String middleName;
	@Basic
	@Column(name = "LAST_NAME")
	private String lastName;

	@Column(name = "CONTACT_TYPE")
	private Integer contactType;

	@Basic
	@Column(name = "ORGANIZATION")
	private String organization;

	@Basic
	@Column(name = "PO_BOX_NUMBER")
	private String poBoxNumber;

	@Basic
	@Column(name = "EMAIL")
	private String email;

	@Basic
	@Column(name = "TELEPHONE")
	private String telephone;

	@Basic
	@Column(name = "MOBILE_NUMBER")
	private String mobileNumber;

	@Basic
	@Column(name = "ADDRESS_LINE1")
	private String addressLine1;

	@Basic
	@Column(name = "ADDRESS_LINE2")
	private String addressLine2;

	@Basic
	@Column(name = "ADDRESS_LINE3")
	private String addressLine3;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "COUNTRY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONTACT_COUNTRY_CODE_COUNTRY"))
	private Country country;

	@OneToOne
	@JoinColumn(name = "STATE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONTACT_STATE_ID_STATE"))
	private State state;

	@Basic
	@Column(name = "CITY")
	private String city;

	@Basic
	@Column(name = "POST_ZIP_CODE")
	private String postZipCode;

	@Basic
	@Column(name = "BILLING_EMAIL")
	private String billingEmail;

	@Basic
	@Column(name = "CONTRACT_PO_NUMBER")
	private String contractPoNumber;

	@Basic
	@Column(name = "VAT_REGISTRATION_NUMBER")
	private String vatRegistrationNumber;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONTACT_CURRENCY_CODE_CURRENCY"))
	private Currency currency;

	@Basic(optional = false)
	@Column(name = "CREATED_BY")
	private Integer createdBy = 0;

	@Basic(optional = false)
	@Column(name = "CREATED_DATE")
	@ColumnDefault(value = "CURRENT_TIMESTAMP")

	private LocalDateTime createdDate;

	@Basic
	@Column(name = "LAST_UPDATED_BY")
	private Integer lastUpdatedBy;

	@Basic
	@Column(name = "LAST_UPDATE_DATE")

	private LocalDateTime lastUpdateDate;

	@Column(name = "DELETE_FLAG")
	@ColumnDefault(value = "false")
	@Basic(optional = false)
	private Boolean deleteFlag = Boolean.FALSE;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PLACE_OF_SUPPLY_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONTACT_PLACE_OF_SUPPLY_ID_PLACE_OF_SUPPLY"))
	private PlaceOfSupply placeOfSupplyId;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_ACTIVE")
	private Boolean isActive = true;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_MIGRATED_RECORD")
	private Boolean isMigratedRecord = false;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_REGISTERED_FOR_VAT")
	private Boolean isRegisteredForVat = false;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "TAX_TREATMENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONTACT_TAX_TREATMENT_ID_TAX_TREATMENT"))
	private TaxTreatment taxTreatment;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SHIPPING_COUNTRY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONTACT_SHIPPING_COUNTRY_CODE_COUNTRY"))
	private Country shippingCountry;

	@OneToOne
	@JoinColumn(name = "SHIPPING_STATE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONTACT_SHIPPING_STATE_ID_STATE"))
	private State shippingState;

	@Basic
	@Column(name = "SHIPPING_CITY")
	private String shippingCity;

	@Basic
	@Column(name = "SHIPPING_POST_ZIP_CODE")
	private String shippingPostZipCode;

	@Basic
	@Column(name = "SHIPPING_TELEPHONE")
	private String shippingTelephone;
	@Basic
	@Column(name = "BILLING_TELEPHONE")
	private String billingTelephone;

	@Basic
	@Column(name = "FAX")
	private String fax;

	@Basic
	@Column(name = "SHIPPING_FAX")
	private String shippingFax;

	@Basic
	@Column(name = "WEBSITE")
	private String website;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "IS_BILLING_SHIPPING_ADDRESS_SAME")
	private Boolean isBillingandShippingAddressSame = false;

	@Basic(optional = false)
	@ColumnDefault(value = "false")
	@Column(name = "UPDATE_CONTACT")
	private Boolean updateContact = false;

	@PrePersist
	public void updateDates() {
		createdDate = LocalDateTime.now();
		lastUpdateDate = LocalDateTime.now();
	}

	@PreUpdate
	public void updateLastUpdatedDate() {
		lastUpdateDate = LocalDateTime.now();
	}

}
