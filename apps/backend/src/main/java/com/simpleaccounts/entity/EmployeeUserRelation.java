package com.simpleaccounts.entity;

import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Created by Suraj Rahade on 24/04/2021.
 */

@Entity
@Table(name = "EMPLOYEE_USER_RELATION")
@Data
@NamedQueries({})
public class EmployeeUserRelation {

    	@Id
    @Column(name = "EMPLOYEE_USER_RELATION_ID", updatable = true, nullable = true)
	@SequenceGenerator(name="EMPLOYEE_USER_RELATION_SEQ", sequenceName="EMPLOYEE_USER_RELATION_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="EMPLOYEE_USER_RELATION_SEQ")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_USER_RELATION_USER_ID_SA_USER"))
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "EMPLOYEE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_EMPLOYEE_USER_RELATION_EMPLOYEE_ID_EMPLOYEE"))
    private Employee employee;

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

    @Column(name = "LAST_UPDATED_BY")
    private Integer lastUpdateBy;

    @Column(name = "LAST_UPDATE_DATE")
   //@Convert(converter = DateConverter.class)
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
