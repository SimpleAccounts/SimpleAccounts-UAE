package com.simpleaccounts.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "SALARY_COMPONENT")
@Data

public class SalaryComponent implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "SALARY_COMPONENT_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="SALARY_COMPONENT_SEQ", sequenceName="SALARY_COMPONENT_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="SALARY_COMPONENT_SEQ")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SALARY_STRUCTURE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SALARY_COMPONENT_SALARY_STRUCTURE_ID_SALARY_STRUCTURE"))
    private SalaryStructure salaryStructure;

    @Basic
    @Column(name="DESCRIPTION")
    private String description;

    @Basic
    @Column(name="FORMULA")
    private String formula;

    @Basic
    @Column(name="FLAT_AMOUNT")
    private String flatAmount;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "IS_EDITABLE")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean isEditable = Boolean.FALSE;

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

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;

    @Basic
    @Column(name = "CALCULATION_TYPE")
    private Integer calculationType;

    @Basic
    @Column(name = "COMPONENT_TYPE")
    private String componentType;

    @Basic
    @Column(name = "COMPONENT_CODE")
    private String componentCode;
}
