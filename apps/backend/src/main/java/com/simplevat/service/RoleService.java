package com.simplevat.service;

import com.simplevat.entity.Role;
import java.util.List;

/**
 *
 * @author Uday
 */
public abstract class RoleService extends SimpleVatService<Integer, Role> {

    public abstract List<Role> getRoles();

    public abstract Role getRoleById(Integer roleCode);

    public abstract Role getDefaultRole();
}
