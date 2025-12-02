package com.simplevat.dao;

import com.simplevat.entity.RoleModuleRelation;
import com.simplevat.entity.SimplevatModules;

import java.util.List;

public interface RoleModuleDao extends Dao<Integer,SimplevatModules > {
public List<SimplevatModules> getListOfSimplevatModules();
public List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode);
public List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode, Integer simplevatModuleId);
}
