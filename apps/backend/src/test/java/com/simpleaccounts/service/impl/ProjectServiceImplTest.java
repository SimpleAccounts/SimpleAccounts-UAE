package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.ProjectFilterEnum;
import com.simpleaccounts.criteria.ProjectCriteria;
import com.simpleaccounts.criteria.ProjectFilter;
import com.simpleaccounts.dao.ProjectDao;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
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
class ProjectServiceImplTest {

    @Mock
    private ProjectDao projectDao;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Project testProject;
    private ProjectCriteria testCriteria;

    @BeforeEach
    void setUp() {
        testProject = new Project();
        testProject.setProjectId(1);
        testProject.setProjectName("Test Project");
        testProject.setRevenueBudget(BigDecimal.valueOf(10000.00));
        testProject.setCreatedBy(1);
        testProject.setCreatedDate(LocalDateTime.now());
        testProject.setDeleteFlag(false);

        testCriteria = new ProjectCriteria();
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnProjectDaoWhenGetDaoCalled() {
        assertThat(projectService.getDao()).isEqualTo(projectDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(projectService.getDao()).isNotNull();
    }

    // ========== getProjectsByCriteria Tests ==========

    @Test
    void shouldReturnProjectsWhenValidCriteriaProvided() throws Exception {
        List<Project> expectedProjects = Arrays.asList(testProject);
        when(projectDao.filter(any(ProjectFilter.class))).thenReturn(expectedProjects);

        List<Project> result = projectService.getProjectsByCriteria(testCriteria);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testProject);
        verify(projectDao, times(1)).filter(any(ProjectFilter.class));
    }

    @Test
    void shouldReturnEmptyListWhenNoCriteriaMatch() throws Exception {
        when(projectDao.filter(any(ProjectFilter.class))).thenReturn(Collections.emptyList());

        List<Project> result = projectService.getProjectsByCriteria(testCriteria);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(projectDao, times(1)).filter(any(ProjectFilter.class));
    }

    @Test
    void shouldReturnMultipleProjectsWhenMultipleMatch() throws Exception {
        Project project2 = new Project();
        project2.setProjectId(2);
        project2.setProjectName("Second Project");

        Project project3 = new Project();
        project3.setProjectId(3);
        project3.setProjectName("Third Project");

        List<Project> expectedProjects = Arrays.asList(testProject, project2, project3);
        when(projectDao.filter(any(ProjectFilter.class))).thenReturn(expectedProjects);

        List<Project> result = projectService.getProjectsByCriteria(testCriteria);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testProject, project2, project3);
        verify(projectDao, times(1)).filter(any(ProjectFilter.class));
    }

    @Test
    void shouldHandleExceptionWhenFilterFails() throws Exception {
        when(projectDao.filter(any(ProjectFilter.class))).thenThrow(new RuntimeException("Database error"));

        assertThatThrownBy(() -> projectService.getProjectsByCriteria(testCriteria))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Database error");

        verify(projectDao, times(1)).filter(any(ProjectFilter.class));
    }

    // ========== updateProjectRevenueBudget Tests ==========

    @Test
    void shouldUpdateRevenueBudgetWhenExistingBudgetIsNotNull() {
        BigDecimal initialBudget = testProject.getRevenueBudget();
        BigDecimal revenueAmount = BigDecimal.valueOf(5000.00);
        BigDecimal expectedBudget = initialBudget.add(revenueAmount);

        when(projectDao.update(any(Project.class))).thenReturn(testProject);

        projectService.updateProjectRevenueBudget(revenueAmount, testProject);

        assertThat(testProject.getRevenueBudget()).isEqualTo(expectedBudget);
        verify(projectDao, times(1)).update(testProject);
    }

    @Test
    void shouldSetRevenueBudgetWhenExistingBudgetIsNull() {
        testProject.setRevenueBudget(null);
        BigDecimal revenueAmount = BigDecimal.valueOf(5000.00);

        when(projectDao.update(any(Project.class))).thenReturn(testProject);

        projectService.updateProjectRevenueBudget(revenueAmount, testProject);

        assertThat(testProject.getRevenueBudget()).isEqualTo(revenueAmount);
        verify(projectDao, times(1)).update(testProject);
    }

