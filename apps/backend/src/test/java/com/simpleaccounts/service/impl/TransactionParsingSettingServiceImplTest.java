package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.dao.TransactionParsingSettingDao;
import com.simpleaccounts.entity.TransactionParsingSetting;
import com.simpleaccounts.exceptions.ServiceException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionParsingSettingServiceImpl Tests")
class TransactionParsingSettingServiceImplTest {

    @Mock
    private TransactionParsingSettingDao transactionParsingSettingDao;

    @InjectMocks
    private TransactionParsingSettingServiceImpl transactionParsingSettingService;

    private TransactionParsingSetting testSetting;
    private Long settingId;

    @BeforeEach
    void setUp() {
        settingId = 1L;

        testSetting = new TransactionParsingSetting();
        testSetting.setId(settingId);
        testSetting.setSettingName("Default Parsing Rule");
        testSetting.setSettingValue("*.csv");
        testSetting.setSettingType("FILE_PATTERN");
        testSetting.setIsActive(true);
        testSetting.setCreatedBy(1);
        testSetting.setCreatedDate(LocalDateTime.now());
    }

    @Nested
    @DisplayName("getDao() Tests")
    class GetDaoTests {

        @Test
        @DisplayName("Should return TransactionParsingSettingDao instance")
        void shouldReturnTransactionParsingSettingDao() {
            assertThat(transactionParsingSettingService.getDao()).isEqualTo(transactionParsingSettingDao);
        }

        @Test
        @DisplayName("Should not return null")
        void shouldNotReturnNull() {
            assertThat(transactionParsingSettingService.getDao()).isNotNull();
        }

        @Test
        @DisplayName("Should return same instance on multiple calls")
        void shouldReturnSameInstanceOnMultipleCalls() {
            var dao1 = transactionParsingSettingService.getDao();
            var dao2 = transactionParsingSettingService.getDao();

            assertThat(dao1).isSameAs(dao2);
            assertThat(dao1).isEqualTo(transactionParsingSettingDao);
        }
    }

    @Nested
    @DisplayName("geTransactionParsingList() Tests")
    class GetTransactionParsingListTests {

        @Test
        @DisplayName("Should return list when valid filter map provided")
        void shouldReturnListWhenValidFilterMapProvided() {
            Map<TransactionParsingSettingFilterEnum, Object> filterMap = new EnumMap<>(TransactionParsingSettingFilterEnum.class);
            filterMap.put(TransactionParsingSettingFilterEnum.IS_ACTIVE, true);

            List<TransactionParsingSetting> expectedList = Arrays.asList(
                testSetting,
                createSetting(2L, "Secondary Rule", "*.txt")
            );

            when(transactionParsingSettingDao.getTransactionList(filterMap)).thenReturn(expectedList);

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(filterMap);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(2);
            assertThat(result).isEqualTo(expectedList);
            verify(transactionParsingSettingDao, times(1)).getTransactionList(filterMap);
        }

        @Test
        @DisplayName("Should return empty list when no settings match filter")
        void shouldReturnEmptyListWhenNoSettingsMatchFilter() {
            Map<TransactionParsingSettingFilterEnum, Object> filterMap = new EnumMap<>(TransactionParsingSettingFilterEnum.class);
            filterMap.put(TransactionParsingSettingFilterEnum.IS_ACTIVE, false);

            when(transactionParsingSettingDao.getTransactionList(filterMap))
                .thenReturn(Collections.emptyList());

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(filterMap);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionParsingSettingDao, times(1)).getTransactionList(filterMap);
        }

        @Test
        @DisplayName("Should return null when DAO returns null")
        void shouldReturnNullWhenDaoReturnsNull() {
            Map<TransactionParsingSettingFilterEnum, Object> filterMap = new EnumMap<>(TransactionParsingSettingFilterEnum.class);

            when(transactionParsingSettingDao.getTransactionList(filterMap)).thenReturn(null);

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(filterMap);

            assertThat(result).isNull();
            verify(transactionParsingSettingDao, times(1)).getTransactionList(filterMap);
        }

        @Test
        @DisplayName("Should handle empty filter map")
        void shouldHandleEmptyFilterMap() {
            Map<TransactionParsingSettingFilterEnum, Object> emptyMap = new EnumMap<>(TransactionParsingSettingFilterEnum.class);
            List<TransactionParsingSetting> expectedList = Collections.singletonList(testSetting);

            when(transactionParsingSettingDao.getTransactionList(emptyMap)).thenReturn(expectedList);

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(emptyMap);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            verify(transactionParsingSettingDao, times(1)).getTransactionList(emptyMap);
        }

        @Test
        @DisplayName("Should handle null filter map")
        void shouldHandleNullFilterMap() {
            List<TransactionParsingSetting> expectedList = Collections.singletonList(testSetting);

            when(transactionParsingSettingDao.getTransactionList(null)).thenReturn(expectedList);

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(null);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            verify(transactionParsingSettingDao, times(1)).getTransactionList(null);
        }

