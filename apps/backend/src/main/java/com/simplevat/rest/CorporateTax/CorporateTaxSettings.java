package com.simplevat.rest.CorporateTax;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CORPORATE_TAX_DATE_SETTING")
@Data
public class CorporateTaxSettings {
    @Id
    @SequenceGenerator(name="CORPORATE_TAX_DATE_SETTING_SEQ", sequenceName="CORPORATE_TAX_DATE_SETTING_SEQ", allocationSize=1, initialValue = 10000)
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CORPORATE_TAX_DATE_SETTING_SEQ")
    @Column(name = "CORPORATE_TAX_DATE_SETTING_ID", updatable = false, nullable = false)
    private Integer id;

    @Basic
    @Column(name = "FISCAL_YEAR")
    private String fiscalYear;

    @Column(name = "SELECTED_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean selectedFlag = Boolean.FALSE;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "CREATED_BY")
    @ColumnDefault(value = "0")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Basic
    @Column(name = "LAST_UPDATE_DATE")
    private LocalDateTime lastUpdateDate;

    @Basic
    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdatedBy;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;
}
