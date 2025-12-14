package com.simpleaccounts.service;

import com.simpleaccounts.entity.RoleModuleRelation;
import java.util.List;

public abstract class RoleModuleRelationService extends SimpleAccountsService<Integer, RoleModuleRelation> {
 public abstract List<RoleModuleRelation> getRoleModuleRelationByRoleCode(Integer roleCode);
 public abstract List<RoleModuleRelation> getListOfSimpleAccountsModulesForAllRoles();
 public abstract void deleteByRoleCode(Integer roleCode);

}