        @Test
        @DisplayName("Should handle multiple filter criteria")
        void shouldHandleMultipleFilterCriteria() {
            Map<TransactionParsingSettingFilterEnum, Object> filterMap = new EnumMap<>(TransactionParsingSettingFilterEnum.class);
            filterMap.put(TransactionParsingSettingFilterEnum.IS_ACTIVE, true);
            filterMap.put(TransactionParsingSettingFilterEnum.SETTING_TYPE, "FILE_PATTERN");

            List<TransactionParsingSetting> expectedList = Collections.singletonList(testSetting);

            when(transactionParsingSettingDao.getTransactionList(filterMap)).thenReturn(expectedList);

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(filterMap);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getSettingType()).isEqualTo("FILE_PATTERN");
            verify(transactionParsingSettingDao, times(1)).getTransactionList(filterMap);
        }

        @Test
        @DisplayName("Should return large list of settings")
        void shouldReturnLargeListOfSettings() {
            Map<TransactionParsingSettingFilterEnum, Object> filterMap = new EnumMap<>(TransactionParsingSettingFilterEnum.class);

            List<TransactionParsingSetting> largeList = new ArrayList<>();
            for (int i = 0; i < 100; i++) {
                largeList.add(createSetting((long) i, "Setting " + i, "Value " + i));
            }

            when(transactionParsingSettingDao.getTransactionList(filterMap)).thenReturn(largeList);

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(filterMap);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(100);
            verify(transactionParsingSettingDao, times(1)).getTransactionList(filterMap);
        }

        @Test
        @DisplayName("Should handle single setting result")
        void shouldHandleSingleSettingResult() {
            Map<TransactionParsingSettingFilterEnum, Object> filterMap = new EnumMap<>(TransactionParsingSettingFilterEnum.class);
            filterMap.put(TransactionParsingSettingFilterEnum.SETTING_NAME, "Default Parsing Rule");

            List<TransactionParsingSetting> singleList = Collections.singletonList(testSetting);

            when(transactionParsingSettingDao.getTransactionList(filterMap)).thenReturn(singleList);

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(filterMap);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getSettingName()).isEqualTo("Default Parsing Rule");
        }

        @Test
        @DisplayName("Should handle consecutive calls with different filters")
        void shouldHandleConsecutiveCallsWithDifferentFilters() {
            Map<TransactionParsingSettingFilterEnum, Object> filter1 = new EnumMap<>(TransactionParsingSettingFilterEnum.class);
            filter1.put(TransactionParsingSettingFilterEnum.IS_ACTIVE, true);

            Map<TransactionParsingSettingFilterEnum, Object> filter2 = new EnumMap<>(TransactionParsingSettingFilterEnum.class);
            filter2.put(TransactionParsingSettingFilterEnum.IS_ACTIVE, false);

            List<TransactionParsingSetting> activeList = Collections.singletonList(testSetting);
            List<TransactionParsingSetting> inactiveList = Collections.emptyList();

            when(transactionParsingSettingDao.getTransactionList(filter1)).thenReturn(activeList);
            when(transactionParsingSettingDao.getTransactionList(filter2)).thenReturn(inactiveList);

            List<TransactionParsingSetting> result1 =
                transactionParsingSettingService.geTransactionParsingList(filter1);
            List<TransactionParsingSetting> result2 =
                transactionParsingSettingService.geTransactionParsingList(filter2);

            assertThat(result1).hasSize(1);
            assertThat(result2).isEmpty();
            verify(transactionParsingSettingDao, times(1)).getTransactionList(filter1);
            verify(transactionParsingSettingDao, times(1)).getTransactionList(filter2);
        }
    }

    @Nested
    @DisplayName("Inherited CRUD Operation Tests")
    class InheritedCrudOperationTests {

        @Test
        @DisplayName("Should find setting by primary key")
        void shouldFindSettingByPrimaryKey() {
            when(transactionParsingSettingDao.findByPK(settingId)).thenReturn(testSetting);

            TransactionParsingSetting result = transactionParsingSettingService.findByPK(settingId);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testSetting);
            assertThat(result.getId()).isEqualTo(settingId);
            verify(transactionParsingSettingDao, times(1)).findByPK(settingId);
        }

        @Test
        @DisplayName("Should throw exception when setting not found by PK")
        void shouldThrowExceptionWhenSettingNotFoundByPK() {
            Long nonExistentId = 999L;
            when(transactionParsingSettingDao.findByPK(nonExistentId)).thenReturn(null);

            assertThatThrownBy(() -> transactionParsingSettingService.findByPK(nonExistentId))
                    .isInstanceOf(ServiceException.class);

            verify(transactionParsingSettingDao, times(1)).findByPK(nonExistentId);
        }

        @Test
        @DisplayName("Should persist new setting")
        void shouldPersistNewSetting() {
            transactionParsingSettingService.persist(testSetting);

            verify(transactionParsingSettingDao, times(1)).persist(testSetting);
        }

        @Test
        @DisplayName("Should update existing setting")
        void shouldUpdateExistingSetting() {
            when(transactionParsingSettingDao.update(testSetting)).thenReturn(testSetting);

            TransactionParsingSetting result = transactionParsingSettingService.update(testSetting);

            assertThat(result).isNotNull();
            assertThat(result).isEqualTo(testSetting);
            verify(transactionParsingSettingDao, times(1)).update(testSetting);
        }

        @Test
        @DisplayName("Should delete setting")
        void shouldDeleteSetting() {
            transactionParsingSettingService.delete(testSetting);

            verify(transactionParsingSettingDao, times(1)).delete(testSetting);
        }

        @Test
        @DisplayName("Should find settings by attributes")
        void shouldFindSettingsByAttributes() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("settingType", "FILE_PATTERN");

            List<TransactionParsingSetting> expectedList = Arrays.asList(testSetting);
            when(transactionParsingSettingDao.findByAttributes(attributes)).thenReturn(expectedList);

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result).containsExactly(testSetting);
            verify(transactionParsingSettingDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should return empty list when no attributes match")
        void shouldReturnEmptyListWhenNoAttributesMatch() {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("settingType", "NON_EXISTENT");

            when(transactionParsingSettingDao.findByAttributes(attributes))
                .thenReturn(Collections.emptyList());

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionParsingSettingDao, times(1)).findByAttributes(attributes);
        }

        @Test
        @DisplayName("Should handle null attributes map")
        void shouldHandleNullAttributesMap() {
            List<TransactionParsingSetting> result =
                transactionParsingSettingService.findByAttributes(null);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionParsingSettingDao, never()).findByAttributes(any());
        }

        @Test
        @DisplayName("Should handle empty attributes map")
        void shouldHandleEmptyAttributesMap() {
            Map<String, Object> attributes = new HashMap<>();

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.findByAttributes(attributes);

            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
            verify(transactionParsingSettingDao, never()).findByAttributes(any());
        }
    }

    @Nested
    @DisplayName("Edge Cases and Error Handling Tests")
    class EdgeCasesAndErrorHandlingTests {

        @Test
        @DisplayName("Should handle setting with minimal data")
        void shouldHandleSettingWithMinimalData() {
            TransactionParsingSetting minimalSetting = new TransactionParsingSetting();
            minimalSetting.setId(100L);

            when(transactionParsingSettingDao.findByPK(100L)).thenReturn(minimalSetting);

            TransactionParsingSetting result = transactionParsingSettingService.findByPK(100L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(100L);
            assertThat(result.getSettingName()).isNull();
        }

        @Test
        @DisplayName("Should handle setting with null ID")
        void shouldHandleSettingWithNullId() {
            TransactionParsingSetting settingWithNullId = new TransactionParsingSetting();
            settingWithNullId.setId(null);
            settingWithNullId.setSettingName("No ID Setting");

            when(transactionParsingSettingDao.update(settingWithNullId)).thenReturn(settingWithNullId);

            TransactionParsingSetting result = transactionParsingSettingService.update(settingWithNullId);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isNull();
            assertThat(result.getSettingName()).isEqualTo("No ID Setting");
        }

        @Test
        @DisplayName("Should handle zero as setting ID")
        void shouldHandleZeroAsSettingId() {
            Long zeroId = 0L;
            when(transactionParsingSettingDao.findByPK(zeroId)).thenReturn(null);

            assertThatThrownBy(() -> transactionParsingSettingService.findByPK(zeroId))
                    .isInstanceOf(ServiceException.class);

            verify(transactionParsingSettingDao, times(1)).findByPK(zeroId);
        }

        @Test
        @DisplayName("Should handle negative setting ID")
        void shouldHandleNegativeSettingId() {
            Long negativeId = -1L;
            when(transactionParsingSettingDao.findByPK(negativeId)).thenReturn(null);

            assertThatThrownBy(() -> transactionParsingSettingService.findByPK(negativeId))
                    .isInstanceOf(ServiceException.class);

            verify(transactionParsingSettingDao, times(1)).findByPK(negativeId);
        }

        @Test
        @DisplayName("Should handle very large setting ID")
        void shouldHandleVeryLargeSettingId() {
            Long largeId = Long.MAX_VALUE;
            TransactionParsingSetting largeSetting = createSetting(largeId, "Large ID", "Value");

            when(transactionParsingSettingDao.findByPK(largeId)).thenReturn(largeSetting);

            TransactionParsingSetting result = transactionParsingSettingService.findByPK(largeId);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(largeId);
        }

        @Test
        @DisplayName("Should handle setting with empty string values")
        void shouldHandleSettingWithEmptyStringValues() {
            TransactionParsingSetting emptySetting = createSetting(50L, "", "");
            emptySetting.setSettingType("");

            when(transactionParsingSettingDao.update(emptySetting)).thenReturn(emptySetting);

            TransactionParsingSetting result = transactionParsingSettingService.update(emptySetting);

            assertThat(result).isNotNull();
            assertThat(result.getSettingName()).isEmpty();
            assertThat(result.getSettingValue()).isEmpty();
            assertThat(result.getSettingType()).isEmpty();
        }

        @Test
        @DisplayName("Should handle setting with special characters")
        void shouldHandleSettingWithSpecialCharacters() {
            TransactionParsingSetting specialSetting = createSetting(60L,
                "Setting <>&\"'", "*.csv|*.txt&data");

            when(transactionParsingSettingDao.update(specialSetting)).thenReturn(specialSetting);

            TransactionParsingSetting result = transactionParsingSettingService.update(specialSetting);

            assertThat(result).isNotNull();
            assertThat(result.getSettingName()).contains("<", ">", "&", "\"", "'");
            assertThat(result.getSettingValue()).contains("|", "&");
        }

        @Test
        @DisplayName("Should handle setting with very long values")
        void shouldHandleSettingWithVeryLongValues() {
            String longValue = "A".repeat(1000);
            TransactionParsingSetting longSetting = createSetting(70L, "Long Setting", longValue);

            when(transactionParsingSettingDao.update(longSetting)).thenReturn(longSetting);

            TransactionParsingSetting result = transactionParsingSettingService.update(longSetting);

            assertThat(result).isNotNull();
            assertThat(result.getSettingValue()).hasSize(1000);
        }

        @Test
        @DisplayName("Should handle concurrent updates")
        void shouldHandleConcurrentUpdates() {
            TransactionParsingSetting setting1 = createSetting(1L, "Setting 1", "Value 1");
            TransactionParsingSetting setting2 = createSetting(2L, "Setting 2", "Value 2");

            when(transactionParsingSettingDao.update(setting1)).thenReturn(setting1);
            when(transactionParsingSettingDao.update(setting2)).thenReturn(setting2);

            TransactionParsingSetting result1 = transactionParsingSettingService.update(setting1);
            TransactionParsingSetting result2 = transactionParsingSettingService.update(setting2);

            assertThat(result1).isNotNull();
            assertThat(result2).isNotNull();
            assertThat(result1.getId()).isNotEqualTo(result2.getId());
            verify(transactionParsingSettingDao, times(1)).update(setting1);
            verify(transactionParsingSettingDao, times(1)).update(setting2);
        }

        @Test
        @DisplayName("Should handle inactive settings filter")
        void shouldHandleInactiveSettingsFilter() {
            Map<TransactionParsingSettingFilterEnum, Object> filterMap = new EnumMap<>(TransactionParsingSettingFilterEnum.class);
            filterMap.put(TransactionParsingSettingFilterEnum.IS_ACTIVE, false);

            TransactionParsingSetting inactiveSetting = createSetting(80L, "Inactive", "Value");
            inactiveSetting.setIsActive(false);

            when(transactionParsingSettingDao.getTransactionList(filterMap))
                .thenReturn(Collections.singletonList(inactiveSetting));

            List<TransactionParsingSetting> result =
                transactionParsingSettingService.geTransactionParsingList(filterMap);

            assertThat(result).isNotNull();
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getIsActive()).isFalse();
        }

        @Test
        @DisplayName("Should handle multiple persists")
        void shouldHandleMultiplePersists() {
            TransactionParsingSetting setting1 = createSetting(1L, "First", "Value1");
            TransactionParsingSetting setting2 = createSetting(2L, "Second", "Value2");
            TransactionParsingSetting setting3 = createSetting(3L, "Third", "Value3");

            transactionParsingSettingService.persist(setting1);
            transactionParsingSettingService.persist(setting2);
            transactionParsingSettingService.persist(setting3);

            verify(transactionParsingSettingDao, times(1)).persist(setting1);
            verify(transactionParsingSettingDao, times(1)).persist(setting2);
            verify(transactionParsingSettingDao, times(1)).persist(setting3);
        }
    }

    // Helper method
    private TransactionParsingSetting createSetting(Long id, String name, String value) {
        TransactionParsingSetting setting = new TransactionParsingSetting();
        setting.setId(id);
        setting.setSettingName(name);
        setting.setSettingValue(value);
        setting.setSettingType("CUSTOM");
        setting.setIsActive(true);
        setting.setCreatedBy(1);
        setting.setCreatedDate(LocalDateTime.now());
        return setting;
    }
}
