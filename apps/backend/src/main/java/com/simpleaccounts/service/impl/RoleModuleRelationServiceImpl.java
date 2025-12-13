package com.simpleaccounts.service.impl;


import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.RoleModuleRelationDao;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.service.RoleModuleRelationService;
import java.util.List;
import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@Transactional
@RequiredArgsConstructor
public class RoleModuleRelationServiceImpl extends RoleModuleRelationService {
    private final RoleModuleRelationDao roleModuleRelationDao;

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
