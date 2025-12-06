package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.CompanyType;
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
@DisplayName("CompanyTypeDaoImpl Unit Tests")
class CompanyTypeDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<CompanyType> typedQuery;

    @InjectMocks
    private CompanyTypeDaoImpl companyTypeDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(companyTypeDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(companyTypeDao, "entityClass", CompanyType.class);
    }

    @Test
    @DisplayName("Should return list of company types when types exist")
    void getCompanyTypesReturnsListWhenTypesExist() {
        // Arrange
        List<CompanyType> expectedTypes = createCompanyTypeList(3);
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedTypes);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedTypes);
    }

    @Test
    @DisplayName("Should return empty list when no company types exist")
    void getCompanyTypesReturnsEmptyListWhenNoTypesExist() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return empty list when result list is null")
    void getCompanyTypesReturnsEmptyListWhenResultIsNull() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should use correct JPQL query")
    void getCompanyTypesUsesCorrectQuery() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyTypeDao.getCompanyTypes();

        // Assert
        verify(entityManager).createQuery("Select c From CompanyType c", CompanyType.class);
    }

    @Test
    @DisplayName("Should call getResultList on typed query")
    void getCompanyTypesCallsGetResultList() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyTypeDao.getCompanyTypes();

        // Assert
        verify(typedQuery).getResultList();
    }

    @Test
    @DisplayName("Should return single company type when only one exists")
    void getCompanyTypesReturnsSingleTypeWhenOnlyOneExists() {
        // Arrange
        List<CompanyType> types = Collections.singletonList(
            createCompanyType(1, "LLC")
        );
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCompanyTypeName()).isEqualTo("LLC");
    }

    @Test
    @DisplayName("Should handle large list of company types")
    void getCompanyTypesHandlesLargeList() {
        // Arrange
        List<CompanyType> types = createCompanyTypeList(100);
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should return types with correct IDs")
    void getCompanyTypesReturnsTypesWithCorrectIds() {
        // Arrange
        CompanyType type1 = createCompanyType(1, "Corporation");
        CompanyType type2 = createCompanyType(2, "Partnership");
        List<CompanyType> types = Arrays.asList(type1, type2);

        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getCompanyTypeId()).isEqualTo(1);
        assertThat(result.get(1).getCompanyTypeId()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should return types with correct names")
    void getCompanyTypesReturnsTypesWithCorrectNames() {
        // Arrange
        CompanyType type1 = createCompanyType(1, "Sole Proprietorship");
        CompanyType type2 = createCompanyType(2, "Limited Liability Company");
        List<CompanyType> types = Arrays.asList(type1, type2);

        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result.get(0).getCompanyTypeName()).isEqualTo("Sole Proprietorship");
        assertThat(result.get(1).getCompanyTypeName()).isEqualTo("Limited Liability Company");
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getCompanyTypesReturnsConsistentResults() {
        // Arrange
        List<CompanyType> types = createCompanyTypeList(5);
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<CompanyType> result1 = companyTypeDao.getCompanyTypes();
        List<CompanyType> result2 = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should create query exactly once per call")
    void getCompanyTypesCreatesQueryOncePerCall() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyTypeDao.getCompanyTypes();

        // Assert
        verify(entityManager, times(1)).createQuery(anyString(), eq(CompanyType.class));
    }

    @Test
    @DisplayName("Should not return null list")
    void getCompanyTypesNeverReturnsNull() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(null);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should return empty list when result list is empty collection")
    void getCompanyTypesHandlesEmptyCollection() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(Collections.emptyList());

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should return all types from query result")
    void getCompanyTypesReturnsAllTypesFromQuery() {
        // Arrange
        List<CompanyType> expectedTypes = createCompanyTypeList(10);
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(expectedTypes);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).hasSize(10);
        assertThat(result).containsExactlyElementsOf(expectedTypes);
    }

    @Test
    @DisplayName("Should return types in order from query")
    void getCompanyTypesReturnsTypesInOrder() {
        // Arrange
        CompanyType type1 = createCompanyType(1, "First");
        CompanyType type2 = createCompanyType(2, "Second");
        CompanyType type3 = createCompanyType(3, "Third");
        List<CompanyType> types = Arrays.asList(type1, type2, type3);

        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result.get(0).getCompanyTypeName()).isEqualTo("First");
        assertThat(result.get(1).getCompanyTypeName()).isEqualTo("Second");
        assertThat(result.get(2).getCompanyTypeName()).isEqualTo("Third");
    }

    @Test
    @DisplayName("Should handle special characters in company type names")
    void getCompanyTypesHandlesSpecialCharacters() {
        // Arrange
        CompanyType type = createCompanyType(1, "L.L.C. & Co.");
        List<CompanyType> types = Collections.singletonList(type);

        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(types);

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCompanyTypeName()).isEqualTo("L.L.C. & Co.");
    }

    @Test
    @DisplayName("Should verify entity manager is called correctly")
    void getCompanyTypesVerifiesEntityManagerCall() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyTypeDao.getCompanyTypes();

        // Assert
        verify(entityManager).createQuery("Select c From CompanyType c", CompanyType.class);
        verify(typedQuery).getResultList();
    }

    @Test
    @DisplayName("Should not use named queries")
    void getCompanyTypesDoesNotUseNamedQueries() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        companyTypeDao.getCompanyTypes();

        // Assert
        verify(entityManager, never()).createNamedQuery(anyString(), any());
    }

    @Test
    @DisplayName("Should return new ArrayList instance when result is empty")
    void getCompanyTypesReturnsNewArrayListWhenEmpty() {
        // Arrange
        when(entityManager.createQuery("Select c From CompanyType c", CompanyType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<CompanyType> result = companyTypeDao.getCompanyTypes();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isInstanceOf(ArrayList.class);
    }

    private List<CompanyType> createCompanyTypeList(int count) {
        List<CompanyType> types = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            types.add(createCompanyType(i + 1, "CompanyType " + (i + 1)));
        }
        return types;
    }

    private CompanyType createCompanyType(int id, String name) {
        CompanyType type = new CompanyType();
        type.setCompanyTypeId(id);
        type.setCompanyTypeName(name);
        return type;
    }
}
