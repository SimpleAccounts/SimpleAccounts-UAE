package com.simpleaccounts.entity;

import lombok.Data;
import lombok.Setter;

import javax.persistence.*;

import java.io.Serializable;
import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;

/**
 * Created by mohsinh on 2/26/2017.
 */

@NamedQueries({
        @NamedQuery(name = "allCountries",
                query = "SELECT c FROM Country c where c.deleteFlag=false ORDER BY c.defaltFlag DESC , c.orderSequence,c.countryName ASC"),
        @NamedQuery(name = "getCountryIdByInputColoumnValue", query = "SELECT c.countryCode FROM Country c where c.countryName=:val")
})

@Entity
@Table(name = "COUNTRY")
@Data
public class Country implements Serializable {

    private static final long serialVersionUID = 1L;
    	@Id
    @Column(name = "COUNTRY_CODE", updatable = false, nullable = false)
	@SequenceGenerator(name="COUNTRY_SEQ", sequenceName="COUNTRY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="COUNTRY_SEQ")
    private int countryCode;

    @Basic(optional = false)
    @Column(name = "COUNTRY_NAME")
    private String countryName;
    @Basic
    @Column(name = "COUNTRY_DESCRIPTION")
    private String countryDescription;
    @Basic
    @Column(name = "ISO_ALPHA3_CODE", length = 3)
    private String isoAlpha3Code;

    @Column(name = "DEFAULT_FLAG")
    @ColumnDefault(value = "'N'")
    @Basic(optional = false)
    private Character defaltFlag;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_CURRENCY_CODE_CURRENCY"))
    private Currency currencyCode;

    @Transient
    @Setter
    private String countryFullName;

    public String getCountryFullName() {
        countryFullName = countryName + " - (" + isoAlpha3Code + ")";
        return countryFullName;
    }

}
