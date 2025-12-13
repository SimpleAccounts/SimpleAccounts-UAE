package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.RoleDao;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoleServiceImpl Unit Tests")
class RoleServiceImplTest {

    @Mock
    private RoleDao roleDao;

    @InjectMocks
    private RoleServiceImpl roleService;

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsRoleDao() {
        // Act
        var result = roleService.getDao();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(roleDao);
    }

    @Test
    @DisplayName("Should return list of roles")
    void getRolesReturnsRoleList() {
        // Arrange
        List<Role> expectedRoles = Arrays.asList(
            createRole(1, "Admin"),
            createRole(2, "User"),
            createRole(3, "Manager")
        );

        when(roleDao.getRoles())
            .thenReturn(expectedRoles);

        // Act
        List<Role> result = roleService.getRoles();

        // Assert
        assertThat(result).isNotNull().hasSize(3);
        verify(roleDao).getRoles();
    }

    @Test
    @DisplayName("Should return empty list when no roles exist")
    void getRolesReturnsEmptyList() {
        // Arrange
        when(roleDao.getRoles())
            .thenReturn(new ArrayList<>());

        // Act
        List<Role> result = roleService.getRoles();

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return role by ID")
    void getRoleByIdReturnsRole() {
        // Arrange
        Integer roleCode = 1;
        Role expectedRole = createRole(roleCode, "Admin");

        when(roleDao.getRoleById(roleCode))
            .thenReturn(expectedRole);

        // Act
        Role result = roleService.getRoleById(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRoleCode()).isEqualTo(roleCode);
        assertThat(result.getRoleName()).isEqualTo("Admin");
        verify(roleDao).getRoleById(roleCode);
    }

    @Test
    @DisplayName("Should return null when role not found by ID")
    void getRoleByIdReturnsNullWhenNotFound() {
        // Arrange
        Integer roleCode = 999;

        when(roleDao.getRoleById(roleCode))
            .thenReturn(null);

        // Act
        Role result = roleService.getRoleById(roleCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return default role")
    void getDefaultRoleReturnsRole() {
        // Arrange
        Role defaultRole = createRole(1, "Default Role");
        defaultRole.setDefaultFlag('Y');

        when(roleDao.getDefaultRole())
            .thenReturn(defaultRole);

        // Act
        Role result = roleService.getDefaultRole();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getDefaultFlag()).isEqualTo('Y');
        verify(roleDao).getDefaultRole();
    }

    @Test
    @DisplayName("Should return null when no default role exists")
    void getDefaultRoleReturnsNullWhenNotExists() {
        // Arrange
        when(roleDao.getDefaultRole())
            .thenReturn(null);

        // Act
        Role result = roleService.getDefaultRole();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should find role by primary key")
    void findByPKReturnsRole() {
        // Arrange
        Integer roleCode = 2;
        Role expectedRole = createRole(roleCode, "Manager");

        when(roleDao.findByPK(roleCode))
            .thenReturn(expectedRole);

        // Act
        Role result = roleService.findByPK(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRoleCode()).isEqualTo(roleCode);
        verify(roleDao).findByPK(roleCode);
    }

    @Test
    @DisplayName("Should throw exception when role not found by PK")
    void findByPKThrowsExceptionWhenNotFound() {
        // Arrange
        Integer roleCode = 999;

        when(roleDao.findByPK(roleCode))
            .thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> roleService.findByPK(roleCode))
            .isInstanceOf(ServiceException.class);
    }

    @Test
    @DisplayName("Should return roles with correct properties")
    void getRolesReturnsRolesWithCorrectProperties() {
        // Arrange
        Role role = createRole(1, "Administrator");
        role.setRoleDescription("System Administrator Role");
        role.setOrderSequence(1);

        when(roleDao.getRoles())
            .thenReturn(Collections.singletonList(role));

        // Act
        List<Role> result = roleService.getRoles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRoleName()).isEqualTo("Administrator");
        assertThat(result.get(0).getRoleDescription()).isEqualTo("System Administrator Role");
    }

    @Test
    @DisplayName("Should handle roles with different flags")
    void getRolesHandlesRolesWithDifferentFlags() {
        // Arrange
        Role activeRole = createRole(1, "Active Role");
        activeRole.setIsActive(true);

        Role inactiveRole = createRole(2, "Inactive Role");
        inactiveRole.setIsActive(false);

        when(roleDao.getRoles())
            .thenReturn(Arrays.asList(activeRole, inactiveRole));

        // Act
        List<Role> result = roleService.getRoles();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getIsActive()).isTrue();
        assertThat(result.get(1).getIsActive()).isFalse();
    }

    @Test
    @DisplayName("Should return roles in correct order")
    void getRolesReturnsInOrder() {
        // Arrange
        List<Role> roles = Arrays.asList(
            createRole(1, "First"),
            createRole(2, "Second"),
            createRole(3, "Third")
        );

        when(roleDao.getRoles())
            .thenReturn(roles);

        // Act
        List<Role> result = roleService.getRoles();

        // Assert
        assertThat(result).extracting(Role::getRoleName)
            .containsExactly("First", "Second", "Third");
    }

    @Test
    @DisplayName("Should verify DAO is correct type")
    void getDaoReturnsCorrectType() {
        // Act
        var result = roleService.getDao();

        // Assert
        assertThat(result).isInstanceOf(RoleDao.class);
    }

    @Test
    @DisplayName("Should handle role with version number")
    void getRoleByIdHandlesVersionNumber() {
        // Arrange
        Role role = createRole(1, "Versioned Role");
        role.setVersionNumber(5);

        when(roleDao.getRoleById(1))
            .thenReturn(role);

        // Act
        Role result = roleService.getRoleById(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getVersionNumber()).isEqualTo(5);
    }

    private Role createRole(Integer code, String name) {
        Role role = new Role();
        role.setRoleCode(code);
        role.setRoleName(name);
        role.setDeleteFlag(false);
        role.setIsActive(true);
        role.setDefaultFlag('N');
        role.setVersionNumber(1);
        return role;
    }
}
