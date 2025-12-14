package com.simpleaccounts.rest.CorporateTax;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "CORPORATE_TAX_FILING")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class CorporateTaxFiling implements Serializable {
    @Id
    @Column(name = "CORPORATE_TAX_FILING_ID", updatable = false, nullable = false)
    @SequenceGenerator(name="CORPORATE_TAX_FILING_SEQ", sequenceName="CORPORATE_TAX_FILING_SEQ", allocationSize=1, initialValue = 10000)
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="CORPORATE_TAX_FILING_SEQ")
    private Integer id;

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

    private LocalDateTime lastUpdateDate;

    @Column(name = "CT_START_DATE")
    private LocalDate startDate;

    @Column(name = "CT_END_DATE")
    private LocalDate endDate;

    @Column(name = "DUE_DATE")
    private LocalDate dueDate;

    @Column(name = "CT_FILED_ON")
    private LocalDate taxFiledOn;

    @Basic
    @Column(name = "STATUS", columnDefinition = "int default 1")
    private Integer status;

    @Column(name = "BALANCE_DUE")
    @ColumnDefault(value = "0.00")
    private BigDecimal balanceDue;

    @Column(name = "NET_INCOME")
    @ColumnDefault(value = "0.00")
    private BigDecimal netIncome;

    @Column(name = "TAXABLE_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal taxableAmount;

    @Column(name = "TAX_AMOUNT")
    @ColumnDefault(value = "0.00")
    private BigDecimal taxAmount;

    @Column(name = "REPORTING_PERIOD")
    private String reportingPeriod;

    @Column(name = "CT_REPORT_FOR_YEAR")
    private String reportingForYear;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "VIEW_CT_REPORT")
    private String viewCtReport;

}
