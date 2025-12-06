package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.UserFilterEnum;
import com.simpleaccounts.entity.Role;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
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

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<User> userTypedQuery;

    @Mock
    private TypedQuery<DropdownModel> dropdownTypedQuery;

    @Mock
    private Query query;

    @Mock
    private DatatableSortingFilterConstant dataTableUtil;

    @InjectMocks
    private UserDaoImpl userDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(userDao, "entityClass", User.class);
    }

    @Test
    @DisplayName("Should return user by email when user exists and is active")
    void getUserByEmailReturnsUserWhenExists() {
        // Arrange
        String email = "test@example.com";
        User user = createUser(1, email);
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("email", email))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(Collections.singletonList(user));

        // Act
        Optional<User> result = userDao.getUserByEmail(email);

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getUserEmail()).isEqualTo(email);
    }

    @Test
    @DisplayName("Should return empty optional when user not found by email")
    void getUserByEmailReturnsEmptyWhenNotFound() {
        // Arrange
        String email = "nonexistent@example.com";
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("email", email))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        Optional<User> result = userDao.getUserByEmail(email);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty optional when multiple users found")
    void getUserByEmailReturnsEmptyWhenMultipleFound() {
        // Arrange
        String email = "duplicate@example.com";
        List<User> users = Arrays.asList(createUser(1, email), createUser(2, email));
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("email", email))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(users);

        // Act
        Optional<User> result = userDao.getUserByEmail(email);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should set email parameter correctly in getUserByEmail")
    void getUserByEmailSetsEmailParameter() {
        // Arrange
        String email = "test@example.com";
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.setParameter("email", email))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        userDao.getUserByEmail(email);

        // Assert
        verify(query).setParameter("email", email);
    }

    @Test
    @DisplayName("Should return user email when user exists")
    void getUserEmailReturnsUser() {
        // Arrange
        String email = "test@example.com";
        User user = createUser(1, email);
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("email", email))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(Collections.singletonList(user));

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
        String email = "nonexistent@example.com";
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("email", email))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        User result = userDao.getUserEmail(email);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when result list is null")
    void getUserEmailReturnsNullWhenListIsNull() {
        // Arrange
        String email = "test@example.com";
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("email", email))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        User result = userDao.getUserEmail(email);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return true when user credentials are valid")
    void getUserByEmailAndPasswordReturnsTrue() {
        // Arrange
        String email = "test@example.com";
        String password = "password123";
        User user = createUser(1, email);
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("userEmail", email))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("password", password))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getSingleResult())
            .thenReturn(user);

        // Act
        boolean result = userDao.getUserByEmail(email, password);

        // Assert
        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("Should set user email and password parameters")
    void getUserByEmailAndPasswordSetsParameters() {
        // Arrange
        String email = "test@example.com";
        String password = "password123";
        User user = createUser(1, email);
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("userEmail", email))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("password", password))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getSingleResult())
            .thenReturn(user);

        // Act
        userDao.getUserByEmail(email, password);

        // Assert
        verify(userTypedQuery).setParameter("userEmail", email);
        verify(userTypedQuery).setParameter("password", password);
    }

    @Test
    @DisplayName("Should return user password by user ID")
    void getUserPasswordReturnsUser() {
        // Arrange
        Integer userId = 1;
        User user = createUser(userId, "test@example.com");
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("userId", userId))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getSingleResult())
            .thenReturn(user);

        // Act
        User result = userDao.getUserPassword(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(userId);
    }

    @Test
    @DisplayName("Should set user ID parameter in getUserPassword")
    void getUserPasswordSetsUserIdParameter() {
        // Arrange
        Integer userId = 123;
        User user = createUser(userId, "test@example.com");
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("userId", userId))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getSingleResult())
            .thenReturn(user);

        // Act
        userDao.getUserPassword(userId);

        // Assert
        verify(userTypedQuery).setParameter("userId", userId);
    }

    @Test
    @DisplayName("Should return all users not assigned to employees")
    void getAllUserNotEmployeeReturnsUsers() {
        // Arrange
        List<User> users = createUserList(5);
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(users);

        // Act
        List<User> result = userDao.getAllUserNotEmployee();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should return empty list when no users without employees")
    void getAllUserNotEmployeeReturnsEmptyListWhenNone() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<User> result = userDao.getAllUserNotEmployee();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result is null for non-employee users")
    void getAllUserNotEmployeeReturnsEmptyListWhenNull() {
        // Arrange
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<User> result = userDao.getAllUserNotEmployee();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should soft delete users by setting delete flag")
    void deleteByIdsSetsDeleteFlagOnUsers() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        User user1 = createUser(1, "user1@example.com");
        User user2 = createUser(2, "user2@example.com");
        User user3 = createUser(3, "user3@example.com");

        when(entityManager.find(User.class, 1)).thenReturn(user1);
        when(entityManager.find(User.class, 2)).thenReturn(user2);
        when(entityManager.find(User.class, 3)).thenReturn(user3);
        when(entityManager.merge(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        userDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(3)).merge(any(User.class));
        assertThat(user1.getDeleteFlag()).isTrue();
        assertThat(user2.getDeleteFlag()).isTrue();
        assertThat(user3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNotDeleteWhenListEmpty() {
        // Arrange
        List<Integer> emptyIds = new ArrayList<>();

        // Act
        userDao.deleteByIds(emptyIds);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNotDeleteWhenListNull() {
        // Act
        userDao.deleteByIds(null);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should return pagination response model with user list")
    void getUserListReturnsPaginationResponseModel() {
        // Arrange
        Map<UserFilterEnum, Object> filterMap = new EnumMap<>(UserFilterEnum.class);
        PaginationModel paginationModel = createPaginationModel(0, 10, "firstName", "ASC");

        List<User> users = createUserList(5);
        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.USER)))
            .thenReturn("firstName");
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(users);

        // Act
        PaginationResponseModel result = userDao.getUserList(filterMap, paginationModel);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getData()).isNotNull();
    }

    @Test
    @DisplayName("Should return users for dropdown")
    void getUserForDropdownReturnsDropdownModels() {
        // Arrange
        List<DropdownModel> dropdownModels = createDropdownModelList(5);
        when(entityManager.createNamedQuery("userForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(dropdownModels);

        // Act
        List<DropdownModel> result = userDao.getUserForDropdown();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should return all user IDs")
    void getAllUserIdsReturnsUserIds() {
        // Arrange
        List<Integer> userIds = Arrays.asList(1, 2, 3, 4, 5);
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(userIds);

        // Act
        List<Integer> result = userDao.getAllUserIds();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).containsExactly(1, 2, 3, 4, 5);
    }

    @Test
    @DisplayName("Should return users for payroll dropdown")
    void getUserForPayrollDropdownReturnsDropdownModels() {
        // Arrange
        Integer userId = 1;
        List<DropdownModel> dropdownModels = createDropdownModelList(3);
        when(entityManager.createNamedQuery("userForPayrollDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.setParameter("userId", userId))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(dropdownModels);

        // Act
        List<DropdownModel> result = userDao.getUserForPayrollDropdown(userId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should set userId parameter for payroll dropdown")
    void getUserForPayrollDropdownSetsUserIdParameter() {
        // Arrange
        Integer userId = 123;
        when(entityManager.createNamedQuery("userForPayrollDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.setParameter("userId", userId))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        userDao.getUserForPayrollDropdown(userId);

        // Assert
        verify(dropdownTypedQuery).setParameter("userId", userId);
    }

    @Test
    @DisplayName("Should verify user entity structure")
    void userEntityHasCorrectStructure() {
        // Arrange
        User user = createUser(1, "test@example.com");
        user.setFirstName("John");
        user.setLastName("Doe");

        // Assert
        assertThat(user.getUserId()).isEqualTo(1);
        assertThat(user.getUserEmail()).isEqualTo("test@example.com");
        assertThat(user.getFirstName()).isEqualTo("John");
        assertThat(user.getLastName()).isEqualTo("Doe");
        assertThat(user.getDeleteFlag()).isFalse();
        assertThat(user.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should handle large number of IDs for deletion")
    void deleteByIdsHandlesLargeNumberOfIds() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
            when(entityManager.find(User.class, i))
                .thenReturn(createUser(i, "user" + i + "@example.com"));
        }
        when(entityManager.merge(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        userDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(100)).find(eq(User.class), any(Integer.class));
        verify(entityManager, times(100)).merge(any(User.class));
    }

    @Test
    @DisplayName("Should apply filters to user list query")
    void getUserListAppliesFilters() {
        // Arrange
        Map<UserFilterEnum, Object> filterMap = new EnumMap<>(UserFilterEnum.class);
        filterMap.put(UserFilterEnum.FIRST_NAME, "John");
        PaginationModel paginationModel = createPaginationModel(0, 10, "firstName", "ASC");

        when(dataTableUtil.getColName(anyString(), eq(DatatableSortingFilterConstant.USER)))
            .thenReturn("firstName");
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        userDao.getUserList(filterMap, paginationModel);

        // Assert
        verify(dataTableUtil).getColName(anyString(), eq(DatatableSortingFilterConstant.USER));
    }

    @Test
    @DisplayName("Should return empty list when getAllUserIds returns nothing")
    void getAllUserIdsReturnsEmptyListWhenNoUsers() {
        // Arrange
        when(entityManager.createQuery(anyString()))
            .thenReturn(query);
        when(query.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<Integer> result = userDao.getAllUserIds();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return first user from multiple results in getUserEmail")
    void getUserEmailReturnsFirstFromMultiple() {
        // Arrange
        String email = "test@example.com";
        User user1 = createUser(1, email);
        User user2 = createUser(2, email);
        when(entityManager.createQuery(anyString(), eq(User.class)))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.setParameter("email", email))
            .thenReturn(userTypedQuery);
        when(userTypedQuery.getResultList())
            .thenReturn(Arrays.asList(user1, user2));

        // Act
        User result = userDao.getUserEmail(email);

        // Assert
        assertThat(result).isEqualTo(user1);
    }

    @Test
    @DisplayName("Should maintain delete flag false for new users")
    void newUserHasDeleteFlagFalse() {
        // Arrange & Act
        User user = createUser(100, "newuser@example.com");

        // Assert
        assertThat(user.getDeleteFlag()).isFalse();
    }

    @Test
    @DisplayName("Should maintain active flag true for new users")
    void newUserHasActiveFlagTrue() {
        // Arrange & Act
        User user = createUser(100, "newuser@example.com");

        // Assert
        assertThat(user.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("Should use userForDropdown named query")
    void getUserForDropdownUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("userForDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        userDao.getUserForDropdown();

        // Assert
        verify(entityManager).createNamedQuery("userForDropdown", DropdownModel.class);
    }

    @Test
    @DisplayName("Should use userForPayrollDropdown named query")
    void getUserForPayrollDropdownUsesNamedQuery() {
        // Arrange
        Integer userId = 1;
        when(entityManager.createNamedQuery("userForPayrollDropdown", DropdownModel.class))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.setParameter("userId", userId))
            .thenReturn(dropdownTypedQuery);
        when(dropdownTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        userDao.getUserForPayrollDropdown(userId);

        // Assert
        verify(entityManager).createNamedQuery("userForPayrollDropdown", DropdownModel.class);
    }

    private List<User> createUserList(int count) {
        List<User> users = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            users.add(createUser(i + 1, "user" + (i + 1) + "@example.com"));
        }
        return users;
    }

    private User createUser(int id, String email) {
        User user = new User();
        user.setUserId(id);
        user.setUserEmail(email);
        user.setFirstName("User");
        user.setLastName(String.valueOf(id));
        user.setDeleteFlag(Boolean.FALSE);
        user.setIsActive(Boolean.TRUE);
        return user;
    }

    private List<DropdownModel> createDropdownModelList(int count) {
        List<DropdownModel> models = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            models.add(new DropdownModel(i + 1, "User " + (i + 1)));
        }
        return models;
    }

    private PaginationModel createPaginationModel(int pageNo, int pageSize, String sortingCol, String order) {
        PaginationModel model = new PaginationModel();
        model.setPageNo(pageNo);
        model.setPageSize(pageSize);
        model.setSortingCol(sortingCol);
        model.setOrder(order);
        return model;
    }
}
