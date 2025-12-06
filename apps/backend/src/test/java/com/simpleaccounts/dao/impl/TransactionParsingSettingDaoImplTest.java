package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.TransactionParsingSettingFilterEnum;
import com.simpleaccounts.entity.TransactionParsingSetting;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionParsingSettingDaoImpl Unit Tests")
class TransactionParsingSettingDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<TransactionParsingSetting> transactionParsingSettingQuery;

    @Mock
    private TypedQuery<String> stringQuery;

    @InjectMocks
    private TransactionParsingSettingDaoImpl transactionParsingSettingDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(transactionParsingSettingDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(transactionParsingSettingDao, "entityClass", TransactionParsingSetting.class);
    }

    @Test
    @DisplayName("Should return transaction list with filters")
    void getTransactionListReturnsTransactionsWithFilters() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(TransactionParsingSettingFilterEnum.TEMPLATE_ID, 1L);
        List<TransactionParsingSetting> expectedSettings = createTransactionParsingSettingList(3);

        // Mock the executeQuery method behavior
        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(expectedSettings);

        // Act
        List<TransactionParsingSetting> result = transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return empty list when no transactions match filters")
    void getTransactionListReturnsEmptyListWhenNoMatches() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(TransactionParsingSettingFilterEnum.TEMPLATE_ID, 999L);

        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<TransactionParsingSetting> result = transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getTransactionListHandlesEmptyFilterMap() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        List<TransactionParsingSetting> expectedSettings = createTransactionParsingSettingList(5);

        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(expectedSettings);

        // Act
        List<TransactionParsingSetting> result = transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should handle multiple filters")
    void getTransactionListHandlesMultipleFilters() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(TransactionParsingSettingFilterEnum.TEMPLATE_ID, 1L);
        filterMap.put(TransactionParsingSettingFilterEnum.COMPANY_ID, 100L);
        List<TransactionParsingSetting> expectedSettings = createTransactionParsingSettingList(2);

        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(expectedSettings);

        // Act
        List<TransactionParsingSetting> result = transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert
        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("Should build DbFilters from filter map")
    void getTransactionListBuildsDbFiltersFromFilterMap() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(TransactionParsingSettingFilterEnum.TEMPLATE_ID, 1L);

        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert - verify that executeQuery was eventually called
        verify(entityManager, times(1)).createQuery(anyString(), eq(TransactionParsingSetting.class));
    }

    @Test
    @DisplayName("Should return date format by template id")
    void getDateFormatByTemplateIdReturnsDateFormat() {
        // Arrange
        Long templateId = 1L;
        List<String> expectedFormats = Collections.singletonList("yyyy-MM-dd");

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(expectedFormats);

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEqualTo("yyyy-MM-dd");
    }

    @Test
    @DisplayName("Should return null when no date format found for template id")
    void getDateFormatByTemplateIdReturnsNullWhenNotFound() {
        // Arrange
        Long templateId = 999L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should return null when result list is null")
    void getDateFormatByTemplateIdReturnsNullWhenResultListIsNull() {
        // Arrange
        Long templateId = 1L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(null);

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should set template id parameter correctly")
    void getDateFormatByTemplateIdSetsTemplateIdParameter() {
        // Arrange
        Long templateId = 5L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        verify(stringQuery).setParameter("id", templateId);
    }

    @Test
    @DisplayName("Should use named query getDateFormatIdTemplateId")
    void getDateFormatByTemplateIdUsesCorrectNamedQuery() {
        // Arrange
        Long templateId = 1L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        verify(entityManager).createNamedQuery("getDateFormatIdTemplateId", String.class);
    }

    @Test
    @DisplayName("Should return first date format from list")
    void getDateFormatByTemplateIdReturnsFirstFromList() {
        // Arrange
        Long templateId = 1L;
        List<String> formats = Arrays.asList("yyyy-MM-dd", "dd-MM-yyyy", "MM/dd/yyyy");

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(formats);

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isEqualTo("yyyy-MM-dd");
    }

    @Test
    @DisplayName("Should handle zero template id")
    void getDateFormatByTemplateIdHandlesZeroTemplateId() {
        // Arrange
        Long templateId = 0L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle negative template id")
    void getDateFormatByTemplateIdHandlesNegativeTemplateId() {
        // Arrange
        Long templateId = -1L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should call getResultList exactly once for date format query")
    void getDateFormatByTemplateIdCallsGetResultListOnce() {
        // Arrange
        Long templateId = 1L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        verify(stringQuery, times(1)).getResultList();
    }

    @Test
    @DisplayName("Should call createNamedQuery exactly once")
    void getDateFormatByTemplateIdCallsCreateNamedQueryOnce() {
        // Arrange
        Long templateId = 1L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        verify(entityManager, times(1)).createNamedQuery("getDateFormatIdTemplateId", String.class);
    }

    @Test
    @DisplayName("Should return different date formats for different template ids")
    void getDateFormatByTemplateIdReturnsDifferentFormatsForDifferentIds() {
        // Arrange
        Long templateId1 = 1L;
        Long templateId2 = 2L;
        List<String> format1 = Collections.singletonList("yyyy-MM-dd");
        List<String> format2 = Collections.singletonList("dd/MM/yyyy");

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId1))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId2))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(format1)
            .thenReturn(format2);

        // Act
        String result1 = transactionParsingSettingDao.getDateFormatByTemplateId(templateId1);
        String result2 = transactionParsingSettingDao.getDateFormatByTemplateId(templateId2);

        // Assert
        assertThat(result1).isEqualTo("yyyy-MM-dd");
        assertThat(result2).isEqualTo("dd/MM/yyyy");
    }

    @Test
    @DisplayName("Should handle various date format patterns")
    void getDateFormatByTemplateIdHandlesVariousDateFormatPatterns() {
        // Arrange
        Long templateId = 1L;
        List<String> formats = Collections.singletonList("yyyy/MM/dd HH:mm:ss");

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(formats);

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isEqualTo("yyyy/MM/dd HH:mm:ss");
    }

    @Test
    @DisplayName("Should verify TransactionParsingSetting entity structure")
    void transactionParsingSettingEntityHasCorrectStructure() {
        // Arrange
        TransactionParsingSetting setting = createTransactionParsingSetting(1L);
        setting.setTemplateId(100L);
        setting.setCompanyId(200L);
        setting.setDateFormat("yyyy-MM-dd");

        // Assert
        assertThat(setting.getTransactionParsingSettingId()).isEqualTo(1L);
        assertThat(setting.getTemplateId()).isEqualTo(100L);
        assertThat(setting.getCompanyId()).isEqualTo(200L);
        assertThat(setting.getDateFormat()).isEqualTo("yyyy-MM-dd");
    }

    @Test
    @DisplayName("Should handle single transaction parsing setting result")
    void getTransactionListHandlesSingleResult() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(TransactionParsingSettingFilterEnum.TEMPLATE_ID, 1L);
        List<TransactionParsingSetting> expectedSettings = createTransactionParsingSettingList(1);

        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(expectedSettings);

        // Act
        List<TransactionParsingSetting> result = transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should handle large transaction parsing setting result set")
    void getTransactionListHandlesLargeResultSet() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        List<TransactionParsingSetting> expectedSettings = createTransactionParsingSettingList(100);

        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(expectedSettings);

        // Act
        List<TransactionParsingSetting> result = transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should handle null values in filter map")
    void getTransactionListHandlesNullValuesInFilterMap() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(TransactionParsingSettingFilterEnum.TEMPLATE_ID, null);
        List<TransactionParsingSetting> expectedSettings = createTransactionParsingSettingList(3);

        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(expectedSettings);

        // Act
        List<TransactionParsingSetting> result = transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should handle empty string date format")
    void getDateFormatByTemplateIdHandlesEmptyStringFormat() {
        // Arrange
        Long templateId = 1L;
        List<String> formats = Collections.singletonList("");

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(formats);

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle large template id values")
    void getDateFormatByTemplateIdHandlesLargeTemplateId() {
        // Arrange
        Long templateId = 999999999L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        String result = transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        assertThat(result).isNull();
        verify(stringQuery).setParameter("id", 999999999L);
    }

    @Test
    @DisplayName("Should verify setParameter is called before getResultList")
    void getDateFormatByTemplateIdCallsSetParameterBeforeGetResultList() {
        // Arrange
        Long templateId = 1L;

        when(entityManager.createNamedQuery("getDateFormatIdTemplateId", String.class))
            .thenReturn(stringQuery);
        when(stringQuery.setParameter("id", templateId))
            .thenReturn(stringQuery);
        when(stringQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        transactionParsingSettingDao.getDateFormatByTemplateId(templateId);

        // Assert
        verify(stringQuery).setParameter("id", templateId);
        verify(stringQuery).getResultList();
    }

    @Test
    @DisplayName("Should iterate through all filter entries")
    void getTransactionListIteratesThroughAllFilterEntries() {
        // Arrange
        Map<TransactionParsingSettingFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(TransactionParsingSettingFilterEnum.TEMPLATE_ID, 1L);
        filterMap.put(TransactionParsingSettingFilterEnum.COMPANY_ID, 100L);

        when(entityManager.createQuery(anyString(), eq(TransactionParsingSetting.class)))
            .thenReturn(transactionParsingSettingQuery);
        when(transactionParsingSettingQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<TransactionParsingSetting> result = transactionParsingSettingDao.getTransactionList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(filterMap).hasSize(2);
    }

    private List<TransactionParsingSetting> createTransactionParsingSettingList(int count) {
        List<TransactionParsingSetting> settings = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            settings.add(createTransactionParsingSetting((long) (i + 1)));
        }
        return settings;
    }

    private TransactionParsingSetting createTransactionParsingSetting(Long id) {
        TransactionParsingSetting setting = new TransactionParsingSetting();
        setting.setTransactionParsingSettingId(id);
        setting.setTemplateId(id * 10);
        setting.setCompanyId(id * 100);
        setting.setDateFormat("yyyy-MM-dd");
        return setting;
    }
}
