package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.RoleModuleDao;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import com.simpleaccounts.service.RoleModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("roleModuleService")
public class RoleModuleServiceImpl extends RoleModuleService {

@Autowired
RoleModuleDao roleModuleDao;
    @Override
    public List<SimpleAccountsModules> getListOfSimpleAccountsModules() {
      return   roleModuleDao.getListOfSimpleAccountsModules();
    }
    @Override
    public  List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode){
        return  roleModuleDao.getModuleListByRoleCode(roleCode);
    }
    @Override
    public  List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode, Integer simpleAccountsModuleId){
        return  roleModuleDao.getModuleListByRoleCode(roleCode,simpleAccountsModuleId);
    }
    @Override
    public Dao<Integer, SimpleAccountsModules> getDao() {

        return roleModuleDao;
    }
}

