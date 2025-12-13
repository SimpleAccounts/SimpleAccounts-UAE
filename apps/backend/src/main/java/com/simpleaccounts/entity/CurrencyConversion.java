/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

/**
 *
 * @author admin
 */
@Entity

@Table(name = "CONVERTED_CURRENCY")
@Data

@NamedQueries({
        @NamedQuery(name = "listOfCurrency", query = "SELECT cc FROM CurrencyConversion cc WHERE cc.deleteFlag=false"),
        @NamedQuery(name = "listOfActiveCurrency", query = "SELECT cc FROM CurrencyConversion cc WHERE cc.deleteFlag=false and cc.isActive=true "),
        @NamedQuery(name = "getcompanyCurrency", query ="SELECT cc.currencyCode, cc.exchangeRate FROM CurrencyConversion cc where cc.currencyCode IN (select c.currencyCode from Currency c)" )
})
public class CurrencyConversion implements Serializable {

    private static final long serialVersionUID = 1L;
    	@Id
    @Column(name = "CURRENCY_CONVERSION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="CONVERTED_CURRENCY_SEQ", sequenceName="CONVERTED_CURRENCY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CONVERTED_CURRENCY_SEQ")
    private Integer currencyConversionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRENCY_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONVERTED_CURRENCY_CURRENCY_CODE_CURRENCY"))
    private Currency currencyCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CURRENCY_CODE_CONVERTED_TO",foreignKey = @javax.persistence.ForeignKey(name = "FK_CONVERTED_CURRENCY_CURRENCY_CODE_CONVERTED_TO_CURRENCY"))
    private Currency currencyCodeConvertedTo;

    @Basic
    @Column(name = "EXCHANGE_RATE", precision = 19, scale = 9)
    private BigDecimal exchangeRate;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)

    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate = LocalDateTime.now();

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_ACTIVE")
    private Boolean isActive = true;

    @Basic(optional = false)
    @ColumnDefault(value = "false")
    @Column(name = "IS_MIGRATED_RECORD")
    private Boolean isMigratedRecord = Boolean.FALSE;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
