package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.RoleModuleRelationDao;
import com.simpleaccounts.entity.RoleModuleRelation;

import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository
public class RoleModuleRelationDaoImpl extends AbstractDao<Integer, RoleModuleRelation> implements RoleModuleRelationDao {
    public List<RoleModuleRelation> getRoleModuleRelationByRoleCode(Integer roleCode){

        TypedQuery<RoleModuleRelation> query = getEntityManager().createQuery(
                 " SELECT rm FROM RoleModuleRelation rm WHERE rm.role.roleCode=:roleCode",
                RoleModuleRelation.class);
        query.setParameter("roleCode", roleCode);
        if (query.getResultList() != null && !query.getResultList().isEmpty()) {
            return query.getResultList();
        }
        return new ArrayList<>();
    }
    public List<RoleModuleRelation> getListOfSimpleAccountsModulesForAllRoles(){
        return this.executeNamedQuery("getListOfSimpleAccountsModulesForAllRoles");
    }
    public void deleteByRoleCode(Integer roleCode){
        TypedQuery<RoleModuleRelation> query = getEntityManager().createQuery(
                " DELETE  FROM RoleModuleRelation  WHERE role.roleCode=:roleCode",
                RoleModuleRelation.class);
        query.setParameter("roleCode", roleCode);
    }
}
