package com.simpleaccounts.service;

import com.simpleaccounts.entity.Role;
import java.util.List;

/**
 *
 * @author Uday
 */
public abstract class RoleService extends SimpleAccountsService<Integer, Role> {

    public abstract List<Role> getRoles();

    public abstract Role getRoleById(Integer roleCode);

    public abstract Role getDefaultRole();
}
