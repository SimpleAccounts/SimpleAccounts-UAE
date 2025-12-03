package com.simpleaccounts.service.impl;


import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.RoleModuleRelationDao;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import com.simpleaccounts.service.RoleModuleRelationService;
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
    public List<RoleModuleRelation> getListOfSimpleAccountsModulesForAllRoles(){
        return roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();
    }
    @Override
    public  void deleteByRoleCode(Integer roleCode){
        roleModuleRelationDao.deleteByRoleCode(roleCode);
    }
}
