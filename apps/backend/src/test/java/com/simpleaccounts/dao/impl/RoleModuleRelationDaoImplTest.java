package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import java.util.ArrayList;
import java.util.Arrays;
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
@DisplayName("RoleModuleRelationDaoImpl Unit Tests")
class RoleModuleRelationDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<RoleModuleRelation> roleModuleRelationQuery;

    @InjectMocks
    private RoleModuleRelationDaoImpl roleModuleRelationDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(roleModuleRelationDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(roleModuleRelationDao, "entityClass", RoleModuleRelation.class);
    }

    @Test
    @DisplayName("Should return role module relations by role code")
    void getRoleModuleRelationByRoleCodeReturnsRelations() {
        // Arrange
        Integer roleCode = 1;
        List<RoleModuleRelation> expectedRelations = createRoleModuleRelationList(3, roleCode);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedRelations);
    }

    @Test
    @DisplayName("Should return empty list when no relations found for role code")
    void getRoleModuleRelationByRoleCodeReturnsEmptyListWhenNoRelations() {
        // Arrange
        Integer roleCode = 999;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result list is null")
    void getRoleModuleRelationByRoleCodeReturnsEmptyListWhenNull() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(null);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should set roleCode parameter correctly")
    void getRoleModuleRelationByRoleCodeSetsRoleCodeParameter() {
        // Arrange
        Integer roleCode = 5;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationQuery).setParameter("roleCode", roleCode);
    }

    @Test
    @DisplayName("Should create query with correct JPQL")
    void getRoleModuleRelationByRoleCodeCreatesCorrectQuery() {
        // Arrange
        Integer roleCode = 1;
        String expectedQuery = " SELECT rm FROM RoleModuleRelation rm WHERE rm.role.roleCode=:roleCode";

        when(entityManager.createQuery(eq(expectedQuery), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        verify(entityManager).createQuery(eq(expectedQuery), eq(RoleModuleRelation.class));
    }

    @Test
    @DisplayName("Should handle single role module relation")
    void getRoleModuleRelationByRoleCodeHandlesSingleRelation() {
        // Arrange
        Integer roleCode = 1;
        List<RoleModuleRelation> expectedRelations = createRoleModuleRelationList(1, roleCode);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should handle multiple role module relations")
    void getRoleModuleRelationByRoleCodeHandlesMultipleRelations() {
        // Arrange
        Integer roleCode = 1;
        List<RoleModuleRelation> expectedRelations = createRoleModuleRelationList(10, roleCode);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should call getResultList exactly once")
    void getRoleModuleRelationByRoleCodeCallsGetResultListOnce() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should return different results for different role codes")
    void getRoleModuleRelationByRoleCodeReturnsDifferentResultsForDifferentRoles() {
        // Arrange
        Integer roleCode1 = 1;
        Integer roleCode2 = 2;
        List<RoleModuleRelation> relations1 = createRoleModuleRelationList(3, roleCode1);
        List<RoleModuleRelation> relations2 = createRoleModuleRelationList(2, roleCode2);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode1))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode2))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(relations1)
            .thenReturn(relations2);

        // Act
        List<RoleModuleRelation> result1 = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode1);
        List<RoleModuleRelation> result2 = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode2);

        // Assert
        assertThat(result1).hasSize(3);
        assertThat(result2).hasSize(2);
    }

    @Test
    @DisplayName("Should handle zero roleCode")
    void getRoleModuleRelationByRoleCodeHandlesZeroRoleCode() {
        // Arrange
        Integer roleCode = 0;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return list of simple accounts modules for all roles")
    void getListOfSimpleAccountsModulesForAllRolesReturnsModules() {
        // Arrange
        List<RoleModuleRelation> expectedRelations = createRoleModuleRelationList(5, 1);

        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedRelations);
    }

    @Test
    @DisplayName("Should return empty list when no modules for all roles")
    void getListOfSimpleAccountsModulesForAllRolesReturnsEmptyList() {
        // Arrange
        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use named query for all roles modules")
    void getListOfSimpleAccountsModulesForAllRolesUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        verify(entityManager).createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class);
    }

    @Test
    @DisplayName("Should handle large list of modules for all roles")
    void getListOfSimpleAccountsModulesForAllRolesHandlesLargeList() {
        // Arrange
        List<RoleModuleRelation> expectedRelations = createRoleModuleRelationList(100, 1);

        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should delete by role code")
    void deleteByRoleCodeExecutesDeleteQuery() {
        // Arrange
        Integer roleCode = 1;
        String expectedQuery = " DELETE  FROM RoleModuleRelation  WHERE role.roleCode=:roleCode";

        when(entityManager.createQuery(eq(expectedQuery), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);

        // Act
        roleModuleRelationDao.deleteByRoleCode(roleCode);

        // Assert
        verify(entityManager).createQuery(eq(expectedQuery), eq(RoleModuleRelation.class));
        verify(roleModuleRelationQuery).setParameter("roleCode", roleCode);
    }

    @Test
    @DisplayName("Should set roleCode parameter for delete query")
    void deleteByRoleCodeSetsRoleCodeParameter() {
        // Arrange
        Integer roleCode = 5;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);

        // Act
        roleModuleRelationDao.deleteByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationQuery).setParameter("roleCode", roleCode);
    }

    @Test
    @DisplayName("Should create delete query with correct JPQL")
    void deleteByRoleCodeCreatesCorrectDeleteQuery() {
        // Arrange
        Integer roleCode = 1;
        String expectedQuery = " DELETE  FROM RoleModuleRelation  WHERE role.roleCode=:roleCode";

        when(entityManager.createQuery(eq(expectedQuery), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);

        // Act
        roleModuleRelationDao.deleteByRoleCode(roleCode);

        // Assert
        verify(entityManager).createQuery(eq(expectedQuery), eq(RoleModuleRelation.class));
    }

    @Test
    @DisplayName("Should handle delete with zero roleCode")
    void deleteByRoleCodeHandlesZeroRoleCode() {
        // Arrange
        Integer roleCode = 0;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);

        // Act
        roleModuleRelationDao.deleteByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationQuery).setParameter("roleCode", roleCode);
    }

    @Test
    @DisplayName("Should handle delete with negative roleCode")
    void deleteByRoleCodeHandlesNegativeRoleCode() {
        // Arrange
        Integer roleCode = -1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);

        // Act
        roleModuleRelationDao.deleteByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationQuery).setParameter("roleCode", roleCode);
    }

    @Test
    @DisplayName("Should verify relation contains role and module")
    void roleModuleRelationContainsRoleAndModule() {
        // Arrange
        Integer roleCode = 1;
        RoleModuleRelation relation = createRoleModuleRelation(1, roleCode);

        // Assert
        assertThat(relation.getRole()).isNotNull();
        assertThat(relation.getRole().getRoleCode()).isEqualTo(roleCode);
        assertThat(relation.getSimpleAccountsModule()).isNotNull();
    }

    @Test
    @DisplayName("Should return modules for multiple different roles")
    void getListOfSimpleAccountsModulesForAllRolesReturnsModulesForMultipleRoles() {
        // Arrange
        RoleModuleRelation relation1 = createRoleModuleRelation(1, 1);
        RoleModuleRelation relation2 = createRoleModuleRelation(2, 2);
        RoleModuleRelation relation3 = createRoleModuleRelation(3, 3);
        List<RoleModuleRelation> expectedRelations = Arrays.asList(relation1, relation2, relation3);

        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getRole().getRoleCode()).isEqualTo(1);
        assertThat(result.get(1).getRole().getRoleCode()).isEqualTo(2);
        assertThat(result.get(2).getRole().getRoleCode()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should call createQuery exactly once for getRoleModuleRelationByRoleCode")
    void getRoleModuleRelationByRoleCodeCallsCreateQueryOnce() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        verify(entityManager, times(1)).createQuery(anyString(), eq(RoleModuleRelation.class));
    }

    @Test
    @DisplayName("Should call createNamedQuery exactly once for all roles modules")
    void getListOfSimpleAccountsModulesForAllRolesCallsCreateNamedQueryOnce() {
        // Arrange
        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class);
    }

    @Test
    @DisplayName("Should call createQuery exactly once for deleteByRoleCode")
    void deleteByRoleCodeCallsCreateQueryOnce() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);

        // Act
        roleModuleRelationDao.deleteByRoleCode(roleCode);

        // Assert
        verify(entityManager, times(1)).createQuery(anyString(), eq(RoleModuleRelation.class));
    }

    private List<RoleModuleRelation> createRoleModuleRelationList(int count, Integer roleCode) {
        List<RoleModuleRelation> relations = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            relations.add(createRoleModuleRelation(i + 1, roleCode));
        }
        return relations;
    }

    private RoleModuleRelation createRoleModuleRelation(Integer id, Integer roleCode) {
        RoleModuleRelation relation = new RoleModuleRelation();
        relation.setRoleModuleRelationId(id);

        Role role = new Role();
        role.setRoleCode(roleCode);
        role.setRoleName("Role " + roleCode);
        relation.setRole(role);

        SimpleAccountsModules module = new SimpleAccountsModules();
        module.setSimpleAccountsModuleId(id);
        module.setSimpleAccountsModuleName("Module " + id);
        module.setOrderSequence(id);
        relation.setSimpleAccountsModule(module);

        return relation;
    }
}
