package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.ProjectFilterEnum;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
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
@DisplayName("ProjectDaoImpl Unit Tests")
class ProjectDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<Project> projectTypedQuery;

    @Mock
    private TypedQuery<DropdownModel> dropdownTypedQuery;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private ProjectDaoImpl projectDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(projectDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(projectDao, "entityClass", Project.class);
    }

    @Test
    @DisplayName("Should return projects for dropdown")
    void getProjectsForDropdownReturnsProjectList() {
        // Arrange
        List<DropdownModel> dropdownModels = createDropdownModelList(5);
        when(entityManager.createNamedQuery("projectsForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(dropdownModels);

        // Act
        List<DropdownModel> result = projectDao.getProjectsForDropdown();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(dropdownModels);
    }

    @Test
    @DisplayName("Should return empty dropdown list when no projects exist")
    void getProjectsForDropdownReturnsEmptyListWhenNoProjects() {
        // Arrange
        when(entityManager.createNamedQuery("projectsForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<DropdownModel> result = projectDao.getProjectsForDropdown();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use projectsForDropdown named query")
    void getProjectsForDropdownUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("projectsForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        projectDao.getProjectsForDropdown();

        // Assert
        verify(entityManager).createNamedQuery("projectsForDropdown", DropdownModel.class);
    }

    @Test
    @DisplayName("Should soft delete projects by setting delete flag")
    void deleteByIdsSetsDeleteFlagOnProjects() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        Project project1 = createProject(1, "Project1");
        Project project2 = createProject(2, "Project2");
        Project project3 = createProject(3, "Project3");

        when(entityManager.find(Project.class, 1)).thenReturn(project1);
        when(entityManager.find(Project.class, 2)).thenReturn(project2);
        when(entityManager.find(Project.class, 3)).thenReturn(project3);
        when(entityManager.merge(any(Project.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        projectDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(3)).merge(any(Project.class));
        assertThat(project1.getDeleteFlag()).isTrue();
        assertThat(project2.getDeleteFlag()).isTrue();
        assertThat(project3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNotDeleteWhenListEmpty() {
        // Arrange
        List<Integer> emptyIds = new ArrayList<>();

        // Act
        projectDao.deleteByIds(emptyIds);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNotDeleteWhenListNull() {
        // Act
        projectDao.deleteByIds(null);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should delete single project")
    void deleteByIdsDeletesSingleProject() {
        // Arrange
        List<Integer> ids = Collections.singletonList(1);
        Project project = createProject(1, "Test Project");

        when(entityManager.find(Project.class, 1)).thenReturn(project);
        when(entityManager.merge(any(Project.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        projectDao.deleteByIds(ids);

        // Assert
        verify(entityManager).merge(project);
        assertThat(project.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should find and update each project by ID")
    void deleteByIdsFindsAndUpdatesEachProject() {
        // Arrange
        List<Integer> ids = Arrays.asList(5, 10);
        Project project1 = createProject(5, "Project5");
        Project project2 = createProject(10, "Project10");

        when(entityManager.find(Project.class, 5)).thenReturn(project1);
        when(entityManager.find(Project.class, 10)).thenReturn(project2);
        when(entityManager.merge(any(Project.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        projectDao.deleteByIds(ids);

        // Assert
        verify(entityManager).find(Project.class, 5);
        verify(entityManager).find(Project.class, 10);
        verify(entityManager, times(2)).merge(any(Project.class));
    }

    @Test
    @DisplayName("Should handle delete flag properly")
    void deleteByIdsSetsDeleteFlagProperly() {
        // Arrange
        Project project = createProject(1, "Test");
        project.setDeleteFlag(Boolean.FALSE);

        when(entityManager.find(Project.class, 1)).thenReturn(project);
        when(entityManager.merge(any(Project.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        projectDao.deleteByIds(Collections.singletonList(1));

        // Assert
        assertThat(project.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should call merge for each project in deleteByIds")
    void deleteByIdsCallsMergeForEachProject() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2);
        when(entityManager.find(eq(Project.class), any(Integer.class)))
            .thenReturn(createProject(1, "Test"));
        when(entityManager.merge(any(Project.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // Act
        projectDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(2)).merge(any(Project.class));
    }

    @Test
    @DisplayName("Should handle large number of IDs for deletion")
    void deleteByIdsHandlesLargeNumberOfIds() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
            when(entityManager.find(Project.class, i))
                .thenReturn(createProject(i, "Project" + i));
        }
        when(entityManager.merge(any(Project.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        projectDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(100)).find(eq(Project.class), any(Integer.class));
        verify(entityManager, times(100)).merge(any(Project.class));
    }

    @Test
    @DisplayName("Should return correct dropdown model structure")
    void getProjectsForDropdownReturnsCorrectStructure() {
        // Arrange
        DropdownModel model1 = new DropdownModel(1, "Project 1");
        DropdownModel model2 = new DropdownModel(2, "Project 2");
        List<DropdownModel> models = Arrays.asList(model1, model2);

        when(entityManager.createNamedQuery("projectsForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(models);

        // Act
        List<DropdownModel> result = projectDao.getProjectsForDropdown();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getValue()).isEqualTo(1);
        assertThat(result.get(0).getLabel()).isEqualTo("Project 1");
    }

    @Test
    @DisplayName("Should return pagination response model with project list")
    void getProjectListReturnsPaginationResponseModel() {
        // Arrange
        Map<ProjectFilterEnum, Object> filterMap = new EnumMap<>(ProjectFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "projectName", "ASC");

        List<Project> projects = createProjectList(5);
        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PROJECT)))
            .thenReturn("projectName");
        when(entityManager.createQuery(anyString(), eq(Project.class)))
            .thenReturn(projectTypedQuery);
        when(projectTypedQuery.getResultList())
            .thenReturn(projects);

        // Act
        PaginationResponseModel result = projectDao.getProjectList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should apply filters to project list query")
    void getProjectListAppliesFilters() {
        // Arrange
        Map<ProjectFilterEnum, Object> filterMap = new EnumMap<>(ProjectFilterEnum.class);
        filterMap.put(ProjectFilterEnum.PROJECT_NAME, "Test");
        PaginationModel paginationModel = createPaginationModel(0, 10, "projectName", "ASC");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PROJECT)))
            .thenReturn("projectName");
        when(entityManager.createQuery(anyString(), eq(Project.class)))
            .thenReturn(projectTypedQuery);
        when(projectTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        projectDao.getProjectList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil).getColName(anyString(), eq(DatatableSortingFilterConstant.PROJECT));
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getProjectListHandlesEmptyFilterMap() {
        // Arrange
        Map<ProjectFilterEnum, Object> emptyFilterMap = new EnumMap<>(ProjectFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "projectName", "ASC");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PROJECT)))
            .thenReturn("projectName");
        when(entityManager.createQuery(anyString(), eq(Project.class)))
            .thenReturn(projectTypedQuery);
        when(projectTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = projectDao.getProjectList(emptyFilterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should set sorting column from pagination model")
    void getProjectListSetsSortingColumn() {
        // Arrange
        Map<ProjectFilterEnum, Object> filterMap = new EnumMap<>(ProjectFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "3", "ASC");

        when(dataTableUtil.getColName("3", DatatableSortingFilterConstant.PROJECT))
            .thenReturn("projectName");
        when(entityManager.createQuery(anyString(), eq(Project.class)))
            .thenReturn(projectTypedQuery);
        when(projectTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        projectDao.getProjectList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil).getColName("3", DatatableSortingFilterConstant.PROJECT);
        assertThat(paginationModel.getSortingCol()).isEqualTo("projectName");
    }

    @Test
    @DisplayName("Should verify project entity structure")
    void projectEntityHasCorrectStructure() {
        // Arrange
        Project project = createProject(1, "Test Project");
        project.setExpenseBudget(new BigDecimal("1000.00"));
        project.setRevenueBudget(new BigDecimal("5000.00"));
        project.setContractPoNumber("PO-123");

        // Assert
        assertThat(project.getProjectId()).isEqualTo(1);
        assertThat(project.getProjectName()).isEqualTo("Test Project");
        assertThat(project.getExpenseBudget()).isEqualTo(new BigDecimal("1000.00"));
        assertThat(project.getRevenueBudget()).isEqualTo(new BigDecimal("5000.00"));
        assertThat(project.getContractPoNumber()).isEqualTo("PO-123");
        assertThat(project.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should return multiple projects for dropdown")
    void getProjectsForDropdownReturnsMultipleProjects() {
        // Arrange
        List<DropdownModel> dropdownModels = createDropdownModelList(10);
        when(entityManager.createNamedQuery("projectsForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(dropdownModels);

        // Act
        List<DropdownModel> result = projectDao.getProjectsForDropdown();

        // Assert
        assertThat(result).hasSize(10);
        verify(dropdownTypedQuery).getResultList();
    }

    @Test
    @DisplayName("Should maintain delete flag false for new projects")
    void newProjectHasDeleteFlagFalse() {
        // Arrange & Act
        Project project = createProject(100, "New Project");

        // Assert
        assertThat(project.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should handle null pagination model gracefully")
    void getProjectListHandlesNullPaginationModel() {
        // Arrange
        Map<ProjectFilterEnum, Object> filterMap = new EnumMap<>(ProjectFilterEnum.class);

        when(entityManager.createQuery(anyString(), eq(Project.class)))
            .thenReturn(projectTypedQuery);
        when(projectTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = projectDao.getProjectList(filterMap, null);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should process multiple filters correctly")
    void getProjectListProcessesMultipleFilters() {
        // Arrange
        Map<ProjectFilterEnum, Object> filterMap = new EnumMap<>(ProjectFilterEnum.class);
        filterMap.put(ProjectFilterEnum.PROJECT_NAME, "Test");
        filterMap.put(ProjectFilterEnum.DELETE_FLAG, false);
        PaginationModel paginationModel = createPaginationModel(0, 10, "projectName", "ASC");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PROJECT)))
            .thenReturn("projectName");
        when(entityManager.createQuery(anyString(), eq(Project.class)))
            .thenReturn(projectTypedQuery);
        when(projectTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        PaginationResponseModel result = projectDao.getProjectList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        verify(entityManager, times(2)).createQuery(anyString(), eq(Project.class));
    }

    @Test
    @DisplayName("Should correctly count total results")
    void getProjectListReturnsCorrectTotalCount() {
        // Arrange
        Map<ProjectFilterEnum, Object> filterMap = new EnumMap<>(ProjectFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "projectName", "ASC");
        List<Project> projects = createProjectList(15);

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.PROJECT)))
            .thenReturn("projectName");
        when(entityManager.createQuery(anyString(), eq(Project.class)))
            .thenReturn(projectTypedQuery);
        when(projectTypedQuery.getResultList())
            .thenReturn(projects);

        // Act
        PaginationResponseModel result = projectDao.getProjectList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRecordsTotal()).isEqualTo(15);
    }

    @Test
    @DisplayName("Should verify named query is called exactly once")
    void getProjectsForDropdownCallsNamedQueryOnce() {
        // Arrange
        when(entityManager.createNamedQuery("projectsForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        projectDao.getProjectsForDropdown();

        // Assert
        verify(entityManager, times(1)).createNamedQuery("projectsForDropdown", DropdownModel.class);
    }

    private List<Project> createProjectList(int count) {
        List<Project> projects = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            projects.add(createProject(i + 1, "Project " + (i + 1)));
        }
        return projects;
    }

    private Project createProject(int id, String name) {
        Project project = new Project();
        project.setProjectId(id);
        project.setProjectName(name);
        project.setDeleteFlag(Boolean.FALSE);
        project.setExpenseBudget(BigDecimal.ZERO);
        project.setRevenueBudget(BigDecimal.ZERO);
        return project;
    }

    private List<DropdownModel> createDropdownModelList(int count) {
        List<DropdownModel> models = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            models.add(new DropdownModel(i + 1, "Project " + (i + 1)));
        }
        return models;
    }

    private PaginationModel createPaginationModel(int pageNo, int pageSize, String sortingCol, String order) {
        PaginationModel model = new PaginationModel();
        model.setPageNo(pageNo);
        model.setPageSize(pageSize);
        model.setSortingCol(sortingCol);
        model.setOrder(order);
        return model;
    }
}
