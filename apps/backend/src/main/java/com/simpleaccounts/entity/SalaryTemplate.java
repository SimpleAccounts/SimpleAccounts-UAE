package com.simpleaccounts.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@NamedQueries({
        @NamedQuery(name = "allSalaryTemplates", query = "SELECT s FROM SalaryTemplate s "),

})
@Entity
@Table(name = "SALARY_TEMPLATE")
@Data

public class SalaryTemplate implements Serializable {

    private static final long serialVersionUID = 6914121175305098995L;

    	@Id
    @Column(name = "SALARY_TEMPLATE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="SALARY_TEMPLATE_SEQ", sequenceName="SALARY_TEMPLATE_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="SALARY_TEMPLATE_SEQ")
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SALARY_COMPONENT_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SALARY_TEMPLATE_SALARY_COMPONENT_ID_SALARY_COMPONENT"))
    private SalaryComponent salaryComponentId;

    @Column(name = "IS_ACTIVE")

    @Basic(optional = true)
    private Boolean isActive = Boolean.TRUE;

    @Column(name = "IS_EDITABLE")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean isEditable = Boolean.FALSE;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SALARY_ROLE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SALARY_TEMPLATE_SALARY_ROLE_ID_SALARY_ROLE"))
    private SalaryRole salaryRoleId;

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
