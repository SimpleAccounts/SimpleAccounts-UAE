package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Role;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoleDaoImpl Unit Tests")
class RoleDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Role> roleTypedQuery;

    @InjectMocks
    private RoleDaoImpl roleDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(roleDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(roleDao, "entityClass", Role.class);
    }

    @Test
    @DisplayName("Should return all roles using named query")
    void getRolesReturnsAllRoles() {
        // Arrange
        List<Role> roles = createRoleList(5);
        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(roles);

        // Act
        List<Role> result = roleDao.getRoles();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(roles);
    }

    @Test
    @DisplayName("Should return empty list when no roles exist")
    void getRolesReturnsEmptyListWhenNoRoles() {
        // Arrange
        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Role> result = roleDao.getRoles();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use Role.FindAllRole named query")
    void getRolesUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleDao.getRoles();

        // Assert
        verify(entityManager).createNamedQuery("Role.FindAllRole", Role.class);
    }

    @Test
    @DisplayName("Should return role by ID")
    void getRoleByIdReturnsRole() {
        // Arrange
        Integer roleCode = 1;
        Role role = createRole(roleCode, "Admin");
        when(entityManager.find(Role.class, roleCode))
            .thenReturn(role);

        // Act
        Role result = roleDao.getRoleById(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRoleCode()).isEqualTo(roleCode);
        assertThat(result.getRoleName()).isEqualTo("Admin");
    }

    @Test
    @DisplayName("Should return null when role not found by ID")
    void getRoleByIdReturnsNullWhenNotFound() {
        // Arrange
        Integer roleCode = 999;
        when(entityManager.find(Role.class, roleCode))
            .thenReturn(null);

        // Act
        Role result = roleDao.getRoleById(roleCode);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should call entityManager find with correct parameters")
    void getRoleByIdCallsEntityManagerFind() {
        // Arrange
        Integer roleCode = 5;
        when(entityManager.find(Role.class, roleCode))
            .thenReturn(null);

        // Act
        roleDao.getRoleById(roleCode);

        // Assert
        verify(entityManager).find(Role.class, roleCode);
    }

    @Test
    @DisplayName("Should return default role when roles exist")
    void getDefaultRoleReturnsFirstRole() {
        // Arrange
        List<Role> roles = createRoleList(3);
        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(roles);

        // Act
        Role result = roleDao.getDefaultRole();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(roles.get(0));
    }

    @Test
    @DisplayName("Should return null when no roles exist for default role")
    void getDefaultRoleReturnsNullWhenNoRoles() {
        // Arrange
        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Role result = roleDao.getDefaultRole();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when role list is null for default role")
    void getDefaultRoleReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        Role result = roleDao.getDefaultRole();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should call getRoles when getting default role")
    void getDefaultRoleCallsGetRoles() {
        // Arrange
        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleDao.getDefaultRole();

        // Assert
        verify(entityManager, times(2)).createNamedQuery("Role.FindAllRole", Role.class);
    }

    @Test
    @DisplayName("Should verify role entity structure")
    void roleEntityHasCorrectStructure() {
        // Arrange
        Role role = createRole(1, "Administrator");
        role.setRoleDescription("System Administrator");
        role.setDefaultFlag('Y');
        role.setOrderSequence(1);

        // Assert
        assertThat(role.getRoleCode()).isEqualTo(1);
        assertThat(role.getRoleName()).isEqualTo("Administrator");
        assertThat(role.getRoleDescription()).isEqualTo("System Administrator");
        assertThat(role.getDefaultFlag()).isEqualTo('Y');
        assertThat(role.getOrderSequence()).isEqualTo(1);
        assertThat(role.getDeleteFlag()).isFalse();
        assertThat(role.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should return first role from multiple roles for default")
    void getDefaultRoleReturnsFirstFromMultiple() {
        // Arrange
        Role role1 = createRole(1, "Admin");
        Role role2 = createRole(2, "User");
        Role role3 = createRole(3, "Manager");
        List<Role> roles = Arrays.asList(role1, role2, role3);

        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(roles);

        // Act
        Role result = roleDao.getDefaultRole();

        // Assert
        assertThat(result).isEqualTo(role1);
        assertThat(result.getRoleName()).isEqualTo("Admin");
    }

    @Test
    @DisplayName("Should return single role when only one exists")
    void getRolesReturnsSingleRole() {
        // Arrange
        Role role = createRole(1, "Admin");
        List<Role> roles = Collections.singletonList(role);

        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(roles);

        // Act
        List<Role> result = roleDao.getRoles();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(role);
    }

    @Test
    @DisplayName("Should handle role with default flag Y")
    void roleWithDefaultFlagYIsHandled() {
        // Arrange
        Role role = createRole(1, "Default Role");
        role.setDefaultFlag('Y');

        when(entityManager.find(Role.class, 1))
            .thenReturn(role);

        // Act
        Role result = roleDao.getRoleById(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getDefaultFlag()).isEqualTo('Y');
    }

    @Test
    @DisplayName("Should handle role with default flag N")
    void roleWithDefaultFlagNIsHandled() {
        // Arrange
        Role role = createRole(2, "Regular Role");
        role.setDefaultFlag('N');

        when(entityManager.find(Role.class, 2))
            .thenReturn(role);

        // Act
        Role result = roleDao.getRoleById(2);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getDefaultFlag()).isEqualTo('N');
    }

    @Test
    @DisplayName("Should maintain active flag as true for new roles")
    void newRoleHasActiveFlagTrue() {
        // Arrange & Act
        Role role = createRole(100, "New Role");

        // Assert
        assertThat(role.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should maintain delete flag as false for new roles")
    void newRoleHasDeleteFlagFalse() {
        // Arrange & Act
        Role role = createRole(100, "New Role");

        // Assert
        assertThat(role.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should call named query exactly once for getRoles")
    void getRolesCallsNamedQueryOnce() {
        // Arrange
        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleDao.getRoles();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("Role.FindAllRole", Role.class);
    }

    @Test
    @DisplayName("Should handle roles with order sequence")
    void rolesWithOrderSequenceAreHandled() {
        // Arrange
        Role role1 = createRole(1, "First");
        role1.setOrderSequence(1);
        Role role2 = createRole(2, "Second");
        role2.setOrderSequence(2);
        List<Role> roles = Arrays.asList(role1, role2);

        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(roles);

        // Act
        List<Role> result = roleDao.getRoles();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getOrderSequence()).isEqualTo(1);
        assertThat(result.get(1).getOrderSequence()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should return role with correct version number")
    void roleHasCorrectVersionNumber() {
        // Arrange
        Role role = createRole(1, "Admin");
        role.setVersionNumber(1);

        when(entityManager.find(Role.class, 1))
            .thenReturn(role);

        // Act
        Role result = roleDao.getRoleById(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getVersionNumber()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should handle multiple role codes")
    void getRoleByIdHandlesMultipleRoleCodes() {
        // Arrange
        Role role1 = createRole(1, "Admin");
        Role role2 = createRole(2, "User");
        Role role3 = createRole(3, "Manager");

        when(entityManager.find(Role.class, 1)).thenReturn(role1);
        when(entityManager.find(Role.class, 2)).thenReturn(role2);
        when(entityManager.find(Role.class, 3)).thenReturn(role3);

        // Act
        Role result1 = roleDao.getRoleById(1);
        Role result2 = roleDao.getRoleById(2);
        Role result3 = roleDao.getRoleById(3);

        // Assert
        assertThat(result1.getRoleName()).isEqualTo("Admin");
        assertThat(result2.getRoleName()).isEqualTo("User");
        assertThat(result3.getRoleName()).isEqualTo("Manager");
    }

    @Test
    @DisplayName("Should verify findByPK is used for getRoleById")
    void getRoleByIdUsesFindByPK() {
        // Arrange
        Integer roleCode = 10;
        Role role = createRole(roleCode, "Test Role");
        when(entityManager.find(Role.class, roleCode))
            .thenReturn(role);

        // Act
        Role result = roleDao.getRoleById(roleCode);

        // Assert
        assertThat(result).isNotNull();
        verify(entityManager).find(Role.class, roleCode);
    }

    @Test
    @DisplayName("Should handle empty role description")
    void roleWithEmptyDescriptionIsHandled() {
        // Arrange
        Role role = createRole(1, "Admin");
        role.setRoleDescription("");

        when(entityManager.find(Role.class, 1))
            .thenReturn(role);

        // Act
        Role result = roleDao.getRoleById(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRoleDescription()).isEmpty();
    }

    @Test
    @DisplayName("Should handle null role description")
    void roleWithNullDescriptionIsHandled() {
        // Arrange
        Role role = createRole(1, "Admin");
        role.setRoleDescription(null);

        when(entityManager.find(Role.class, 1))
            .thenReturn(role);

        // Act
        Role result = roleDao.getRoleById(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRoleDescription()).isNull();
    }

    @Test
    @DisplayName("Should verify default role returns first from ordered list")
    void getDefaultRoleReturnsFirstFromOrderedList() {
        // Arrange
        Role defaultRole = createRole(1, "Default");
        defaultRole.setDefaultFlag('Y');
        defaultRole.setOrderSequence(1);

        Role regularRole = createRole(2, "Regular");
        regularRole.setDefaultFlag('N');
        regularRole.setOrderSequence(2);

        List<Role> roles = Arrays.asList(defaultRole, regularRole);

        when(entityManager.createNamedQuery("Role.FindAllRole", Role.class))
            .thenReturn(roleTypedQuery);
        when(roleTypedQuery.getResultList())
            .thenReturn(roles);

        // Act
        Role result = roleDao.getDefaultRole();

        // Assert
        assertThat(result).isEqualTo(defaultRole);
        assertThat(result.getDefaultFlag()).isEqualTo('Y');
    }

    private List<Role> createRoleList(int count) {
        List<Role> roles = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            roles.add(createRole(i + 1, "Role " + (i + 1)));
        }
        return roles;
    }

    private Role createRole(int code, String name) {
        Role role = new Role();
        role.setRoleCode(code);
        role.setRoleName(name);
        role.setDeleteFlag(Boolean.FALSE);
        role.setIsActive(Boolean.TRUE);
        role.setDefaultFlag('N');
        role.setVersionNumber(1);
        return role;
    }
}
