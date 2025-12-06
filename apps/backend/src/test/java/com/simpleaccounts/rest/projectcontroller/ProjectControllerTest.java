package com.simpleaccounts.rest.projectcontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.constant.dbfilter.ProjectFilterEnum;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.ProjectService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private ProjectService projectService;
    @MockBean private ProjectRestHelper projectRestHelper;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getProductByIdShouldReturnProject() throws Exception {
        Project project = new Project();
        project.setProjectId(1);
        project.setProjectName("Test Project");

        ProjectRequestModel requestModel = new ProjectRequestModel();
        requestModel.setProjectId(1);
        requestModel.setProjectName("Test Project");

        when(projectService.findByPK(1)).thenReturn(project);
        when(projectRestHelper.getRequestModel(project)).thenReturn(requestModel);

        mockMvc.perform(get("/rest/project/getProjectById")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.projectId").value(1))
                .andExpect(jsonPath("$.projectName").value("Test Project"));

        verify(projectService).findByPK(1);
    }

    @Test
    void getProductByIdShouldReturnNotFoundForNullProject() throws Exception {
        when(projectService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/project/getProjectById")
                        .param("id", "999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getProductListShouldReturnPaginatedList() throws Exception {
        Project project = new Project();
        project.setProjectId(1);
        project.setProjectName("Test Project");

        ProjectViewModel viewModel = new ProjectViewModel();
        viewModel.setProjectId(1);
        viewModel.setProjectName("Test Project");

        PaginationResponseModel pagination = new PaginationResponseModel(1, Arrays.asList(project));
        when(projectService.getProjectList(any(), any())).thenReturn(pagination);
        when(projectRestHelper.getListModel(any())).thenReturn(Arrays.asList(viewModel));

        mockMvc.perform(get("/rest/project/getList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(1));

        verify(projectService).getProjectList(any(), any());
        verify(projectRestHelper).getListModel(any());
    }

    @Test
    void getProductListShouldApplyFilters() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(projectService.getProjectList(any(), any())).thenReturn(pagination);
        when(projectRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/project/getList")
                        .param("projectName", "Test Project")
                        .param("vatRegistrationNumber", "VAT123")
                        .param("revenueBudget", "10000")
                        .param("expenseBudget", "5000"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(projectService).getProjectList(captor.capture(), any());
        Map<ProjectFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ProjectFilterEnum.PROJECT_NAME, "Test Project");
        assertThat(filterData).containsEntry(ProjectFilterEnum.VAT_REGISTRATION_NUMBER, "VAT123");
    }

    @Test
    void getProductListShouldReturnNotFoundForNullResponse() throws Exception {
        when(projectService.getProjectList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/project/getList"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getProjectsForDropdownShouldReturnList() throws Exception {
        List<DropdownModel> dropdownList = Arrays.asList(
                new DropdownModel(1, "Project 1"),
                new DropdownModel(2, "Project 2")
        );

        when(projectService.getProjectsForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/project/getProjectsForDropdown"))
                .andExpect(status().isOk());

        verify(projectService).getProjectsForDropdown();
    }

    @Test
    void deleteProjectShouldDeleteExistingProject() throws Exception {
        Project project = new Project();
        project.setProjectId(1);

        when(projectService.findByPK(1)).thenReturn(project);

        mockMvc.perform(delete("/rest/project/delete")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successfully")));

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectService).update(captor.capture());
        assertThat(captor.getValue().getDeleteFlag()).isTrue();
    }

    @Test
    void deleteProjectShouldReturnNotFoundForNullProject() throws Exception {
        when(projectService.findByPK(999)).thenReturn(null);

        mockMvc.perform(delete("/rest/project/delete")
                        .param("id", "999"))
                .andExpect(status().isNotFound());

        verify(projectService, never()).update(any());
    }

    @Test
    void deleteProjectShouldHandleException() throws Exception {
        when(projectService.findByPK(1)).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(delete("/rest/project/delete")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteProjectsShouldDeleteMultipleProjects() throws Exception {
        mockMvc.perform(delete("/rest/project/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isOk());

        verify(projectService).deleteByIds(any());
    }

    @Test
    void deleteProjectsShouldHandleException() throws Exception {
        when(projectService.deleteByIds(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(delete("/rest/project/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"ids\":[1,2,3]}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveProjectShouldPersistProject() throws Exception {
        Project project = new Project();
        project.setProjectName("New Project");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(projectRestHelper.getEntity(any())).thenReturn(project);

        mockMvc.perform(post("/rest/project/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projectName\":\"New Project\",\"revenueBudget\":10000}"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Saved Successfully")));

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectService).persist(captor.capture());
        assertThat(captor.getValue().getCreatedBy()).isEqualTo(1);
        assertThat(captor.getValue().getCreatedDate()).isNotNull();
    }

    @Test
    void updateShouldUpdateProject() throws Exception {
        Project project = new Project();
        project.setProjectId(1);
        project.setProjectName("Updated Project");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(projectRestHelper.getEntity(any())).thenReturn(project);

        mockMvc.perform(post("/rest/project/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projectId\":1,\"projectName\":\"Updated Project\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Updated Successfully")));

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectService).update(captor.capture());
        assertThat(captor.getValue().getLastUpdateBy()).isEqualTo(1);
        assertThat(captor.getValue().getLastUpdateDate()).isNotNull();
    }

    @Test
    void getProductListShouldHandleEmptyResults() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(projectService.getProjectList(any(), any())).thenReturn(pagination);
        when(projectRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/project/getList"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void getProductListShouldApplyDeleteFlagFilter() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(projectService.getProjectList(any(), any())).thenReturn(pagination);
        when(projectRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/project/getList")
                        .param("deleteFlag", "false"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(projectService).getProjectList(captor.capture(), any());
        Map<ProjectFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ProjectFilterEnum.DELETE_FLAG, false);
    }

    @Test
    void getProductListShouldApplyProjectIdFilter() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(projectService.getProjectList(any(), any())).thenReturn(pagination);
        when(projectRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/project/getList")
                        .param("projectId", "5"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(projectService).getProjectList(captor.capture(), any());
        Map<ProjectFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ProjectFilterEnum.PROJECT_ID, 5);
    }

    @Test
    void saveProjectShouldSetCreatedByAndDate() throws Exception {
        Project project = new Project();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(10);
        when(projectRestHelper.getEntity(any())).thenReturn(project);

        mockMvc.perform(post("/rest/project/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projectName\":\"Test\"}"))
                .andExpect(status().isOk());

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectService).persist(captor.capture());

        Project savedProject = captor.getValue();
        assertThat(savedProject.getCreatedBy()).isEqualTo(10);
        assertThat(savedProject.getCreatedDate()).isNotNull();
    }

    @Test
    void updateShouldSetLastUpdateByAndDate() throws Exception {
        Project project = new Project();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(15);
        when(projectRestHelper.getEntity(any())).thenReturn(project);

        mockMvc.perform(post("/rest/project/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"projectId\":1,\"projectName\":\"Test\"}"))
                .andExpect(status().isOk());

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectService).update(captor.capture());

        Project updatedProject = captor.getValue();
        assertThat(updatedProject.getLastUpdateBy()).isEqualTo(15);
        assertThat(updatedProject.getLastUpdateDate()).isNotNull();
    }

    @Test
    void getProjectsForDropdownShouldReturnEmptyListWhenNoProjects() throws Exception {
        when(projectService.getProjectsForDropdown()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/project/getProjectsForDropdown"))
                .andExpect(status().isOk());
    }

    @Test
    void getProductListShouldApplyRevenueBudgetFilter() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(projectService.getProjectList(any(), any())).thenReturn(pagination);
        when(projectRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/project/getList")
                        .param("revenueBudget", "50000"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(projectService).getProjectList(captor.capture(), any());
        Map<ProjectFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ProjectFilterEnum.REVENUE_BUDGET, 50000);
    }

    @Test
    void getProductListShouldApplyExpenseBudgetFilter() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(0, new ArrayList<>());
        when(projectService.getProjectList(any(), any())).thenReturn(pagination);
        when(projectRestHelper.getListModel(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/project/getList")
                        .param("expenseBudget", "25000"))
                .andExpect(status().isOk());

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(projectService).getProjectList(captor.capture(), any());
        Map<ProjectFilterEnum, Object> filterData = captor.getValue();

        assertThat(filterData).containsEntry(ProjectFilterEnum.EXPENSE_BUDGET, 25000);
    }

    @Test
    void deleteProjectShouldSetDeleteFlagToTrue() throws Exception {
        Project project = new Project();
        project.setProjectId(1);
        project.setDeleteFlag(false);

        when(projectService.findByPK(1)).thenReturn(project);

        mockMvc.perform(delete("/rest/project/delete")
                        .param("id", "1"))
                .andExpect(status().isOk());

        ArgumentCaptor<Project> captor = ArgumentCaptor.forClass(Project.class);
        verify(projectService).update(captor.capture());
        assertThat(captor.getValue().getDeleteFlag()).isTrue();
    }
}
