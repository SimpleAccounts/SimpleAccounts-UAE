package com.simpleaccounts.security;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import com.simpleaccounts.entity.Role;
import java.util.Collection;
import org.junit.Test;
import org.springframework.security.core.GrantedAuthority;

/**
 * Unit tests that verify role-to-authority mapping for {@link CustomUserDetails}.
 */
public class CustomUserDetailsTest {

    @Test
    public void shouldExposeAdminAuthorityForAdminRole() {
        Role adminRole = new Role();
        adminRole.setRoleName("ADMIN");

        CustomUserDetails details = new CustomUserDetails();
        details.setRole(adminRole);

        Collection<? extends GrantedAuthority> authorities = details.getAuthorities();

        assertEquals(1, authorities.size());
        assertEquals("ROLE_ADMIN", authorities.iterator().next().getAuthority());
    }

    @Test
    public void shouldDefaultToEmployeeAuthorityForNonAdminRole() {
        Role employeeRole = new Role();
        employeeRole.setRoleName("Employee");

        CustomUserDetails details = new CustomUserDetails();
        details.setRole(employeeRole);

        Collection<? extends GrantedAuthority> authorities = details.getAuthorities();

        assertEquals(1, authorities.size());
        String authority = authorities.iterator().next().getAuthority();
        assertTrue(authority.contains("ROLE_EMPLOYEE"));
    }
}










