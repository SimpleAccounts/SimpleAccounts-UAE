package com.simplevat.service;


import com.simplevat.entity.RoleModuleRelation;
import com.simplevat.entity.SimplevatModules;

import java.util.List;

public abstract class RoleModuleService extends SimpleVatService<Integer, SimplevatModules> {

    public abstract List<SimplevatModules> getListOfSimplevatModules();

    public abstract List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode);
    public abstract List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode, Integer simplevatModuleId);
}
