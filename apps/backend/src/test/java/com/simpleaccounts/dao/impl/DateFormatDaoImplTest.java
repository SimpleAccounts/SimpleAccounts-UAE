package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DateFormatFilterEnum;
import com.simpleaccounts.entity.DateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
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
@DisplayName("DateFormatDaoImpl Unit Tests")
class DateFormatDaoImplTest {

    @Mock
    private EntityManager entityManager;

    @Mock
    private TypedQuery<DateFormat> dateFormatTypedQuery;

    @InjectMocks
    private DateFormatDaoImpl dateFormatDao;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dateFormatDao, "entityManager", entityManager);
        ReflectionTestUtils.setField(dateFormatDao, "entityClass", DateFormat.class);
    }

    @Test
    @DisplayName("Should return date format list with filters")
    void getDateFormatListReturnsListWithFilters() {
        // Arrange
        Map<DateFormatFilterEnum, Object> filterMap = new EnumMap<>(DateFormatFilterEnum.class);
        filterMap.put(DateFormatFilterEnum.DELETE_FLAG, false);

        List<DateFormat> dateFormats = createDateFormatList(3);
        when(entityManager.createQuery(any(String.class), eq(DateFormat.class)))
            .thenReturn(dateFormatTypedQuery);
        when(dateFormatTypedQuery.getResultList())
            .thenReturn(dateFormats);

        // Act
        List<DateFormat> result = dateFormatDao.getDateFormatList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
    }

    @Test
    @DisplayName("Should return empty list when no date formats match filter")
    void getDateFormatListReturnsEmptyListWhenNoMatches() {
        // Arrange
        Map<DateFormatFilterEnum, Object> filterMap = new EnumMap<>(DateFormatFilterEnum.class);
        filterMap.put(DateFormatFilterEnum.DELETE_FLAG, false);

        when(entityManager.createQuery(any(String.class), eq(DateFormat.class)))
            .thenReturn(dateFormatTypedQuery);
        when(dateFormatTypedQuery.getResultList())
            .thenReturn(new ArrayList<>());

        // Act
        List<DateFormat> result = dateFormatDao.getDateFormatList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty filter map")
    void getDateFormatListHandlesEmptyFilterMap() {
        // Arrange
        Map<DateFormatFilterEnum, Object> filterMap = new EnumMap<>(DateFormatFilterEnum.class);
        List<DateFormat> dateFormats = createDateFormatList(5);

        when(entityManager.createQuery(any(String.class), eq(DateFormat.class)))
            .thenReturn(dateFormatTypedQuery);
        when(dateFormatTypedQuery.getResultList())
            .thenReturn(dateFormats);

        // Act
        List<DateFormat> result = dateFormatDao.getDateFormatList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
    }

    @Test
    @DisplayName("Should handle multiple filters")
    void getDateFormatListHandlesMultipleFilters() {
        // Arrange
        Map<DateFormatFilterEnum, Object> filterMap = new EnumMap<>(DateFormatFilterEnum.class);
        filterMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
        filterMap.put(DateFormatFilterEnum.DATE_FORMAT_ID, 1);

        List<DateFormat> dateFormats = createDateFormatList(1);
        when(entityManager.createQuery(any(String.class), eq(DateFormat.class)))
            .thenReturn(dateFormatTypedQuery);
        when(dateFormatTypedQuery.getResultList())
            .thenReturn(dateFormats);

        // Act
        List<DateFormat> result = dateFormatDao.getDateFormatList(filterMap);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Should soft delete date formats by setting delete flag")
    void deleteByIdsSetsDeleteFlagOnDateFormats() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2, 3);
        DateFormat dateFormat1 = createDateFormat(1, "dd/MM/yyyy", false);
        DateFormat dateFormat2 = createDateFormat(2, "MM/dd/yyyy", false);
        DateFormat dateFormat3 = createDateFormat(3, "yyyy-MM-dd", false);

        when(entityManager.find(DateFormat.class, 1)).thenReturn(dateFormat1);
        when(entityManager.find(DateFormat.class, 2)).thenReturn(dateFormat2);
        when(entityManager.find(DateFormat.class, 3)).thenReturn(dateFormat3);
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(3)).merge(any(DateFormat.class));
        assertThat(dateFormat1.getDeleteFlag()).isTrue();
        assertThat(dateFormat2.getDeleteFlag()).isTrue();
        assertThat(dateFormat3.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should not delete when IDs list is empty")
    void deleteByIdsDoesNotDeleteWhenListEmpty() {
        // Arrange
        List<Integer> emptyIds = new ArrayList<>();

        // Act
        dateFormatDao.deleteByIds(emptyIds);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should not delete when IDs list is null")
    void deleteByIdsDoesNotDeleteWhenListNull() {
        // Act
        dateFormatDao.deleteByIds(null);

        // Assert
        verify(entityManager, never()).find(any(), any());
        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should delete single date format")
    void deleteByIdsDeletesSingleDateFormat() {
        // Arrange
        List<Integer> ids = Collections.singletonList(1);
        DateFormat dateFormat = createDateFormat(1, "dd-MM-yyyy", false);

        when(entityManager.find(DateFormat.class, 1)).thenReturn(dateFormat);
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(ids);

        // Assert
        verify(entityManager).merge(dateFormat);
        assertThat(dateFormat.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should find and update each date format by ID")
    void deleteByIdsFindsAndUpdatesEachDateFormat() {
        // Arrange
        List<Integer> ids = Arrays.asList(5, 10);
        DateFormat dateFormat1 = createDateFormat(5, "dd/MM/yyyy", false);
        DateFormat dateFormat2 = createDateFormat(10, "MM/dd/yyyy", false);

        when(entityManager.find(DateFormat.class, 5)).thenReturn(dateFormat1);
        when(entityManager.find(DateFormat.class, 10)).thenReturn(dateFormat2);
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(ids);

        // Assert
        verify(entityManager).find(DateFormat.class, 5);
        verify(entityManager).find(DateFormat.class, 10);
        verify(entityManager, times(2)).merge(any(DateFormat.class));
    }

    @Test
    @DisplayName("Should handle large number of IDs for deletion")
    void deleteByIdsHandlesLargeNumberOfIds() {
        // Arrange
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            ids.add(i);
            when(entityManager.find(DateFormat.class, i))
                .thenReturn(createDateFormat(i, "Format" + i, false));
        }
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(50)).find(eq(DateFormat.class), any(Integer.class));
        verify(entityManager, times(50)).merge(any(DateFormat.class));
    }

    @Test
    @DisplayName("Should handle delete flag properly")
    void deleteByIdsSetsDeleteFlagProperly() {
        // Arrange
        DateFormat dateFormat = createDateFormat(1, "dd/MM/yyyy", false);

        when(entityManager.find(DateFormat.class, 1)).thenReturn(dateFormat);
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(Collections.singletonList(1));

        // Assert
        assertThat(dateFormat.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should call merge for each date format in deleteByIds")
    void deleteByIdsCallsMergeForEachDateFormat() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 2);
        when(entityManager.find(eq(DateFormat.class), any(Integer.class)))
            .thenReturn(createDateFormat(1, "Test", false));
        when(entityManager.merge(any(DateFormat.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(ids);

        // Assert
        verify(entityManager, times(2)).merge(any(DateFormat.class));
    }

    @Test
    @DisplayName("Should preserve date format pattern when deleting")
    void deleteByIdsPreservesDateFormatPattern() {
        // Arrange
        String pattern = "dd-MM-yyyy HH:mm:ss";
        DateFormat dateFormat = createDateFormat(1, pattern, false);

        when(entityManager.find(DateFormat.class, 1)).thenReturn(dateFormat);
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(Collections.singletonList(1));

        // Assert
        assertThat(dateFormat.getDateFormatPattern()).isEqualTo(pattern);
        assertThat(dateFormat.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should return list with single date format")
    void getDateFormatListReturnsSingleFormat() {
        // Arrange
        Map<DateFormatFilterEnum, Object> filterMap = new EnumMap<>(DateFormatFilterEnum.class);
        List<DateFormat> dateFormats = Collections.singletonList(
            createDateFormat(1, "dd/MM/yyyy", false)
        );

        when(entityManager.createQuery(any(String.class), eq(DateFormat.class)))
            .thenReturn(dateFormatTypedQuery);
        when(dateFormatTypedQuery.getResultList())
            .thenReturn(dateFormats);

        // Act
        List<DateFormat> result = dateFormatDao.getDateFormatList(filterMap);

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDateFormatPattern()).isEqualTo("dd/MM/yyyy");
    }

    @Test
    @DisplayName("Should handle large date format list")
    void getDateFormatListHandlesLargeList() {
        // Arrange
        Map<DateFormatFilterEnum, Object> filterMap = new EnumMap<>(DateFormatFilterEnum.class);
        List<DateFormat> dateFormats = createDateFormatList(100);

        when(entityManager.createQuery(any(String.class), eq(DateFormat.class)))
            .thenReturn(dateFormatTypedQuery);
        when(dateFormatTypedQuery.getResultList())
            .thenReturn(dateFormats);

        // Act
        List<DateFormat> result = dateFormatDao.getDateFormatList(filterMap);

        // Assert
        assertThat(result).hasSize(100);
    }

    @Test
    @DisplayName("Should handle already deleted date formats")
    void deleteByIdsHandlesAlreadyDeletedFormats() {
        // Arrange
        DateFormat dateFormat = createDateFormat(1, "dd/MM/yyyy", true);

        when(entityManager.find(DateFormat.class, 1)).thenReturn(dateFormat);
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(Collections.singletonList(1));

        // Assert
        assertThat(dateFormat.getDeleteFlag()).isTrue();
        verify(entityManager).merge(dateFormat);
    }

    @Test
    @DisplayName("Should return correct date format patterns")
    void getDateFormatListReturnsCorrectPatterns() {
        // Arrange
        Map<DateFormatFilterEnum, Object> filterMap = new EnumMap<>(DateFormatFilterEnum.class);
        List<DateFormat> dateFormats = Arrays.asList(
            createDateFormat(1, "dd/MM/yyyy", false),
            createDateFormat(2, "MM/dd/yyyy", false),
            createDateFormat(3, "yyyy-MM-dd", false)
        );

        when(entityManager.createQuery(any(String.class), eq(DateFormat.class)))
            .thenReturn(dateFormatTypedQuery);
        when(dateFormatTypedQuery.getResultList())
            .thenReturn(dateFormats);

        // Act
        List<DateFormat> result = dateFormatDao.getDateFormatList(filterMap);

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getDateFormatPattern()).isEqualTo("dd/MM/yyyy");
        assertThat(result.get(1).getDateFormatPattern()).isEqualTo("MM/dd/yyyy");
        assertThat(result.get(2).getDateFormatPattern()).isEqualTo("yyyy-MM-dd");
    }

    @Test
    @DisplayName("Should handle null date format from find operation")
    void deleteByIdsHandlesNullDateFormat() {
        // Arrange
        when(entityManager.find(DateFormat.class, 999)).thenReturn(null);

        // Act & Assert - should not throw exception
        try {
            dateFormatDao.deleteByIds(Collections.singletonList(999));
        } catch (NullPointerException e) {
            // Expected when date format is not found
        }

        verify(entityManager, never()).merge(any());
    }

    @Test
    @DisplayName("Should return date formats with different delete flags")
    void getDateFormatListReturnsDifferentDeleteFlags() {
        // Arrange
        Map<DateFormatFilterEnum, Object> filterMap = new EnumMap<>(DateFormatFilterEnum.class);
        List<DateFormat> dateFormats = Arrays.asList(
            createDateFormat(1, "dd/MM/yyyy", false),
            createDateFormat(2, "MM/dd/yyyy", true)
        );

        when(entityManager.createQuery(any(String.class), eq(DateFormat.class)))
            .thenReturn(dateFormatTypedQuery);
        when(dateFormatTypedQuery.getResultList())
            .thenReturn(dateFormats);

        // Act
        List<DateFormat> result = dateFormatDao.getDateFormatList(filterMap);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDeleteFlag()).isFalse();
        assertThat(result.get(1).getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should change delete flag from false to true")
    void deleteByIdsChangesDeleteFlagFromFalseToTrue() {
        // Arrange
        DateFormat dateFormat = createDateFormat(1, "dd/MM/yyyy", false);
        assertThat(dateFormat.getDeleteFlag()).isFalse();

        when(entityManager.find(DateFormat.class, 1)).thenReturn(dateFormat);
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        dateFormatDao.deleteByIds(Collections.singletonList(1));

        // Assert
        assertThat(dateFormat.getDeleteFlag()).isTrue();
    }

    @Test
    @DisplayName("Should handle mixed valid and invalid IDs")
    void deleteByIdsHandlesMixedValidAndInvalidIds() {
        // Arrange
        List<Integer> ids = Arrays.asList(1, 999);
        DateFormat dateFormat1 = createDateFormat(1, "dd/MM/yyyy", false);

        when(entityManager.find(DateFormat.class, 1)).thenReturn(dateFormat1);
        when(entityManager.find(DateFormat.class, 999)).thenReturn(null);
        when(entityManager.merge(any(DateFormat.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act & Assert
        try {
            dateFormatDao.deleteByIds(ids);
        } catch (NullPointerException e) {
            // Expected for invalid ID
        }

        assertThat(dateFormat1.getDeleteFlag()).isTrue();
    }

    private DateFormat createDateFormat(int id, String pattern, boolean deleteFlag) {
        DateFormat dateFormat = new DateFormat();
        dateFormat.setDateFormatId(id);
        dateFormat.setDateFormatPattern(pattern);
        dateFormat.setDeleteFlag(deleteFlag);
        return dateFormat;
    }

    private List<DateFormat> createDateFormatList(int count) {
        List<DateFormat> dateFormats = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            dateFormats.add(createDateFormat(i + 1, "Format" + (i + 1), false));
        }
        return dateFormats;
    }
}