    @Test
    void shouldUpdateRevenueBudgetWithNegativeAmount() {
        BigDecimal initialBudget = BigDecimal.valueOf(10000.00);
        testProject.setRevenueBudget(initialBudget);
        BigDecimal revenueAmount = BigDecimal.valueOf(-2000.00);
        BigDecimal expectedBudget = BigDecimal.valueOf(8000.00);

        when(projectDao.update(any(Project.class))).thenReturn(testProject);

        projectService.updateProjectRevenueBudget(revenueAmount, testProject);

        assertThat(testProject.getRevenueBudget()).isEqualTo(expectedBudget);
        verify(projectDao, times(1)).update(testProject);
    }

    @Test
    void shouldUpdateRevenueBudgetWithZeroAmount() {
        BigDecimal initialBudget = testProject.getRevenueBudget();
        BigDecimal revenueAmount = BigDecimal.ZERO;

        when(projectDao.update(any(Project.class))).thenReturn(testProject);

        projectService.updateProjectRevenueBudget(revenueAmount, testProject);

        assertThat(testProject.getRevenueBudget()).isEqualTo(initialBudget);
        verify(projectDao, times(1)).update(testProject);
    }

    @Test
    void shouldHandleMultipleRevenueBudgetUpdates() {
        BigDecimal initialBudget = BigDecimal.valueOf(10000.00);
        testProject.setRevenueBudget(initialBudget);

        when(projectDao.update(any(Project.class))).thenReturn(testProject);

        projectService.updateProjectRevenueBudget(BigDecimal.valueOf(1000.00), testProject);
        projectService.updateProjectRevenueBudget(BigDecimal.valueOf(2000.00), testProject);
        projectService.updateProjectRevenueBudget(BigDecimal.valueOf(3000.00), testProject);

        assertThat(testProject.getRevenueBudget()).isEqualTo(BigDecimal.valueOf(16000.00));
        verify(projectDao, times(3)).update(testProject);
    }

    @Test
    void shouldUpdateRevenueBudgetWithLargeDecimalValues() {
        testProject.setRevenueBudget(BigDecimal.valueOf(999999999.99));
        BigDecimal largeAmount = BigDecimal.valueOf(5000000.50);

        when(projectDao.update(any(Project.class))).thenReturn(testProject);

        projectService.updateProjectRevenueBudget(largeAmount, testProject);

        assertThat(testProject.getRevenueBudget())
                .isEqualTo(BigDecimal.valueOf(1004999999.99).add(BigDecimal.valueOf(0.50)));
        verify(projectDao, times(1)).update(testProject);
    }

    @Test
    void shouldUpdateRevenueBudgetWithVerySmallDecimalAmount() {
        testProject.setRevenueBudget(BigDecimal.valueOf(1000.00));
        BigDecimal verySmallAmount = BigDecimal.valueOf(0.01);

        when(projectDao.update(any(Project.class))).thenReturn(testProject);

        projectService.updateProjectRevenueBudget(verySmallAmount, testProject);

        assertThat(testProject.getRevenueBudget()).isEqualTo(BigDecimal.valueOf(1000.01));
        verify(projectDao, times(1)).update(testProject);
    }

    // ========== getProjectsForDropdown Tests ==========

    @Test
    void shouldReturnDropdownModelsWhenProjectsExist() {
        DropdownModel dropdown1 = new DropdownModel(1, "Test Project");
        DropdownModel dropdown2 = new DropdownModel(2, "Second Project");
        List<DropdownModel> expectedList = Arrays.asList(dropdown1, dropdown2);

        when(projectDao.getProjectsForDropdown()).thenReturn(expectedList);

        List<DropdownModel> result = projectService.getProjectsForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("Test Project");
        assertThat(result.get(1).getValue()).isEqualTo(2);
        assertThat(result.get(1).getLabel()).isEqualTo("Second Project");
        verify(projectDao, times(1)).getProjectsForDropdown();
    }

