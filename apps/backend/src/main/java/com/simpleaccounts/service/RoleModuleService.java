package com.simpleaccounts.service;

import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import java.util.List;

public abstract class RoleModuleService extends SimpleAccountsService<Integer, SimpleAccountsModules> {

    public abstract List<SimpleAccountsModules> getListOfSimpleAccountsModules();

    public abstract List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode);
    public abstract List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode, Integer simpleAccountsModuleId);
}
