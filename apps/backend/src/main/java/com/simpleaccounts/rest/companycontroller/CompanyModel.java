package com.simpleaccounts.rest.companycontroller;

import java.math.BigDecimal;
import java.util.Date;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CompanyModel {

	private MultipartFile companyLogo;
	private String companyName;
	private String companyRegistrationNumber;
	private String vatRegistrationNumber;
	private Boolean companyLogoChange;
	private Integer companyTypeCode;
	private Integer industryTypeCode;
	private String phoneNumber;
	private String telephoneNumber;
	private String emailAddress;
	private String website;
	private String invoicingAddressLine1;
	private String invoicingAddressLine2;
	private String invoicingAddressLine3;
	private String invoicingCity;
	private String invoicingStateRegion;
	private String invoicingPostZipCode;
	private String invoicingPoBoxNumber;
	private Integer invoicingCountryCode;
	private Integer currencyCode;
	private String companyAddressLine1;
	private String companyAddressLine2;
	private String companyAddressLine3;
	private String companyCity;
	private String companyStateRegion;
	private String companyPostZipCode;
	private String companyPoBoxNumber;
	private Integer companyCountryCode;
	private BigDecimal companyExpenseBudget;
	private BigDecimal companyRevenueBudget;
	private String dateFormat;
	private byte[] companyLogoByteArray;
	private Boolean IsRegisteredVat = Boolean.FALSE;
	private Boolean IsDesignatedZone = Boolean.FALSE;
	private Date vatRegistrationDate;
	private Integer countryId;
	private Integer stateId;
	private String TaxRegistrationNumber;
	private Integer companyStateCode;
	private String mobileNumber;
	private String fax;
	private String companyStateName;
	private String companyCountryName;
	private String companyBankCode;
	private String companyNumber;
	private Boolean isEligibleForCP;
	private Boolean generateSif;
	private String fiscalYear;
	private Boolean isVatEditable;
	}
