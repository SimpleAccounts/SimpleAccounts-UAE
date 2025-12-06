package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.dao.StateDao;
import com.simpleaccounts.entity.State;
import com.simpleaccounts.exceptions.ServiceException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StateServiceImplTest {

    @Mock
    private StateDao stateDao;

    @InjectMocks
    private StateServiceImpl stateService;

    private State testState1;
    private State testState2;
    private State testState3;

    @BeforeEach
    void setUp() {
        testState1 = new State();
        testState1.setStateId(1);
        testState1.setStateName("Dubai");
        testState1.setStateCode("DXB");
        testState1.setCountryId(1);

        testState2 = new State();
        testState2.setStateId(2);
        testState2.setStateName("Abu Dhabi");
        testState2.setStateCode("AUH");
        testState2.setCountryId(1);

        testState3 = new State();
        testState3.setStateId(3);
        testState3.setStateName("Sharjah");
        testState3.setStateCode("SHJ");
        testState3.setCountryId(1);
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnStateDaoWhenGetDaoCalled() {
        assertThat(stateService.getDao()).isEqualTo(stateDao);
    }

    @Test
    void shouldReturnNonNullDaoInstance() {
        assertThat(stateService.getDao()).isNotNull();
    }

    // ========== getstateList Tests ==========

    @Test
    void shouldReturnStateListWhenValidFilterMapProvided() {
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.COUNTRY_ID, 1);

        List<State> expectedList = Arrays.asList(testState1, testState2, testState3);
        when(stateDao.getstateList(filterMap)).thenReturn(expectedList);

        List<State> result = stateService.getstateList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result).containsExactly(testState1, testState2, testState3);
        verify(stateDao, times(1)).getstateList(filterMap);
    }

    @Test
    void shouldReturnEmptyListWhenNoStatesMatchFilter() {
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.COUNTRY_ID, 999);

        when(stateDao.getstateList(filterMap)).thenReturn(Collections.emptyList());

        List<State> result = stateService.getstateList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(stateDao, times(1)).getstateList(filterMap);
    }

    @Test
    void shouldReturnSingleStateWhenOnlyOneMatches() {
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, 1);

        List<State> expectedList = Collections.singletonList(testState1);
        when(stateDao.getstateList(filterMap)).thenReturn(expectedList);

        List<State> result = stateService.getstateList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testState1);
        assertThat(result.get(0).getStateName()).isEqualTo("Dubai");
        verify(stateDao, times(1)).getstateList(filterMap);
    }

    @Test
    void shouldHandleEmptyFilterMap() {
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        List<State> expectedList = Arrays.asList(testState1, testState2, testState3);

        when(stateDao.getstateList(filterMap)).thenReturn(expectedList);

        List<State> result = stateService.getstateList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        verify(stateDao, times(1)).getstateList(filterMap);
    }

    @Test
    void shouldHandleNullFilterMap() {
        List<State> expectedList = Arrays.asList(testState1, testState2);
        when(stateDao.getstateList(null)).thenReturn(expectedList);

        List<State> result = stateService.getstateList(null);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(stateDao, times(1)).getstateList(null);
    }

    @Test
    void shouldReturnNullWhenDaoReturnsNull() {
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        when(stateDao.getstateList(filterMap)).thenReturn(null);

        List<State> result = stateService.getstateList(filterMap);

        assertThat(result).isNull();
        verify(stateDao, times(1)).getstateList(filterMap);
    }

    @Test
    void shouldHandleMultipleFilters() {
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.COUNTRY_ID, 1);
        filterMap.put(StateFilterEnum.STATE_NAME, "Dubai");

        List<State> expectedList = Collections.singletonList(testState1);
        when(stateDao.getstateList(filterMap)).thenReturn(expectedList);

        List<State> result = stateService.getstateList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStateName()).isEqualTo("Dubai");
        verify(stateDao, times(1)).getstateList(filterMap);
    }

    @Test
    void shouldReturnStatesWithCompleteData() {
        State detailedState = new State();
        detailedState.setStateId(10);
        detailedState.setStateName("Ajman");
        detailedState.setStateCode("AJM");
        detailedState.setCountryId(1);

        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(StateFilterEnum.STATE_ID, 10);

        List<State> expectedList = Collections.singletonList(detailedState);
        when(stateDao.getstateList(filterMap)).thenReturn(expectedList);

        List<State> result = stateService.getstateList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStateId()).isEqualTo(10);
        assertThat(result.get(0).getStateName()).isEqualTo("Ajman");
        assertThat(result.get(0).getStateCode()).isEqualTo("AJM");
        verify(stateDao, times(1)).getstateList(filterMap);
    }

    @Test
    void shouldHandleMultipleConsecutiveCalls() {
        Map<StateFilterEnum, Object> filterMap1 = new HashMap<>();
        filterMap1.put(StateFilterEnum.STATE_ID, 1);

        Map<StateFilterEnum, Object> filterMap2 = new HashMap<>();
        filterMap2.put(StateFilterEnum.STATE_ID, 2);

        when(stateDao.getstateList(filterMap1)).thenReturn(Collections.singletonList(testState1));
        when(stateDao.getstateList(filterMap2)).thenReturn(Collections.singletonList(testState2));

        List<State> result1 = stateService.getstateList(filterMap1);
        List<State> result2 = stateService.getstateList(filterMap2);

        assertThat(result1).hasSize(1);
        assertThat(result1.get(0).getStateName()).isEqualTo("Dubai");
        assertThat(result2).hasSize(1);
        assertThat(result2.get(0).getStateName()).isEqualTo("Abu Dhabi");
        verify(stateDao, times(1)).getstateList(filterMap1);
        verify(stateDao, times(1)).getstateList(filterMap2);
    }

    @Test
    void shouldHandleLargeListOfStates() {
        List<State> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            State state = new State();
            state.setStateId(i);
            state.setStateName("State " + i);
            largeList.add(state);
        }

        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        when(stateDao.getstateList(filterMap)).thenReturn(largeList);

        List<State> result = stateService.getstateList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        assertThat(result.get(0).getStateName()).isEqualTo("State 1");
        assertThat(result.get(49).getStateName()).isEqualTo("State 50");
        verify(stateDao, times(1)).getstateList(filterMap);
    }

    // ========== getStateIdByInputColumnValue Tests ==========

    @Test
    void shouldReturnStateIdWhenValidValueProvided() {
        String inputValue = "Dubai";
        when(stateDao.getStateIdByInputColumnValue(inputValue)).thenReturn(1);

        Integer result = stateService.getStateIdByInputColumnValue(inputValue);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(1);
        verify(stateDao, times(1)).getStateIdByInputColumnValue(inputValue);
    }

    @Test
    void shouldReturnNullWhenNoStateMatchesValue() {
        String inputValue = "Unknown State";
        when(stateDao.getStateIdByInputColumnValue(inputValue)).thenReturn(null);

        Integer result = stateService.getStateIdByInputColumnValue(inputValue);

        assertThat(result).isNull();
        verify(stateDao, times(1)).getStateIdByInputColumnValue(inputValue);
    }

    @Test
    void shouldHandleEmptyStringValue() {
        String inputValue = "";
        when(stateDao.getStateIdByInputColumnValue(inputValue)).thenReturn(null);

        Integer result = stateService.getStateIdByInputColumnValue(inputValue);

        assertThat(result).isNull();
        verify(stateDao, times(1)).getStateIdByInputColumnValue(inputValue);
    }

    @Test
    void shouldHandleNullValue() {
        when(stateDao.getStateIdByInputColumnValue(null)).thenReturn(null);

        Integer result = stateService.getStateIdByInputColumnValue(null);

        assertThat(result).isNull();
        verify(stateDao, times(1)).getStateIdByInputColumnValue(null);
    }

    @Test
    void shouldReturnDifferentIdsForDifferentValues() {
        when(stateDao.getStateIdByInputColumnValue("Dubai")).thenReturn(1);
        when(stateDao.getStateIdByInputColumnValue("Abu Dhabi")).thenReturn(2);
        when(stateDao.getStateIdByInputColumnValue("Sharjah")).thenReturn(3);

        Integer result1 = stateService.getStateIdByInputColumnValue("Dubai");
        Integer result2 = stateService.getStateIdByInputColumnValue("Abu Dhabi");
        Integer result3 = stateService.getStateIdByInputColumnValue("Sharjah");

        assertThat(result1).isEqualTo(1);
        assertThat(result2).isEqualTo(2);
        assertThat(result3).isEqualTo(3);
        verify(stateDao, times(1)).getStateIdByInputColumnValue("Dubai");
        verify(stateDao, times(1)).getStateIdByInputColumnValue("Abu Dhabi");
        verify(stateDao, times(1)).getStateIdByInputColumnValue("Sharjah");
    }

    @Test
    void shouldHandleCaseSensitiveValue() {
        when(stateDao.getStateIdByInputColumnValue("dubai")).thenReturn(null);
        when(stateDao.getStateIdByInputColumnValue("Dubai")).thenReturn(1);

        Integer result1 = stateService.getStateIdByInputColumnValue("dubai");
        Integer result2 = stateService.getStateIdByInputColumnValue("Dubai");

        assertThat(result1).isNull();
        assertThat(result2).isEqualTo(1);
        verify(stateDao, times(1)).getStateIdByInputColumnValue("dubai");
        verify(stateDao, times(1)).getStateIdByInputColumnValue("Dubai");
    }

    @Test
    void shouldHandleValueWithWhitespace() {
        String inputValue = "  Dubai  ";
        when(stateDao.getStateIdByInputColumnValue(inputValue)).thenReturn(1);

        Integer result = stateService.getStateIdByInputColumnValue(inputValue);

        assertThat(result).isEqualTo(1);
        verify(stateDao, times(1)).getStateIdByInputColumnValue(inputValue);
    }

    @Test
    void shouldHandleNumericStringValue() {
        String inputValue = "123";
        when(stateDao.getStateIdByInputColumnValue(inputValue)).thenReturn(123);

        Integer result = stateService.getStateIdByInputColumnValue(inputValue);

        assertThat(result).isEqualTo(123);
        verify(stateDao, times(1)).getStateIdByInputColumnValue(inputValue);
    }

    @Test
    void shouldHandleSpecialCharactersInValue() {
        String inputValue = "State@#$";
        when(stateDao.getStateIdByInputColumnValue(inputValue)).thenReturn(null);

        Integer result = stateService.getStateIdByInputColumnValue(inputValue);

        assertThat(result).isNull();
        verify(stateDao, times(1)).getStateIdByInputColumnValue(inputValue);
    }

    @Test
    void shouldReturnZeroAsValidStateId() {
        String inputValue = "Default State";
        when(stateDao.getStateIdByInputColumnValue(inputValue)).thenReturn(0);

        Integer result = stateService.getStateIdByInputColumnValue(inputValue);

        assertThat(result).isEqualTo(0);
        verify(stateDao, times(1)).getStateIdByInputColumnValue(inputValue);
    }

    @Test
    void shouldHandleRepeatedCallsWithSameValue() {
        String inputValue = "Dubai";
        when(stateDao.getStateIdByInputColumnValue(inputValue)).thenReturn(1);

        stateService.getStateIdByInputColumnValue(inputValue);
        stateService.getStateIdByInputColumnValue(inputValue);
        stateService.getStateIdByInputColumnValue(inputValue);

        verify(stateDao, times(3)).getStateIdByInputColumnValue(inputValue);
    }

    // ========== Inherited CRUD Operation Tests ==========

    @Test
    void shouldFindStateByPrimaryKey() {
        when(stateDao.findByPK(1)).thenReturn(testState1);

        State result = stateService.findByPK(1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testState1);
        assertThat(result.getStateId()).isEqualTo(1);
        verify(stateDao, times(1)).findByPK(1);
    }

    @Test
    void shouldThrowExceptionWhenStateNotFoundByPK() {
        when(stateDao.findByPK(999)).thenReturn(null);

        assertThatThrownBy(() -> stateService.findByPK(999))
                .isInstanceOf(ServiceException.class);

        verify(stateDao, times(1)).findByPK(999);
    }

    @Test
    void shouldPersistNewState() {
        stateService.persist(testState1);

        verify(stateDao, times(1)).persist(testState1);
    }

    @Test
    void shouldPersistMultipleStates() {
        stateService.persist(testState1);
        stateService.persist(testState2);
        stateService.persist(testState3);

        verify(stateDao, times(1)).persist(testState1);
        verify(stateDao, times(1)).persist(testState2);
        verify(stateDao, times(1)).persist(testState3);
    }

    @Test
    void shouldUpdateExistingState() {
        when(stateDao.update(testState1)).thenReturn(testState1);

        State result = stateService.update(testState1);

        assertThat(result).isNotNull();
        assertThat(result).isEqualTo(testState1);
        verify(stateDao, times(1)).update(testState1);
    }

    @Test
    void shouldUpdateStateAndReturnUpdatedEntity() {
        testState1.setStateName("Updated Dubai");
        testState1.setStateCode("UDXB");
        when(stateDao.update(testState1)).thenReturn(testState1);

        State result = stateService.update(testState1);

        assertThat(result).isNotNull();
        assertThat(result.getStateName()).isEqualTo("Updated Dubai");
        assertThat(result.getStateCode()).isEqualTo("UDXB");
        verify(stateDao, times(1)).update(testState1);
    }

    @Test
    void shouldDeleteState() {
        stateService.delete(testState1);

        verify(stateDao, times(1)).delete(testState1);
    }

    @Test
    void shouldDeleteMultipleStates() {
        stateService.delete(testState1);
        stateService.delete(testState2);

        verify(stateDao, times(1)).delete(testState1);
        verify(stateDao, times(1)).delete(testState2);
    }

    @Test
    void shouldFindStatesByAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("stateName", "Dubai");

        List<State> expectedList = Collections.singletonList(testState1);
        when(stateDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<State> result = stateService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result).containsExactly(testState1);
        verify(stateDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldReturnEmptyListWhenNoAttributesMatch() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("stateName", "Unknown");

        when(stateDao.findByAttributes(attributes)).thenReturn(Collections.emptyList());

        List<State> result = stateService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(stateDao, times(1)).findByAttributes(attributes);
    }

    @Test
    void shouldHandleNullAttributesMap() {
        List<State> result = stateService.findByAttributes(null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(stateDao, never()).findByAttributes(any());
    }

    @Test
    void shouldHandleEmptyAttributesMap() {
        Map<String, Object> attributes = new HashMap<>();

        List<State> result = stateService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(stateDao, never()).findByAttributes(any());
    }

    @Test
    void shouldFindStatesByMultipleAttributes() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("stateName", "Dubai");
        attributes.put("countryId", 1);

        List<State> expectedList = Collections.singletonList(testState1);
        when(stateDao.findByAttributes(attributes)).thenReturn(expectedList);

        List<State> result = stateService.findByAttributes(attributes);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStateName()).isEqualTo("Dubai");
        assertThat(result.get(0).getCountryId()).isEqualTo(1);
        verify(stateDao, times(1)).findByAttributes(attributes);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleStateWithMinimalData() {
        State minimalState = new State();
        minimalState.setStateId(99);

        when(stateDao.findByPK(99)).thenReturn(minimalState);

        State result = stateService.findByPK(99);

        assertThat(result).isNotNull();
        assertThat(result.getStateId()).isEqualTo(99);
        assertThat(result.getStateName()).isNull();
        verify(stateDao, times(1)).findByPK(99);
    }

    @Test
    void shouldHandleStateWithEmptyStrings() {
        State emptyState = new State();
        emptyState.setStateId(50);
        emptyState.setStateName("");
        emptyState.setStateCode("");

        when(stateDao.findByPK(50)).thenReturn(emptyState);

        State result = stateService.findByPK(50);

        assertThat(result).isNotNull();
        assertThat(result.getStateName()).isEmpty();
        assertThat(result.getStateCode()).isEmpty();
        verify(stateDao, times(1)).findByPK(50);
    }

    @Test
    void shouldVerifyDaoInteractionForMultipleOperations() {
        Map<StateFilterEnum, Object> filterMap = new HashMap<>();
        when(stateDao.getstateList(filterMap)).thenReturn(Arrays.asList(testState1));
        when(stateDao.getStateIdByInputColumnValue("Dubai")).thenReturn(1);

        stateService.getstateList(filterMap);
        stateService.getStateIdByInputColumnValue("Dubai");

        verify(stateDao, times(1)).getstateList(filterMap);
        verify(stateDao, times(1)).getStateIdByInputColumnValue("Dubai");
    }

    @Test
    void shouldHandleNegativeStateId() {
        when(stateDao.findByPK(-1)).thenReturn(null);

        assertThatThrownBy(() -> stateService.findByPK(-1))
                .isInstanceOf(ServiceException.class);

        verify(stateDao, times(1)).findByPK(-1);
    }

    @Test
    void shouldHandleLongStateName() {
        String longValue = "A".repeat(500);
        when(stateDao.getStateIdByInputColumnValue(longValue)).thenReturn(null);

        Integer result = stateService.getStateIdByInputColumnValue(longValue);

        assertThat(result).isNull();
        verify(stateDao, times(1)).getStateIdByInputColumnValue(longValue);
    }
}
