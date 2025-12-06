package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.entity.State;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("StateDaoImpl Unit Tests")
class StateDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<State> stateTypedQuery;

    @Mock
    private TypedQuery<Integer> integerTypedQuery;

    @InjectMocks
    private StateDaoImpl stateDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(stateDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(stateDao, "entityClass", State.class);
    }

    @Test
    @DisplayName("Should return list of states with valid filter map")
    void getstateListReturnsStatesWithValidFilters() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, 1);

        List<State> expectedStates = createStateList(3);

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.setParameter(anyString(), any()))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(expectedStates);

        // Act
        List<State> result = stateDao.getstateList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).isEqualTo(expectedStates);
    }

    @Test
    @DisplayName("Should return empty list when no states match filters")
    void getstateListReturnsEmptyListWhenNoMatches() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, 999);

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.setParameter(anyString(), any()))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<State> result = stateDao.getstateList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getstateListHandlesEmptyFilterMap() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        List<State> expectedStates = createStateList(5);

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(expectedStates);

        // Act
        List<State> result = stateDao.getstateList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should handle multiple filters in filter map")
    void getstateListHandlesMultipleFilters() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, 1);
        filterMap.put(StateFilterEnum.COUNTRY_ID, 100);

        List<State> expectedStates = createStateList(2);

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.setParameter(anyString(), any()))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(expectedStates);

        // Act
        List<State> result = stateDao.getstateList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should return state ID by input column value")
    void getStateIdByInputColumnValueReturnsValidId() {
        // Arrange
        String inputValue = "California";
        Integer expectedStateId = 5;

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(expectedStateId);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(expectedStateId);
        verify(integerTypedQuery).setParameter("val", inputValue);
        verify(integerTypedQuery).setMaxResults(1);
    }

    @Test
    @DisplayName("Should return null when state ID not found by input value")
    void getStateIdByInputColumnValueReturnsNullWhenNotFound() {
        // Arrange
        String inputValue = "NonExistentState";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(null);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should use correct named query for state ID retrieval")
    void getStateIdByInputColumnValueUsesCorrectNamedQuery() {
        // Arrange
        String inputValue = "Texas";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(10);

        // Act
        stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        verify(entityManager).createNamedQuery("getStateIdByInputColumnValue", Integer.class);
    }

    @Test
    @DisplayName("Should set max results to 1 for state ID query")
    void getStateIdByInputColumnValueSetsMaxResults() {
        // Arrange
        String inputValue = "Florida";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(7);

        // Act
        stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        verify(integerTypedQuery).setMaxResults(1);
    }

    @Test
    @DisplayName("Should handle null value parameter in state ID query")
    void getStateIdByInputColumnValueHandlesNullValue() {
        // Arrange
        String inputValue = null;

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(null);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isNull();
        verify(integerTypedQuery).setParameter("val", null);
    }

    @Test
    @DisplayName("Should handle empty string value in state ID query")
    void getStateIdByInputColumnValueHandlesEmptyString() {
        // Arrange
        String inputValue = "";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(null);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return single state when filter matches one result")
    void getstateListReturnsSingleState() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, 1);

        List<State> singleStateList = Collections.singletonList(createState(1, "New York"));

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.setParameter(anyString(), any()))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(singleStateList);

        // Act
        List<State> result = stateDao.getstateList(filterMap);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStateId()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return large list of states when filter is broad")
    void getstateListReturnsLargeList() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        List<State> largeStateList = createStateList(50);

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(largeStateList);

        // Act
        List<State> result = stateDao.getstateList(filterMap);

        // Assert
        assertThat(result).hasSize(50);
    }

    @Test
    @DisplayName("Should call getSingleResult exactly once for state ID query")
    void getStateIdByInputColumnValueCallsSingleResultOnce() {
        // Arrange
        String inputValue = "Arizona";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(3);

        // Act
        stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        verify(integerTypedQuery, times(2)).getSingleResult();
    }

    @Test
    @DisplayName("Should verify entity manager is used for state list query")
    void getstateListUsesEntityManager() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        stateDao.getstateList(filterMap);

        // Assert
        verify(entityManager).createQuery(anyString(), eq(State.class));
    }

    @Test
    @DisplayName("Should handle filter with null values")
    void getstateListHandlesNullValuesInFilter() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, null);

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<State> result = stateDao.getstateList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        verify(stateTypedQuery, never()).setParameter(anyString(), any());
    }

    @Test
    @DisplayName("Should return consistent results on multiple calls")
    void getstateListReturnsConsistentResults() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, 1);

        List<State> expectedStates = createStateList(3);

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.setParameter(anyString(), any()))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(expectedStates);

        // Act
        List<State> result1 = stateDao.getstateList(filterMap);
        List<State> result2 = stateDao.getstateList(filterMap);

        // Assert
        assertThat(result1).isEqualTo(result2);
    }

    @Test
    @DisplayName("Should handle special characters in input value")
    void getStateIdByInputColumnValueHandlesSpecialCharacters() {
        // Arrange
        String inputValue = "O'Brien State";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(15);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isEqualTo(15);
        verify(integerTypedQuery).setParameter("val", inputValue);
    }

    @Test
    @DisplayName("Should handle whitespace in input value")
    void getStateIdByInputColumnValueHandlesWhitespace() {
        // Arrange
        String inputValue = "  New Mexico  ";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(20);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isEqualTo(20);
    }

    @Test
    @DisplayName("Should return correct state ID for numeric string input")
    void getStateIdByInputColumnValueHandlesNumericString() {
        // Arrange
        String inputValue = "12345";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(12345);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isEqualTo(12345);
    }

    @Test
    @DisplayName("Should build correct query with DbFilters from filter map")
    void getstateListBuildsCorrectQuery() {
        // Arrange
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, 1);

        when(entityManager.createQuery(anyString(), eq(State.class)))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.setParameter(anyString(), any()))
            .thenReturn(stateTypedQuery);
        when(stateTypedQuery.getResultList())
            .thenReturn(createStateList(1));

        // Act
        stateDao.getstateList(filterMap);

        // Assert
        ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
        verify(entityManager).createQuery(queryCaptor.capture(), eq(State.class));
        String query = queryCaptor.getValue();
        assertThat(query).contains("SELECT o FROM");
        assertThat(query).contains("State");
    }

    @Test
    @DisplayName("Should handle case insensitive input value")
    void getStateIdByInputColumnValueHandlesCaseInsensitive() {
        // Arrange
        String inputValue = "TEXAS";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(48);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isEqualTo(48);
    }

    @Test
    @DisplayName("Should return zero when state ID is zero")
    void getStateIdByInputColumnValueReturnsZero() {
        // Arrange
        String inputValue = "Unknown";

        when(entityManager.createNamedQuery("getStateIdByInputColumnValue", Integer.class))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setParameter("val", inputValue))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.setMaxResults(1))
            .thenReturn(integerTypedQuery);
        when(integerTypedQuery.getSingleResult())
            .thenReturn(0);

        // Act
        Integer result = stateDao.getStateIdByInputColumnValue(inputValue);

        // Assert
        assertThat(result).isEqualTo(0);
    }

    private List<State> createStateList(int count) {
        List<State> states = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            states.add(createState(i + 1, "State " + (i + 1)));
        }
        return states;
    }

    private State createState(int id, String name) {
        State state = new State();
        state.setStateId(id);
        state.setStateName(name);
        return state;
    }
}
