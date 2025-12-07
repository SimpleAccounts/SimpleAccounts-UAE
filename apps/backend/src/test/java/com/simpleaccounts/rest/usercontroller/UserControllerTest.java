package com.simpleaccounts.rest.usercontroller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.integration.MailIntegration;
import com.simpleaccounts.repository.PasswordHistoryRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.CoacTransactionCategoryService;
import com.simpleaccounts.service.CompanyService;
import com.simpleaccounts.service.ConfigurationService;
import com.simpleaccounts.service.EmaiLogsService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.RoleService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.UserService;
import com.simpleaccounts.utils.EmployeeUserRelationHelper;
import com.simpleaccounts.utils.FileHelper;
import java.time.LocalDateTime;
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
@DisplayName("UserController Unit Tests")
class UserControllerTest {

  private MockMvc mockMvc;

  @Mock private UserService userService;

  @Mock private EmaiLogsService emaiLogsService;

  @Mock private FileHelper fileUtility;

  @Mock private RoleService roleService;

  @Mock private ConfigurationService configurationService;

  @Mock private JwtTokenUtil jwtTokenUtil;

  @Mock private CompanyService companyService;

  @Mock private UserRestHelper userRestHelper;

  @Mock private MailIntegration mailIntegration;

  @Mock private TransactionCategoryService transactionCategoryService;

  @Mock private CoacTransactionCategoryService coacTransactionCategoryService;

  @Mock private EmployeeService employeeService;

  @Mock private EmployeeUserRelationHelper employeeUserRelationHelper;

  @Mock private PasswordHistoryRepository passwordHistoryRepository;

  @InjectMocks private UserController userController;

  @BeforeEach
  void setUp() {
    mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
  }

  @Test
  @DisplayName("Should return user by ID")
  void getByIdReturnsUser() throws Exception {
    User user = createUser(1, "John", "Doe", "john@test.com");
    UserModel userModel = new UserModel();
    userModel.setId(1);
    userModel.setFirstName("John");
    userModel.setLastName("Doe");

    when(userService.findByPK(1)).thenReturn(user);
    when(userRestHelper.getModel(user)).thenReturn(userModel);

    mockMvc.perform(get("/rest/user/getById").param("id", "1")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return not found when user does not exist")
  void getByIdReturnsNotFound() throws Exception {
    when(userService.findByPK(999)).thenReturn(null);

    mockMvc.perform(get("/rest/user/getById").param("id", "999")).andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Should return role list")
  void getRolesReturnsList() throws Exception {
    Role role1 = new Role();
    role1.setRoleCode(1);
    role1.setRoleName("Admin");
    Role role2 = new Role();
    role2.setRoleCode(2);
    role2.setRoleName("User");

    when(roleService.getRoles()).thenReturn(Arrays.asList(role1, role2));

    mockMvc.perform(get("/rest/user/getrole")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return not found when no roles exist")
  void getRolesReturnsNotFound() throws Exception {
    when(roleService.getRoles()).thenReturn(null);

    mockMvc.perform(get("/rest/user/getrole")).andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Should return current user")
  void getCurrentUserReturnsUser() throws Exception {
    User user = createUser(1, "John", "Doe", "john@test.com");

    when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
    when(userService.findByPK(1)).thenReturn(user);

    mockMvc.perform(get("/rest/user/current")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return users for dropdown")
  void getUserForDropdownReturnsList() throws Exception {
    List<DropdownModel> dropdownList =
        Arrays.asList(new DropdownModel(1, "John Doe"), new DropdownModel(2, "Jane Smith"));

    when(userService.getUserForDropdown()).thenReturn(dropdownList);

    mockMvc.perform(get("/rest/user/getUserForDropdown")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should delete user successfully")
  void deleteUserSucceeds() throws Exception {
    User user = createUser(1, "John", "Doe", "john@test.com");

    when(userService.findByPK(1)).thenReturn(user);

    mockMvc.perform(delete("/rest/user/delete").param("id", "1")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return not found when deleting non-existent user")
  void deleteUserReturnsNotFound() throws Exception {
    when(userService.findByPK(999)).thenReturn(null);

    mockMvc
        .perform(delete("/rest/user/delete").param("id", "999"))
        .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Should return user list")
  void getUserListReturnsList() throws Exception {
    PaginationResponseModel response = new PaginationResponseModel(0, Collections.emptyList());

    when(userService.getUserList(any(), any())).thenReturn(response);
    when(userRestHelper.getModelList(any())).thenReturn(Collections.emptyList());

    mockMvc.perform(get("/rest/user/getList")).andExpect(status().isOk());
  }

  @Test
  @DisplayName("Should return not found when user list is null")
  void getUserListReturnsNotFound() throws Exception {
    when(userService.getUserList(any(), any())).thenReturn(null);

    mockMvc.perform(get("/rest/user/getList")).andExpect(status().isNotFound());
  }

  private User createUser(Integer id, String firstName, String lastName, String email) {
    User user = new User();
    user.setUserId(id);
    user.setFirstName(firstName);
    user.setLastName(lastName);
    user.setUserEmail(email);
    user.setDeleteFlag(false);
    user.setIsActive(true);
    user.setCreatedDate(LocalDateTime.now());
    user.setCreatedBy(1);
    Company company = new Company();
    company.setCompanyId(1);
    user.setCompany(company);
    return user;
  }
}
