package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
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
@DisplayName("RoleModuleRelationDaoImpl Unit Tests")
class RoleModuleRelationDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<RoleModuleRelation> relationTypedQuery;

    @InjectMocks
    private RoleModuleRelationDaoImpl roleModuleRelationDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(roleModuleRelationDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(roleModuleRelationDao, "entityClass", RoleModuleRelation.class);
    }

    @Test
    @DisplayName("Should return role module relations by role code")
    void getRoleModuleRelationByRoleCodeReturnsList() {
        // Arrange
        Integer roleCode = 1;
        List<RoleModuleRelation> expectedRelations = createRoleModuleRelationList(5, roleCode);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().hasSize(5);
    }

    @Test
    @DisplayName("Should return empty list when role has no relations")
    void getRoleModuleRelationByRoleCodeReturnsEmptyList() {
        // Arrange
        Integer roleCode = 999;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result is null")
    void getRoleModuleRelationByRoleCodeReturnsEmptyListWhenNull() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return list of modules for all roles")
    void getListOfSimpleAccountsModulesForAllRolesReturnsList() {
        // Arrange
        List<RoleModuleRelation> expectedRelations = Arrays.asList(
            createRoleModuleRelation(1, 1, 1, "Module A"),
            createRoleModuleRelation(2, 1, 2, "Module B"),
            createRoleModuleRelation(3, 2, 1, "Module A"),
            createRoleModuleRelation(4, 2, 3, "Module C")
        );

        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).isNotNull().hasSize(4);
    }

    @Test
    @DisplayName("Should return empty list when no modules for all roles")
    void getListOfSimpleAccountsModulesForAllRolesReturnsEmptyList() {
        // Arrange
        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query for all roles")
    void getListOfSimpleAccountsModulesForAllRolesUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        verify(entityManager).createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class);
    }

    @Test
    @DisplayName("Should delete relations by role code")
    void deleteByRoleCodeCreatesDeleteQuery() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);

        // Act
        roleModuleRelationDao.deleteByRoleCode(roleCode);

        // Assert
        verify(relationTypedQuery).setParameter("roleCode", roleCode);
    }

    @Test
    @DisplayName("Should find relation by primary key")
    void findByPKReturnsRelation() {
        // Arrange
        Integer relationId = 1;
        RoleModuleRelation expectedRelation = createRoleModuleRelation(relationId, 1, 1, "Test Module");

        when(entityManager.find(RoleModuleRelation.class, relationId))
            .thenReturn(expectedRelation);

        // Act
        RoleModuleRelation result = roleModuleRelationDao.findByPK(relationId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(relationId);
    }

    @Test
    @DisplayName("Should return null when relation not found")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer relationId = 999;

        when(entityManager.find(RoleModuleRelation.class, relationId))
            .thenReturn(null);

        // Act
        RoleModuleRelation result = roleModuleRelationDao.findByPK(relationId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle admin role with all modules")
    void getRoleModuleRelationByRoleCodeHandlesAdminRole() {
        // Arrange
        Integer adminRoleCode = 1;
        List<RoleModuleRelation> allModules = createRoleModuleRelationList(15, adminRoleCode);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", adminRoleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(allModules);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(adminRoleCode);

        // Assert
        assertThat(result).hasSize(15);
    }

    @Test
    @DisplayName("Should handle user role with limited modules")
    void getRoleModuleRelationByRoleCodeHandlesUserRole() {
        // Arrange
        Integer userRoleCode = 2;
        List<RoleModuleRelation> limitedModules = createRoleModuleRelationList(3, userRoleCode);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", userRoleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(limitedModules);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(userRoleCode);

        // Assert
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return relations with correct role codes")
    void getRoleModuleRelationByRoleCodeReturnsCorrectRoles() {
        // Arrange
        Integer roleCode = 3;
        List<RoleModuleRelation> relations = createRoleModuleRelationList(4, roleCode);

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(relations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).allMatch(r -> r.getRole().getRoleCode().equals(roleCode));
    }

    @Test
    @DisplayName("Should return single relation when role has one module")
    void getRoleModuleRelationByRoleCodeReturnsSingleRelation() {
        // Arrange
        Integer roleCode = 5;
        List<RoleModuleRelation> relations = Collections.singletonList(
            createRoleModuleRelation(1, roleCode, 1, "Only Module")
        );

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(relations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSimpleAccountsModule().getSimpleAccountsModuleName()).isEqualTo("Only Module");
    }

    @Test
    @DisplayName("Should persist new relation")
    void persistRelationPersistsEntity() {
        // Arrange
        RoleModuleRelation relation = createRoleModuleRelation(100, 1, 1, "New Module");

        // Act
        roleModuleRelationDao.getEntityManager().persist(relation);

        // Assert
        verify(entityManager).persist(relation);
    }

    @Test
    @DisplayName("Should update existing relation")
    void updateRelationMergesEntity() {
        // Arrange
        RoleModuleRelation relation = createRoleModuleRelation(1, 1, 1, "Updated Module");
        when(entityManager.merge(relation)).thenReturn(relation);

        // Act
        RoleModuleRelation result = roleModuleRelationDao.update(relation);

        // Assert
        verify(entityManager).merge(relation);
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should delete relation")
    void deleteRelationRemovesEntity() {
        // Arrange
        RoleModuleRelation relation = createRoleModuleRelation(1, 1, 1, "Delete Module");
        when(entityManager.contains(relation)).thenReturn(true);

        // Act
        roleModuleRelationDao.delete(relation);

        // Assert
        verify(entityManager).remove(relation);
    }

    @Test
    @DisplayName("Should handle large number of relations")
    void getListOfSimpleAccountsModulesForAllRolesHandlesLargeList() {
        // Arrange
        List<RoleModuleRelation> largeList = createLargeRelationList(100);

        when(entityManager.createNamedQuery("getListOfSimpleAccountsModulesForAllRoles", RoleModuleRelation.class))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(largeList);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).hasSize(100);
    }

    private RoleModuleRelation createRoleModuleRelation(Integer id, Integer roleCode, Integer moduleId, String moduleName) {
        RoleModuleRelation relation = new RoleModuleRelation();
        relation.setId(id);

        Role role = new Role();
        role.setRoleCode(roleCode);
        role.setRoleName("Role " + roleCode);
        relation.setRole(role);

        SimpleAccountsModules module = new SimpleAccountsModules();
        module.setSimpleAccountsModuleId(moduleId);
        module.setSimpleAccountsModuleName(moduleName);
        relation.setSimpleAccountsModule(module);

        return relation;
    }

    private List<RoleModuleRelation> createRoleModuleRelationList(int count, Integer roleCode) {
        List<RoleModuleRelation> relations = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            relations.add(createRoleModuleRelation(i + 1, roleCode, i + 1, "Module " + (i + 1)));
        }
        return relations;
    }

    private List<RoleModuleRelation> createLargeRelationList(int count) {
        List<RoleModuleRelation> relations = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            int roleCode = (i % 5) + 1;
            relations.add(createRoleModuleRelation(i + 1, roleCode, i + 1, "Module " + (i + 1)));
        }
        return relations;
    }
}
