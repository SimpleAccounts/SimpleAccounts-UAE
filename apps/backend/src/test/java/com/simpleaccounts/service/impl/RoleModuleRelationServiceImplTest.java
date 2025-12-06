package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.RoleModuleRelationDao;
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
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RoleModuleRelationServiceImplTest {

    @Mock
    private RoleModuleRelationDao roleModuleRelationDao;

    @InjectMocks
    private RoleModuleRelationServiceImpl roleModuleRelationService;

    private RoleModuleRelation testRelation;
    private SimpleAccountsModules testModule;

    @BeforeEach
    void setUp() {
        testModule = new SimpleAccountsModules();
        testModule.setSimpleAccountsModulesId(1);
        testModule.setSimpleAccountsModulesCode("INVOICING");
        testModule.setSimpleAccountsModulesName("Invoicing Module");

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
    void shouldReturnRoleModuleRelationDaoWhenGetDaoCalled() {
        assertThat(roleModuleRelationService.getDao()).isEqualTo(roleModuleRelationDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(roleModuleRelationService.getDao()).isNotNull();
    }

    // ========== getRoleModuleRelationByRoleCode Tests ==========

    @Test
    void shouldReturnRelationsWhenRoleCodeHasModules() {
        RoleModuleRelation relation2 = new RoleModuleRelation();
        relation2.setRoleModuleRelationId(2);
        relation2.setRoleCode(100);

        List<RoleModuleRelation> expectedRelations = Arrays.asList(testRelation, relation2);
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(100)).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testRelation, relation2);
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(100);
    }

    @Test
    void shouldReturnEmptyListWhenRoleCodeHasNoModules() {
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(999)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(999);
    }

    @Test
    void shouldReturnSingleRelationWhenRoleCodeHasOneModule() {
        List<RoleModuleRelation> expectedRelations = Collections.singletonList(testRelation);
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(100)).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRoleCode()).isEqualTo(100);
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(100);
    }

    @Test
    void shouldHandleMultipleRelationsForSameRole() {
        List<RoleModuleRelation> expectedRelations = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            RoleModuleRelation relation = new RoleModuleRelation();
            relation.setRoleModuleRelationId(i);
            relation.setRoleCode(100);
            expectedRelations.add(relation);
        }

        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(100)).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
        assertThat(result.get(0).getRoleModuleRelationId()).isEqualTo(1);
        assertThat(result.get(9).getRoleModuleRelationId()).isEqualTo(10);
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(100);
    }

    @Test
    void shouldHandleNullRoleCode() {
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(null)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(null);
    }

    @Test
    void shouldHandleZeroRoleCode() {
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(0)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(0);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(0);
    }

    @Test
    void shouldHandleNegativeRoleCode() {
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(-1)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(-1);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(-1);
    }

    // ========== getListOfSimpleAccountsModulesForAllRoles Tests ==========

    @Test
    void shouldReturnAllModuleRelationsForAllRoles() {
        RoleModuleRelation relation2 = new RoleModuleRelation();
        relation2.setRoleModuleRelationId(2);
        relation2.setRoleCode(200);

        RoleModuleRelation relation3 = new RoleModuleRelation();
        relation3.setRoleModuleRelationId(3);
        relation3.setRoleCode(300);

        List<RoleModuleRelation> expectedRelations = Arrays.asList(testRelation, relation2, relation3);
        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles()).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testRelation, relation2, relation3);
        verify(roleModuleRelationDao, times(1)).getListOfSimpleAccountsModulesForAllRoles();
    }

    @Test
    void shouldReturnEmptyListWhenNoModuleRelationsExist() {
        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles()).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleRelationDao, times(1)).getListOfSimpleAccountsModulesForAllRoles();
    }

    @Test
    void shouldReturnSingleModuleRelation() {
        List<RoleModuleRelation> expectedRelations = Collections.singletonList(testRelation);
        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles()).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRoleCode()).isEqualTo(100);
        verify(roleModuleRelationDao, times(1)).getListOfSimpleAccountsModulesForAllRoles();
    }

    @Test
    void shouldHandleMultipleRolesWithMultipleModules() {
        List<RoleModuleRelation> expectedRelations = new ArrayList<>();
        for (int roleCode = 100; roleCode <= 200; roleCode += 50) {
            for (int i = 1; i <= 5; i++) {
                RoleModuleRelation relation = new RoleModuleRelation();
                relation.setRoleModuleRelationId(i);
                relation.setRoleCode(roleCode);
                expectedRelations.add(relation);
            }
        }

        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles()).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(15);
        verify(roleModuleRelationDao, times(1)).getListOfSimpleAccountsModulesForAllRoles();
    }

    // ========== deleteByRoleCode Tests ==========

    @Test
    void shouldDeleteRelationsByRoleCode() {
        roleModuleRelationService.deleteByRoleCode(100);

        verify(roleModuleRelationDao, times(1)).deleteByRoleCode(100);
    }

    @Test
    void shouldHandleDeleteByNullRoleCode() {
        roleModuleRelationService.deleteByRoleCode(null);

        verify(roleModuleRelationDao, times(1)).deleteByRoleCode(null);
    }

    @Test
    void shouldHandleDeleteByZeroRoleCode() {
        roleModuleRelationService.deleteByRoleCode(0);

        verify(roleModuleRelationDao, times(1)).deleteByRoleCode(0);
    }

    @Test
    void shouldHandleDeleteByNegativeRoleCode() {
        roleModuleRelationService.deleteByRoleCode(-1);

        verify(roleModuleRelationDao, times(1)).deleteByRoleCode(-1);
    }

    @Test
    void shouldDeleteMultipleRelationsByDifferentRoleCodes() {
        roleModuleRelationService.deleteByRoleCode(100);
        roleModuleRelationService.deleteByRoleCode(200);
        roleModuleRelationService.deleteByRoleCode(300);

        verify(roleModuleRelationDao, times(1)).deleteByRoleCode(100);
        verify(roleModuleRelationDao, times(1)).deleteByRoleCode(200);
        verify(roleModuleRelationDao, times(1)).deleteByRoleCode(300);
    }

    @Test
    void shouldVerifyDeleteOperationIsCalled() {
        ArgumentCaptor<Integer> captor = ArgumentCaptor.forClass(Integer.class);

        roleModuleRelationService.deleteByRoleCode(100);

        verify(roleModuleRelationDao, times(1)).deleteByRoleCode(captor.capture());
        assertThat(captor.getValue()).isEqualTo(100);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindRoleModuleRelationByPrimaryKey() {
        when(roleModuleRelationDao.findByPK(1)).thenReturn(testRelation);

        RoleModuleRelation result = roleModuleRelationService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        assertThat(result.getRoleModuleRelationId()).isEqualTo(1);
        verify(roleModuleRelationDao, times(1)).findByPK(1);
    }

    @Test
    void shouldReturnNullWhenRoleModuleRelationNotFoundByPK() {
        when(roleModuleRelationDao.findByPK(999)).thenReturn(null);

        RoleModuleRelation result = roleModuleRelationService.findByPK(999);

        assertThat(result).isNull();
        verify(roleModuleRelationDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewRoleModuleRelation() {
        roleModuleRelationService.persist(testRelation);

        verify(roleModuleRelationDao, times(1)).persist(testRelation);
    }

    @Test
    void shouldUpdateExistingRoleModuleRelation() {
        when(roleModuleRelationDao.update(testRelation)).thenReturn(testRelation);

        RoleModuleRelation result = roleModuleRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testRelation);
        verify(roleModuleRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldUpdateRoleModuleRelationAndReturnUpdatedEntity() {
        testRelation.setRoleCode(200);
        when(roleModuleRelationDao.update(testRelation)).thenReturn(testRelation);

        RoleModuleRelation result = roleModuleRelationService.update(testRelation);

        assertThat(result).isNotNull();
        assertThat(result.getRoleCode()).isEqualTo(200);
        verify(roleModuleRelationDao, times(1)).update(testRelation);
    }

    @Test
    void shouldDeleteRoleModuleRelation() {
        roleModuleRelationService.delete(testRelation);

        verify(roleModuleRelationDao, times(1)).delete(testRelation);
    }

    @Test
    void shouldFindRoleModuleRelationsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("roleCode", 100);
        attributes.put("deleteFlag", false);

        List<RoleModuleRelation> expectedList = Arrays.asList(testRelation);
        when(roleModuleRelationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<RoleModuleRelation> result = roleModuleRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testRelation);
        verify(roleModuleRelationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("roleCode", 999);

        when(roleModuleRelationDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleRelationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleRelationDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleRelationWithNullModule() {
        RoleModuleRelation relationWithNullModule = new RoleModuleRelation();
        relationWithNullModule.setRoleModuleRelationId(2);
        relationWithNullModule.setRoleCode(100);
        relationWithNullModule.setSimpleAccountsModules(null);

        when(roleModuleRelationDao.findByPK(2)).thenReturn(relationWithNullModule);

        RoleModuleRelation result = roleModuleRelationService.findByPK(2);

        assertThat(result).isNotNull();
        assertThat(result.getSimpleAccountsModules()).isNull();
        verify(roleModuleRelationDao, times(1)).findByPK(2);
    }

    @Test
    void shouldHandleRelationWithMinimalData() {
        RoleModuleRelation minimalRelation = new RoleModuleRelation();
        minimalRelation.setRoleModuleRelationId(99);

        when(roleModuleRelationDao.findByPK(99)).thenReturn(minimalRelation);

        RoleModuleRelation result = roleModuleRelationService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getRoleModuleRelationId()).isEqualTo(99);
        assertThat(result.getRoleCode()).isNull();
        verify(roleModuleRelationDao, times(1)).findByPK(99);
    }

    @Test
    void shouldVerifyTransactionalBehavior() {
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(100)).thenReturn(Arrays.asList(testRelation));

        roleModuleRelationService.getRoleModuleRelationByRoleCode(100);
        roleModuleRelationService.getRoleModuleRelationByRoleCode(100);

        verify(roleModuleRelationDao, times(2)).getRoleModuleRelationByRoleCode(100);
    }

    @Test
    void shouldHandleMultipleDifferentRoleCodes() {
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(100)).thenReturn(Arrays.asList(testRelation));
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(200)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result1 = roleModuleRelationService.getRoleModuleRelationByRoleCode(100);
        List<RoleModuleRelation> result2 = roleModuleRelationService.getRoleModuleRelationByRoleCode(200);

        assertThat(result1).hasSize(1);
        assertThat(result2).isEmpty();
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(100);
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(200);
    }

    @Test
    void shouldHandleVeryLargeRoleCode() {
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(999999)).thenReturn(Collections.emptyList());

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(999999);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(999999);
    }

    @Test
    void shouldVerifyDaoInteractionForGetAll() {
        when(roleModuleRelationDao.getListOfSimpleAccountsModulesForAllRoles()).thenReturn(Arrays.asList(testRelation));

        roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();
        roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();
        roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles();

        verify(roleModuleRelationDao, times(3)).getListOfSimpleAccountsModulesForAllRoles();
    }

    @Test
    void shouldHandleRelationsWithSameRoleButDifferentModules() {
        SimpleAccountsModules module2 = new SimpleAccountsModules();
        module2.setSimpleAccountsModulesId(2);
        module2.setSimpleAccountsModulesCode("REPORTING");

        RoleModuleRelation relation2 = new RoleModuleRelation();
        relation2.setRoleModuleRelationId(2);
        relation2.setRoleCode(100);
        relation2.setSimpleAccountsModules(module2);

        List<RoleModuleRelation> expectedRelations = Arrays.asList(testRelation, relation2);
        when(roleModuleRelationDao.getRoleModuleRelationByRoleCode(100)).thenReturn(expectedRelations);

        List<RoleModuleRelation> result = roleModuleRelationService.getRoleModuleRelationByRoleCode(100);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getSimpleAccountsModules().getSimpleAccountsModulesCode()).isEqualTo("INVOICING");
        assertThat(result.get(1).getSimpleAccountsModules().getSimpleAccountsModulesCode()).isEqualTo("REPORTING");
        verify(roleModuleRelationDao, times(1)).getRoleModuleRelationByRoleCode(100);
    }

    @Test
    void shouldHandleDeleteOperationMultipleTimes() {
        roleModuleRelationService.deleteByRoleCode(100);
        roleModuleRelationService.deleteByRoleCode(100);

        verify(roleModuleRelationDao, times(2)).deleteByRoleCode(100);
    }
}
