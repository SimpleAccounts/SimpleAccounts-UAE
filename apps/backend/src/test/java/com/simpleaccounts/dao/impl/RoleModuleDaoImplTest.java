package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
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
@DisplayName("RoleModuleDaoImpl Unit Tests")
class RoleModuleDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<SimpleAccountsModules> simpleAccountsModulesQuery;

    @Mock
    private TypedQuery<RoleModuleRelation> roleModuleRelationQuery;

    @InjectMocks
    private RoleModuleDaoImpl roleModuleDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(roleModuleDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(roleModuleDao, "entityClass", SimpleAccountsModules.class);
    }

    @Test
    @DisplayName("Should return list of all SimpleAccountsModules")
    void getListOfSimpleAccountsModulesReturnsAllModules() {
        // Arrange
        List<SimpleAccountsModules> expectedModules = createSimpleAccountsModulesList(5);
        when(entityManager.createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class))
            .thenReturn(simpleAccountsModulesQuery);
        when(simpleAccountsModulesQuery.getResultList())
            .thenReturn(expectedModules);

        // Act
        List<SimpleAccountsModules> result = roleModuleDao.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(expectedModules);
    }

    @Test
    @DisplayName("Should return empty list when no modules exist")
    void getListOfSimpleAccountsModulesReturnsEmptyList() {
        // Arrange
        when(entityManager.createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class))
            .thenReturn(simpleAccountsModulesQuery);
        when(simpleAccountsModulesQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<SimpleAccountsModules> result = roleModuleDao.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use named query listOfSimpleAccountsModules")
    void getListOfSimpleAccountsModulesUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class))
            .thenReturn(simpleAccountsModulesQuery);
        when(simpleAccountsModulesQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getListOfSimpleAccountsModules();

        // Assert
        verify(entityManager).createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class);
    }

    @Test
    @DisplayName("Should return module list by role code")
    void getModuleListByRoleCodeReturnsModuleList() {
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
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedRelations);
    }

    @Test
    @DisplayName("Should return empty list when no modules found for role code")
    void getModuleListByRoleCodeReturnsEmptyListWhenNoModules() {
        // Arrange
        Integer roleCode = 999;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result list is null for role code")
    void getModuleListByRoleCodeReturnsEmptyListWhenNull() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(null);

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should set roleCode parameter correctly")
    void getModuleListByRoleCodeSetsRoleCodeParameter() {
        // Arrange
        Integer roleCode = 5;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationQuery).setParameter("roleCode", roleCode);
    }

    @Test
    @DisplayName("Should return module list by role code and module id")
    void getModuleListByRoleCodeAndModuleIdReturnsModuleList() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 10;
        List<RoleModuleRelation> expectedRelations = createRoleModuleRelationList(2, roleCode);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).isEqualTo(expectedRelations);
    }

    @Test
    @DisplayName("Should return empty list when no modules found for role code and module id")
    void getModuleListByRoleCodeAndModuleIdReturnsEmptyListWhenNoModules() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 999;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result list is null for role code and module id")
    void getModuleListByRoleCodeAndModuleIdReturnsEmptyListWhenNull() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 10;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(null);

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should set both roleCode and simpleAccountsModule parameters")
    void getModuleListByRoleCodeAndModuleIdSetsBothParameters() {
        // Arrange
        Integer roleCode = 3;
        Integer moduleId = 15;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        verify(roleModuleRelationQuery).setParameter("roleCode", roleCode);
        verify(roleModuleRelationQuery).setParameter("simpleAccountsModule", moduleId);
    }

    @Test
    @DisplayName("Should create query with correct JPQL for role code only")
    void getModuleListByRoleCodeCreatesCorrectQuery() {
        // Arrange
        Integer roleCode = 1;
        String expectedQuery = "SELECT rm FROM RoleModuleRelation rm ,SimpleAccountsModules sm,Role r WHERE sm.simpleAccountsModuleId =" +
                "rm.simpleAccountsModule.simpleAccountsModuleId AND r.roleCode=rm.role.roleCode AND rm.role.roleCode=:roleCode AND r.deleteFlag=false ORDER BY rm.simpleAccountsModule.orderSequence ASC ";

        when(entityManager.createQuery(eq(expectedQuery), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        verify(entityManager).createQuery(eq(expectedQuery), eq(RoleModuleRelation.class));
    }

    @Test
    @DisplayName("Should create query with correct JPQL for role code and module id")
    void getModuleListByRoleCodeAndModuleIdCreatesCorrectQuery() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 10;
        String expectedQuery = "SELECT rm FROM RoleModuleRelation rm ,SimpleAccountsModules sm,Role r WHERE sm.simpleAccountsModuleId =" +
                "rm.simpleAccountsModule.simpleAccountsModuleId AND r.roleCode=rm.role.roleCode AND rm.role.roleCode=:roleCode" +
                " AND rm.simpleAccountsModule.simpleAccountsModuleId=:simpleAccountsModule";

        when(entityManager.createQuery(eq(expectedQuery), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        verify(entityManager).createQuery(eq(expectedQuery), eq(RoleModuleRelation.class));
    }

    @Test
    @DisplayName("Should handle single module relation")
    void getModuleListByRoleCodeHandlesSingleRelation() {
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
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should handle multiple module relations")
    void getModuleListByRoleCodeHandlesMultipleRelations() {
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
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should call getResultList exactly once for single parameter method")
    void getModuleListByRoleCodeCallsGetResultListOnce() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call getResultList exactly once for two parameter method")
    void getModuleListByRoleCodeAndModuleIdCallsGetResultListOnce() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 10;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        verify(roleModuleRelationQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should return different results for different role codes")
    void getModuleListByRoleCodeReturnsDifferentResultsForDifferentRoles() {
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
        List<RoleModuleRelation> result1 = roleModuleDao.getModuleListByRoleCode(roleCode1);
        List<RoleModuleRelation> result2 = roleModuleDao.getModuleListByRoleCode(roleCode2);

        // Assert
        assertThat(result1).hasSize(3);
        assertThat(result2).hasSize(2);
    }

    @Test
    @DisplayName("Should verify query is ordered by orderSequence ASC")
    void getModuleListByRoleCodeVerifiesOrderByClause() {
        // Arrange
        Integer roleCode = 1;
        String queryWithOrderBy = "SELECT rm FROM RoleModuleRelation rm ,SimpleAccountsModules sm,Role r WHERE sm.simpleAccountsModuleId =" +
                "rm.simpleAccountsModule.simpleAccountsModuleId AND r.roleCode=rm.role.roleCode AND rm.role.roleCode=:roleCode AND r.deleteFlag=false ORDER BY rm.simpleAccountsModule.orderSequence ASC ";

        when(entityManager.createQuery(eq(queryWithOrderBy), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        verify(entityManager).createQuery(eq(queryWithOrderBy), eq(RoleModuleRelation.class));
    }

    @Test
    @DisplayName("Should filter by deleteFlag equals false")
    void getModuleListByRoleCodeFiltersDeletedRoles() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        verify(entityManager).createQuery(
            org.mockito.ArgumentMatchers.contains("r.deleteFlag=false"),
            eq(RoleModuleRelation.class)
        );
    }

    @Test
    @DisplayName("Should handle zero roleCode")
    void getModuleListByRoleCodeHandlesZeroRoleCode() {
        // Arrange
        Integer roleCode = 0;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle zero moduleId")
    void getModuleListByRoleCodeAndModuleIdHandlesZeroModuleId() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 0;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("roleCode", roleCode))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(roleModuleRelationQuery);
        when(roleModuleRelationQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return ordered modules list")
    void getListOfSimpleAccountsModulesReturnsOrderedList() {
        // Arrange
        SimpleAccountsModules module1 = createSimpleAccountsModule(1, "Module 1", 1);
        SimpleAccountsModules module2 = createSimpleAccountsModule(2, "Module 2", 2);
        SimpleAccountsModules module3 = createSimpleAccountsModule(3, "Module 3", 3);
        List<SimpleAccountsModules> expectedModules = Arrays.asList(module1, module2, module3);

        when(entityManager.createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class))
            .thenReturn(simpleAccountsModulesQuery);
        when(simpleAccountsModulesQuery.getResultList())
            .thenReturn(expectedModules);

        // Act
        List<SimpleAccountsModules> result = roleModuleDao.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getOrderSequence()).isEqualTo(1);
        assertThat(result.get(1).getOrderSequence()).isEqualTo(2);
        assertThat(result.get(2).getOrderSequence()).isEqualTo(3);
    }

    private List<SimpleAccountsModules> createSimpleAccountsModulesList(int count) {
        List<SimpleAccountsModules> modules = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            modules.add(createSimpleAccountsModule(i + 1, "Module " + (i + 1), i + 1));
        }
        return modules;
    }

    private SimpleAccountsModules createSimpleAccountsModule(Integer id, String name, Integer orderSequence) {
        SimpleAccountsModules module = new SimpleAccountsModules();
        module.setSimpleAccountsModuleId(id);
        module.setSimpleAccountsModuleName(name);
        module.setOrderSequence(orderSequence);
        return module;
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
        relation.setRole(role);

        SimpleAccountsModules module = createSimpleAccountsModule(id, "Module " + id, id);
        relation.setSimpleAccountsModule(module);

        return relation;
    }
}
