package com.simpleaccounts.dao;

import com.simpleaccounts.entity.RoleModuleRelation;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public interface RoleModuleRelationDao extends Dao<Integer, RoleModuleRelation>{
    public List<RoleModuleRelation> getListOfSimpleAccountsModulesForAllRoles();
    public List<RoleModuleRelation> getRoleModuleRelationByRoleCode(Integer roleCode);
    public void deleteByRoleCode(Integer roleCode);

}
