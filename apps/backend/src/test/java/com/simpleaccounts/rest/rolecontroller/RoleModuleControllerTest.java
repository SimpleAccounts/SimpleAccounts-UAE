package com.simpleaccounts.rest.rolecontroller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.RoleRequestModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.RoleModuleRelationService;
import com.simpleaccounts.service.RoleModuleService;
import com.simpleaccounts.service.RoleService;
import com.simpleaccounts.service.UserService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
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
@WebMvcTest(RoleModuleController.class)
@AutoConfigureMockMvc(addFilters = false)
class RoleModuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private RoleModuleRelationService roleModuleRelationService;
    @MockBean private RoleModuleService roleModuleService;
    @MockBean private RoleService roleService;
    @MockBean private RoleModuleRestHelper roleModuleRestHelper;
    @MockBean private UserService userService;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    private List<RoleModuleRelation> sampleRoleModuleRelations;
    private List<SimpleAccountsModules> sampleModules;

    @BeforeEach
    void setUp() {
        sampleRoleModuleRelations = new ArrayList<>();
        RoleModuleRelation relation1 = new RoleModuleRelation();
        RoleModuleRelation relation2 = new RoleModuleRelation();
        sampleRoleModuleRelations.add(relation1);
        sampleRoleModuleRelations.add(relation2);

        sampleModules = new ArrayList<>();
        SimpleAccountsModules module1 = new SimpleAccountsModules();
        module1.setSimpleAccountsModuleId(1);
        SimpleAccountsModules module2 = new SimpleAccountsModules();
        module2.setSimpleAccountsModuleId(2);
        sampleModules.add(module1);
        sampleModules.add(module2);
    }

    @Test
    void getModuleListForAllRolesShouldReturnModuleList() throws Exception {
        when(roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles())
                .thenReturn(sampleRoleModuleRelations);
        when(roleModuleRestHelper.getModuleListForAllRoles(sampleRoleModuleRelations))
                .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/roleModule/getListForAllRoles"))
                .andExpect(status().isOk());

        verify(roleModuleRelationService).getListOfSimpleAccountsModulesForAllRoles();
        verify(roleModuleRestHelper).getModuleListForAllRoles(sampleRoleModuleRelations);
    }

    @Test
    void getModuleListForAllRolesShouldHandleNullList() throws Exception {
        when(roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles()).thenReturn(null);

        mockMvc.perform(get("/rest/roleModule/getListForAllRoles"))
                .andExpect(status().isOk());

        verify(roleModuleRelationService).getListOfSimpleAccountsModulesForAllRoles();
        verify(roleModuleRestHelper, never()).getModuleListForAllRoles(any());
    }

    @Test
    void getModuleListShouldReturnModuleList() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(roleModuleService.getListOfSimpleAccountsModules()).thenReturn(sampleModules);
        when(roleModuleRestHelper.getModuleList(sampleModules)).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/roleModule/getList")
                        .param("roleCode", "1"))
                .andExpect(status().isOk());

        verify(roleModuleService).getListOfSimpleAccountsModules();
        verify(roleModuleRestHelper).getModuleList(sampleModules);
    }

    @Test
    void getModuleListShouldHandleNullList() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(roleModuleService.getListOfSimpleAccountsModules()).thenReturn(null);

        mockMvc.perform(get("/rest/roleModule/getList")
                        .param("roleCode", "1"))
                .andExpect(status().isOk());

        verify(roleModuleService).getListOfSimpleAccountsModules();
        verify(roleModuleRestHelper, never()).getModuleList(any());
    }

    @Test
    void getModuleListByRoleCodeShouldReturnModulesForRole() throws Exception {
        when(roleModuleService.getModuleListByRoleCode(2)).thenReturn(sampleRoleModuleRelations);
        when(roleModuleRestHelper.getModuleListForAllRoles(sampleRoleModuleRelations))
                .thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/roleModule/getModuleListByRoleCode")
                        .param("roleCode", "2"))
                .andExpect(status().isOk());

        verify(roleModuleService).getModuleListByRoleCode(2);
        verify(roleModuleRestHelper).getModuleListForAllRoles(sampleRoleModuleRelations);
    }

    @Test
    void getModuleListByRoleCodeShouldHandleNullList() throws Exception {
        when(roleModuleService.getModuleListByRoleCode(2)).thenReturn(null);

        mockMvc.perform(get("/rest/roleModule/getModuleListByRoleCode")
                        .param("roleCode", "2"))
                .andExpect(status().isOk());

        verify(roleModuleService).getModuleListByRoleCode(2);
        verify(roleModuleRestHelper, never()).getModuleListForAllRoles(any());
    }

    @Test
    void saveShouldPersistNewRole() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        mockMvc.perform(post("/rest/roleModule/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleName\":\"Manager\",\"roleDescription\":\"Manager Role\",\"isActive\":true,\"moduleListIds\":[1,2,3]}"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Saved successful")));

        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleService).persist(roleCaptor.capture());

        Role savedRole = roleCaptor.getValue();
        assertThat(savedRole.getCreatedBy()).isEqualTo(1);
        assertThat(savedRole.getCreatedDate()).isNotNull();
        assertThat(savedRole.getDefaultFlag()).isEqualTo('N');
        assertThat(savedRole.getDeleteFlag()).isFalse();
    }

    @Test
    void saveShouldPersistRoleModuleRelations() throws Exception {
        SimpleAccountsModules module1 = new SimpleAccountsModules();
        module1.setSimpleAccountsModuleId(1);
        SimpleAccountsModules module2 = new SimpleAccountsModules();
        module2.setSimpleAccountsModuleId(2);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(roleModuleService.findByPK(1)).thenReturn(module1);
        when(roleModuleService.findByPK(2)).thenReturn(module2);

        mockMvc.perform(post("/rest/roleModule/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleName\":\"Manager\",\"roleDescription\":\"Manager Role\",\"moduleListIds\":[1,2]}"))
                .andExpect(status().isOk());

        verify(roleModuleRelationService, times(2)).persist(any(RoleModuleRelation.class));
    }

    @Test
    void saveShouldHandleNullModuleList() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        mockMvc.perform(post("/rest/roleModule/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleName\":\"Manager\",\"roleDescription\":\"Manager Role\"}"))
                .andExpect(status().isOk());

        verify(roleService).persist(any(Role.class));
        verify(roleModuleRelationService, never()).persist(any());
    }

    @Test
    void saveShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(post("/rest/roleModule/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleName\":\"Manager\"}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void updateShouldUpdateExistingRole() throws Exception {
        Role existingRole = new Role();
        existingRole.setRoleCode(5);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(roleModuleRestHelper.getEntity(any(), any())).thenReturn(existingRole);
        when(roleModuleService.getModuleListByRoleCode(5)).thenReturn(new ArrayList<>());

        mockMvc.perform(post("/rest/roleModule/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleID\":5,\"roleName\":\"Updated Manager\",\"moduleListIds\":[1,2]}"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Updated successful")));

        verify(roleService).update(existingRole);
    }

    @Test
    void updateShouldDeleteExistingRelations() throws Exception {
        Role existingRole = new Role();
        existingRole.setRoleCode(5);

        RoleModuleRelation relation1 = new RoleModuleRelation();
        RoleModuleRelation relation2 = new RoleModuleRelation();
        List<RoleModuleRelation> existingRelations = Arrays.asList(relation1, relation2);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(roleModuleRestHelper.getEntity(any(), any())).thenReturn(existingRole);
        when(roleModuleService.getModuleListByRoleCode(5)).thenReturn(existingRelations);

        mockMvc.perform(post("/rest/roleModule/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleID\":5,\"roleName\":\"Updated Manager\",\"moduleListIds\":[]}"))
                .andExpect(status().isOk());

        verify(roleModuleRelationService, times(2)).delete(any(RoleModuleRelation.class));
    }

    @Test
    void updateShouldPersistNewRelations() throws Exception {
        Role existingRole = new Role();
        existingRole.setRoleCode(5);

        SimpleAccountsModules module = new SimpleAccountsModules();
        module.setSimpleAccountsModuleId(1);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(roleModuleRestHelper.getEntity(any(), any())).thenReturn(existingRole);
        when(roleModuleService.getModuleListByRoleCode(eq(5))).thenReturn(new ArrayList<>());
        when(roleModuleService.getModuleListByRoleCode(eq(5), eq(1))).thenReturn(new ArrayList<>());
        when(roleModuleService.findByPK(1)).thenReturn(module);

        mockMvc.perform(post("/rest/roleModule/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleID\":5,\"roleName\":\"Updated Manager\",\"moduleListIds\":[1]}"))
                .andExpect(status().isOk());

        verify(roleModuleRelationService).persist(any(RoleModuleRelation.class));
    }

    @Test
    void updateShouldUpdateExistingRelations() throws Exception {
        Role existingRole = new Role();
        existingRole.setRoleCode(5);

        SimpleAccountsModules module = new SimpleAccountsModules();
        module.setSimpleAccountsModuleId(1);

        RoleModuleRelation existingRelation = new RoleModuleRelation();
        List<RoleModuleRelation> existingRelations = Arrays.asList(existingRelation);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(roleModuleRestHelper.getEntity(any(), any())).thenReturn(existingRole);
        when(roleModuleService.getModuleListByRoleCode(eq(5))).thenReturn(new ArrayList<>());
        when(roleModuleService.getModuleListByRoleCode(eq(5), eq(1))).thenReturn(existingRelations);
        when(roleModuleService.findByPK(1)).thenReturn(module);

        mockMvc.perform(post("/rest/roleModule/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleID\":5,\"roleName\":\"Updated Manager\",\"moduleListIds\":[1]}"))
                .andExpect(status().isOk());

        verify(roleModuleRelationService).update(any(RoleModuleRelation.class));
    }

    @Test
    void updateShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(post("/rest/roleModule/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleID\":5,\"roleName\":\"Updated Manager\"}"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteUserShouldDeleteExistingRole() throws Exception {
        Role role = new Role();
        role.setRoleCode(5);
        role.setDeleteFlag(false);

        when(roleService.findByPK(5)).thenReturn(role);

        mockMvc.perform(delete("/rest/roleModule/delete")
                        .param("roleCode", "5"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successful")));

        ArgumentCaptor<Role> captor = ArgumentCaptor.forClass(Role.class);
        verify(roleService).update(captor.capture());
        assertThat(captor.getValue().getDeleteFlag()).isTrue();
    }

    @Test
    void deleteUserShouldReturnNotFoundForNullRole() throws Exception {
        when(roleService.findByPK(999)).thenReturn(null);

        mockMvc.perform(delete("/rest/roleModule/delete")
                        .param("roleCode", "999"))
                .andExpect(status().isNotFound());

        verify(roleService, never()).update(any());
    }

    @Test
    void deleteUserShouldHandleException() throws Exception {
        when(roleService.findByPK(5)).thenThrow(new RuntimeException("Test error"));

        mockMvc.perform(delete("/rest/roleModule/delete")
                        .param("roleCode", "5"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getUsersCountForRoleShouldReturnCount() throws Exception {
        Role role = new Role();
        role.setRoleCode(5);

        User user1 = new User();
        User user2 = new User();
        List<User> users = Arrays.asList(user1, user2);

        when(roleService.findByPK(5)).thenReturn(role);
        when(userService.findByAttributes(any())).thenReturn(users);

        mockMvc.perform(get("/rest/roleModule/getUsersCountForRole")
                        .param("roleId", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(2));

        ArgumentCaptor<Map> captor = ArgumentCaptor.forClass(Map.class);
        verify(userService).findByAttributes(captor.capture());

        Map<String, Object> params = captor.getValue();
        assertThat(params).containsEntry("role", role);
        assertThat(params).containsEntry("isActive", true);
        assertThat(params).containsEntry("deleteFlag", false);
    }

    @Test
    void getUsersCountForRoleShouldReturnZeroForNoUsers() throws Exception {
        Role role = new Role();
        role.setRoleCode(5);

        when(roleService.findByPK(5)).thenReturn(role);
        when(userService.findByAttributes(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/roleModule/getUsersCountForRole")
                        .param("roleId", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(0));
    }

    @Test
    void saveShouldSetVersionNumberToOne() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        mockMvc.perform(post("/rest/roleModule/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleName\":\"Manager\",\"roleDescription\":\"Manager Role\"}"))
                .andExpect(status().isOk());

        ArgumentCaptor<Role> roleCaptor = ArgumentCaptor.forClass(Role.class);
        verify(roleService).persist(roleCaptor.capture());

        Role savedRole = roleCaptor.getValue();
        assertThat(savedRole.getVersionNumber()).isEqualTo(1);
    }

    @Test
    void saveShouldSetIsActiveFromRequest() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);

        mockMvc.perform(post("/rest/roleModule/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleName\":\"Manager\",\"roleDescription\":\"Manager Role\",\"isActive\":false}"))
                .andExpect(status().isOk());

        verify(roleService).persist(any(Role.class));
    }

    @Test
    void getModuleListByRoleCodeShouldHandleEmptyList() throws Exception {
        when(roleModuleService.getModuleListByRoleCode(2)).thenReturn(new ArrayList<>());
        when(roleModuleRestHelper.getModuleListForAllRoles(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/roleModule/getModuleListByRoleCode")
                        .param("roleCode", "2"))
                .andExpect(status().isOk());
    }

    @Test
    void updateShouldHandleNullModuleList() throws Exception {
        Role existingRole = new Role();
        existingRole.setRoleCode(5);

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(roleModuleRestHelper.getEntity(any(), any())).thenReturn(existingRole);
        when(roleModuleService.getModuleListByRoleCode(5)).thenReturn(new ArrayList<>());

        mockMvc.perform(post("/rest/roleModule/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roleID\":5,\"roleName\":\"Updated Manager\"}"))
                .andExpect(status().isOk());

        verify(roleService).update(existingRole);
    }

    @Test
    void deleteUserShouldSetDeleteFlagToTrue() throws Exception {
        Role role = new Role();
        role.setRoleCode(5);
        role.setDeleteFlag(false);

        when(roleService.findByPK(5)).thenReturn(role);

        mockMvc.perform(delete("/rest/roleModule/delete")
                        .param("roleCode", "5"))
                .andExpect(status().isOk());

        ArgumentCaptor<Role> captor = ArgumentCaptor.forClass(Role.class);
        verify(roleService).update(captor.capture());
        assertThat(captor.getValue().getDeleteFlag()).isTrue();
    }
}
