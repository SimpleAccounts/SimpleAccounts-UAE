package com.simplevat.dao.impl;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.simplevat.dao.RoleDao;
import com.simplevat.entity.Role;
import com.simplevat.dao.AbstractDao;

/**
 * Created by mohsin on 3/3/2017.
 */
@Repository
public class RoleDaoImpl extends AbstractDao<Integer, Role> implements RoleDao {

    @Override
    public List<Role> getRoles() {
        return this.executeNamedQuery("Role.FindAllRole");
    }

    @Override
    public Role getRoleById(Integer roleCode) {
        return this.findByPK(roleCode);
    }

    @Override
    public Role getDefaultRole() {
        if (getRoles() != null && !getRoles().isEmpty()) {
            return getRoles().get(0);
        }
        return null;
    }
}
