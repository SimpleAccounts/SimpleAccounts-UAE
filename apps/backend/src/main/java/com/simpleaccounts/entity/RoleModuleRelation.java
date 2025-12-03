package com.simpleaccounts.entity;

import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * Created By Zain Khan On 19-10-2020
 */

@Entity
@Table(name = "ROLE_MODULE_RELATION")
@Getter
@Setter
@NamedQueries({
        @NamedQuery(name = "getListOfSimpleAccountsModulesForAllRoles", query = "SELECT rm FROM RoleModuleRelation rm,SimpleAccountsModules sm,Role r" +
                " Where sm.simpleAccountsModuleId=rm.simpleAccountsModule.simpleAccountsModuleId AND r.roleCode=rm.role.roleCode order by sm.orderSequence ASC "),
        @NamedQuery(name = "deleteRoleModuleRelationByRoleCode", query = "DELETE FROM RoleModuleRelation  WHERE role.roleCode=:roleCode"),
        @NamedQuery(  name = "getRoleModuleRelationByRoleCode", query =" SELECT rm FROM RoleModuleRelation rm WHERE rm.role.roleCode=:roleCode")})

public class RoleModuleRelation {

        	@Id
        @Column(name = "ROLE_MODULE_RELATION_ID")
		@SequenceGenerator(name="ROLE_MODULE_RELATION_SEQ", sequenceName="ROLE_MODULE_RELATION_SEQ", allocationSize=1, initialValue = 10000)
		@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="ROLE_MODULE_RELATION_SEQ")
        private Integer id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "SIMPLEACCOUNTS_MODULE_ID",foreignKey = @javax.persistence.ForeignKey(name = "FK_ROLE_MOD_RELATION_SA_MOD_ID_SA_MOD"))
        private SimpleAccountsModules simpleAccountsModule;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "ROLE_CODE",foreignKey = @javax.persistence.ForeignKey(name = "FK_ROLE_MODULE_RELATION_ROLE_CODE_ROLE"))
        private Role role;

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
        @Temporal(TemporalType.TIMESTAMP)
        private Date lastUpdateDate;

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
