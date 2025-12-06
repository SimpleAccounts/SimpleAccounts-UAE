package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.bankaccount.BankAccountType;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import javax.persistence.EntityManager;
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
@DisplayName("BankAccountTypeDaoImpl Unit Tests")
class BankAccountTypeDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<BankAccountType> typedQuery;

    @InjectMocks
    private BankAccountTypeDaoImpl bankAccountTypeDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bankAccountTypeDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(bankAccountTypeDao, "entityClass", BankAccountType.class);
    }

    @Test
    @DisplayName("Should return list of bank account types")
    void getBankAccountTypeListReturnsListOfTypes() {
        // Arrange
        List<BankAccountType> expectedTypes = createBankAccountTypeList(3);
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedTypes);

        // Act
        List<BankAccountType> result = bankAccountTypeDao.getBankAccountTypeList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedTypes);
    }

    @Test
    @DisplayName("Should return empty list when no bank account types exist")
    void getBankAccountTypeListReturnsEmptyListWhenNoTypesExist() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<BankAccountType> result = bankAccountTypeDao.getBankAccountTypeList();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use allBankAccountType named query")
    void getBankAccountTypeListUsesNamedQuery() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        bankAccountTypeDao.getBankAccountTypeList();

        // Assert
        verify(entityManager).createNamedQuery("allBankAccountType", BankAccountType.class);
    }

    @Test
    @DisplayName("Should find bank account type by ID")
    void getBankAccountTypeReturnsBankAccountTypeById() {
        // Arrange
        int id = 1;
        BankAccountType expectedType = createBankAccountType(id, "Savings");
        when(entityManager.find(BankAccountType.class, id))
            .thenReturn(expectedType);

        // Act
        BankAccountType result = bankAccountTypeDao.getBankAccountType(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getBankAccountTypeId()).isEqualTo(id);
        assertThat(result.getBankAccountTypeName()).isEqualTo("Savings");
    }

    @Test
    @DisplayName("Should return null when bank account type not found by ID")
    void getBankAccountTypeReturnsNullWhenNotFound() {
        // Arrange
        int id = 999;
        when(entityManager.find(BankAccountType.class, id))
            .thenReturn(null);

        // Act
        BankAccountType result = bankAccountTypeDao.getBankAccountType(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle ID zero")
    void getBankAccountTypeHandlesIdZero() {
        // Arrange
        int id = 0;
        when(entityManager.find(BankAccountType.class, id))
            .thenReturn(null);

        // Act
        BankAccountType result = bankAccountTypeDao.getBankAccountType(id);

        // Assert
        assertThat(result).isNull();
        verify(entityManager).find(BankAccountType.class, id);
    }

    @Test
    @DisplayName("Should handle negative ID")
    void getBankAccountTypeHandlesNegativeId() {
        // Arrange
        int id = -1;
        when(entityManager.find(BankAccountType.class, id))
            .thenReturn(null);

        // Act
        BankAccountType result = bankAccountTypeDao.getBankAccountType(id);

        // Assert
        assertThat(result).isNull();
        verify(entityManager).find(BankAccountType.class, id);
    }

    @Test
    @DisplayName("Should return default bank account type when list is not empty")
    void getDefaultBankAccountTypeReturnsFirstTypeWhenListNotEmpty() {
        // Arrange
        List<BankAccountType> types = createBankAccountTypeList(3);
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        BankAccountType result = bankAccountTypeDao.getDefaultBankAccountType();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(types.get(0));
    }

    @Test
    @DisplayName("Should return null when no bank account types exist for default")
    void getDefaultBankAccountTypeReturnsNullWhenListEmpty() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        BankAccountType result = bankAccountTypeDao.getDefaultBankAccountType();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when bank account type list is null")
    void getDefaultBankAccountTypeReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        BankAccountType result = bankAccountTypeDao.getDefaultBankAccountType();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return first element even when multiple types exist")
    void getDefaultBankAccountTypeReturnsFirstElementWithMultipleTypes() {
        // Arrange
        BankAccountType firstType = createBankAccountType(1, "Checking");
        BankAccountType secondType = createBankAccountType(2, "Savings");
        List<BankAccountType> types = Arrays.asList(firstType, secondType);

        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        BankAccountType result = bankAccountTypeDao.getDefaultBankAccountType();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(firstType);
        assertThat(result).isNotEqualTo(secondType);
    }

    @Test
    @DisplayName("Should call getBankAccountTypeList twice for default")
    void getDefaultBankAccountTypeCallsGetBankAccountTypeListTwice() {
        // Arrange
        List<BankAccountType> types = createBankAccountTypeList(2);
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        bankAccountTypeDao.getDefaultBankAccountType();

        // Assert
        verify(entityManager, times(2)).createNamedQuery("allBankAccountType", BankAccountType.class);
    }

    @Test
    @DisplayName("Should return consistent results for multiple calls to list")
    void getBankAccountTypeListReturnsConsistentResults() {
        // Arrange
        List<BankAccountType> types = createBankAccountTypeList(3);
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<BankAccountType> result1 = bankAccountTypeDao.getBankAccountTypeList();
        List<BankAccountType> result2 = bankAccountTypeDao.getBankAccountTypeList();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should return same instance when finding same ID multiple times")
    void getBankAccountTypeReturnsSameInstanceForSameId() {
        // Arrange
        int id = 1;
        BankAccountType type = createBankAccountType(id, "Current");
        when(entityManager.find(BankAccountType.class, id))
            .thenReturn(type);

        // Act
        BankAccountType result1 = bankAccountTypeDao.getBankAccountType(id);
        BankAccountType result2 = bankAccountTypeDao.getBankAccountType(id);

        // Assert
        assertThat(result1).isSameAs(result2);
    }

    @Test
    @DisplayName("Should find different types with different IDs")
    void getBankAccountTypeReturnsDifferentTypesForDifferentIds() {
        // Arrange
        BankAccountType type1 = createBankAccountType(1, "Savings");
        BankAccountType type2 = createBankAccountType(2, "Current");

        when(entityManager.find(BankAccountType.class, 1))
            .thenReturn(type1);
        when(entityManager.find(BankAccountType.class, 2))
            .thenReturn(type2);

        // Act
        BankAccountType result1 = bankAccountTypeDao.getBankAccountType(1);
        BankAccountType result2 = bankAccountTypeDao.getBankAccountType(2);

        // Assert
        assertThat(result1).isNotEqualTo(result2);
        assertThat(result1.getBankAccountTypeName()).isEqualTo("Savings");
        assertThat(result2.getBankAccountTypeName()).isEqualTo("Current");
    }

    @Test
    @DisplayName("Should handle single element list for default")
    void getDefaultBankAccountTypeHandlesSingleElementList() {
        // Arrange
        List<BankAccountType> types = Collections.singletonList(
            createBankAccountType(1, "Only Type")
        );
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        BankAccountType result = bankAccountTypeDao.getDefaultBankAccountType();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getBankAccountTypeName()).isEqualTo("Only Type");
    }

    @Test
    @DisplayName("Should return list with correct size")
    void getBankAccountTypeListReturnsCorrectSize() {
        // Arrange
        List<BankAccountType> types = createBankAccountTypeList(5);
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<BankAccountType> result = bankAccountTypeDao.getBankAccountTypeList();

        // Assert
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should handle large list of bank account types")
    void getBankAccountTypeListHandlesLargeList() {
        // Arrange
        List<BankAccountType> types = createBankAccountTypeList(100);
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<BankAccountType> result = bankAccountTypeDao.getBankAccountTypeList();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should verify entity manager interaction for findByPK")
    void getBankAccountTypeVerifiesEntityManagerInteraction() {
        // Arrange
        int id = 5;
        BankAccountType type = createBankAccountType(id, "Business");
        when(entityManager.find(BankAccountType.class, id))
            .thenReturn(type);

        // Act
        bankAccountTypeDao.getBankAccountType(id);

        // Assert
        verify(entityManager).find(BankAccountType.class, id);
    }

    @Test
    @DisplayName("Should not call find when getting list")
    void getBankAccountTypeListDoesNotCallFind() {
        // Arrange
        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        bankAccountTypeDao.getBankAccountTypeList();

        // Assert
        verify(entityManager, never()).find(any(), any());
    }

    @Test
    @DisplayName("Should not call named query when finding by ID")
    void getBankAccountTypeDoesNotCallNamedQuery() {
        // Arrange
        int id = 1;
        when(entityManager.find(BankAccountType.class, id))
            .thenReturn(createBankAccountType(id, "Test"));

        // Act
        bankAccountTypeDao.getBankAccountType(id);

        // Assert
        verify(entityManager, never()).createNamedQuery(anyString(), any());
    }

    @Test
    @DisplayName("Should return correct type name for found bank account type")
    void getBankAccountTypeReturnsCorrectTypeName() {
        // Arrange
        int id = 10;
        BankAccountType type = createBankAccountType(id, "Investment");
        when(entityManager.find(BankAccountType.class, id))
            .thenReturn(type);

        // Act
        BankAccountType result = bankAccountTypeDao.getBankAccountType(id);

        // Assert
        assertThat(result.getBankAccountTypeName()).isEqualTo("Investment");
    }

    @Test
    @DisplayName("Should return types in order from query")
    void getBankAccountTypeListReturnsTypesInOrder() {
        // Arrange
        BankAccountType type1 = createBankAccountType(1, "First");
        BankAccountType type2 = createBankAccountType(2, "Second");
        BankAccountType type3 = createBankAccountType(3, "Third");
        List<BankAccountType> types = Arrays.asList(type1, type2, type3);

        when(entityManager.createNamedQuery("allBankAccountType", BankAccountType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<BankAccountType> result = bankAccountTypeDao.getBankAccountTypeList();

        // Assert
        assertThat(result.get(0).getBankAccountTypeName()).isEqualTo("First");
        assertThat(result.get(1).getBankAccountTypeName()).isEqualTo("Second");
        assertThat(result.get(2).getBankAccountTypeName()).isEqualTo("Third");
    }

    private List<BankAccountType> createBankAccountTypeList(int count) {
        List<BankAccountType> types = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            types.add(createBankAccountType(i + 1, "Type " + (i + 1)));
        }
        return types;
    }

    private BankAccountType createBankAccountType(int id, String name) {
        BankAccountType type = new BankAccountType();
        type.setBankAccountTypeId(id);
        type.setBankAccountTypeName(name);
        return type;
    }
}
