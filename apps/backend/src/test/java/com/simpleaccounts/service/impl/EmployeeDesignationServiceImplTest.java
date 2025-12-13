package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.EmployeeDesignationDao;
import com.simpleaccounts.entity.EmployeeDesignation;
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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("EmployeeDesignationServiceImpl Unit Tests")
class EmployeeDesignationServiceImplTest {

    @Mock
    private EmployeeDesignationDao employeeDesignationDao;

    @InjectMocks
    private EmployeeDesignationServiceImpl employeeDesignationService;

    private EmployeeDesignation testDesignation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(employeeDesignationService, "dao", employeeDesignationDao);
        testDesignation = createTestDesignation(1, "Manager", null);
    }

    @Test
    @DisplayName("Should return employee designation dropdown list")
    void getEmployeeDesignationDropdownReturnsList() {
        List<DropdownObjectModel> expectedList = Arrays.asList(
            new DropdownObjectModel(1, "Manager"),
            new DropdownObjectModel(2, "Developer"),
            new DropdownObjectModel(3, "Analyst")
        );

        when(employeeDesignationDao.getEmployeeDesignationDropdown()).thenReturn(expectedList);

        List<DropdownObjectModel> result = employeeDesignationService.getEmployeeDesignationDropdown();

        assertThat(result).isNotNull().hasSize(3);
        assertThat(result.get(0).getLabel()).isEqualTo("Manager");
        verify(employeeDesignationDao).getEmployeeDesignationDropdown();
    }

    @Test
    @DisplayName("Should return empty list when no designations exist")
    void getEmployeeDesignationDropdownReturnsEmptyList() {
        when(employeeDesignationDao.getEmployeeDesignationDropdown()).thenReturn(Collections.emptyList());

        List<DropdownObjectModel> result = employeeDesignationService.getEmployeeDesignationDropdown();

        assertThat(result).isNotNull().isEmpty();
        verify(employeeDesignationDao).getEmployeeDesignationDropdown();
    }

    @Test
    @DisplayName("Should return parent employee designations for dropdown")
    void getParentEmployeeDesignationForDropdownReturnsList() {
        List<DropdownObjectModel> expectedList = Arrays.asList(
            new DropdownObjectModel(1, "Senior Manager"),
            new DropdownObjectModel(2, "Director")
        );

        when(employeeDesignationDao.getParentEmployeeDesignationForDropdown()).thenReturn(expectedList);

        List<DropdownObjectModel> result = employeeDesignationService.getParentEmployeeDesignationForDropdown();

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getLabel()).isEqualTo("Senior Manager");
        verify(employeeDesignationDao).getParentEmployeeDesignationForDropdown();
    }

    @Test
    @DisplayName("Should return empty list when no parent designations exist")
    void getParentEmployeeDesignationForDropdownReturnsEmptyList() {
        when(employeeDesignationDao.getParentEmployeeDesignationForDropdown()).thenReturn(Collections.emptyList());

        List<DropdownObjectModel> result = employeeDesignationService.getParentEmployeeDesignationForDropdown();

        assertThat(result).isNotNull().isEmpty();
        verify(employeeDesignationDao).getParentEmployeeDesignationForDropdown();
    }

    @Test
    @DisplayName("Should return employee designation list with pagination")
    void getEmployeeDesignationListReturnsListWithPagination() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);

        List<EmployeeDesignation> designations = Arrays.asList(testDesignation);
        PaginationResponseModel expectedResponse = new PaginationResponseModel(1, designations);

        when(employeeDesignationDao.getEmployeeDesignationList(filterDataMap, paginationModel))
            .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeDesignationService.getEmployeeDesignationList(filterDataMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(1);
        assertThat(result.getData()).isNotNull();
        verify(employeeDesignationDao).getEmployeeDesignationList(filterDataMap, paginationModel);
    }

    @Test
    @DisplayName("Should return empty result when no designations found with filters")
    void getEmployeeDesignationListReturnsEmptyResultWhenNoDesignations() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();

        PaginationResponseModel expectedResponse = new PaginationResponseModel(0, Collections.emptyList());

        when(employeeDesignationDao.getEmployeeDesignationList(filterDataMap, paginationModel))
            .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeDesignationService.getEmployeeDesignationList(filterDataMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(0);
        verify(employeeDesignationDao).getEmployeeDesignationList(filterDataMap, paginationModel);
    }

    @Test
    @DisplayName("Should handle pagination with sorting")
    void getEmployeeDesignationListHandlesSorting() {
        Map<Object, Object> filterDataMap = new HashMap<>();
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPageNo(0);
        paginationModel.setPageSize(10);
        paginationModel.setSortingCol("designationName");
        paginationModel.setOrder("ASC");

        List<EmployeeDesignation> designations = Arrays.asList(
            createTestDesignation(1, "Analyst", null),
            createTestDesignation(2, "Developer", null),
            createTestDesignation(3, "Manager", null)
        );
        PaginationResponseModel expectedResponse = new PaginationResponseModel(3, designations);

        when(employeeDesignationDao.getEmployeeDesignationList(filterDataMap, paginationModel))
            .thenReturn(expectedResponse);

        PaginationResponseModel result = employeeDesignationService.getEmployeeDesignationList(filterDataMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getCount()).isEqualTo(3);
        verify(employeeDesignationDao).getEmployeeDesignationList(filterDataMap, paginationModel);
    }

    @Test
    @DisplayName("Should return correct DAO instance")
    void getDaoReturnsCorrectDao() {
        // Test by calling a method that uses the DAO
        when(employeeDesignationDao.getEmployeeDesignationDropdown()).thenReturn(Collections.emptyList());

        employeeDesignationService.getEmployeeDesignationDropdown();

        verify(employeeDesignationDao).getEmployeeDesignationDropdown();
    }

    @Test
    @DisplayName("Should find designation by primary key")
    void findByPKReturnsDesignation() {
        Integer id = 1;
        when(employeeDesignationDao.findByPK(id)).thenReturn(testDesignation);

        EmployeeDesignation result = employeeDesignationService.findByPK(id);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(id);
        assertThat(result.getDesignationName()).isEqualTo("Manager");
        verify(employeeDesignationDao).findByPK(id);
    }

    @Test
    @DisplayName("Should return null when designation not found by primary key")
    void findByPKReturnsNullWhenNotFound() {
        Integer id = 999;
        when(employeeDesignationDao.findByPK(id)).thenReturn(null);

        EmployeeDesignation result = employeeDesignationService.findByPK(id);

        assertThat(result).isNull();
        verify(employeeDesignationDao).findByPK(id);
    }

    @Test
    @DisplayName("Should persist new designation")
    void persistSavesNewDesignation() {
        EmployeeDesignation newDesignation = createTestDesignation(null, "New Role", null);

        employeeDesignationService.persist(newDesignation);

        verify(employeeDesignationDao).persist(newDesignation);
    }

    @Test
    @DisplayName("Should update existing designation")
    void updateModifiesExistingDesignation() {
        testDesignation.setDesignationName("Updated Manager");
        when(employeeDesignationDao.update(testDesignation)).thenReturn(testDesignation);

        EmployeeDesignation result = employeeDesignationService.update(testDesignation);

        assertThat(result).isNotNull();
        assertThat(result.getDesignationName()).isEqualTo("Updated Manager");
        verify(employeeDesignationDao).update(testDesignation);
    }

    @Test
    @DisplayName("Should handle hierarchical designations")
    void getParentEmployeeDesignationForDropdownHandlesHierarchy() {
        // Parent designations should have null parentId
        List<DropdownObjectModel> parentDesignations = Arrays.asList(
            new DropdownObjectModel(1, "CEO"),
            new DropdownObjectModel(2, "CTO"),
            new DropdownObjectModel(3, "CFO")
        );

        when(employeeDesignationDao.getParentEmployeeDesignationForDropdown()).thenReturn(parentDesignations);

        List<DropdownObjectModel> result = employeeDesignationService.getParentEmployeeDesignationForDropdown();

        assertThat(result).isNotNull().hasSize(3);
        // All should be top-level designations
        verify(employeeDesignationDao).getParentEmployeeDesignationForDropdown();
    }

    private EmployeeDesignation createTestDesignation(Integer id, String name, Integer parentId) {
        EmployeeDesignation designation = new EmployeeDesignation();
        designation.setId(id);
        designation.setDesignationName(name);
        designation.setParentId(parentId);
        designation.setDeleteFlag(false);
        designation.setCreatedBy(1);
        designation.setCreatedDate(LocalDateTime.now());
        return designation;
    }
}
