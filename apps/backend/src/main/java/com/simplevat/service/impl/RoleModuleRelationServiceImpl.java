package com.simplevat.service.impl;


import com.simplevat.dao.Dao;
import com.simplevat.dao.RoleModuleRelationDao;
import com.simplevat.entity.RoleModuleRelation;
import com.simplevat.entity.SimplevatModules;
import com.simplevat.service.RoleModuleRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
@Transactional
public class RoleModuleRelationServiceImpl extends RoleModuleRelationService {
    @Autowired
    RoleModuleRelationDao roleModuleRelationDao;

    @Override
    public Dao<Integer, RoleModuleRelation> getDao() {
        return roleModuleRelationDao;
    }
    @Override
    public  List<RoleModuleRelation> getRoleModuleRelationByRoleCode(Integer roleCode){
        return  roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);
    }
    @Override
    public List<RoleModuleRelation> getListOfSimplevatModulesForAllRoles(){
        return roleModuleRelationDao.getListOfSimplevatModulesForAllRoles();
    }
    @Override
    public  void deleteByRoleCode(Integer roleCode){
        roleModuleRelationDao.deleteByRoleCode(roleCode);
    }
}
