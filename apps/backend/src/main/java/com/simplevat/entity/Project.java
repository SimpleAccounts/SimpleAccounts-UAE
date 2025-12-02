package com.simplevat.entity;

import com.simplevat.constant.CommonConstant;
import com.simplevat.entity.converter.DateConverter;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsinh on 2/26/2017.
 */


@NamedQueries({
    @NamedQuery(name = "projectsForDropdown",
            query = "SELECT new "+ CommonConstant.DROPDOWN_MODEL_PACKAGE +"(p.projectId , p.projectName)"
            + " FROM Project p where p.deleteFlag = FALSE  order by p.projectName ")

})

@Entity
@Table(name = "PROJECT")
@Data
@NoArgsConstructor
//@TableGenerator(name="INCREMENT_INITIAL_VALUE", initialValue = 1000)
public class Project implements Serializable {

    	@Id
    @Column(name = "PROJECT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="PROJECT_SEQ", sequenceName="PROJECT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PROJECT_SEQ")
    private Integer projectId;

    @Column(name = "PROJECT_NAME")
    private String projectName;

    @Column(name = "EXPENSE_BUDGET")
    @ColumnDefault(value = "0.00")
    private BigDecimal expenseBudget = BigDecimal.ZERO;

    @Column(name = "REVENUE_BUDGET")
    @ColumnDefault(value = "0.00")
    private BigDecimal revenueBudget = BigDecimal.ZERO;

    @Column(name = "CONTRACT_PO_NUMBER")
    private String contractPoNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CONTACT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PROJECT_CONTACT_ID_CONTACT"))
    private Contact contact;

    @Column(name = "VAT_REGISTRATION_NUMBER")
    private String vatRegistrationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LANGUAGE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_PROJECT_LANGUAGE_CODE_LANGUAGE"))
    private Language invoiceLanguageCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_PROJECT_CURRENCY_CODE_CURRENCY"))
    private Currency currency;

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

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
