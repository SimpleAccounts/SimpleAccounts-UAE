package com.simpleaccounts.rest.payroll;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.EmployeeBankDetails;
import com.simpleaccounts.entity.Employment;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.SalaryComponent;
import com.simpleaccounts.entity.SalaryRole;
import com.simpleaccounts.entity.SalaryStructure;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.model.EmployeeBankDetailsPersistModel;
import com.simpleaccounts.model.EmploymentPersistModel;
import com.simpleaccounts.rest.DropdownObjectModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.payroll.payrolService.PayrolService;
import com.simpleaccounts.rest.payroll.service.SalaryComponentService;
import com.simpleaccounts.rest.payroll.service.SalaryRoleService;
import com.simpleaccounts.rest.payroll.service.SalaryStructureService;
import com.simpleaccounts.security.JwtTokenUtil;
import com.simpleaccounts.service.EmployeeBankDetailsService;
import com.simpleaccounts.service.EmploymentService;
import com.simpleaccounts.service.UserService;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class PayrollControllerTest {

    @Mock private JwtTokenUtil jwtTokenUtil;
    @Mock private UserService userService;
    @Mock private EmployeeBankDetailsService employeeBankDetailsService;
    @Mock private EmploymentService employmentService;
    @Mock private SalaryRoleService salaryRoleService;
    @Mock private SalaryStructureService salaryStructureService;
    @Mock private SalaryComponentService salaryComponentService;
    @Mock private PayrolService payrolService;
    @Mock private PayrollRestHepler payrollRestHepler;

    @InjectMocks
    private PayrollController controller;

    private HttpServletRequest mockRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        mockRequest = mock(HttpServletRequest.class);

        Role userRole = new Role();
        userRole.setRoleCode(1);

        testUser = new User();
        testUser.setUserId(1);
        testUser.setRole(userRole);
    }

    @Test
    void getByIdShouldReturnEmployeeBankDetailsWhenFound() {
        EmployeeBankDetails bankDetails = new EmployeeBankDetails();
        bankDetails.setId(1);

        EmployeeBankDetailsPersistModel model = new EmployeeBankDetailsPersistModel();

        when(employeeBankDetailsService.findByPK(1)).thenReturn(bankDetails);
        when(payrollRestHepler.getModel(bankDetails)).thenReturn(model);

        ResponseEntity<EmployeeBankDetailsPersistModel> response = controller.getById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getByIdShouldReturnNotFoundWhenBankDetailsDoesNotExist() {
        when(employeeBankDetailsService.findByPK(999)).thenReturn(null);

        ResponseEntity<EmployeeBankDetailsPersistModel> response = controller.getById(999);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getSalaryRolesForDropdownShouldReturnList() {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Manager"),
            new DropdownObjectModel(2, "Engineer")
        );

        when(salaryRoleService.getSalaryRolesForDropdownObjectModel()).thenReturn(dropdownList);

        ResponseEntity<List<DropdownObjectModel>> response = controller.getSalaryRolesForDropdown();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getSalaryComponentForDropdownShouldReturnListForRole() {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Basic Salary"),
            new DropdownObjectModel(2, "Housing Allowance")
        );

        when(salaryComponentService.getSalaryComponentForDropdownObjectModel(1)).thenReturn(dropdownList);

        ResponseEntity<List<DropdownObjectModel>> response = controller.getSalaryComponentForDropdown(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getSalaryRoleByIdShouldReturnRoleWhenFound() {
        SalaryRole salaryRole = new SalaryRole();
        salaryRole.setId(1);
        salaryRole.setRoleName("Manager");

        SalaryRolePersistModel model = new SalaryRolePersistModel();

        when(salaryRoleService.findByPK(1)).thenReturn(salaryRole);
        when(payrollRestHepler.getSalaryRoleModel(salaryRole)).thenReturn(model);

        ResponseEntity<SalaryRolePersistModel> response = controller.getSalaryRoleById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getSalaryRoleByIdShouldReturnNotFoundWhenRoleDoesNotExist() {
        when(salaryRoleService.findByPK(999)).thenReturn(null);

        ResponseEntity<SalaryRolePersistModel> response = controller.getSalaryRoleById(999);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getSalaryRoleListShouldReturnPaginatedList() {
        PayRollFilterModel filterModel = new PayRollFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);

        PaginationResponseModel pagination = new PaginationResponseModel(5, new ArrayList<>());
        when(salaryRoleService.getSalaryRoleList(any(), eq(filterModel))).thenReturn(pagination);
        when(payrollRestHepler.getSalaryRoleListModel(pagination)).thenReturn(pagination);

        ResponseEntity<PaginationResponseModel> response = controller.getSalaryRoleList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getCount()).isEqualTo(5);
    }

    @Test
    void getSalaryRoleListShouldReturnInternalServerErrorWhenNull() {
        PayRollFilterModel filterModel = new PayRollFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(salaryRoleService.getSalaryRoleList(any(), eq(filterModel))).thenReturn(null);

        ResponseEntity<PaginationResponseModel> response = controller.getSalaryRoleList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    void getSalaryStructureByIdShouldReturnStructureWhenFound() {
        SalaryStructure salaryStructure = new SalaryStructure();
        salaryStructure.setId(1);

        SalaryStructurePersistModel model = new SalaryStructurePersistModel();

        when(salaryStructureService.findByPK(1)).thenReturn(salaryStructure);
        when(payrollRestHepler.getSalaryStructureModel(salaryStructure)).thenReturn(model);

        ResponseEntity<SalaryStructurePersistModel> response = controller.getSalaryStructureById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getSalaryStructureByIdShouldReturnNotFoundWhenStructureDoesNotExist() {
        when(salaryStructureService.findByPK(999)).thenReturn(null);

        ResponseEntity<SalaryStructurePersistModel> response = controller.getSalaryStructureById(999);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getSalaryStructureForDropdownShouldReturnList() {
        List<DropdownObjectModel> dropdownList = Arrays.asList(
            new DropdownObjectModel(1, "Standard Structure"),
            new DropdownObjectModel(2, "Executive Structure")
        );

        when(salaryStructureService.getSalaryStructureDropdown()).thenReturn(dropdownList);

        ResponseEntity<List<DropdownObjectModel>> response = controller.getSalaryStructureForDropdown();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    void getSalaryStructureListShouldReturnPaginatedList() {
        PayRollFilterModel filterModel = new PayRollFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);

        PaginationResponseModel pagination = new PaginationResponseModel(3, new ArrayList<>());
        when(salaryStructureService.getSalaryStructureList(any(), eq(filterModel))).thenReturn(pagination);
        when(payrollRestHepler.getSalaryStructureListModel(pagination)).thenReturn(pagination);

        ResponseEntity<PaginationResponseModel> response = controller.getSalaryStructureList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getCount()).isEqualTo(3);
    }

    @Test
    void getSalaryComponentByIdShouldReturnComponentWhenFound() {
        SalaryComponent salaryComponent = new SalaryComponent();
        salaryComponent.setId(1);

        SalaryComponentPersistModel model = new SalaryComponentPersistModel();

        when(salaryComponentService.findByPK(1)).thenReturn(salaryComponent);
        when(payrollRestHepler.getSalaryComponentModel(salaryComponent)).thenReturn(model);

        ResponseEntity<SalaryComponentPersistModel> response = controller.getSalaryComponentById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getSalaryComponentByIdShouldReturnNotFoundWhenComponentDoesNotExist() {
        when(salaryComponentService.findByPK(999)).thenReturn(null);

        ResponseEntity<SalaryComponentPersistModel> response = controller.getSalaryComponentById(999);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getEmploymentByIdShouldReturnEmploymentWhenFound() {
        Employment employment = new Employment();
        employment.setId(1);

        EmploymentPersistModel model = new EmploymentPersistModel();

        when(employmentService.findByPK(1)).thenReturn(employment);
        when(payrollRestHepler.getEmploymentModel(employment)).thenReturn(model);

        ResponseEntity<EmploymentPersistModel> response = controller.getEmploymentById(1);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getEmploymentByIdShouldReturnNotFoundWhenEmploymentDoesNotExist() {
        when(employmentService.findByPK(999)).thenReturn(null);

        ResponseEntity<EmploymentPersistModel> response = controller.getEmploymentById(999);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void getListShouldReturnPaginatedPayrollList() {
        PayRollFilterModel filterModel = new PayRollFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);

        PaginationResponseModel pagination = new PaginationResponseModel(10, new ArrayList<>());
        when(payrolService.getList(any(), eq(filterModel))).thenReturn(pagination);
        when(payrollRestHepler.getListModel(any())).thenReturn(new ArrayList<>());

        ResponseEntity<PaginationResponseModel> response = controller.getPayrollList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getListShouldReturnNotFoundWhenNull() {
        PayRollFilterModel filterModel = new PayRollFilterModel();

        when(jwtTokenUtil.getUserIdFromHttpRequest(mockRequest)).thenReturn(1);
        when(userService.findByPK(1)).thenReturn(testUser);
        when(payrolService.getList(any(), eq(filterModel))).thenReturn(null);

        ResponseEntity<PaginationResponseModel> response = controller.getPayrollList(filterModel, mockRequest);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
