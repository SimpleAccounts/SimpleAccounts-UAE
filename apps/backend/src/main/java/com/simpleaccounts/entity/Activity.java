package com.simpleaccounts.entity;

import java.time.LocalDateTime;

import javax.persistence.*;

import java.time.format.DateTimeFormatter;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

@NamedQueries({
    @NamedQuery(name = "allActivity",
            query = "SELECT a FROM Activity a where a.lastUpdateDate > :startDate order by a.lastUpdateDate desc")
})
@Entity
@Table(name = "ACTIVITY")
@Data
public class Activity {

    	@Id
    @Column(name = "ACTIVITY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="ACTIVITY_SEQ", sequenceName="ACTIVITY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="ACTIVITY_SEQ")
    private Integer activityId;
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

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;
    @Basic
    @Column(name = "MODULE_CODE")
    private String moduleCode;

    @Basic
    @Column(name = "ACTIVITY_CODE")
    private String activityCode;

    @Basic
    @Column(name = "FIELD_1")
    private String field1;

    @Basic
    @Column(name = "FIELD_2")
    private String field2;

    @Basic
    @Column(name = "FIELD_3")
    private String field3;

    @Basic
    @Column(name = "UPDATED_BY")
    private int updatedBy;

    @Basic
    @Column(name = "LAST_UPDATE_DATE")

    private LocalDateTime lastUpdateDate;

    @Transient
    private boolean loggingRequired = false;

    @Transient
    private String strLastUpdateDate;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @PostLoad
    public void updateLastUploadDateTime() {
        if (lastUpdateDate != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd hh:mm a");
            strLastUpdateDate = lastUpdateDate.format(formatter);
        }
    }
}
