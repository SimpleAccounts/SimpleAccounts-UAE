package com.simplevat.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * Created By Zain Khan On 19-10-2020
 */


@Entity
@Table(name = "SIMPLEACCOUNTS_MODULES")
@Data
@NoArgsConstructor

@NamedQueries({
        @NamedQuery(name = "listOfSimplevatModules", query = "SELECT sm FROM SimplevatModules sm Where sm.deleteFlag=false AND sm.simplevatModuleId not in (123,127,131)"),
        @NamedQuery(name= "moduleListByRoleCode",query = "SELECT sm FROM SimplevatModules sm ,RoleModuleRelation rm" +
                " WHERE sm.simplevatModuleId =rm.simplevatModule.simplevatModuleId AND rm.role.roleCode=:roleCode")
       })
public class SimplevatModules {

    private static final long serialVersionUID = 1L;
    	@Id
    @Column(name = "SIMPLEACCOUNTS_MODULE_ID", updatable = false, nullable = false)
	@SequenceGenerator(name="SIMPLEACCOUNTS_MODULES_SEQ", sequenceName="SIMPLEACCOUNTS_MODULES_SEQ", allocationSize=1, initialValue = 10000)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="SIMPLEACCOUNTS_MODULES_SEQ")
    private Integer simplevatModuleId;

    @Column(name = "SIMPLEACCOUNTS_MODULE_NAME")
    @Basic(optional = false)
    private String simplevatModuleName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PARENT_SIMPLEACCOUNTS_MODULE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_SA_MODULES_PARENT_SA_MODULE_ID_PARENT_SA_MODULE"))
    private SimplevatModules parentModule;

    @Column(name = "DEFAULT_FLAG")
    @ColumnDefault(value = "'N'")
    @Basic(optional = false)
    private Character defaltFlag;

    @Column(name = "ORDER_SEQUENCE")
    @Basic(optional = true)
    private Integer orderSequence;

    @Column(name = "DELETE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean deleteFlag = Boolean.FALSE;

    @Column(name = "SELECTABLE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean selectableFlag = Boolean.FALSE;

    @Column(name = "EDITABLE_FLAG")
    @ColumnDefault(value = "false")
    @Basic(optional = false)
    private Boolean editableFlag = Boolean.FALSE;

    @Column(name = "MODULE_TYPE")
    @Basic(optional = false)
    private String moduleType;

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

    @Column(name = "VERSION_NUMBER")
    @ColumnDefault(value = "1")
    @Basic(optional = false)
    @Version
    private Integer versionNumber = 1;


//    @OneToMany(mappedBy = "simplevatModules", fetch = FetchType.LAZY)
//    private List<RoleModuleRelation> roleModuleRelationList;
//
//    public SimplevatModules(Integer simplevatModuleId) {
//        this.simplevatModuleId = simplevatModuleId;
//    }
}

