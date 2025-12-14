package com.simpleaccounts.rest.employeeDesignationController;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeDesignation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.EmployeeDesignationPersistModel;
import com.simpleaccounts.repository.EmployeeRepository;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmployeeDesignationService;
import com.simpleaccounts.service.EmployeeService;
import com.simpleaccounts.service.UserService;
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
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("EmployeeDesignationController Unit Tests")
class EmployeeDesignationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private JwtTokenUtil jwtTokenUtil;

    @Mock
    private UserService userService;

    @Mock
    private EmployeeDesignationRestHelper employeeDesignationRestHelper;

    @Mock
    private EmployeeDesignationService employeeDesignationService;

    @Mock
    private EmployeeService employeeService;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeDesignationController employeeDesignationController;

    private EmployeeDesignation testDesignation;
    private User testUser;
    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(employeeDesignationController).build();
        testDesignation = createTestDesignation(1, "Manager", null);
        testUser = createTestUser(1, "Admin", "User", "admin@test.com");
        testEmployee = createTestEmployee(1, "John", "Doe", "john@test.com");
    }

    @Test
    @DisplayName("Should save employee designation successfully")
    void saveEmployeeDesignationSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(employeeDesignationRestHelper.getEmployeeDesignationEntity(any())).thenReturn(testDesignation);
        doNothing().when(employeeDesignationService).persist(any());

        mockMvc.perform(post("/rest/employeeDesignation/saveEmployeeDesignation")
                .param("designationName", "Manager"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should update employee designation successfully")
    void updateEmployeeDesignationSucceeds() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(employeeDesignationRestHelper.getEmployeeDesignationEntity(any())).thenReturn(testDesignation);
        when(employeeDesignationService.update(any())).thenReturn(testDesignation);

        mockMvc.perform(post("/rest/employeeDesignation/updateEmployeeDesignation")
                .param("id", "1")
                .param("designationName", "Senior Manager"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should delete employee designation when not in use")
    void deleteEmployeeDesignationSucceedsWhenNotInUse() throws Exception {
        when(employeeDesignationService.findByPK(1)).thenReturn(testDesignation);
        when(employeeService.findByAttributes(any())).thenReturn(Collections.emptyList());
        when(employeeDesignationService.update(any(), anyInt())).thenReturn(testDesignation);

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return conflict when designation is in use")
    void deleteEmployeeDesignationReturnsConflictWhenInUse() throws Exception {
        testEmployee.setDeleteFlag(false);
        when(employeeDesignationService.findByPK(1)).thenReturn(testDesignation);
        when(employeeService.findByAttributes(any())).thenReturn(Arrays.asList(testEmployee));

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation").param("id", "1"))
            .andExpect(status().isConflict());
    }

    @Test
    @DisplayName("Should allow delete when all employees using designation are deleted")
    void deleteEmployeeDesignationSucceedsWhenAllEmployeesDeleted() throws Exception {
        testEmployee.setDeleteFlag(true);
        when(employeeDesignationService.findByPK(1)).thenReturn(testDesignation);
        when(employeeService.findByAttributes(any())).thenReturn(Arrays.asList(testEmployee));
        when(employeeDesignationService.update(any(), anyInt())).thenReturn(testDesignation);

        mockMvc.perform(delete("/rest/employeeDesignation/deleteEmployeeDesignation").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return employee designation by ID")
    void getEmployeeDesignationByIdReturnsDesignation() throws Exception {
        EmployeeDesignationPersistModel model = createDesignationPersistModel(1, "Manager");
        when(employeeDesignationService.findByPK(1)).thenReturn(testDesignation);
        when(employeeDesignationRestHelper.getEmployeeDesignationModel(testDesignation)).thenReturn(model);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationById").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return not found when designation does not exist")
    void getEmployeeDesignationByIdReturnsNotFound() throws Exception {
        when(employeeDesignationService.findByPK(999)).thenReturn(null);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationById").param("id", "999"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should return employee designations for dropdown")
    void getEmployeeDesignationForDropdownReturnsList() throws Exception {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Manager"),
            new DropdownObjectModel(2, "Developer")
        );

        when(employeeDesignationService.getEmployeeDesignationDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationForDropdown"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return parent employee designations for dropdown")
    void getParentEmployeeDesignationForDropdownReturnsList() throws Exception {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "CEO"),
            new DropdownObjectModel(2, "Director")
        );

        when(employeeDesignationService.getParentEmployeeDesignationForDropdown()).thenReturn(dropdownList);

        mockMvc.perform(get("/rest/employeeDesignation/getParentEmployeeDesignationForDropdown"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return employee designation list with pagination")
    void getEmployeeDesignationListReturnsList() throws Exception {
        PaginationResponseModel response = new PaginationResponseModel(1, Arrays.asList(testDesignation));
        PaginationResponseModel transformedResponse = new PaginationResponseModel(1, Arrays.asList(createDesignationPersistModel(1, "Manager")));

        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(employeeDesignationService.getEmployeeDesignationList(any(), any())).thenReturn(response);
        when(employeeDesignationRestHelper.getEmployeeDesignationListModel(response)).thenReturn(transformedResponse);

        mockMvc.perform(get("/rest/employeeDesignation/EmployeeDesignationList")
                .param("pageNo", "0")
                .param("pageSize", "10"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return internal server error when designation list is null")
    void getEmployeeDesignationListReturnsErrorWhenNull() throws Exception {
        when(jwtTokenUtil.getUserIdFromHttpRequest(any())).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(employeeDesignationService.getEmployeeDesignationList(any(), any())).thenReturn(null);

        mockMvc.perform(get("/rest/employeeDesignation/EmployeeDesignationList"))
            .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("Should return employee designation count")
    void getEmployeeDesignationCountReturnsCount() throws Exception {
        when(employeeDesignationService.findByPK(1)).thenReturn(testDesignation);
        when(employeeRepository.countEmployeesByEmployeeDesignationIdAndDeleteFlag(testDesignation, false)).thenReturn(5);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationCount").param("id", "1"))
            .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should return zero count when no employees use designation")
    void getEmployeeDesignationCountReturnsZero() throws Exception {
        when(employeeDesignationService.findByPK(1)).thenReturn(testDesignation);
        when(employeeRepository.countEmployeesByEmployeeDesignationIdAndDeleteFlag(testDesignation, false)).thenReturn(0);

        mockMvc.perform(get("/rest/employeeDesignation/getEmployeeDesignationCount").param("id", "1"))
            .andExpect(status().isOk());
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

    private User createTestUser(Integer id, String firstName, String lastName, String email) {
        User user = new User();
        user.setUserId(id);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setUserEmail(email);
        user.setIsActive(true);
        user.setDeleteFlag(false);
        user.setCreatedDate(LocalDateTime.now());
        user.setCreatedBy(1);
        return user;
    }

    private Employee createTestEmployee(Integer id, String firstName, String lastName, String email) {
        Employee employee = new Employee();
        employee.setId(id);
        employee.setFirstName(firstName);
        employee.setLastName(lastName);
        employee.setEmail(email);
        employee.setIsActive(true);
        employee.setDeleteFlag(false);
        return employee;
    }

    private EmployeeDesignationPersistModel createDesignationPersistModel(Integer id, String name) {
        EmployeeDesignationPersistModel model = new EmployeeDesignationPersistModel();
        model.setId(id);
        model.setDesignationName(name);
        return model;
    }
}
