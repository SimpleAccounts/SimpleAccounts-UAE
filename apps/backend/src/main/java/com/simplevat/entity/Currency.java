package com.simplevat.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

import com.simplevat.entity.converter.DateConverter;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;

/**
 * Created by mohsinh on 2/26/2017.
 */
@NamedQueries({
    @NamedQuery(name = "allCurrencies",
            query = "SELECT c "
            + "FROM Currency c where c.deleteFlag=false ORDER BY c.defaultFlag DESC, c.orderSequence,c.currencyDescription ASC "),
        @NamedQuery(name = "allCurrenciesProfile",
                query = "SELECT c "
                        + "FROM Currency c  ORDER BY c.defaultFlag DESC, c.orderSequence,c.currencyDescription ASC "),
        @NamedQuery(name = "allCompanyCurrencies",
                query = "SELECT c "
                        + "FROM Currency c  where c.currencyCode IN (SELECT cc.currencyCode from Company cc)"),
        @NamedQuery(name = "allActiveCurrencies",
                query = "SELECT c "
                        + "FROM Currency c where c.currencyCode IN (Select cc.currencyCode from CurrencyConversion cc where cc.deleteFlag=false and cc.isActive=true) ORDER BY c.defaultFlag DESC, c.orderSequence,c.currencyDescription ASC "),
        @NamedQuery(name = "setDeafualtCurrency",query = "UPDATE Currency c SET c.deleteFlag=false WHERE c.currencyCode != :currencyCode ")
        })

@Entity
@Table(name = "CURRENCY")
@Data
public class Currency implements Serializable {


    	@Id
    @Column(name = "CURRENCY_CODE", updatable = false, nullable = false)
	@SequenceGenerator(name="CURRENCY_SEQ", sequenceName="CURRENCY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CURRENCY_SEQ")
    private Integer currencyCode;

    @Basic(optional = false)
    @Column(name = "CURRENCY_NAME")
    private String currencyName;

    @Basic
    @Column(name = "CURRENCY_DESCRIPTION")
    private String currencyDescription;

    @Basic
    @Column(name = "CURRENCY_ISO_CODE", length = 3)
    private String currencyIsoCode;

    @Basic
    @Column(name = "CURRENCY_SYMBOL")
    private String currencySymbol;

    @Column(name = "DEFAULT_FLAG")
    @ColumnDefault(value = "'N'")
    @Basic(optional = false)
    private Character defaultFlag;

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
   //@Convert(converter = DateConverter.class)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
   //@Convert(converter = DateConverter.class)
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

    @Transient
    private String description;

    public String getDescription() {
        return currencyDescription + " - " + currencyIsoCode + "(" + currencySymbol + ")";
    }
}
