package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.RoleDao;
import com.simplevat.entity.Role;
import com.simplevat.service.RoleService;
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
