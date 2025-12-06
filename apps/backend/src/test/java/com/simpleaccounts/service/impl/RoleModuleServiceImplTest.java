package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.RoleModuleDao;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import java.time.LocalDateTime;
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
class RoleModuleServiceImplTest {

    @Mock
    private RoleModuleDao roleModuleDao;

    @InjectMocks
    private RoleModuleServiceImpl roleModuleService;

    private SimpleAccountsModules testModule;
    private RoleModuleRelation testRelation;

    @BeforeEach
    void setUp() {
        testModule = new SimpleAccountsModules();
        testModule.setSimpleAccountsModulesId(1);
        testModule.setSimpleAccountsModulesCode("INVOICING");
        testModule.setSimpleAccountsModulesName("Invoicing Module");
        testModule.setSimpleAccountsModulesDescription("Module for managing invoices");
        testModule.setCreatedBy(1);
        testModule.setCreatedDate(LocalDateTime.now());
        testModule.setDeleteFlag(false);

        testRelation = new RoleModuleRelation();
        testRelation.setRoleModuleRelationId(1);
        testRelation.setRoleCode(100);
        testRelation.setSimpleAccountsModules(testModule);
        testRelation.setCreatedBy(1);
        testRelation.setCreatedDate(LocalDateTime.now());
        testRelation.setDeleteFlag(false);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnRoleModuleDaoWhenGetDaoCalled() {
        assertThat(roleModuleService.getDao()).isEqualTo(roleModuleDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(roleModuleService.getDao()).isNotNull();
    }

    // ========== getListOfSimpleAccountsModules Tests ==========

    @Test
    void shouldReturnAllModulesWhenModulesExist() {
        SimpleAccountsModules module2 = new SimpleAccountsModules();
        module2.setSimpleAccountsModulesId(2);
        module2.setSimpleAccountsModulesCode("REPORTING");
        module2.setSimpleAccountsModulesName("Reporting Module");

        SimpleAccountsModules module3 = new SimpleAccountsModules();
        module3.setSimpleAccountsModulesId(3);
        module3.setSimpleAccountsModulesCode("EXPENSES");
        module3.setSimpleAccountsModulesName("Expenses Module");

        List<SimpleAccountsModules> expectedModules = Arrays.asList(testModule, module2, module3);
        when(roleModuleDao.getListOfSimpleAccountsModules()).thenReturn(expectedModules);

        List<SimpleAccountsModules> result = roleModuleService.getListOfSimpleAccountsModules();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testModule, module2, module3);
        verify(roleModuleDao, times(1)).getListOfSimpleAccountsModules();
    }

    @Test
    void shouldReturnEmptyListWhenNoModulesExist() {
        when(roleModuleDao.getListOfSimpleAccountsModules()).thenReturn(Collections.emptyList());

        List<SimpleAccountsModules> result = roleModuleService.getListOfSimpleAccountsModules();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getListOfSimpleAccountsModules();
    }

    @Test
    void shouldReturnSingleModule() {
        List<SimpleAccountsModules> expectedModules = Collections.singletonList(testModule);
        when(roleModuleDao.getListOfSimpleAccountsModules()).thenReturn(expectedModules);

        List<SimpleAccountsModules> result = roleModuleService.getListOfSimpleAccountsModules();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSimpleAccountsModulesCode()).isEqualTo("INVOICING");
        verify(roleModuleDao, times(1)).getListOfSimpleAccountsModules();
    }

