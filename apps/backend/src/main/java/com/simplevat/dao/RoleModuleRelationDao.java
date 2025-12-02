package com.simplevat.dao;


import com.simplevat.entity.RoleModuleRelation;
import com.simplevat.entity.SimplevatModules;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public interface RoleModuleRelationDao extends Dao<Integer, RoleModuleRelation>{
    public List<RoleModuleRelation> getListOfSimplevatModulesForAllRoles();
    public List<RoleModuleRelation> getRoleModuleRelationByRoleCode(Integer roleCode);
    public void deleteByRoleCode(Integer roleCode);

}
