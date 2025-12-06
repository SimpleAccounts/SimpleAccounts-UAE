package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeDesignationDao;
import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.time.LocalDateTime;
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
class EmployeeDesignationServiceImplTest {

    @Mock
    private EmployeeDesignationDao employeeDesignationDao;

    @InjectMocks
    private EmployeeDesignationServiceImpl employeeDesignationService;

    private EmployeeDesignation testEmployeeDesignation;
    private PaginationModel testPaginationModel;

    @BeforeEach
    void setUp() {
        testEmployeeDesignation = new EmployeeDesignation();
        testEmployeeDesignation.setEmployeeDesignationId(1);
        testEmployeeDesignation.setDesignationName("Senior Manager");
        testEmployeeDesignation.setDesignationCode("SM001");
        testEmployeeDesignation.setDesignationDescription("Senior Management Position");
        testEmployeeDesignation.setCreatedBy(1);
        testEmployeeDesignation.setCreatedDate(LocalDateTime.now());
        testEmployeeDesignation.setDeleteFlag(false);

        testPaginationModel = new PaginationModel();
        testPaginationModel.setPageNumber(0);
        testPaginationModel.setPageSize(10);
        testPaginationModel.setSortBy("designationName");
        testPaginationModel.setSortOrder("ASC");
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnEmployeeDesignationDaoWhenGetDaoCalled() {
        assertThat(employeeDesignationService.getDao()).isEqualTo(employeeDesignationDao);
    }

    // ========== getEmployeeDesignationDropdown Tests ==========

    @Test
    void shouldReturnEmployeeDesignationDropdownWhenDesignationsExist() {
        DropdownObjectModel dropdown1 = new DropdownObjectModel(1, "Senior Manager");
        DropdownObjectModel dropdown2 = new DropdownObjectModel(2, "Manager");
        DropdownObjectModel dropdown3 = new DropdownObjectModel(3, "Team Lead");
        List<DropdownObjectModel> expectedList = Arrays.asList(dropdown1, dropdown2, dropdown3);

        when(employeeDesignationDao.getEmployeeDesignationDropdown()).thenReturn(expectedList);

        List<DropdownObjectModel> result = employeeDesignationService.getEmployeeDesignationDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("Senior Manager");
        assertThat(result.get(1).getValue()).isEqualTo(2);
        assertThat(result.get(1).getLabel()).isEqualTo("Manager");
        verify(employeeDesignationDao, times(1)).getEmployeeDesignationDropdown();
    }

    @Test
    void shouldReturnEmptyListWhenNoDesignationsForDropdown() {
        when(employeeDesignationDao.getEmployeeDesignationDropdown()).thenReturn(Collections.emptyList());

        List<DropdownObjectModel> result = employeeDesignationService.getEmployeeDesignationDropdown();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeDesignationDao, times(1)).getEmployeeDesignationDropdown();
    }

    @Test
    void shouldReturnSingleDesignationInDropdown() {
        DropdownObjectModel dropdown = new DropdownObjectModel(1, "Senior Manager");
        List<DropdownObjectModel> expectedList = Collections.singletonList(dropdown);

        when(employeeDesignationDao.getEmployeeDesignationDropdown()).thenReturn(expectedList);

        List<DropdownObjectModel> result = employeeDesignationService.getEmployeeDesignationDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        verify(employeeDesignationDao, times(1)).getEmployeeDesignationDropdown();
    }

    @Test
    void shouldHandleMultipleCallsToGetDropdown() {
        List<DropdownObjectModel> expectedList = Arrays.asList(
            new DropdownObjectModel(1, "Senior Manager"),
            new DropdownObjectModel(2, "Manager")
        );

        when(employeeDesignationDao.getEmployeeDesignationDropdown()).thenReturn(expectedList);

        List<DropdownObjectModel> result1 = employeeDesignationService.getEmployeeDesignationDropdown();
        List<DropdownObjectModel> result2 = employeeDesignationService.getEmployeeDesignationDropdown();

        assertThat(result1).hasSize(2);
        assertThat(result2).hasSize(2);
        verify(employeeDesignationDao, times(2)).getEmployeeDesignationDropdown();
    }

    // ========== getParentEmployeeDesignationForDropdown Tests ==========

