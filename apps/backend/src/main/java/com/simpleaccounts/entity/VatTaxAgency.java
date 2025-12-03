package com.simpleaccounts.entity;


import com.simpleaccounts.entity.converter.DateConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@NamedQueries({
           @NamedQuery(name = "findVatTaxAgencyByVatReportFillingId", query = "SELECT vta FROM VatTaxAgency  vta where  vta.vatReportFiling.id = :vatReportFillingId") })

@Entity
@Table(name = "VAT_TAX_AGENCY")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
//@TableGenerator(name = "INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class VatTaxAgency implements Serializable {
    	@Id
    @Column(name = "VAT_TAX_AGENCY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="VAT_TAX_AGENCY_SEQ", sequenceName="VAT_TAX_AGENCY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="VAT_TAX_AGENCY_SEQ")
    private Integer id;

    @Basic
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_TAX_AGENCY_USER_ID_SA_USER"))
    private User userId;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

    @Column(name = "TAX_FILED_ON")
    private LocalDate taxFiledOn;

    @Basic
    @Column(name = "TAXABLE_PERSON_NAME_IN_ENGLISH")
    private String taxablePersonNameInEnglish;

    @Basic
    @Column(name = "TAXABLE_PERSON_NAME_IN_ARABIC")
    private String taxablePersonNameInArabic;

    @Basic
    @Column(name = "TAX_AGENT_NAME")
    private String taxAgentName;

    @Basic
    @Column(name = "TAX_AGENCY_NAME")
    private String taxAgencyName;

    @Basic
    @Column(name = "TAX_AGENCY_NUMBER")
    private String taxAgencyNumber;

    @Basic
    @Column(name = "TAX_AGENT_APPROVAL_NUMBER")
    private String taxAgentApprovalNumber;

    @Basic
    @Column(name = "VAT_REGISTRATION_NUMBER")
    private String vatRegistrationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VAT_REPORT_FILING_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_TAX_AGENCY_VAT_REPORT_FILING_ID_VAT_REPORT_FILING"))
    private VatReportFiling vatReportFiling;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

//    @Column(name = "VERSION_NUMBER")
//    @ColumnDefault(value = "1")
//    @Basic(optional = false)
//    @Version
//    private Integer versionNumber = 1;

}
