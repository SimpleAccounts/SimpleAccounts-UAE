package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.IndustryType;
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
@DisplayName("IndustryTypeDaoImpl Unit Tests")
class IndustryTypeDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<IndustryType> typedQuery;

    @InjectMocks
    private IndustryTypeDaoImpl dao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dao, "entityClass", IndustryType.class);
    }

    @Test
    @DisplayName("Should return list of industry types when types exist")
    void getIndustryTypesReturnsListWhenTypesExist() {
        // Arrange
        List<IndustryType> industryTypes = createIndustryTypeList(5);

        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(industryTypes);

        // Act
        List<IndustryType> result = dao.getIndustryTypes();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result).isEqualTo(industryTypes);
    }

    @Test
    @DisplayName("Should return empty list when no industry types exist")
    void getIndustryTypesReturnsEmptyListWhenNoTypes() {
        // Arrange
        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        List<IndustryType> result = dao.getIndustryTypes();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should execute correct query for getting industry types")
    void getIndustryTypesExecutesCorrectQuery() {
        // Arrange
        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getIndustryTypes();

        // Assert
        verify(entityManager).createQuery("Select i from IndustryType i", IndustryType.class);
    }

    @Test
    @DisplayName("Should return null when result list is null")
    void getIndustryTypesReturnsNullWhenListIsNull() {
        // Arrange
        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(null);

        // Act
        List<IndustryType> result = dao.getIndustryTypes();

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return single industry type in list")
    void getIndustryTypesReturnsSingleType() {
        // Arrange
        IndustryType type = createIndustryType(1, "Technology");
        List<IndustryType> types = Collections.singletonList(type);

        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(types);

        // Act
        List<IndustryType> result = dao.getIndustryTypes();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(type);
    }

    @Test
    @DisplayName("Should preserve order of industry types from database")
    void getIndustryTypesPreservesOrder() {
        // Arrange
        IndustryType type1 = createIndustryType(1, "Technology");
        IndustryType type2 = createIndustryType(2, "Finance");
        IndustryType type3 = createIndustryType(3, "Healthcare");
        List<IndustryType> orderedTypes = Arrays.asList(type1, type2, type3);

        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(orderedTypes);

        // Act
        List<IndustryType> result = dao.getIndustryTypes();

        // Assert
        assertThat(result).containsExactly(type1, type2, type3);
    }

    @Test
    @DisplayName("Should call getResultList once per query")
    void getIndustryTypesCallsGetResultListOnce() {
        // Arrange
        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

        // Act
        dao.getIndustryTypes();

        // Assert
        verify(typedQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should return industry types with all properties populated")
    void getIndustryTypesReturnsTypesWithAllProperties() {
        // Arrange
        IndustryType type = createIndustryType(1, "Manufacturing");
        List<IndustryType> types = Collections.singletonList(type);

        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(types);

        // Act
        List<IndustryType> result = dao.getIndustryTypes();

        // Assert
        assertThat(result.get(0).getIndustryTypeId()).isEqualTo(1);
        assertThat(result.get(0).getIndustryTypeName()).isEqualTo("Manufacturing");
    }

    @Test
    @DisplayName("Should handle consecutive queries")
    void getIndustryTypesConsecutiveQueries() {
        // Arrange
        List<IndustryType> types = createIndustryTypeList(3);

        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(types);

        // Act
        List<IndustryType> result1 = dao.getIndustryTypes();
        List<IndustryType> result2 = dao.getIndustryTypes();

        // Assert
        assertThat(result1).hasSize(3);
        assertThat(result2).hasSize(3);
        verify(entityManager, times(2)).createQuery("Select i from IndustryType i", IndustryType.class);
    }

    @Test
    @DisplayName("Should find industry type by primary key")
    void findByPKReturnsIndustryType() {
        // Arrange
        Integer id = 1;
        IndustryType type = createIndustryType(id, "Retail");

        when(entityManager.find(IndustryType.class, id))
            .thenReturn(type);

        // Act
        IndustryType result = dao.findByPK(id);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getIndustryTypeId()).isEqualTo(id);
    }

    @Test
    @DisplayName("Should return null when industry type not found by PK")
    void findByPKReturnsNullWhenNotFound() {
        // Arrange
        Integer id = 999;
        when(entityManager.find(IndustryType.class, id))
            .thenReturn(null);

        // Act
        IndustryType result = dao.findByPK(id);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should persist industry type successfully")
    void persistIndustryTypeSuccessfully() {
        // Arrange
        IndustryType type = createIndustryType(1, "Construction");

        // Act
        IndustryType result = dao.persist(type);

        // Assert
        verify(entityManager).persist(type);
        verify(entityManager).flush();
        verify(entityManager).refresh(type);
        assertThat(result).isEqualTo(type);
    }

    @Test
    @DisplayName("Should update industry type successfully")
    void updateIndustryTypeSuccessfully() {
        // Arrange
        IndustryType type = createIndustryType(1, "Education");
        IndustryType merged = createIndustryType(1, "Education");

        when(entityManager.merge(type)).thenReturn(merged);

        // Act
        IndustryType result = dao.update(type);

        // Assert
        assertThat(result).isEqualTo(merged);
        verify(entityManager).merge(type);
    }

    @Test
    @DisplayName("Should delete managed industry type")
    void deleteIndustryTypeWhenManaged() {
        // Arrange
        IndustryType type = createIndustryType(1, "Agriculture");
        when(entityManager.contains(type)).thenReturn(true);

        // Act
        dao.delete(type);

        // Assert
        verify(entityManager).contains(type);
        verify(entityManager).remove(type);
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should dump all data from table")
    void dumpDataReturnsAllRecords() {
        // Arrange
        List<IndustryType> types = createIndustryTypeList(10);
        String query = "Select t from IndustryType t";

        when(entityManager.createQuery(query)).thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(types);

        // Act
        List<IndustryType> result = dao.dumpData();

        // Assert
        assertThat(result).hasSize(10);
    }

    @Test
    @DisplayName("Should return entity manager instance")
    void getEntityManagerReturnsInstance() {
        // Act
        EntityManager result = dao.getEntityManager();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isSameAs(entityManager);
    }

    @Test
    @DisplayName("Should handle large number of industry types")
    void getIndustryTypesHandlesLargeNumber() {
        // Arrange
        List<IndustryType> types = createIndustryTypeList(100);

        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(types);

        // Act
        List<IndustryType> result = dao.getIndustryTypes();

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should correctly identify entity class")
    void entityClassIsCorrect() {
        // Arrange & Act
        Class<?> entityClass = (Class<?>) ReflectionTestUtils.getField(dao, "entityClass");

        // Assert
        assertThat(entityClass).isEqualTo(IndustryType.class);
    }

    @Test
    @DisplayName("Should return consistent results")
    void getIndustryTypesReturnsConsistentResults() {
        // Arrange
        List<IndustryType> types = createIndustryTypeList(3);

        when(entityManager.createQuery("Select i from IndustryType i", IndustryType.class))
            .thenReturn(typedQuery);
        when(typedQuery.getResultList()).thenReturn(types);

        // Act
        List<IndustryType> result1 = dao.getIndustryTypes();
        List<IndustryType> result2 = dao.getIndustryTypes();

        // Assert
        assertThat(result1).containsExactlyElementsOf(result2);
    }

    private IndustryType createIndustryType(Integer id, String name) {
        IndustryType type = new IndustryType();
        type.setIndustryTypeId(id);
        type.setIndustryTypeName(name);
        return type;
    }

    private List<IndustryType> createIndustryTypeList(int count) {
        List<IndustryType> types = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            types.add(createIndustryType(i, "Industry" + i));
        }
        return types;
    }
}
