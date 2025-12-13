package com.simpleaccounts.rest.rolecontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.RoleModuleRelation;
import com.simpleaccounts.entity.SimpleAccountsModules;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.RoleModuleRelationService;
import com.simpleaccounts.service.RoleModuleService;
import com.simpleaccounts.service.RoleService;
import com.simpleaccounts.service.UserService;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@DisplayName("RoleModuleController Unit Tests")
class RoleModuleControllerTest {

    private MockMvc mockMvc;

    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private RoleModuleRelationService roleModuleRelationService;
    @Mock private RoleModuleService roleModuleService;
    @Mock private RoleService roleService;
    @Mock private RoleModuleRestHelper roleModuleRestHelper;
    @Mock private UserService userService;

    @InjectMocks
    private RoleModuleController roleModuleController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(roleModuleController).build();
    }

    @Test
    @DisplayName("Should return module list for all roles")
    void getModuleListForAllRolesReturnsList() throws Exception {
        List<RoleModuleRelation> relations = createRoleModuleRelationList(5);
        List<ModuleResponseModel> responseModels = new ArrayList<>();

        when(roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles())
            .thenReturn(relations);
        when(roleModuleRestHelper.getModuleListForAllRoles(relations))
            .thenReturn(responseModels);

        mockMvc.perform(get("/rest/roleModule/getListForAllRoles"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return empty list when no modules exist for all roles")
    void getModuleListForAllRolesReturnsEmptyList() throws Exception {
        when(roleModuleRelationService.getListOfSimpleAccountsModulesForAllRoles())
            .thenReturn(null);

        mockMvc.perform(get("/rest/roleModule/getListForAllRoles"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return module list")
    void getModuleListReturnsList() throws Exception {
        List<SimpleAccountsModules> modules = createModuleList(3);
        List<ModuleResponseModel> responseModels = new ArrayList<>();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any()))
            .thenReturn(1);
        when(roleModuleService.getListOfSimpleAccountsModules())
            .thenReturn(modules);
        when(roleModuleRestHelper.getModuleList(modules))
            .thenReturn(responseModels);

        mockMvc.perform(get("/rest/roleModule/getList"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return empty list when no modules exist")
    void getModuleListReturnsEmptyList() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any()))
            .thenReturn(1);
        when(roleModuleService.getListOfSimpleAccountsModules())
            .thenReturn(null);

        mockMvc.perform(get("/rest/roleModule/getList"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return module list by role code")
    void getModuleListByRoleCodeReturnsList() throws Exception {
        Integer roleCode = 1;
        List<RoleModuleRelation> relations = createRoleModuleRelationList(3);
        List<ModuleResponseModel> responseModels = new ArrayList<>();

        when(roleModuleService.getModuleListByRoleCode(roleCode))
            .thenReturn(relations);
        when(roleModuleRestHelper.getModuleListForAllRoles(relations))
            .thenReturn(responseModels);

        mockMvc.perform(get("/rest/roleModule/getModuleListByRoleCode")
                .param("roleCode", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return empty list when role has no modules")
    void getModuleListByRoleCodeReturnsEmptyList() throws Exception {
        Integer roleCode = 999;

        when(roleModuleService.getModuleListByRoleCode(roleCode))
            .thenReturn(null);

        mockMvc.perform(get("/rest/roleModule/getModuleListByRoleCode")
                .param("roleCode", "999"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete role successfully")
    void deleteRoleSucceeds() throws Exception {
        Role role = createRole(1, "Test Role");

        when(roleService.findByPK(1))
            .thenReturn(role);

        mockMvc.perform(delete("/rest/roleModule/delete").param("roleCode", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when deleting non-existent role")
    void deleteRoleReturnsNotFoundWhenNotFound() throws Exception {
        when(roleService.findByPK(999))
            .thenReturn(null);

        mockMvc.perform(delete("/rest/roleModule/delete").param("roleCode", "999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return users count for role")
    void getUsersCountForRoleReturnsCount() throws Exception {
        Role role = createRole(1, "Admin");
        List<User> users = Arrays.asList(
            createUser(1, "User1"),
            createUser(2, "User2"),
            createUser(3, "User3")
        );

        when(roleService.findByPK(1))
            .thenReturn(role);
        when(userService.findByAttributes(any()))
            .thenReturn(users);

        mockMvc.perform(get("/rest/roleModule/getUsersCountForRole")
                .param("roleId", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return zero users when role has no users")
    void getUsersCountForRoleReturnsZero() throws Exception {
        Role role = createRole(2, "Empty Role");

        when(roleService.findByPK(2))
            .thenReturn(role);
        when(userService.findByAttributes(any()))
            .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/rest/roleModule/getUsersCountForRole")
                .param("roleId", "2"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle module list by admin role code")
    void getModuleListByRoleCodeHandlesAdminRole() throws Exception {
        Integer adminRoleCode = 1;
        List<RoleModuleRelation> relations = createRoleModuleRelationList(10);
        List<ModuleResponseModel> responseModels = new ArrayList<>();

        when(roleModuleService.getModuleListByRoleCode(adminRoleCode))
            .thenReturn(relations);
        when(roleModuleRestHelper.getModuleListForAllRoles(relations))
            .thenReturn(responseModels);

        mockMvc.perform(get("/rest/roleModule/getModuleListByRoleCode")
                .param("roleCode", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should handle module list by user role code")
    void getModuleListByRoleCodeHandlesUserRole() throws Exception {
        Integer userRoleCode = 2;
        List<RoleModuleRelation> relations = createRoleModuleRelationList(3);
        List<ModuleResponseModel> responseModels = new ArrayList<>();

        when(roleModuleService.getModuleListByRoleCode(userRoleCode))
            .thenReturn(relations);
        when(roleModuleRestHelper.getModuleListForAllRoles(relations))
            .thenReturn(responseModels);

        mockMvc.perform(get("/rest/roleModule/getModuleListByRoleCode")
                .param("roleCode", "2"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return module list with modules")
    void getModuleListReturnsModulesWithData() throws Exception {
        List<SimpleAccountsModules> modules = Arrays.asList(
            createModule(1, "Invoicing", "INV"),
            createModule(2, "Banking", "BNK"),
            createModule(3, "Payroll", "PAY")
        );
        List<ModuleResponseModel> responseModels = new ArrayList<>();

        when(jwtTokenUtil.getUserIdFromHttpRequest(any()))
            .thenReturn(1);
        when(roleModuleService.getListOfSimpleAccountsModules())
            .thenReturn(modules);
        when(roleModuleRestHelper.getModuleList(modules))
            .thenReturn(responseModels);

        mockMvc.perform(get("/rest/roleModule/getList"))
            .andExpect(status().isOk());
    }

    private Role createRole(Integer code, String name) {
        Role role = new Role();
        role.setRoleCode(code);
        role.setRoleName(name);
        role.setDeleteFlag(false);
        role.setIsActive(true);
        return role;
    }

    private User createUser(Integer id, String firstName) {
        User user = new User();
        user.setUserId(id);
        user.setFirstName(firstName);
        user.setLastName("Test");
        user.setUserEmail(firstName.toLowerCase() + "@test.com");
        user.setDeleteFlag(false);
        user.setIsActive(true);
        user.setCreatedDate(LocalDateTime.now());
        return user;
    }

    private SimpleAccountsModules createModule(Integer id, String name, String code) {
        SimpleAccountsModules module = new SimpleAccountsModules();
        module.setSimpleAccountsModuleId(id);
        module.setSimpleAccountsModuleName(name);
        return module;
    }

    private List<SimpleAccountsModules> createModuleList(int count) {
        List<SimpleAccountsModules> modules = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            modules.add(createModule(i + 1, "Module " + (i + 1), "MOD" + (i + 1)));
        }
        return modules;
    }

    private RoleModuleRelation createRoleModuleRelation(Integer id, Integer roleCode, Integer moduleId) {
        RoleModuleRelation relation = new RoleModuleRelation();
        relation.setId(id);

        Role role = createRole(roleCode, "Role " + roleCode);
        relation.setRole(role);

        SimpleAccountsModules module = createModule(moduleId, "Module " + moduleId, "MOD" + moduleId);
        relation.setSimpleAccountsModule(module);

        return relation;
    }

    private List<RoleModuleRelation> createRoleModuleRelationList(int count) {
        List<RoleModuleRelation> relations = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            relations.add(createRoleModuleRelation(i + 1, 1, i + 1));
        }
        return relations;
    }
}
