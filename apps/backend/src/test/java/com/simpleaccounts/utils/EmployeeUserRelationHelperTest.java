package com.simpleaccounts.utils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.EmployeeUserRelation;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.service.EmployeeUserRelationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmployeeUserRelationHelper Tests")
class EmployeeUserRelationHelperTest {

    @Mock
    private EmployeeUserRelationService employeeUserRelationService;

    private EmployeeUserRelationHelper helper;

    @BeforeEach
    void setUp() {
        helper = new EmployeeUserRelationHelper(employeeUserRelationService);
    }

    @Nested
    @DisplayName("createUserForEmployee Tests")
    class CreateUserForEmployeeTests {

        @Test
        @DisplayName("Should create employee-user relation and persist")
        void shouldCreateEmployeeUserRelationAndPersist() {
            // given
            Employee employee = createEmployee();
            User user = createUser();

            // when
            helper.createUserForEmployee(employee, user);

            // then
            ArgumentCaptor<EmployeeUserRelation> captor = ArgumentCaptor.forClass(EmployeeUserRelation.class);
            verify(employeeUserRelationService).persist(captor.capture());

            EmployeeUserRelation capturedRelation = captor.getValue();
            assertThat(capturedRelation).isNotNull();
            assertThat(capturedRelation.getEmployee()).isEqualTo(employee);
            assertThat(capturedRelation.getUser()).isEqualTo(user);
        }

        @Test
        @DisplayName("Should call persist exactly once")
        void shouldCallPersistExactlyOnce() {
            // given
            Employee employee = createEmployee();
            User user = createUser();

            // when
            helper.createUserForEmployee(employee, user);

            // then
            verify(employeeUserRelationService).persist(any(EmployeeUserRelation.class));
        }

        @Test
        @DisplayName("Should associate correct employee with relation")
        void shouldAssociateCorrectEmployeeWithRelation() {
            // given
            Employee employee = createEmployee();
            employee.setId(123);
            employee.setFirstName("John");
            employee.setLastName("Doe");
            User user = createUser();

            // when
            helper.createUserForEmployee(employee, user);

            // then
            ArgumentCaptor<EmployeeUserRelation> captor = ArgumentCaptor.forClass(EmployeeUserRelation.class);
            verify(employeeUserRelationService).persist(captor.capture());

            Employee capturedEmployee = captor.getValue().getEmployee();
            assertThat(capturedEmployee.getId()).isEqualTo(123);
            assertThat(capturedEmployee.getFirstName()).isEqualTo("John");
            assertThat(capturedEmployee.getLastName()).isEqualTo("Doe");
        }

        @Test
        @DisplayName("Should associate correct user with relation")
        void shouldAssociateCorrectUserWithRelation() {
            // given
            Employee employee = createEmployee();
            User user = createUser();
            user.setId(456);
            user.setUsername("johndoe");

            // when
            helper.createUserForEmployee(employee, user);

            // then
            ArgumentCaptor<EmployeeUserRelation> captor = ArgumentCaptor.forClass(EmployeeUserRelation.class);
            verify(employeeUserRelationService).persist(captor.capture());

            User capturedUser = captor.getValue().getUser();
            assertThat(capturedUser.getId()).isEqualTo(456);
            assertThat(capturedUser.getUsername()).isEqualTo("johndoe");
        }

        private Employee createEmployee() {
            Employee employee = new Employee();
            employee.setId(1);
            employee.setFirstName("Test");
            employee.setLastName("Employee");
            return employee;
        }

        private User createUser() {
            User user = new User();
            user.setId(1);
            user.setUsername("testuser");
            return user;
        }
    }
}
