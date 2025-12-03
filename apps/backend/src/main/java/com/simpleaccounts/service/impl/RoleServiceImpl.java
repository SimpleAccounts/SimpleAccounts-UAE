package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.RoleDao;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.service.RoleService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author Uday
 */
@Service
@Transactional
public class RoleServiceImpl extends RoleService {

    @Autowired
    private RoleDao roleDao;

    @Override
    public List<Role> getRoles() {
        return roleDao.getRoles();
    }

    @Override
    public Role getRoleById(Integer roleCode){
        return roleDao.getRoleById(roleCode);
    }

	@Override
	public Dao<Integer, Role> getDao() {
		return roleDao;
	}

    @Override
    public Role getDefaultRole() {
        return roleDao.getDefaultRole();
    }
}
