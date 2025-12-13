package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.UserDao;
import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.repository.UserJpaRepository;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.utils.DateUtils;
import com.simpleaccounts.utils.EmailSender;
import com.simpleaccounts.utils.RandomString;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl Unit Tests")
class UserServiceImplTest {

    @Mock
    private UserDao dao;

    @Mock
    private UserJpaRepository userJpaRepo;

    @Mock
    private RandomString randomString;

    @Mock
    private EmailSender emailSender;

    @Mock
    private DateUtils dateUtils;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "dao", dao);
    }

    @Test
    @DisplayName("Should find user by ID")
    void findByIdReturnsUser() {
        // Arrange
        int userId = 1;
        User expectedUser = createUser(userId, "John", "Doe", "john@test.com");

        when(dao.findByPK(userId))
            .thenReturn(expectedUser);

        // Act
        User result = userService.findByPK(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(userId);
        verify(dao).findByPK(userId);
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void findByIdThrowsExceptionWhenNotFound() {
        // Arrange
        int userId = 999;

        when(dao.findByPK(userId))
            .thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> userService.findByPK(userId))
            .isInstanceOf(ServiceException.class);
    }

    @Test
    @DisplayName("Should return user dropdown list")
    void getUserForDropdownReturnsDropdownList() {
        // Arrange
        List<DropdownModel> expectedList = Arrays.asList(
            new DropdownModel(1, "John Doe"),
            new DropdownModel(2, "Jane Smith")
        );

        when(dao.getUserForDropdown())
            .thenReturn(expectedList);

        // Act
        List<DropdownModel> result = userService.getUserForDropdown();

        // Assert
        assertThat(result).isNotNull().hasSize(2);
        verify(dao).getUserForDropdown();
    }

    @Test
    @DisplayName("Should return user by email")
    void getUserByEmailReturnsUser() {
        // Arrange
        String email = "john@test.com";
        User expectedUser = createUser(1, "John", "Doe", email);

        when(dao.getUserByEmail(email))
            .thenReturn(Optional.of(expectedUser));

        // Act
        Optional<User> result = userService.getUserByEmail(email);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getUserEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("Should return empty optional when user not found by email")
    void getUserByEmailReturnsEmptyWhenNotFound() {
        // Arrange
        String email = "nonexistent@test.com";

        when(dao.getUserByEmail(email))
            .thenReturn(Optional.empty());

        // Act
        Optional<User> result = userService.getUserByEmail(email);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle user with company and role")
    void handleUserWithCompanyAndRole() {
        // Arrange
        User user = createUser(1, "John", "Doe", "john@test.com");

        Company company = new Company();
        company.setCompanyId(1);
        company.setCompanyName("Test Company");
        user.setCompany(company);

        Role role = new Role();
        role.setRoleCode(1);
        role.setRoleName("Admin");
        user.setRole(role);

        when(dao.findByPK(1)).thenReturn(user);

        // Act
        User result = userService.findByPK(1);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCompany()).isNotNull();
        assertThat(result.getRole()).isNotNull();
    }

    @Test
    @DisplayName("Should return all users not employee")
    void getAllUserNotEmployeeReturnsUsers() {
        // Arrange
        List<User> expectedUsers = Arrays.asList(
            createUser(1, "John", "Doe", "john@test.com"),
            createUser(2, "Jane", "Smith", "jane@test.com")
        );

        when(dao.getAllUserNotEmployee())
            .thenReturn(expectedUsers);

        // Act
        List<User> result = userService.getAllUserNotEmployee();

        // Assert
        assertThat(result).isNotNull().hasSize(2);
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
        return user;
    }
}
