package com.simpleaccounts.dao;


import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public interface RoleModuleRelationDao extends Dao<Integer, RoleModuleRelation>{
    public List<RoleModuleRelation> getListOfSimpleAccountsModulesForAllRoles();
    public List<RoleModuleRelation> getRoleModuleRelationByRoleCode(Integer roleCode);
    public void deleteByRoleCode(Integer roleCode);

}
