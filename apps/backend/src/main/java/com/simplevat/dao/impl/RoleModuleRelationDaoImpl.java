package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.RoleModuleRelationDao;
import com.simplevat.entity.RoleModuleRelation;
import com.simplevat.entity.SimplevatModules;
import com.simplevat.service.RoleModuleRelationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;

@Repository
public class RoleModuleRelationDaoImpl extends AbstractDao<Integer, RoleModuleRelation> implements RoleModuleRelationDao {
    public List<RoleModuleRelation> getRoleModuleRelationByRoleCode(Integer roleCode){

//        return this.executeNamedQuery("getRoleModuleRelationByRoleCode");
        TypedQuery<RoleModuleRelation> query = getEntityManager().createQuery(
                 " SELECT rm FROM RoleModuleRelation rm WHERE rm.role.roleCode=:roleCode",
                RoleModuleRelation.class);
        query.setParameter("roleCode", roleCode);
        if (query.getResultList() != null && !query.getResultList().isEmpty()) {
            return query.getResultList();
        }
        return new ArrayList<>();
    }
    public List<RoleModuleRelation> getListOfSimplevatModulesForAllRoles(){
        return this.executeNamedQuery("getListOfSimplevatModulesForAllRoles");
    }
    public void deleteByRoleCode(Integer roleCode){
        TypedQuery<RoleModuleRelation> query = getEntityManager().createQuery(
                " DELETE  FROM RoleModuleRelation  WHERE role.roleCode=:roleCode",
                RoleModuleRelation.class);
        query.setParameter("roleCode", roleCode);
    }
}
