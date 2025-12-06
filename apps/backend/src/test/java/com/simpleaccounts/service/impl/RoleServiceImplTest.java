package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.RoleDao;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RoleServiceImplTest {

    @Mock
    private RoleDao roleDao;

    @InjectMocks
    private RoleServiceImpl roleService;

    private Role testRole;
    private Role adminRole;
    private Role userRole;

    @BeforeEach
    void setUp() {
        testRole = new Role();
        testRole.setRoleCode(1);
        testRole.setRoleName("Test Role");
        testRole.setRoleDescription("Test Role Description");

        adminRole = new Role();
        adminRole.setRoleCode(2);
        adminRole.setRoleName("Admin");
        adminRole.setRoleDescription("Administrator Role");

        userRole = new Role();
        userRole.setRoleCode(3);
        userRole.setRoleName("User");
        userRole.setRoleDescription("Standard User Role");
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnRoleDaoWhenGetDaoCalled() {
        assertThat(roleService.getDao()).isEqualTo(roleDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(roleService.getDao()).isNotNull();
    }

    // ========== getRoles Tests ==========

    @Test
    void shouldReturnAllRolesWhenRolesExist() {
        List<Role> expectedRoles = Arrays.asList(testRole, adminRole, userRole);
        when(roleDao.getRoles()).thenReturn(expectedRoles);

        List<Role> result = roleService.getRoles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testRole, adminRole, userRole);
        verify(roleDao, times(1)).getRoles();
    }

    @Test
    void shouldReturnEmptyListWhenNoRolesExist() {
        when(roleDao.getRoles()).thenReturn(Collections.emptyList());

        List<Role> result = roleService.getRoles();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleDao, times(1)).getRoles();
    }

    @Test
    void shouldReturnSingleRoleWhenOnlyOneExists() {
        List<Role> expectedRoles = Collections.singletonList(testRole);
        when(roleDao.getRoles()).thenReturn(expectedRoles);

        List<Role> result = roleService.getRoles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testRole);
        assertThat(result.get(0).getRoleName()).isEqualTo("Test Role");
        verify(roleDao, times(1)).getRoles();
    }

    @Test
    void shouldReturnNullWhenDaoReturnsNull() {
        when(roleDao.getRoles()).thenReturn(null);

        List<Role> result = roleService.getRoles();

        assertThat(result).isNull();
        verify(roleDao, times(1)).getRoles();
    }

    @Test
    void shouldHandleMultipleCallsToGetRoles() {
        List<Role> expectedRoles = Arrays.asList(testRole, adminRole);
        when(roleDao.getRoles()).thenReturn(expectedRoles);

        List<Role> result1 = roleService.getRoles();
        List<Role> result2 = roleService.getRoles();

        assertThat(result1).hasSize(2);
        assertThat(result2).hasSize(2);
        verify(roleDao, times(2)).getRoles();
    }

    @Test
    void shouldReturnRolesWithAllFieldsPopulated() {
        Role detailedRole = new Role();
        detailedRole.setRoleCode(10);
        detailedRole.setRoleName("Manager");
        detailedRole.setRoleDescription("Manager with full access");

        List<Role> expectedRoles = Collections.singletonList(detailedRole);
        when(roleDao.getRoles()).thenReturn(expectedRoles);

        List<Role> result = roleService.getRoles();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRoleCode()).isEqualTo(10);
        assertThat(result.get(0).getRoleName()).isEqualTo("Manager");
        assertThat(result.get(0).getRoleDescription()).isEqualTo("Manager with full access");
        verify(roleDao, times(1)).getRoles();
    }

    // ========== getRoleById Tests ==========

    @Test
    void shouldReturnRoleWhenValidIdProvided() {
        when(roleDao.getRoleById(1)).thenReturn(testRole);

        Role result = roleService.getRoleById(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRole);
        assertThat(result.getRoleCode()).isEqualTo(1);
        assertThat(result.getRoleName()).isEqualTo("Test Role");
        verify(roleDao, times(1)).getRoleById(1);
    }

    @Test
    void shouldReturnNullWhenRoleNotFound() {
        when(roleDao.getRoleById(999)).thenReturn(null);

        Role result = roleService.getRoleById(999);

        assertThat(result).isNull();
        verify(roleDao, times(1)).getRoleById(999);
    }

    @Test
    void shouldReturnCorrectRoleForDifferentIds() {
        when(roleDao.getRoleById(2)).thenReturn(adminRole);
        when(roleDao.getRoleById(3)).thenReturn(userRole);

        Role result1 = roleService.getRoleById(2);
        Role result2 = roleService.getRoleById(3);

        assertThat(result1).isEqualTo(adminRole);
        assertThat(result1.getRoleName()).isEqualTo("Admin");
        assertThat(result2).isEqualTo(userRole);
        assertThat(result2.getRoleName()).isEqualTo("User");
        verify(roleDao, times(1)).getRoleById(2);
        verify(roleDao, times(1)).getRoleById(3);
    }

    @Test
    void shouldHandleNullRoleId() {
        when(roleDao.getRoleById(null)).thenReturn(null);

        Role result = roleService.getRoleById(null);

        assertThat(result).isNull();
        verify(roleDao, times(1)).getRoleById(null);
    }

    @Test
    void shouldHandleZeroRoleId() {
        when(roleDao.getRoleById(0)).thenReturn(null);

        Role result = roleService.getRoleById(0);

        assertThat(result).isNull();
        verify(roleDao, times(1)).getRoleById(0);
    }

    @Test
    void shouldHandleNegativeRoleId() {
        when(roleDao.getRoleById(-1)).thenReturn(null);

        Role result = roleService.getRoleById(-1);

        assertThat(result).isNull();
        verify(roleDao, times(1)).getRoleById(-1);
    }

    @Test
    void shouldReturnRoleWithCompleteData() {
        Role completeRole = new Role();
        completeRole.setRoleCode(5);
        completeRole.setRoleName("Supervisor");
        completeRole.setRoleDescription("Supervises team operations");

        when(roleDao.getRoleById(5)).thenReturn(completeRole);

        Role result = roleService.getRoleById(5);

        assertThat(result).isNotNull();
        assertThat(result.getRoleCode()).isEqualTo(5);
        assertThat(result.getRoleName()).isEqualTo("Supervisor");
        assertThat(result.getRoleDescription()).isEqualTo("Supervises team operations");
        verify(roleDao, times(1)).getRoleById(5);
    }

    // ========== getDefaultRole Tests ==========

    @Test
    void shouldReturnDefaultRoleWhenExists() {
        when(roleDao.getDefaultRole()).thenReturn(userRole);

        Role result = roleService.getDefaultRole();

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(userRole);
        assertThat(result.getRoleName()).isEqualTo("User");
        verify(roleDao, times(1)).getDefaultRole();
    }

    @Test
    void shouldReturnNullWhenNoDefaultRoleExists() {
        when(roleDao.getDefaultRole()).thenReturn(null);

        Role result = roleService.getDefaultRole();

        assertThat(result).isNull();
        verify(roleDao, times(1)).getDefaultRole();
    }

    @Test
    void shouldAlwaysReturnSameDefaultRole() {
        when(roleDao.getDefaultRole()).thenReturn(userRole);

        Role result1 = roleService.getDefaultRole();
        Role result2 = roleService.getDefaultRole();
        Role result3 = roleService.getDefaultRole();

        assertThat(result1).isEqualTo(userRole);
        assertThat(result2).isEqualTo(userRole);
        assertThat(result3).isEqualTo(userRole);
        verify(roleDao, times(3)).getDefaultRole();
    }

    @Test
    void shouldReturnDefaultRoleWithAllProperties() {
        Role defaultRole = new Role();
        defaultRole.setRoleCode(1);
        defaultRole.setRoleName("Default User");
        defaultRole.setRoleDescription("Default role for new users");

        when(roleDao.getDefaultRole()).thenReturn(defaultRole);

        Role result = roleService.getDefaultRole();

        assertThat(result).isNotNull();
        assertThat(result.getRoleCode()).isEqualTo(1);
        assertThat(result.getRoleName()).isEqualTo("Default User");
        assertThat(result.getRoleDescription()).isEqualTo("Default role for new users");
        verify(roleDao, times(1)).getDefaultRole();
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindRoleByPrimaryKey() {
        when(roleDao.findByPK(1)).thenReturn(testRole);

        Role result = roleService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRole);
        assertThat(result.getRoleCode()).isEqualTo(1);
        verify(roleDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenRoleNotFoundByPK() {
        when(roleDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> roleService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(roleDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewRole() {
        roleService.persist(testRole);

        verify(roleDao, times(1)).persist(testRole);
    }

    @Test
    void shouldPersistMultipleRoles() {
        roleService.persist(testRole);
        roleService.persist(adminRole);
        roleService.persist(userRole);

        verify(roleDao, times(1)).persist(testRole);
        verify(roleDao, times(1)).persist(adminRole);
        verify(roleDao, times(1)).persist(userRole);
    }

    @Test
    void shouldUpdateExistingRole() {
        when(roleDao.update(testRole)).thenReturn(testRole);

        Role result = roleService.update(testRole);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRole);
        verify(roleDao, times(1)).update(testRole);
    }

    @Test
    void shouldUpdateRoleAndReturnUpdatedEntity() {
        testRole.setRoleName("Updated Role Name");
        testRole.setRoleDescription("Updated Description");
        when(roleDao.update(testRole)).thenReturn(testRole);

        Role result = roleService.update(testRole);

        assertThat(result).isNotNull();
        assertThat(result.getRoleName()).isEqualTo("Updated Role Name");
        assertThat(result.getRoleDescription()).isEqualTo("Updated Description");
        verify(roleDao, times(1)).update(testRole);
    }

    @Test
    void shouldDeleteRole() {
        roleService.delete(testRole);

        verify(roleDao, times(1)).delete(testRole);
    }

    @Test
    void shouldDeleteMultipleRoles() {
        roleService.delete(testRole);
        roleService.delete(adminRole);

        verify(roleDao, times(1)).delete(testRole);
        verify(roleDao, times(1)).delete(adminRole);
    }

    @Test
    void shouldFindRolesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("roleName", "Test Role");

        List<Role> expectedList = Collections.singletonList(testRole);
        when(roleDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Role> result = roleService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testRole);
        verify(roleDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("roleName", "Non-existent Role");

        when(roleDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Role> result = roleService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<Role> result = roleService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<Role> result = roleService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindRolesByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("roleName", "Admin");
        attributes.put("roleCode", 2);

        List<Role> expectedList = Collections.singletonList(adminRole);
        when(roleDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Role> result = roleService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRoleName()).isEqualTo("Admin");
        assertThat(result.get(0).getRoleCode()).isEqualTo(2);
        verify(roleDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleRoleWithMinimalData() {
        Role minimalRole = new Role();
        minimalRole.setRoleCode(99);

        when(roleDao.getRoleById(99)).thenReturn(minimalRole);

        Role result = roleService.getRoleById(99);

        assertThat(result).isNotNull();
        assertThat(result.getRoleCode()).isEqualTo(99);
        assertThat(result.getRoleName()).isNull();
        assertThat(result.getRoleDescription()).isNull();
        verify(roleDao, times(1)).getRoleById(99);
    }

    @Test
    void shouldHandleLargeListOfRoles() {
        List<Role> largeList = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            Role role = new Role();
            role.setRoleCode(i);
            role.setRoleName("Role " + i);
            largeList.add(role);
        }

        when(roleDao.getRoles()).thenReturn(largeList);

        List<Role> result = roleService.getRoles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getRoleName()).isEqualTo("Role 1");
        assertThat(result.get(99).getRoleName()).isEqualTo("Role 100");
        verify(roleDao, times(1)).getRoles();
    }

    @Test
    void shouldHandleRoleWithEmptyStrings() {
        Role emptyRole = new Role();
        emptyRole.setRoleCode(50);
        emptyRole.setRoleName("");
        emptyRole.setRoleDescription("");

        when(roleDao.getRoleById(50)).thenReturn(emptyRole);

        Role result = roleService.getRoleById(50);

        assertThat(result).isNotNull();
        assertThat(result.getRoleName()).isEmpty();
        assertThat(result.getRoleDescription()).isEmpty();
        verify(roleDao, times(1)).getRoleById(50);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        when(roleDao.getRoles()).thenReturn(Arrays.asList(testRole));
        when(roleDao.getRoleById(1)).thenReturn(testRole);
        when(roleDao.getDefaultRole()).thenReturn(userRole);

        roleService.getRoles();
        roleService.getRoleById(1);
        roleService.getDefaultRole();

        verify(roleDao, times(1)).getRoles();
        verify(roleDao, times(1)).getRoleById(1);
        verify(roleDao, times(1)).getDefaultRole();
    }

    @Test
    void shouldHandleConsecutiveCallsToDifferentMethods() {
        when(roleDao.getRoles()).thenReturn(Arrays.asList(testRole, adminRole));
        when(roleDao.getRoleById(1)).thenReturn(testRole);
        when(roleDao.getDefaultRole()).thenReturn(userRole);

        List<Role> roles = roleService.getRoles();
        Role roleById = roleService.getRoleById(1);
        Role defaultRole = roleService.getDefaultRole();

        assertThat(roles).hasSize(2);
        assertThat(roleById).isEqualTo(testRole);
        assertThat(defaultRole).isEqualTo(userRole);
    }
}
