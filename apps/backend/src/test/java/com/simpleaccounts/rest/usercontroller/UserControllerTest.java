package com.simpleaccounts.rest.usercontroller;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpleaccounts.bank.model.DeleteModel;
import com.simpleaccounts.entity.*;
import com.simpleaccounts.integration.MailIntegration;
import com.simpleaccounts.repository.PasswordHistoryRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.CustomUserDetailsService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.*;
import com.simpleaccounts.utils.FileHelper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

@ExtendWith(SpringExtension.class)
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean private UserService userService;
    @MockBean private EmaiLogsService emaiLogsService;
    @MockBean private FileHelper fileUtility;
    @MockBean private RoleService roleService;
    @MockBean private ConfigurationService configurationService;
    @MockBean private JwtTokenUtil jwtTokenUtil;
    @MockBean private CompanyService companyService;
    @MockBean private UserRestHelper userRestHelper;
    @MockBean private MailIntegration mailIntegration;
    @MockBean private TransactionCategoryService transactionCategoryService;
    @MockBean private CoacTransactionCategoryService coacTransactionCategoryService;
    @MockBean private EmployeeService employeeService;
    @MockBean private EmployeeUserRelationHelper employeeUserRelationHelper;
    @MockBean private PasswordHistoryRepository passwordHistoryRepository;
    @MockBean private CustomUserDetailsService customUserDetailsService;

    @Test
    void getUserListShouldReturnPaginatedList() throws Exception {
        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        List<UserModel> userModels = Arrays.asList(new UserModel(), new UserModel());

        when(userService.getUserList(any(), any())).thenReturn(pagination);
        when(userRestHelper.getModelList(any())).thenReturn(userModels);

        mockMvc.perform(get("/rest/user/getList")
                        .param("name", "John")
                        .param("active", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(10))
                .andExpect(jsonPath("$.data").isArray());

        verify(userService).getUserList(any(), any());
    }

    @Test
    void getUserListShouldReturnNotFoundWhenNull() throws Exception {
        when(userService.getUserList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/user/getList"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getUserListShouldFilterByCompany() throws Exception {
        Company company = new Company();
        company.setCompanyId(1);

        PaginationResponseModel pagination = new PaginationResponseModel(5, new ArrayList<>());

        when(companyService.findByPK(1)).thenReturn(company);
        when(userService.getUserList(any(), any())).thenReturn(pagination);
        when(userRestHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/user/getList")
                        .param("companyId", "1"))
                .andExpect(status().isOk());

        verify(companyService).findByPK(1);
    }

    @Test
    void getUserListShouldFilterByRole() throws Exception {
        Role role = new Role();
        role.setRoleId(2);

        PaginationResponseModel pagination = new PaginationResponseModel(3, new ArrayList<>());

        when(roleService.findByPK(2)).thenReturn(role);
        when(userService.getUserList(any(), any())).thenReturn(pagination);
        when(userRestHelper.getModelList(any())).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/rest/user/getList")
                        .param("roleId", "2"))
                .andExpect(status().isOk());

        verify(roleService).findByPK(2);
    }

    @Test
    void getUserListShouldHandleException() throws Exception {
        when(userService.getUserList(any(), any())).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(get("/rest/user/getList"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteUserShouldSetDeleteFlag() throws Exception {
        User user = createUser(1, "test@example.com");

        when(userService.findByPK(1)).thenReturn(user);

        mockMvc.perform(delete("/rest/user/delete")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted Successful")));

        verify(userService).update(user);
    }

    @Test
    void deleteUserShouldReturnNotFoundWhenUserNotExists() throws Exception {
        when(userService.findByPK(999)).thenReturn(null);

        mockMvc.perform(delete("/rest/user/delete")
                        .param("id", "999"))
                .andExpect(status().isNotFound());

        verify(userService, never()).update(any());
    }

    @Test
    void deleteUserShouldHandleException() throws Exception {
        User user = createUser(1, "test@example.com");

        when(userService.findByPK(1)).thenReturn(user);
        when(userService.update(user)).thenThrow(new RuntimeException("Database error"));

        mockMvc.perform(delete("/rest/user/delete")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void deleteUsersShouldDeleteMultipleUsers() throws Exception {
        DeleteModel deleteModel = new DeleteModel();
        deleteModel.setIds(Arrays.asList(1, 2, 3));

        mockMvc.perform(delete("/rest/user/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deleteModel)))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Deleted successful")));

        verify(userService).deleteByIds(Arrays.asList(1, 2, 3));
    }

    @Test
    void deleteUsersShouldHandleException() throws Exception {
        DeleteModel deleteModel = new DeleteModel();
        deleteModel.setIds(Arrays.asList(1, 2));

        when(userService.deleteByIds(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(delete("/rest/user/deletes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deleteModel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void saveShouldCreateNewUser() throws Exception {
        UserModel userModel = createUserModel();
        User creatingUser = createUser(1, "admin@example.com");
        User newUser = createUser(null, "newuser@example.com");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(creatingUser);
        when(userService.getUserByEmail("newuser@example.com")).thenReturn(Optional.empty());
        when(userRestHelper.getEntity(any())).thenReturn(newUser);

        mockMvc.perform(post("/rest/user/save")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("email", "newuser@example.com")
                        .param("firstName", "John")
                        .param("lastName", "Doe")
                        .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("User Profile saved successfully")));

        verify(userService).persist(any());
    }

    @Test
    void saveShouldReturnForbiddenWhenEmailExists() throws Exception {
        User existingUser = createUser(2, "existing@example.com");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(createUser(1, "admin@example.com"));
        when(userService.getUserByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));

        mockMvc.perform(post("/rest/user/save")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("email", "existing@example.com")
                        .param("firstName", "John")
                        .param("lastName", "Doe")
                        .param("password", "password123"))
                .andExpect(status().isForbidden())
                .andExpect(content().string(Matchers.containsString("Email Id already Exist")));

        verify(userService, never()).persist(any());
    }

    @Test
    void saveShouldUpdateExistingUser() throws Exception {
        User creatingUser = createUser(1, "admin@example.com");
        User existingUser = createUser(5, "user@example.com");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(creatingUser);
        when(userService.getUserEmail("user@example.com")).thenReturn(existingUser);
        when(userRestHelper.getEntity(any())).thenReturn(existingUser);

        mockMvc.perform(post("/rest/user/save")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("id", "5")
                        .param("email", "user@example.com")
                        .param("firstName", "John")
                        .param("lastName", "Doe"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("User Profile updated successfully")));

        verify(userService).update(existingUser, 5);
    }

    @Test
    void updateShouldUpdateUserSuccessfully() throws Exception {
        User user = createUser(5, "user@example.com");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userRestHelper.getEntity(any())).thenReturn(user);

        mockMvc.perform(post("/rest/user/update")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("id", "5")
                        .param("email", "user@example.com")
                        .param("firstName", "Updated")
                        .param("lastName", "Name"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Updated successful")));

        verify(userService).update(user);
    }

    @Test
    void updateShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userRestHelper.getEntity(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(post("/rest/user/update")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("id", "5")
                        .param("email", "user@example.com"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getByIdShouldReturnUser() throws Exception {
        User user = createUser(1, "user@example.com");
        UserModel userModel = createUserModel();

        when(userService.findByPK(1)).thenReturn(user);
        when(userRestHelper.getModel(user)).thenReturn(userModel);

        mockMvc.perform(get("/rest/user/getById")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").exists());

        verify(userRestHelper).getModel(user);
    }

    @Test
    void getByIdShouldReturnNotFoundWhenUserNotExists() throws Exception {
        when(userService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/user/getById")
                        .param("id", "999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getByIdShouldHandleException() throws Exception {
        when(userService.findByPK(1)).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/rest/user/getById")
                        .param("id", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getRoleShouldReturnRoleList() throws Exception {
        List<Role> roles = Arrays.asList(
            createRole(1, "Admin"),
            createRole(2, "User")
        );

        when(roleService.getRoles()).thenReturn(roles);

        mockMvc.perform(get("/rest/user/getrole"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getRoleShouldReturnNotFoundWhenNull() throws Exception {
        when(roleService.getRoles()).thenReturn(null);

        mockMvc.perform(get("/rest/user/getrole"))
                .andExpect(status().isNotFound());
    }

    @Test
    void currentUserShouldReturnLoggedInUser() throws Exception {
        User user = createUser(1, "current@example.com");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(user);

        mockMvc.perform(get("/rest/user/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1));
    }

    @Test
    void currentUserShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Token error"));

        mockMvc.perform(get("/rest/user/current"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getUserForDropdownShouldReturnList() throws Exception {
        List<DropdownModel> dropdownList = Arrays.asList(
            new DropdownModel(1, "User 1"),
            new DropdownModel(2, "User 2")
        );

        when(userService.getUserForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/user/getUserForDropdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getTestmailShouldSendMail() throws Exception {
        User user = createUser(1, "test@example.com");

        when(userService.findByPK(1)).thenReturn(user);

        mockMvc.perform(get("/rest/user/getTestmail")
                        .param("id", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Mail sent")));

        verify(userService).testUserMail(user);
    }

    @Test
    void getTestmailShouldReturnNotFoundWhenUserNotExists() throws Exception {
        when(userService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/user/getTestmail")
                        .param("id", "999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void resetNewPasswordShouldUpdatePassword() throws Exception {
        User user = createUser(1, "user@example.com");
        user.setPassword("$2a$10$encodedOldPassword");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.getUserPassword(1)).thenReturn(user);
        when(passwordHistoryRepository.findPasswordHistoriesByUser(user)).thenReturn(new ArrayList<>());

        mockMvc.perform(post("/rest/user/resetNewpassword")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("id", "1")
                        .param("currentPassword", "oldPassword")
                        .param("password", "newPassword123"))
                .andExpect(status().isOk());
    }

    @Test
    void getUserInviteEmailShouldSendInvite() throws Exception {
        User senderUser = createUser(1, "sender@example.com");
        User targetUser = createUser(2, "target@example.com");

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(senderUser);
        when(userService.findByPK(2)).thenReturn(targetUser);

        mockMvc.perform(get("/rest/user/getUserInviteEmail")
                        .param("userId", "2")
                        .param("loginUrl", "http://example.com/login"))
                .andExpect(status().isOk());

        verify(userService).createPassword(eq(targetUser), any(), eq(senderUser));
    }

    @Test
    void getUserInviteEmailShouldHandleException() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(get("/rest/user/getUserInviteEmail")
                        .param("userId", "2")
                        .param("loginUrl", "http://example.com/login"))
                .andExpect(status().isInternalServerError());
    }

    // Helper methods
    private User createUser(Integer id, String email) {
        User user = new User();
        user.setUserId(id);
        user.setUserEmail(email);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setDeleteFlag(false);
        user.setCreatedDate(LocalDateTime.now());

        Company company = new Company();
        company.setCompanyId(1);
        user.setCompany(company);

        return user;
    }

    private UserModel createUserModel() {
        UserModel model = new UserModel();
        model.setEmail("test@example.com");
        model.setFirstName("John");
        model.setLastName("Doe");
        return model;
    }

    private Role createRole(Integer id, String name) {
        Role role = new Role();
        role.setRoleId(id);
        role.setRoleName(name);
        return role;
    }
}
