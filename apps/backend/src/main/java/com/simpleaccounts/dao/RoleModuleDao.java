package com.simpleaccounts.dao;

import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import java.util.List;

public interface RoleModuleDao extends Dao<Integer,SimpleAccountsModules > {
public List<SimpleAccountsModules> getListOfSimpleAccountsModules();
public List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode);
public List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode, Integer simpleAccountsModuleId);
}