    @Test
    void shouldHandleMultipleModules() {
        List<SimpleAccountsModules> expectedModules = new ArrayList<>();
        for (int i = 1; i <= 15; i++) {
            SimpleAccountsModules module = new SimpleAccountsModules();
            module.setSimpleAccountsModulesId(i);
            module.setSimpleAccountsModulesCode("MODULE" + i);
            module.setSimpleAccountsModulesName("Module " + i);
            expectedModules.add(module);
        }

        when(roleModuleDao.getListOfSimpleAccountsModules()).thenReturn(expectedModules);

        List<SimpleAccountsModules> result = roleModuleService.getListOfSimpleAccountsModules();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(15);
        assertThat(result.get(0).getSimpleAccountsModulesCode()).isEqualTo("MODULE1");
        assertThat(result.get(14).getSimpleAccountsModulesCode()).isEqualTo("MODULE15");
        verify(roleModuleDao, times(1)).getListOfSimpleAccountsModules();
    }

    // ========== getModuleListByRoleCode(Integer) Tests ==========

    @Test
    void shouldReturnModulesWhenRoleCodeHasModules() {
        RoleModuleRelation relation2 = new RoleModuleRelation();
        relation2.setRoleModuleRelationId(2);
        relation2.setRoleCode(100);

        List<RoleModuleRelation> expectedRelations = Arrays.asList(testRelation, relation2);
        when(roleModuleDao.getModuleListByRoleCode(100)).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testRelation, relation2);
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100);
    }

    @Test
    void shouldReturnEmptyListWhenRoleCodeHasNoModules() {
        when(roleModuleDao.getModuleListByRoleCode(999)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(999);
    }

    @Test
    void shouldReturnSingleModuleForRoleCode() {
        List<RoleModuleRelation> expectedRelations = Collections.singletonList(testRelation);
        when(roleModuleDao.getModuleListByRoleCode(100)).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRoleCode()).isEqualTo(100);
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100);
    }

    @Test
    void shouldHandleNullRoleCode() {
        when(roleModuleDao.getModuleListByRoleCode(null)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(null);
    }

    @Test
    void shouldHandleZeroRoleCode() {
        when(roleModuleDao.getModuleListByRoleCode(0)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(0);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(0);
    }

    @Test
    void shouldHandleNegativeRoleCode() {
        when(roleModuleDao.getModuleListByRoleCode(-1)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(-1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(-1);
    }

    // ========== getModuleListByRoleCode(Integer, Integer) Tests ==========

    @Test
    void shouldReturnModulesWhenBothRoleCodeAndModuleIdMatch() {
        List<RoleModuleRelation> expectedRelations = Collections.singletonList(testRelation);
        when(roleModuleDao.getModuleListByRoleCode(100, 1)).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(100, 1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRoleCode()).isEqualTo(100);
        assertThat(result.get(0).getSimpleAccountsModules().getSimpleAccountsModulesId()).isEqualTo(1);
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100, 1);
    }

    @Test
    void shouldReturnEmptyListWhenNoMatchForRoleCodeAndModuleId() {
        when(roleModuleDao.getModuleListByRoleCode(100, 999)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(100, 999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100, 999);
    }

    @Test
    void shouldReturnMultipleModulesForRoleCodeAndModuleId() {
        RoleModuleRelation relation2 = new RoleModuleRelation();
        relation2.setRoleModuleRelationId(2);
        relation2.setRoleCode(100);
        relation2.setSimpleAccountsModules(testModule);

        List<RoleModuleRelation> expectedRelations = Arrays.asList(testRelation, relation2);
        when(roleModuleDao.getModuleListByRoleCode(100, 1)).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(100, 1);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100, 1);
    }

    @Test
    void shouldHandleNullRoleCodeWithModuleId() {
        when(roleModuleDao.getModuleListByRoleCode(null, 1)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(null, 1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(null, 1);
    }

    @Test
    void shouldHandleRoleCodeWithNullModuleId() {
        when(roleModuleDao.getModuleListByRoleCode(100, null)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(100, null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100, null);
    }

    @Test
    void shouldHandleBothNullParameters() {
        when(roleModuleDao.getModuleListByRoleCode(null, null)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(null, null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(null, null);
    }

    @Test
    void shouldHandleZeroRoleCodeAndZeroModuleId() {
        when(roleModuleDao.getModuleListByRoleCode(0, 0)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(0, 0);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(0, 0);
    }

    @Test
    void shouldHandleNegativeRoleCodeAndModuleId() {
        when(roleModuleDao.getModuleListByRoleCode(-1, -1)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(-1, -1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(-1, -1);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindSimpleAccountsModuleByPrimaryKey() {
        when(roleModuleDao.findByPK(1)).thenReturn(testModule);

        SimpleAccountsModules result = roleModuleService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testModule);
        assertThat(result.getSimpleAccountsModulesId()).isEqualTo(1);
        verify(roleModuleDao, times(1)).findByPK(1);
    }

    @Test
    void shouldReturnNullWhenModuleNotFoundByPK() {
        when(roleModuleDao.findByPK(999)).thenReturn(null);

        SimpleAccountsModules result = roleModuleService.findByPK(999);

        assertThat(result).isNull();
        verify(roleModuleDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewSimpleAccountsModule() {
        roleModuleService.persist(testModule);

        verify(roleModuleDao, times(1)).persist(testModule);
    }

    @Test
    void shouldUpdateExistingSimpleAccountsModule() {
        when(roleModuleDao.update(testModule)).thenReturn(testModule);

        SimpleAccountsModules result = roleModuleService.update(testModule);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testModule);
        verify(roleModuleDao, times(1)).update(testModule);
    }

    @Test
    void shouldUpdateModuleAndReturnUpdatedEntity() {
        testModule.setSimpleAccountsModulesName("Updated Module Name");
        testModule.setSimpleAccountsModulesDescription("Updated Description");
        when(roleModuleDao.update(testModule)).thenReturn(testModule);

        SimpleAccountsModules result = roleModuleService.update(testModule);

        assertThat(result).isNotNull();
        assertThat(result.getSimpleAccountsModulesName()).isEqualTo("Updated Module Name");
        assertThat(result.getSimpleAccountsModulesDescription()).isEqualTo("Updated Description");
        verify(roleModuleDao, times(1)).update(testModule);
    }

    @Test
    void shouldDeleteSimpleAccountsModule() {
        roleModuleService.delete(testModule);

        verify(roleModuleDao, times(1)).delete(testModule);
    }

    @Test
    void shouldFindSimpleAccountsModulesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("simpleAccountsModulesCode", "INVOICING");
        attributes.put("deleteFlag", false);

        List<SimpleAccountsModules> expectedList = Arrays.asList(testModule);
        when(roleModuleDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<SimpleAccountsModules> result = roleModuleService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testModule);
        verify(roleModuleDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("simpleAccountsModulesCode", "NONEXISTENT");

        when(roleModuleDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<SimpleAccountsModules> result = roleModuleService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleModuleWithNullCode() {
        SimpleAccountsModules moduleWithNullCode = new SimpleAccountsModules();
        moduleWithNullCode.setSimpleAccountsModulesId(2);
        moduleWithNullCode.setSimpleAccountsModulesCode(null);
        moduleWithNullCode.setSimpleAccountsModulesName("Module with null code");

        when(roleModuleDao.findByPK(2)).thenReturn(moduleWithNullCode);

        SimpleAccountsModules result = roleModuleService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getSimpleAccountsModulesCode()).isNull();
        verify(roleModuleDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleModuleWithNullName() {
        SimpleAccountsModules moduleWithNullName = new SimpleAccountsModules();
        moduleWithNullName.setSimpleAccountsModulesId(3);
        moduleWithNullName.setSimpleAccountsModulesCode("CODE");
        moduleWithNullName.setSimpleAccountsModulesName(null);

        when(roleModuleDao.findByPK(3)).thenReturn(moduleWithNullName);

        SimpleAccountsModules result = roleModuleService.findByPK(3);

        assertThat(result).isNotNull();
        assertThat(result.getSimpleAccountsModulesName()).isNull();
        verify(roleModuleDao, times(1)).findByPK(3);
    }

    @Test
    void shouldHandleModuleWithMinimalData() {
        SimpleAccountsModules minimalModule = new SimpleAccountsModules();
        minimalModule.setSimpleAccountsModulesId(99);

        when(roleModuleDao.findByPK(99)).thenReturn(minimalModule);

        SimpleAccountsModules result = roleModuleService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getSimpleAccountsModulesId()).isEqualTo(99);
        assertThat(result.getSimpleAccountsModulesCode()).isNull();
        assertThat(result.getSimpleAccountsModulesName()).isNull();
        verify(roleModuleDao, times(1)).findByPK(99);
    }

    @Test
    void shouldVerifyMultipleCallsToGetListOfModules() {
        when(roleModuleDao.getListOfSimpleAccountsModules()).thenReturn(Arrays.asList(testModule));

        roleModuleService.getListOfSimpleAccountsModules();
        roleModuleService.getListOfSimpleAccountsModules();
        roleModuleService.getListOfSimpleAccountsModules();

        verify(roleModuleDao, times(3)).getListOfSimpleAccountsModules();
    }

    @Test
    void shouldHandleDifferentRoleCodes() {
        when(roleModuleDao.getModuleListByRoleCode(100)).thenReturn(Arrays.asList(testRelation));
        when(roleModuleDao.getModuleListByRoleCode(200)).thenReturn(Collections.emptyList());
        when(roleModuleDao.getModuleListByRoleCode(300)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result1 = roleModuleService.getModuleListByRoleCode(100);
        List<RoleModuleRelation> result2 = roleModuleService.getModuleListByRoleCode(200);
        List<RoleModuleRelation> result3 = roleModuleService.getModuleListByRoleCode(300);

        assertThat(result1).hasSize(1);
        assertThat(result2).isEmpty();
        assertThat(result3).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100);
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(200);
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(300);
    }

    @Test
    void shouldHandleVeryLargeRoleCode() {
        when(roleModuleDao.getModuleListByRoleCode(999999)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(999999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(999999);
    }

    @Test
    void shouldHandleVeryLargeModuleId() {
        when(roleModuleDao.getModuleListByRoleCode(100, 999999)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleService.getModuleListByRoleCode(100, 999999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100, 999999);
    }

    @Test
    void shouldDistinguishBetweenOverloadedMethods() {
        when(roleModuleDao.getModuleListByRoleCode(100)).thenReturn(Arrays.asList(testRelation));
        when(roleModuleDao.getModuleListByRoleCode(100, 1)).thenReturn(Arrays.asList(testRelation));

        List<RoleModuleRelation> result1 = roleModuleService.getModuleListByRoleCode(100);
        List<RoleModuleRelation> result2 = roleModuleService.getModuleListByRoleCode(100, 1);

        assertThat(result1).hasSize(1);
        assertThat(result2).hasSize(1);
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100);
        verify(roleModuleDao, times(1)).getModuleListByRoleCode(100, 1);
    }

    @Test
    void shouldHandleModuleWithLongDescription() {
        SimpleAccountsModules moduleWithLongDesc = new SimpleAccountsModules();
        moduleWithLongDesc.setSimpleAccountsModulesId(5);
        moduleWithLongDesc.setSimpleAccountsModulesCode("LONG_DESC");
        moduleWithLongDesc.setSimpleAccountsModulesDescription(
                "This is a very long description that contains many words and explains " +
                "in great detail what this module does and how it should be used in the system"
        );

        when(roleModuleDao.findByPK(5)).thenReturn(moduleWithLongDesc);

        SimpleAccountsModules result = roleModuleService.findByPK(5);

        assertThat(result).isNotNull();
        assertThat(result.getSimpleAccountsModulesDescription()).isNotEmpty();
        assertThat(result.getSimpleAccountsModulesDescription().length()).isGreaterThan(50);
        verify(roleModuleDao, times(1)).findByPK(5);
    }
}