    @Test
    void shouldReturnEmptyListWhenNoProjectsForDropdown() {
        when(projectDao.getProjectsForDropdown()).thenReturn(Collections.emptyList());

        List<DropdownModel> result = projectService.getProjectsForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(projectDao, times(1)).getProjectsForDropdown();
    }

    @Test
    void shouldReturnSingleDropdownModel() {
        DropdownModel dropdown = new DropdownModel(1, "Test Project");
        List<DropdownModel> expectedList = Collections.singletonList(dropdown);

        when(projectDao.getProjectsForDropdown()).thenReturn(expectedList);

        List<DropdownModel> result = projectService.getProjectsForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("Test Project");
        verify(projectDao, times(1)).getProjectsForDropdown();
    }

    @Test
    void shouldHandleMultipleDropdownModels() {
        List<DropdownModel> expectedList = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            expectedList.add(new DropdownModel(i, "Project " + i));
        }

        when(projectDao.getProjectsForDropdown()).thenReturn(expectedList);

        List<DropdownModel> result = projectService.getProjectsForDropdown();

        assertThat(result).isNotNull();
        assertThat(result).hasSize(10);
        assertThat(result.get(0).getLabel()).isEqualTo("Project 1");
        assertThat(result.get(9).getLabel()).isEqualTo("Project 10");
        verify(projectDao, times(1)).getProjectsForDropdown();
    }

    // ========== deleteByIds Tests ==========

    @Test
    void shouldDeleteSingleProjectById() {
        List<Integer> ids = Collections.singletonList(1);

        projectService.deleteByIds(ids);

        verify(projectDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteMultipleProjectsByIds() {
        List<Integer> ids = Arrays.asList(1, 2, 3, 4, 5);

        projectService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(projectDao, times(1)).deleteByIds(captor.capture());

        List<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(5);
        assertThat(capturedIds).containsExactly(1, 2, 3, 4, 5);
    }

    @Test
    void shouldHandleEmptyIdsList() {
        List<Integer> ids = Collections.emptyList();

        projectService.deleteByIds(ids);

        verify(projectDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleLargeNumberOfIds() {
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
        }

        projectService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(projectDao, times(1)).deleteByIds(captor.capture());

        List<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(100);
        assertThat(capturedIds.get(0)).isEqualTo(1);
        assertThat(capturedIds.get(99)).isEqualTo(100);
    }

    // ========== getProjectList Tests ==========

    @Test
    void shouldReturnProjectListWhenValidFilterMapProvided() {
        Map<ProjectFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ProjectFilterEnum.DELETE_FLAG, false);
        PaginationModel paginationModel = new PaginationModel();
        paginationModel.setPage(1);
        paginationModel.setPageSize(10);

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(1L);
        expectedResponse.setData(Arrays.asList(testProject));

        when(projectDao.getProjectList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = projectService.getProjectList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(1L);
        assertThat(result.getData()).hasSize(1);
        verify(projectDao, times(1)).getProjectList(filterMap, paginationModel);
    }

    @Test
    void shouldReturnEmptyProjectListWhenNoMatches() {
        Map<ProjectFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(ProjectFilterEnum.DELETE_FLAG, true);
        PaginationModel paginationModel = new PaginationModel();

        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(0L);
        expectedResponse.setData(Collections.emptyList());

        when(projectDao.getProjectList(filterMap, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = projectService.getProjectList(filterMap, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(0L);
        assertThat(result.getData()).isEmpty();
        verify(projectDao, times(1)).getProjectList(filterMap, paginationModel);
    }

    @Test
    void shouldHandleNullFilterMap() {
        PaginationModel paginationModel = new PaginationModel();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(1L);
        expectedResponse.setData(Arrays.asList(testProject));

        when(projectDao.getProjectList(null, paginationModel)).thenReturn(expectedResponse);

        PaginationResponseModel result = projectService.getProjectList(null, paginationModel);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(1L);
        verify(projectDao, times(1)).getProjectList(null, paginationModel);
    }

    @Test
    void shouldHandleNullPaginationModel() {
        Map<ProjectFilterEnum, Object> filterMap = new HashMap<>();
        PaginationResponseModel expectedResponse = new PaginationResponseModel();
        expectedResponse.setTotalRecords(1L);
        expectedResponse.setData(Arrays.asList(testProject));

        when(projectDao.getProjectList(filterMap, null)).thenReturn(expectedResponse);

        PaginationResponseModel result = projectService.getProjectList(filterMap, null);

        assertThat(result).isNotNull();
        assertThat(result.getTotalRecords()).isEqualTo(1L);
        verify(projectDao, times(1)).getProjectList(filterMap, null);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindProjectByPrimaryKey() {
        when(projectDao.findByPK(1)).thenReturn(testProject);

        Project result = projectService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testProject);
        assertThat(result.getProjectId()).isEqualTo(1);
        verify(projectDao, times(1)).findByPK(1);
    }

    @Test
    void shouldReturnNullWhenProjectNotFoundByPK() {
        when(projectDao.findByPK(999)).thenReturn(null);

        Project result = projectService.findByPK(999);

        assertThat(result).isNull();
        verify(projectDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewProject() {
        projectService.persist(testProject);

        verify(projectDao, times(1)).persist(testProject);
    }

    @Test
    void shouldUpdateExistingProject() {
        when(projectDao.update(testProject)).thenReturn(testProject);

        Project result = projectService.update(testProject);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testProject);
        verify(projectDao, times(1)).update(testProject);
    }

    @Test
    void shouldUpdateProjectAndReturnUpdatedEntity() {
        testProject.setProjectName("Updated Project Name");
        when(projectDao.update(testProject)).thenReturn(testProject);

        Project result = projectService.update(testProject);

        assertThat(result).isNotNull();
        assertThat(result.getProjectName()).isEqualTo("Updated Project Name");
        verify(projectDao, times(1)).update(testProject);
    }

    @Test
    void shouldDeleteProject() {
        projectService.delete(testProject);

        verify(projectDao, times(1)).delete(testProject);
    }

    @Test
    void shouldFindProjectsByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("projectName", "Test Project");
        attributes.put("deleteFlag", false);

        List<Project> expectedList = Arrays.asList(testProject);
        when(projectDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<Project> result = projectService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testProject);
        verify(projectDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("projectName", "Non-existent Project");

        when(projectDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<Project> result = projectService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(projectDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleProjectWithNullRevenueBudget() {
        Project projectWithNullBudget = new Project();
        projectWithNullBudget.setProjectId(2);
        projectWithNullBudget.setProjectName("Project with null budget");
        projectWithNullBudget.setRevenueBudget(null);

        when(projectDao.update(any(Project.class))).thenReturn(projectWithNullBudget);

        projectService.updateProjectRevenueBudget(BigDecimal.valueOf(100), projectWithNullBudget);

        assertThat(projectWithNullBudget.getRevenueBudget()).isEqualTo(BigDecimal.valueOf(100));
        verify(projectDao, times(1)).update(projectWithNullBudget);
    }

    @Test
    void shouldHandleNegativeBudgetResults() {
        testProject.setRevenueBudget(BigDecimal.valueOf(100.00));
        BigDecimal largeNegative = BigDecimal.valueOf(-200.00);

        when(projectDao.update(any(Project.class))).thenReturn(testProject);

        projectService.updateProjectRevenueBudget(largeNegative, testProject);

        assertThat(testProject.getRevenueBudget()).isEqualTo(BigDecimal.valueOf(-100.00));
        verify(projectDao, times(1)).update(testProject);
    }

    @Test
    void shouldHandleProjectWithMinimalData() {
        Project minimalProject = new Project();
        minimalProject.setProjectId(99);
        minimalProject.setRevenueBudget(BigDecimal.ZERO);

        when(projectDao.findByPK(99)).thenReturn(minimalProject);

        Project result = projectService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getProjectId()).isEqualTo(99);
        assertThat(result.getProjectName()).isNull();
        verify(projectDao, times(1)).findByPK(99);
    }
}
