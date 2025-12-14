package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "EMPLOYEE_DESIGNATION")
@Data

public class EmployeeDesignation implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "EMPLOYEE_DESIGNATION_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="EMPLOYEE_DESIGNATION_SEQ", sequenceName="EMPLOYEE_DESIGNATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMPLOYEE_DESIGNATION_SEQ")
    private Integer id;

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

    @Basic
    @Column(name = "DESIGNATION_NAME")
    private String designationName;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Basic
    @Column(name = "DESIGNATION_ID")
    private Integer designationId;

    @Basic
    @Column(name = "PARENT_ID")
    private Integer parentId;

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

}
