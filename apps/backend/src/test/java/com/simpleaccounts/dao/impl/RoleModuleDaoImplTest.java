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
@DisplayName("RoleModuleDaoImpl Unit Tests")
class RoleModuleDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<SimpleAccountsModules> moduleTypedQuery;

    @Mock
    private TypedQuery<RoleModuleRelation> relationTypedQuery;

    @InjectMocks
    private RoleModuleDaoImpl roleModuleDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(roleModuleDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(roleModuleDao, "entityClass", SimpleAccountsModules.class);
    }

    @Test
    @DisplayName("Should return list of SimpleAccounts modules")
    void getListOfSimpleAccountsModulesReturnsList() {
        // Arrange
        List<SimpleAccountsModules> expectedModules = Arrays.asList(
            createModule(1, "Invoicing"),
            createModule(2, "Banking"),
            createModule(3, "Payroll")
        );

        when(entityManager.createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class))
            .thenReturn(moduleTypedQuery);
        when(moduleTypedQuery.getResultList())
            .thenReturn(expectedModules);

        // Act
        List<SimpleAccountsModules> result = roleModuleDao.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result).isNotNull().hasSize(3);
    }

    @Test
    @DisplayName("Should return empty list when no modules exist")
    void getListOfSimpleAccountsModulesReturnsEmptyList() {
        // Arrange
        when(entityManager.createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class))
            .thenReturn(moduleTypedQuery);
        when(moduleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<SimpleAccountsModules> result = roleModuleDao.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should use correct named query for modules")
    void getListOfSimpleAccountsModulesUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class))
            .thenReturn(moduleTypedQuery);
        when(moduleTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        roleModuleDao.getListOfSimpleAccountsModules();

        // Assert
        verify(entityManager).createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class);
    }

    @Test
    @DisplayName("Should return module list by role code")
    void getModuleListByRoleCodeReturnsList() {
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
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().hasSize(5);
    }

    @Test
    @DisplayName("Should return empty list when role has no modules")
    void getModuleListByRoleCodeReturnsEmptyList() {
        // Arrange
        Integer roleCode = 999;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result list is null")
    void getModuleListByRoleCodeReturnsEmptyListWhenNull() {
        // Arrange
        Integer roleCode = 1;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return module list by role code and module ID")
    void getModuleListByRoleCodeAndModuleIdReturnsList() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 5;
        List<RoleModuleRelation> expectedRelations = Collections.singletonList(
            createRoleModuleRelation(1, roleCode, moduleId)
        );

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        assertThat(result).isNotNull().hasSize(1);
    }

    @Test
    @DisplayName("Should return empty list when role module combination not found")
    void getModuleListByRoleCodeAndModuleIdReturnsEmptyList() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 999;

        when(entityManager.createQuery(anyString(), eq(RoleModuleRelation.class)))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("roleCode", roleCode))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.setParameter("simpleAccountsModule", moduleId))
            .thenReturn(relationTypedQuery);
        when(relationTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should find module by primary key")
    void findByPKReturnsModule() {
        // Arrange
        Integer moduleId = 1;
        SimpleAccountsModules expectedModule = createModule(moduleId, "Test Module");

        when(entityManager.find(SimpleAccountsModules.class, moduleId))
            .thenReturn(expectedModule);

        // Act
        SimpleAccountsModules result = roleModuleDao.findByPK(moduleId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getSimpleAccountsModuleId()).isEqualTo(moduleId);
    }

    @Test
    @DisplayName("Should return null when module not found")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer moduleId = 999;

        when(entityManager.find(SimpleAccountsModules.class, moduleId))
            .thenReturn(null);

        // Act
        SimpleAccountsModules result = roleModuleDao.findByPK(moduleId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle admin role with all modules")
    void getModuleListByRoleCodeHandlesAdminRole() {
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
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(adminRoleCode);

        // Assert
        assertThat(result).hasSize(15);
    }

    @Test
    @DisplayName("Should handle user role with limited modules")
    void getModuleListByRoleCodeHandlesUserRole() {
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
        List<RoleModuleRelation> result = roleModuleDao.getModuleListByRoleCode(userRoleCode);

        // Assert
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return modules with correct module names")
    void getListOfSimpleAccountsModulesReturnsCorrectNames() {
        // Arrange
        List<SimpleAccountsModules> modules = Arrays.asList(
            createModule(1, "Dashboard"),
            createModule(2, "Reports")
        );

        when(entityManager.createNamedQuery("listOfSimpleAccountsModules", SimpleAccountsModules.class))
            .thenReturn(moduleTypedQuery);
        when(moduleTypedQuery.getResultList())
            .thenReturn(modules);

        // Act
        List<SimpleAccountsModules> result = roleModuleDao.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result.get(0).getSimpleAccountsModuleName()).isEqualTo("Dashboard");
        assertThat(result.get(1).getSimpleAccountsModuleName()).isEqualTo("Reports");
    }

    @Test
    @DisplayName("Should persist new module")
    void persistModulePersistsEntity() {
        // Arrange
        SimpleAccountsModules module = createModule(100, "New Module");

        // Act
        roleModuleDao.getEntityManager().persist(module);

        // Assert
        verify(entityManager).persist(module);
    }

    @Test
    @DisplayName("Should update existing module")
    void updateModuleMergesEntity() {
        // Arrange
        SimpleAccountsModules module = createModule(1, "Updated Module");
        when(entityManager.merge(module)).thenReturn(module);

        // Act
        SimpleAccountsModules result = roleModuleDao.update(module);

        // Assert
        verify(entityManager).merge(module);
        assertThat(result).isNotNull();
    }

    private SimpleAccountsModules createModule(Integer id, String name) {
        SimpleAccountsModules module = new SimpleAccountsModules();
        module.setSimpleAccountsModuleId(id);
        module.setSimpleAccountsModuleName(name);
        return module;
    }

    private RoleModuleRelation createRoleModuleRelation(Integer id, Integer roleCode, Integer moduleId) {
        RoleModuleRelation relation = new RoleModuleRelation();
        relation.setId(id);

        Role role = new Role();
        role.setRoleCode(roleCode);
        relation.setRole(role);

        SimpleAccountsModules module = createModule(moduleId, "Module " + moduleId);
        relation.setSimpleAccountsModule(module);

        return relation;
    }

    private List<RoleModuleRelation> createRoleModuleRelationList(int count, Integer roleCode) {
        List<RoleModuleRelation> relations = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            relations.add(createRoleModuleRelation(i + 1, roleCode, i + 1));
        }
        return relations;
    }
}
