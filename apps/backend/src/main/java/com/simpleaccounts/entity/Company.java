package com.simpleaccounts.entity;

import com.simpleaccounts.constant.CommonConstant;

import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;

import javax.persistence.*;

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.Type;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
    @NamedQuery(name = "companiesForDropdown", query = "SELECT  new " + CommonConstant.DROPDOWN_MODEL_PACKAGE + "(c.companyId , c.companyName) "
            + " FROM Company c where c.deleteFlag = FALSE order by c.companyName "),
    @NamedQuery(name = "getDbConnection", query = " SELECT 1 FROM Company "),
        @NamedQuery(name = "getCompanyCurrency",query = " SELECT cc.currencyCode FROM Company cc")
})
@Entity
@Table(name = "COMPANY")
@Data
public class Company implements Serializable {

    private static final long serialVersionUID = 1L;

    	@Id
	@SequenceGenerator(name="COMPANY_SEQ", sequenceName="COMPANY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="COMPANY_SEQ")
    @Column(name = "COMPANY_ID", updatable = false, nullable = false)
    private Integer companyId;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Basic
    @Column(name = "COMPNAY_NAME")
    private String companyName;

    @Basic
    @Column(name = "COMPANY_REGISTRATION_NUMBER")
    private String companyRegistrationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMPANY_TYPE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_COMPANY_COMPANY_TYPE_CODE_COMPANY_TYPE"))
    private CompanyType companyTypeCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INDUSTRY_TYPE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_COMPANY_INDUSTRY_TYPE_CODE_INDUSTRY_TYPE"))
    private IndustryType industryTypeCode;

    @Basic
    @Column(name = "VAT_NUMBER")
    private String vatNumber;

    @Basic
    @Lob
    @Type(type = "org.hibernate.type.ImageType")
    @Column(name = "COMPANY_LOGO")
    private byte[] companyLogo;

    @Basic
    @Column(name = "EMAIL_ADDRESS")
    private String emailAddress;

    @Basic
    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;

    @Basic
    @Column(name = "MOBILE_NUMBER")
    private String mobileNumber;

    @Basic
    @Column(name = "FAX")
    private String fax;

    @Basic
    @Column(name = "WEBSITE")
    private String website;

    @Basic
    @Column(name = "INVOICING_REFERENCE_PATTERN")
    private String invoicingReferencePattern;

    @Basic
    @Column(name = "INVOICING_ADDRESS_LINE1")
    private String invoicingAddressLine1;

    @Basic
    @Column(name = "INVOICING_ADDRESS_LINE2")
    private String invoicingAddressLine2;

    @Basic
    @Column(name = "INVOICING_ADDRESS_LINE3")
    private String invoicingAddressLine3;

    @Basic
    @Column(name = "INVOICING_CITY")
    private String invoicingCity;

    @Basic
    @Column(name = "INVOICING_STATE_REGION")
    private String invoicingStateRegion;

    @Basic
    @Column(name = "INVOICING_POST_ZIP_CODE")
    private String invoicingPostZipCode;

    @Basic
    @Column(name = "INVOICING_PO_BOX_NUMBER")
    private String invoicingPoBoxNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "INVOICING_COUNTRY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_COMPANY_INVOICING_COUNTRY_CODE_COUNTRY"))
    private Country invoicingCountryCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_COMPANY_CURRENCY_CODE_CURRENCY"))
    private Currency currencyCode;

    @Basic
    @Column(name = "COMPANY_ADDRESS_LINE1")
    private String companyAddressLine1;

    @Basic
    @Column(name = "COMPANY_ADDRESS_LINE2")
    private String companyAddressLine2;

    @Basic
    @Column(name = "COMPANY_ADDRESS_LINE3")
    private String companyAddressLine3;

    @Basic
    @Column(name = "COMPANY_CITY")
    private String companyCity;

    @Basic
    @Column(name = "COMPANY_STATE_REGION")
    private String companyStateRegion;

    @Basic
    @Column(name = "COMPANY_POST_ZIP_CODE")
    private String companyPostZipCode;

    @Basic
    @Column(name = "COMPANY_PO_BOX_NUMBER")
    private String companyPoBoxNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMPANY_COUNTRY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_COMPANY_COMPANY_COUNTRY_CODE"))
    private Country companyCountryCode;

    @Column(name = "COMPANY_EXPENSE_BUDGET")
    @ColumnDefault(value = "0.00")
    private BigDecimal companyExpenseBudget;

    @Column(name = "COMPANY_REVENUE_BUDGET")
    @ColumnDefault(value = "0.00")
    private BigDecimal companyRevenueBudget;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Basic
    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdatedBy;

    @Basic
    @Column(name = "LAST_UPDATE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @Basic
    @Column(name = "DATE_FORMAT")
    private String dateFormat;

    @Column(name = "ACCOUNT_START_DATE")
//	//@Convert(converter = DateConverter.class)
    private LocalDateTime accountStartDate;

    @Column(name = "IS_DESIGNATED_ZONE")
    @ColumnDefault(value = "false")
    private Boolean IsDesignatedZone = Boolean.FALSE;

    @Column(name = "IS_REGISTERED_VAT")
    @ColumnDefault(value = "false")
    private Boolean IsRegisteredVat = Boolean.FALSE;

    @Basic
    @Column(name = "VAT_REGISTRATION_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime vatRegistrationDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMPANY_STATE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_COMPANY_COMPANY_STATE_CODE_STATE"))
    private State companyStateCode;

    @Basic
    @Column(name = "COMPANY_BANK_CODE")
    private String companyBankCode;

    @Basic
    @Column(name = "COMPANY_NUMBER")
    private String companyNumber;

    @Column(name = "IS_ELIGIBLE_FOR_CP")
    @ColumnDefault(value = "false")
    private Boolean IsEligibleForCp = Boolean.FALSE;

    @Column(name = "GENERATE_SIF")
    @ColumnDefault(value = "true")
    private Boolean generateSif = Boolean.TRUE;
}