    @Test
    void shouldReturnParentEmployeeDesignationDropdownWhenParentsExist() {
        DropdownObjectModel dropdown1 = new DropdownObjectModel(1, "CEO");
        DropdownObjectModel dropdown2 = new DropdownObjectModel(2, "CTO");
        List<DropdownObjectModel> expectedList = Arrays.asList(dropdown1, dropdown2);

        when(employeeDesignationDao.getParentEmployeeDesignationForDropdown()).thenReturn(expectedList);

        List<DropdownObjectModel> result = employeeDesignationService.getParentEmployeeDesignationForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getLabel()).isEqualTo("CEO");
        assertThat(result.get(1).getLabel()).isEqualTo("CTO");
        verify(employeeDesignationDao, times(1)).getParentEmployeeDesignationForDropdown();
    }

    @Test
    void shouldReturnEmptyListWhenNoParentDesignations() {
        when(employeeDesignationDao.getParentEmployeeDesignationForDropdown()).thenReturn(Collections.emptyList());

        List<DropdownObjectModel> result = employeeDesignationService.getParentEmployeeDesignationForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeDesignationDao, times(1)).getParentEmployeeDesignationForDropdown();
    }

    @Test
    void shouldReturnSingleParentDesignation() {
        DropdownObjectModel dropdown = new DropdownObjectModel(1, "CEO");
        List<DropdownObjectModel> expectedList = Collections.singletonList(dropdown);

        when(employeeDesignationDao.getParentEmployeeDesignationForDropdown()).thenReturn(expectedList);

        List<DropdownObjectModel> result = employeeDesignationService.getParentEmployeeDesignationForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("CEO");
        verify(employeeDesignationDao, times(1)).getParentEmployeeDesignationForDropdown();
    }

    // ========== getEmployeeDesignationList Tests ==========

    @Test
    void shouldReturnEmployeeDesignationListWhenValidParametersProvided() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        filterDataMap.put("designationName", "Manager");

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(5L);
        expectedResponse.setRecords(Arrays.asList(testEmployeeDesignation));

        when(employeeDesignationDao.getEmployeeDesignationList(filterDataMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeDesignationService.getEmployeeDesignationList(
                filterDataMap, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(5L);
        assertThat(result.getRecords()).hasSize(1);
        verify(employeeDesignationDao, times(1)).getEmployeeDesignationList(filterDataMap, testPaginationModel);
    }

    @Test
    void shouldReturnEmptyListWhenNoDesignationsMatch() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        filterDataMap.put("designationName", "Non-existent");

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(0L);
        expectedResponse.setRecords(Collections.emptyList());

        when(employeeDesignationDao.getEmployeeDesignationList(filterDataMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeDesignationService.getEmployeeDesignationList(
                filterDataMap, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(0L);
        assertThat(result.getRecords()).isEmpty();
        verify(employeeDesignationDao, times(1)).getEmployeeDesignationList(filterDataMap, testPaginationModel);
    }

    @Test
    void shouldHandleNullFilterDataMap() {
        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(10L);

        when(employeeDesignationDao.getEmployeeDesignationList(null, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeDesignationService.getEmployeeDesignationList(
                null, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(10L);
        verify(employeeDesignationDao, times(1)).getEmployeeDesignationList(null, testPaginationModel);
    }

    @Test
    void shouldHandleEmptyFilterDataMap() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(10L);

        when(employeeDesignationDao.getEmployeeDesignationList(filterDataMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeDesignationService.getEmployeeDesignationList(
                filterDataMap, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(10L);
        verify(employeeDesignationDao, times(1)).getEmployeeDesignationList(filterDataMap, testPaginationModel);
    }

    @Test
    void shouldHandleDifferentPageSizes() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        testPaginationModel.setPageSize(20);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(50L);

        when(employeeDesignationDao.getEmployeeDesignationList(filterDataMap, testPaginationModel))
                .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeDesignationService.getEmployeeDesignationList(
                filterDataMap, testPaginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(50L);
        verify(employeeDesignationDao, times(1)).getEmployeeDesignationList(filterDataMap, testPaginationModel);
    }

    // ========== findByPK Tests ==========

    @Test
    void shouldReturnEmployeeDesignationWhenFoundByPK() {
        when(employeeDesignationDao.findByPK(1)).thenReturn(testEmployeeDesignation);

        EmployeeDesignation result = employeeDesignationService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getEmployeeDesignationId()).isEqualTo(1);
        assertThat(result.getDesignationName()).isEqualTo("Senior Manager");
        assertThat(result.getDesignationCode()).isEqualTo("SM001");
        verify(employeeDesignationDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenEmployeeDesignationNotFoundByPK() {
        when(employeeDesignationDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> employeeDesignationService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(employeeDesignationDao, times(1)).findByPK(999);
    }

    // ========== persist Tests ==========

    @Test
    void shouldPersistNewEmployeeDesignation() {
        employeeDesignationService.persist(testEmployeeDesignation);

        verify(employeeDesignationDao, times(1)).persist(testEmployeeDesignation);
    }

    @Test
    void shouldPersistMultipleEmployeeDesignations() {
        EmployeeDesignation designation2 = new EmployeeDesignation();
        designation2.setEmployeeDesignationId(2);
        designation2.setDesignationName("Manager");

        employeeDesignationService.persist(testEmployeeDesignation);
        employeeDesignationService.persist(designation2);

        verify(employeeDesignationDao, times(1)).persist(testEmployeeDesignation);
        verify(employeeDesignationDao, times(1)).persist(designation2);
    }

    // ========== update Tests ==========

    @Test
    void shouldUpdateExistingEmployeeDesignation() {
        when(employeeDesignationDao.update(testEmployeeDesignation)).thenReturn(testEmployeeDesignation);

        EmployeeDesignation result = employeeDesignationService.update(testEmployeeDesignation);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testEmployeeDesignation);
        verify(employeeDesignationDao, times(1)).update(testEmployeeDesignation);
    }

    @Test
    void shouldUpdateDesignationName() {
        testEmployeeDesignation.setDesignationName("Updated Manager");
        when(employeeDesignationDao.update(testEmployeeDesignation)).thenReturn(testEmployeeDesignation);

        EmployeeDesignation result = employeeDesignationService.update(testEmployeeDesignation);

        assertThat(result).isNotNull();
        assertThat(result.getDesignationName()).isEqualTo("Updated Manager");
        verify(employeeDesignationDao, times(1)).update(testEmployeeDesignation);
    }

    // ========== delete Tests ==========

    @Test
    void shouldDeleteEmployeeDesignation() {
        employeeDesignationService.delete(testEmployeeDesignation);

        verify(employeeDesignationDao, times(1)).delete(testEmployeeDesignation);
    }

    // ========== findByAttributes Tests ==========

    @Test
    void shouldReturnEmployeeDesignationsWhenValidAttributesProvided() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("designationName", "Senior Manager");
        attributes.put("deleteFlag", false);

        List<EmployeeDesignation> expectedList = Arrays.asList(testEmployeeDesignation);
        when(employeeDesignationDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<EmployeeDesignation> result = employeeDesignationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testEmployeeDesignation);
        verify(employeeDesignationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("designationName", "Non-existent");

        when(employeeDesignationDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<EmployeeDesignation> result = employeeDesignationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeDesignationDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<EmployeeDesignation> result = employeeDesignationService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeDesignationDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<EmployeeDesignation> result = employeeDesignationService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(employeeDesignationDao, never()).findByAttributes(any());
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleDesignationWithLongDescription() {
        String longDescription = new String(new char[500]).replace('\0', 'x');
        testEmployeeDesignation.setDesignationDescription(longDescription);
        when(employeeDesignationDao.findByPK(1)).thenReturn(testEmployeeDesignation);

        EmployeeDesignation result = employeeDesignationService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result.getDesignationDescription()).hasSize(500);
        verify(employeeDesignationDao, times(1)).findByPK(1);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        when(employeeDesignationDao.findByPK(1)).thenReturn(testEmployeeDesignation);
        when(employeeDesignationDao.update(testEmployeeDesignation)).thenReturn(testEmployeeDesignation);

        employeeDesignationService.findByPK(1);
        employeeDesignationService.update(testEmployeeDesignation);
        employeeDesignationService.persist(testEmployeeDesignation);
        employeeDesignationService.delete(testEmployeeDesignation);

        verify(employeeDesignationDao, times(1)).findByPK(1);
        verify(employeeDesignationDao, times(1)).update(testEmployeeDesignation);
        verify(employeeDesignationDao, times(1)).persist(testEmployeeDesignation);
        verify(employeeDesignationDao, times(1)).delete(testEmployeeDesignation);
    }
}
