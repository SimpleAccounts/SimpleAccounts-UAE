package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.RoleModuleDao;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;

@Repository
public class RoleModuleDaoImpl extends AbstractDao<Integer, SimpleAccountsModules> implements RoleModuleDao {
  @Override
  public List<SimpleAccountsModules> getListOfSimpleAccountsModules() {

        return this.executeNamedQuery("listOfSimpleAccountsModules");
    }
  @Override
  public List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode){
    // return this.executeNamedQuery("moduleListByRoleCode");
    TypedQuery<RoleModuleRelation> query = getEntityManager().createQuery(
            "SELECT rm FROM RoleModuleRelation rm ,SimpleAccountsModules sm,Role r WHERE sm.simpleAccountsModuleId =" +
                    "rm.simpleAccountsModule.simpleAccountsModuleId AND r.roleCode=rm.role.roleCode AND rm.role.roleCode=:roleCode AND r.deleteFlag=false ORDER BY rm.simpleAccountsModule.orderSequence ASC ",
            RoleModuleRelation.class);
    query.setParameter("roleCode", roleCode);
  if (query.getResultList() != null && !query.getResultList().isEmpty()) {
      return query.getResultList();
    }
    return new ArrayList<>();
  }
    @Override
    public List<RoleModuleRelation> getModuleListByRoleCode(Integer roleCode, Integer simpleAccountsModuleId){
     // return this.executeNamedQuery("moduleListByRoleCode");
      TypedQuery<RoleModuleRelation> query = getEntityManager().createQuery(
              "SELECT rm FROM RoleModuleRelation rm ,SimpleAccountsModules sm,Role r WHERE sm.simpleAccountsModuleId =" +
                      "rm.simpleAccountsModule.simpleAccountsModuleId AND r.roleCode=rm.role.roleCode AND rm.role.roleCode=:roleCode" +
                      " AND rm.simpleAccountsModule.simpleAccountsModuleId=:simpleAccountsModule",
              RoleModuleRelation.class);
      query.setParameter("roleCode", roleCode);
      query.setParameter("simpleAccountsModule", simpleAccountsModuleId);
      if (query.getResultList() != null && !query.getResultList().isEmpty()) {
        return query.getResultList();
      }
      return new ArrayList<>();
    }
}
