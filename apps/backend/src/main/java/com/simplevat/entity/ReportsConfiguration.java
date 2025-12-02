package com.simplevat.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "REPORTS_COLUMN_CONFIGURATION")
@Data
public class ReportsConfiguration {
    @Id
    @Column(name = "ID", updatable = false, nullable = false)
    @SequenceGenerator(name="REPORTS_COLUMN_CONFIGURATION_SEQ", sequenceName="REPORTS_COLUMN_CONFIGURATION_SEQ", allocationSize=1, initialValue = 10000)
    @GeneratedValue(strategy=GenerationType.SEQUENCE, generator="REPORTS_COLUMN_CONFIGURATION_SEQ")
    private Integer id;

    @Basic
    @Column(name = "REPORT_NAME")
    private String reportName;

    @Basic
    @Column(name = "COLUMN_NAMES")
    private String columnNames;

    @Column(name = "CREATED_BY")
    @Basic(optional = false)
    private Integer createdBy = 0;

    @Column(name = "CREATED_DATE")
    @ColumnDefault(value = "CURRENT_TIMESTAMP")
    @Basic(optional = false)
    private LocalDateTime createdDate;

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdatedBy;

    @Column(name = "LAST_UPDATE_DATE")
    private LocalDateTime lastUpdateDate;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;
}