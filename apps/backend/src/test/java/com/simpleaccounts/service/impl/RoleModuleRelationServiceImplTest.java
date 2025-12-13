package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.RoleModuleRelationDao;
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
@DisplayName("RoleModuleRelationServiceImpl Unit Tests")
class RoleModuleRelationServiceImplTest {

    @Mock
    private RoleModuleRelationDao roleModuleRelationDao;

    @InjectMocks
    private RoleModuleRelationServiceImpl roleModuleRelationService;

    @Test
    @DisplayName("Should return DAO instance")
    void getDaoReturnsRoleModuleRelationDao() {
        // Act
        var result = roleModuleRelationService.getDao();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(roleModuleRelationDao);
    }

    @Test
    @DisplayName("Should return role module relations by role code")
    void getRoleModuleRelationByRoleCodeReturnsRelations() {
        // Arrange
        Integer roleCode = 1;
        List<RoleModuleRelation> expectedRelations = Arrays.asList(
            createRoleModuleRelation(1, roleCode, 1, "Invoicing"),
            createRoleModuleRelation(2, roleCode, 2, "Banking"),
            createRoleModuleRelation(3, roleCode, 3, "Payroll")
        );

        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode))
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().hasSize(3);
        verify(roleModuleRelationDao).getRoleModuleRelationByRoleCode(roleCode);
    }

    @Test
    @DisplayName("Should return empty list when role has no module relations")
    void getRoleModuleRelationByRoleCodeReturnsEmptyList() {
        // Arrange
        Integer roleCode = 999;

        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode))
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should return list of modules for all roles")
    void getListOfSimpleAccountsModulesForAllRolesReturnsRelations() {
        // Arrange
        List<RoleModuleRelation> expectedRelations = Arrays.asList(
            createRoleModuleRelation(1, 1, 1, "Module A"),
            createRoleModuleRelation(2, 1, 2, "Module B"),
            createRoleModuleRelation(3, 2, 1, "Module A"),
            createRoleModuleRelation(4, 2, 3, "Module C")
        );

        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles())
            .thenReturn(expectedRelations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).isNotNull().hasSize(4);
        verify(roleModuleRelationDao).getListOfSimpleAccountsModulesForAllRoles();
    }

    @Test
    @DisplayName("Should return empty list when no modules exist for any role")
    void getListOfSimpleAccountsModulesForAllRolesReturnsEmptyList() {
        // Arrange
        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles())
            .thenReturn(new ArrayList<>());

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).isNotNull().isEmpty();
    }

    @Test
    @DisplayName("Should delete relations by role code")
    void deleteByRoleCodeCallsDao() {
        // Arrange
        Integer roleCode = 1;

        // Act
        roleModuleRelationService.deleteByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationDao).deleteByRoleCode(roleCode);
    }

    @Test
    @DisplayName("Should delete relations for different role codes")
    void deleteByRoleCodeHandlesDifferentRoleCodes() {
        // Arrange
        Integer roleCode = 5;

        // Act
        roleModuleRelationService.deleteByRoleCode(roleCode);

        // Assert
        verify(roleModuleRelationDao).deleteByRoleCode(roleCode);
    }

    @Test
    @DisplayName("Should return single relation when role has one module")
    void getRoleModuleRelationByRoleCodeReturnsSingleRelation() {
        // Arrange
        Integer roleCode = 3;
        List<RoleModuleRelation> relations = Collections.singletonList(
            createRoleModuleRelation(1, roleCode, 1, "Only Module")
        );

        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode))
            .thenReturn(relations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSimpleAccountsModule().getModuleName()).isEqualTo("Only Module");
    }

    @Test
    @DisplayName("Should return relations with correct role associations")
    void getRoleModuleRelationByRoleCodeReturnsCorrectRoleAssociations() {
        // Arrange
        Integer roleCode = 2;
        List<RoleModuleRelation> relations = Arrays.asList(
            createRoleModuleRelation(1, roleCode, 1, "Dashboard"),
            createRoleModuleRelation(2, roleCode, 2, "Reports")
        );

        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(roleCode))
            .thenReturn(relations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(roleCode);

        // Assert
        assertThat(result).allMatch(r -> r.getRole().getRoleCode().equals(roleCode));
    }

    @Test
    @DisplayName("Should handle large number of module relations")
    void getListOfSimpleAccountsModulesForAllRolesHandlesLargeList() {
        // Arrange
        List<RoleModuleRelation> largeList = createRoleModuleRelationList(100);

        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles())
            .thenReturn(largeList);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should verify DAO is correct type")
    void getDaoReturnsCorrectType() {
        // Act
        var result = roleModuleRelationService.getDao();

        // Assert
        assertThat(result).isInstanceOf(RoleModuleRelationDao.class);
    }

    @Test
    @DisplayName("Should handle admin role with all modules")
    void getRoleModuleRelationByRoleCodeHandlesAdminRole() {
        // Arrange
        Integer adminRoleCode = 1;
        List<RoleModuleRelation> allModules = createRoleModuleRelationListForRole(15, adminRoleCode);

        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(adminRoleCode))
            .thenReturn(allModules);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(adminRoleCode);

        // Assert
        assertThat(result).hasSize(15);
    }

    @Test
    @DisplayName("Should return relations with module details")
    void getListOfSimpleAccountsModulesForAllRolesReturnsModuleDetails() {
        // Arrange
        List<RoleModuleRelation> relations = Arrays.asList(
            createRoleModuleRelation(1, 1, 1, "Contacts"),
            createRoleModuleRelation(2, 1, 2, "Company Settings")
        );

        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles())
            .thenReturn(relations);

        // Act
        List<RoleModuleRelation> result = roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        // Assert
        assertThat(result.get(0).getSimpleAccountsModule().getModuleName()).isEqualTo("Contacts");
        assertThat(result.get(1).getSimpleAccountsModule().getModuleName()).isEqualTo("Company Settings");
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
        module.setModuleName(moduleName);
        module.setModuleCode("MOD" + moduleId);
        relation.setSimpleAccountsModule(module);

        return relation;
    }

    private List<RoleModuleRelation> createRoleModuleRelationList(int count) {
        List<RoleModuleRelation> relations = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            int roleCode = (i % 5) + 1; // Distribute across 5 roles
            relations.add(createRoleModuleRelation(i + 1, roleCode, i + 1, "Module " + (i + 1)));
        }
        return relations;
    }

    private List<RoleModuleRelation> createRoleModuleRelationListForRole(int count, Integer roleCode) {
        List<RoleModuleRelation> relations = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            relations.add(createRoleModuleRelation(i + 1, roleCode, i + 1, "Module " + (i + 1)));
        }
        return relations;
    }
}
