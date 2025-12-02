package com.simplevat.service;

import com.simplevat.entity.RoleModuleRelation;
import com.simplevat.entity.SimplevatModules;

import java.util.List;


public abstract class RoleModuleRelationService extends SimpleVatService<Integer, RoleModuleRelation> {
 public abstract List<RoleModuleRelation> getRoleModuleRelationByRoleCode(Integer roleCode);
 public abstract List<RoleModuleRelation> getListOfSimplevatModulesForAllRoles();
 public abstract void deleteByRoleCode(Integer roleCode);

}
