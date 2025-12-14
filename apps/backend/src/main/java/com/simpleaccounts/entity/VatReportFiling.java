package com.simpleaccounts.entity;

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
@Table(name = "VAT_REPORT_FILING")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)

public class VatReportFiling implements Serializable {

    	@Id
    @Column(name = "VAT_REPORT_FILING_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="VAT_REPORT_FILING_SEQ", sequenceName="VAT_REPORT_FILING_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="VAT_REPORT_FILING_SEQ")
    private Integer id;

    @Basic
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_VAT_REPORT_FILING_USER_ID_USER"))
    private User userId;

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

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Column(name = "TAX_FILED_ON")
    private LocalDate taxFiledOn;

    @Column(name = "TOTAL_TAX_PAYABLE")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalTaxPayable;

    @Column(name = "TOTAL_TAX_RECLAIMABLE")
    @ColumnDefault(value = "0.00")
    private BigDecimal totalTaxReclaimable;

    @Column(name = "BALANCE_DUE")
    @ColumnDefault(value = "0.00")
    private BigDecimal balanceDue;

    @Basic
    @Column(name = "STATUS", columnDefinition = "int default 1")
    private Integer status;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "IS_VAT_RECLAIMABLE")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean isVatReclaimable = Boolean.FALSE;

    @Column(name = "VAT_NUMBER")
    private String vatNumber;
}
