package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.RoleModuleDao;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
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
@DisplayName("RoleModuleServiceImpl Unit Tests")
class RoleModuleServiceImplTest {

    @Mock
    private RoleModuleDao roleModuleDao;

    @InjectMocks
    private RoleModuleServiceImpl roleModuleService;

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsRoleModuleDao() {
        // Act
        var result = roleModuleService.getDao();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(roleModuleDao);
    }

    @Test
    @DisplayName("Should return list of SimpleAccounts modules")
    void getListOfSimpleAccountsModulesReturnsModulesList() {
        // Arrange
        List<SimpleAccountsModules> expectedModules = Arrays.asList(
            createModule(1, "Invoicing"),
            createModule(2, "Banking"),
            createModule(3, "Payroll")
        );

        when(roleModuleDao.getListOfSimpleAccountsModules())
            .thenReturn(expectedModules);

        // Act
        List<SimpleAccountsModules> result = roleModuleService.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result).isNotNull().hasSize(3);
        verify(roleModuleDao).getListOfSimpleAccountsModules();
    }

    @Test
    @DisplayName("Should return empty list when no modules exist")
    void getListOfSimpleAccountsModulesReturnsEmptyList() {
        // Arrange
        when(roleModuleDao.getListOfSimpleAccountsModules())
            .thenReturn(new ArrayList<>());

        // Act
        List<SimpleAccountsModules> result = roleModuleService.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return module list by role code")
    void getModuleListByRoleCodeReturnsRelations() {
        // Arrange
        Integer roleCode = 1;
        List<RoleModuleRelation> expectedRelations = Arrays.asList(
            createRoleModuleRelation(1, roleCode, 1),
            createRoleModuleRelation(2, roleCode, 2)
        );

        when(roleModuleDao.getModuleListByRoleCode(roleCode))
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().hasSize(2);
        verify(roleModuleDao).getModuleListByRoleCode(roleCode);
    }

    @Test
    @DisplayName("Should return empty list when role has no modules")
    void getModuleListByRoleCodeReturnsEmptyList() {
        // Arrange
        Integer roleCode = 999;

        when(roleModuleDao.getModuleListByRoleCode(roleCode))
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return module list by role code and module ID")
    void getModuleListByRoleCodeAndModuleIdReturnsRelations() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 5;
        List<RoleModuleRelation> expectedRelations = Collections.singletonList(
            createRoleModuleRelation(1, roleCode, moduleId)
        );

        when(roleModuleDao.getModuleListByRoleCode(roleCode, moduleId))
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        assertThat(result).isNotNull().hasSize(1);
        verify(roleModuleDao).getModuleListByRoleCode(roleCode, moduleId);
    }

    @Test
    @DisplayName("Should return empty list when role module combination not found")
    void getModuleListByRoleCodeAndModuleIdReturnsEmptyList() {
        // Arrange
        Integer roleCode = 1;
        Integer moduleId = 999;

        when(roleModuleDao.getModuleListByRoleCode(roleCode, moduleId))
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(roleCode, moduleId);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return modules with correct names")
    void getListOfSimpleAccountsModulesReturnsCorrectNames() {
        // Arrange
        List<SimpleAccountsModules> modules = Arrays.asList(
            createModule(1, "Dashboard"),
            createModule(2, "Reports")
        );

        when(roleModuleDao.getListOfSimpleAccountsModules())
            .thenReturn(modules);

        // Act
        List<SimpleAccountsModules> result = roleModuleService.getListOfSimpleAccountsModules();

        // Assert
        assertThat(result.get(0).getSimpleAccountsModuleName()).isEqualTo("Dashboard");
        assertThat(result.get(1).getSimpleAccountsModuleName()).isEqualTo("Reports");
    }

    @Test
    @DisplayName("Should handle admin role code")
    void getModuleListByRoleCodeHandlesAdminRole() {
        // Arrange
        Integer adminRoleCode = 1; // Admin typically has role code 1
        List<RoleModuleRelation> allModules = createRoleModuleRelationList(10, adminRoleCode);

        when(roleModuleDao.getModuleListByRoleCode(adminRoleCode))
            .thenReturn(allModules);

        // Act
        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(adminRoleCode);

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should handle user role with limited modules")
    void getModuleListByRoleCodeHandlesUserRole() {
        // Arrange
        Integer userRoleCode = 2;
        List<RoleModuleRelation> limitedModules = createRoleModuleRelationList(3, userRoleCode);

        when(roleModuleDao.getModuleListByRoleCode(userRoleCode))
            .thenReturn(limitedModules);

        // Act
        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(userRoleCode);

        // Assert
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return DAO of correct type")
    void getDaoReturnsCorrectType() {
        // Act
        var result = roleModuleService.getDao();

        // Assert
        assertThat(result).isInstanceOf(RoleModuleDao.class);
    }

    @Test
    @DisplayName("Should verify findByPK calls DAO")
    void findByPKCallsDao() {
        // Arrange
        Integer moduleId = 1;
        SimpleAccountsModules expectedModule = createModule(moduleId, "Test Module");

        when(roleModuleDao.findByPK(moduleId))
            .thenReturn(expectedModule);

        // Act
        SimpleAccountsModules result = roleModuleService.findByPK(moduleId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getSimpleAccountsModuleId()).isEqualTo(moduleId);
        verify(roleModuleDao).findByPK(moduleId);
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

