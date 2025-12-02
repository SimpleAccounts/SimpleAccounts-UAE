
package com.simplevat.entity;
import com.simplevat.entity.converter.DateConverter;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "PAYROLL_HISTORY")
@Data
public class PayrollHistory {

    	@Id
    @Column(name = "PAYROLL_HISTORY_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="PAYROLL_HISTORY_SEQ", sequenceName="PAYROLL_HISTORY_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="PAYROLL_HISTORY_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PAYROLL_ID",referencedColumnName="PAYROLL_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_PAYROLL_HISTORY_PAYROLL_ID_PAYROLL"))
    private Payroll payrollId;

    @Basic
    @Column(name = "UPDATED_BY")
    private Integer updatedBy;

    @Basic
    @Column(name = "LAST_UPDATE_DATE")
    //@Convert(converter = DateConverter.class)
    private LocalDateTime lastUpdateDate;

    @Basic
    @Column(name = "COMMENT")
    private String comment;

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
