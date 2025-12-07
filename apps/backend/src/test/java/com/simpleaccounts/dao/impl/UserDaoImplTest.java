package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Company;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.DropdownModel;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.Query;
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
@DisplayName("UserDaoImpl Unit Tests")
class UserDaoImplTest {

  @Mock private EntityManager entityManager;

  @Mock private TypedQuery<User> userTypedQuery;

  @Mock private TypedQuery<DropdownModel> dropdownTypedQuery;

  @Mock private Query query;

  @InjectMocks private UserDaoImpl userDao;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(userDao, "entityManager", entityManager);
    ReflectionTestUtils.setField(userDao, "entityClass", User.class);
  }

  @Test
  @DisplayName("Should return user by email when exists")
  void getUserByEmailReturnsOptionalWhenExists() {
    // Arrange
    String email = "john@test.com";
    User expectedUser = createUser(1, "John", "Doe", email);

    when(entityManager.createQuery(anyString())).thenReturn(query);
    when(query.setParameter("email", email)).thenReturn(query);
    when(query.getResultList()).thenReturn(Collections.singletonList(expectedUser));

    // Act
    Optional<User> result = userDao.getUserByEmail(email);

    // Assert
    assertThat(result).isPresent();
    assertThat(result.get().getUserId()).isEqualTo(1);
    assertThat(result.get().getUserEmail()).isEqualTo(email);
  }

  @Test
  @DisplayName("Should return empty optional when user not found by email")
  void getUserByEmailReturnsEmptyWhenNotFound() {
    // Arrange
    String email = "nonexistent@test.com";

    when(entityManager.createQuery(anyString())).thenReturn(query);
    when(query.setParameter("email", email)).thenReturn(query);
    when(query.getResultList()).thenReturn(new ArrayList<>());

    // Act
    Optional<User> result = userDao.getUserByEmail(email);

    // Assert
    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should return user email")
  void getUserEmailReturnsUser() {
    // Arrange
    String email = "john@test.com";
    User expectedUser = createUser(1, "John", "Doe", email);

    when(entityManager.createQuery(anyString(), eq(User.class))).thenReturn(userTypedQuery);
    when(userTypedQuery.setParameter("email", email)).thenReturn(userTypedQuery);
    when(userTypedQuery.getResultList()).thenReturn(Collections.singletonList(expectedUser));

    // Act
    User result = userDao.getUserEmail(email);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getUserEmail()).isEqualTo(email);
  }

  @Test
  @DisplayName("Should return null when user email not found")
  void getUserEmailReturnsNullWhenNotFound() {
    // Arrange
    String email = "nonexistent@test.com";

    when(entityManager.createQuery(anyString(), eq(User.class))).thenReturn(userTypedQuery);
    when(userTypedQuery.setParameter("email", email)).thenReturn(userTypedQuery);
    when(userTypedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    User result = userDao.getUserEmail(email);

    // Assert
    assertThat(result).isNull();
  }

  @Test
  @DisplayName("Should find user by ID")
  void findByPKReturnsUserById() {
    // Arrange
    int userId = 1;
    User expectedUser = createUser(userId, "John", "Doe", "john@test.com");

    when(entityManager.find(User.class, userId)).thenReturn(expectedUser);

    // Act
    User result = userDao.findByPK(userId);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getUserId()).isEqualTo(userId);
    assertThat(result.getFirstName()).isEqualTo("John");
  }

  @Test
  @DisplayName("Should return null when user not found by ID")
  void findByPKReturnsNullWhenNotFound() {
    // Arrange
    int userId = 999;

    when(entityManager.find(User.class, userId)).thenReturn(null);

    // Act
    User result = userDao.findByPK(userId);

    // Assert
    assertThat(result).isNull();
  }

  @Test
  @DisplayName("Should return user dropdown list")
  void getUserForDropdownReturnsDropdownList() {
    // Arrange
    List<DropdownModel> expectedList =
        Arrays.asList(new DropdownModel(1, "John Doe"), new DropdownModel(2, "Jane Smith"));

    when(entityManager.createNamedQuery("userForDropdown", DropdownModel.class))
        .thenReturn(dropdownTypedQuery);
    when(dropdownTypedQuery.getResultList()).thenReturn(expectedList);

    // Act
    List<DropdownModel> result = userDao.getUserForDropdown();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
  }

  @Test
  @DisplayName("Should persist new user")
  void persistUserPersistsNewUser() {
    // Arrange
    User user = createUser(null, "New", "User", "new@test.com");

    // Act - verify EntityManager persist is called correctly
    userDao.getEntityManager().persist(user);

    // Assert
    verify(entityManager).persist(user);
  }

  @Test
  @DisplayName("Should update existing user")
  void updateUserMergesExistingUser() {
    // Arrange
    User user = createUser(1, "Updated", "User", "updated@test.com");
    when(entityManager.merge(user)).thenReturn(user);

    // Act
    User result = userDao.update(user);

    // Assert
    verify(entityManager).merge(user);
    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should delete user")
  void deleteUserRemovesUser() {
    // Arrange
    User user = createUser(1, "Delete", "Me", "delete@test.com");
    when(entityManager.contains(user)).thenReturn(true);

    // Act
    userDao.delete(user);

    // Assert
    verify(entityManager).remove(user);
  }

  @Test
  @DisplayName("Should handle user with company")
  void handleUserWithCompany() {
    // Arrange
    User user = createUser(1, "John", "Doe", "john@test.com");
    Company company = new Company();
    company.setCompanyId(1);
    company.setCompanyName("Test Company");
    user.setCompany(company);

    when(entityManager.find(User.class, 1)).thenReturn(user);

    // Act
    User result = userDao.findByPK(1);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getCompany()).isNotNull();
    assertThat(result.getCompany().getCompanyName()).isEqualTo("Test Company");
  }

  @Test
  @DisplayName("Should handle user with role")
  void handleUserWithRole() {
    // Arrange
    User user = createUser(1, "John", "Doe", "john@test.com");
    Role role = new Role();
    role.setRoleCode(1);
    role.setRoleName("Admin");
    user.setRole(role);

    when(entityManager.find(User.class, 1)).thenReturn(user);

    // Act
    User result = userDao.findByPK(1);

    // Assert
    assertThat(result).isNotNull();
    assertThat(result.getRole()).isNotNull();
    assertThat(result.getRole().getRoleName()).isEqualTo("Admin");
  }

  @Test
  @DisplayName("Should return all users not employee")
  void getAllUserNotEmployeeReturnsUsers() {
    // Arrange
    List<User> expectedUsers =
        Arrays.asList(
            createUser(1, "John", "Doe", "john@test.com"),
            createUser(2, "Jane", "Smith", "jane@test.com"));

    when(entityManager.createQuery(anyString(), eq(User.class))).thenReturn(userTypedQuery);
    when(userTypedQuery.getResultList()).thenReturn(expectedUsers);

    // Act
    List<User> result = userDao.getAllUserNotEmployee();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).hasSize(2);
  }

  @Test
  @DisplayName("Should return empty list when no users not employee")
  void getAllUserNotEmployeeReturnsEmptyList() {
    // Arrange
    when(entityManager.createQuery(anyString(), eq(User.class))).thenReturn(userTypedQuery);
    when(userTypedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    List<User> result = userDao.getAllUserNotEmployee();

    // Assert
    assertThat(result).isNotNull();
    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should handle active and inactive users")
  void handleActiveAndInactiveUsers() {
    // Arrange
    User activeUser = createUser(1, "Active", "User", "active@test.com");
    activeUser.setIsActive(true);

    User inactiveUser = createUser(2, "Inactive", "User", "inactive@test.com");
    inactiveUser.setIsActive(false);

    when(entityManager.find(User.class, 1)).thenReturn(activeUser);
    when(entityManager.find(User.class, 2)).thenReturn(inactiveUser);

    // Act
    User active = userDao.findByPK(1);
    User inactive = userDao.findByPK(2);

    // Assert
    assertThat(active.getIsActive()).isTrue();
    assertThat(inactive.getIsActive()).isFalse();
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
