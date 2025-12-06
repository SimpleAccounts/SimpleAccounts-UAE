package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.constant.dbfilter.DateFormatFilterEnum;
import com.simpleaccounts.dao.DateFormatDao;
import com.simpleaccounts.entity.DateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DateFormatServiceImplTest {

    @Mock
    private DateFormatDao dateFormatDao;

    @InjectMocks
    private DateFormatServiceImpl dateFormatService;

    private DateFormat testDateFormat;
    private DateFormat testDateFormat2;

    @BeforeEach
    void setUp() {
        testDateFormat = new DateFormat();
        testDateFormat.setDateFormatId(1);
        testDateFormat.setDateFormatCode("DD-MM-YYYY");
        testDateFormat.setDateFormatDescription("Day-Month-Year");
        testDateFormat.setDeleteFlag(false);
        testDateFormat.setCreatedDate(LocalDateTime.now());

        testDateFormat2 = new DateFormat();
        testDateFormat2.setDateFormatId(2);
        testDateFormat2.setDateFormatCode("MM/DD/YYYY");
        testDateFormat2.setDateFormatDescription("Month/Day/Year");
        testDateFormat2.setDeleteFlag(false);
        testDateFormat2.setCreatedDate(LocalDateTime.now());
    }

    // ========== getDao Tests ==========

    @Test
    void shouldReturnDateFormatDaoFromGetDao() {
        assertThat(dateFormatService.getDao()).isEqualTo(dateFormatDao);
    }

    // ========== getDateFormatList Tests ==========

    @Test
    void shouldGetDateFormatListWithFiltersSuccessfully() {
        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(DateFormatFilterEnum.DELETE_FLAG, false);

        List<DateFormat> expectedFormats = Arrays.asList(testDateFormat, testDateFormat2);
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(expectedFormats);

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testDateFormat, testDateFormat2);
        verify(dateFormatDao, times(1)).getDateFormatList(filterMap);
    }

    @Test
    void shouldReturnEmptyListWhenNoFormatsMatchFilter() {
        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(DateFormatFilterEnum.DELETE_FLAG, true);

        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(Collections.emptyList());

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(dateFormatDao, times(1)).getDateFormatList(filterMap);
    }

    @Test
    void shouldHandleEmptyFilterMap() {
        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        List<DateFormat> expectedFormats = Arrays.asList(testDateFormat, testDateFormat2);

        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(expectedFormats);

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        verify(dateFormatDao, times(1)).getDateFormatList(filterMap);
    }

    @Test
    void shouldHandleNullFilterMap() {
        List<DateFormat> expectedFormats = Arrays.asList(testDateFormat);
        when(dateFormatDao.getDateFormatList(null)).thenReturn(expectedFormats);

        List<DateFormat> result = dateFormatService.getDateFormatList(null);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(dateFormatDao, times(1)).getDateFormatList(null);
    }

    @Test
    void shouldGetDateFormatListWithDateFormatIdFilter() {
        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(DateFormatFilterEnum.DATE_FORMAT_ID, 1);

        List<DateFormat> expectedFormats = Collections.singletonList(testDateFormat);
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(expectedFormats);

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDateFormatId()).isEqualTo(1);
        verify(dateFormatDao, times(1)).getDateFormatList(filterMap);
    }

    @Test
    void shouldGetDateFormatListWithDateFormatCodeFilter() {
        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(DateFormatFilterEnum.DATE_FORMAT_CODE, "DD-MM-YYYY");

        List<DateFormat> expectedFormats = Collections.singletonList(testDateFormat);
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(expectedFormats);

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDateFormatCode()).isEqualTo("DD-MM-YYYY");
        verify(dateFormatDao, times(1)).getDateFormatList(filterMap);
    }

    @Test
    void shouldGetDateFormatListWithMultipleFilters() {
        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(DateFormatFilterEnum.DELETE_FLAG, false);
        filterMap.put(DateFormatFilterEnum.DATE_FORMAT_CODE, "DD-MM-YYYY");

        List<DateFormat> expectedFormats = Collections.singletonList(testDateFormat);
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(expectedFormats);

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDateFormatCode()).isEqualTo("DD-MM-YYYY");
        assertThat(result.get(0).getDeleteFlag()).isFalse();
        verify(dateFormatDao, times(1)).getDateFormatList(filterMap);
    }

    @Test
    void shouldReturnNullWhenDaoReturnsNull() {
        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(null);

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNull();
        verify(dateFormatDao, times(1)).getDateFormatList(filterMap);
    }

    @Test
    void shouldHandleLargeResultSet() {
        List<DateFormat> largeList = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            DateFormat format = new DateFormat();
            format.setDateFormatId(i);
            format.setDateFormatCode("FORMAT-" + i);
            largeList.add(format);
        }

        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(largeList);

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(50);
        verify(dateFormatDao, times(1)).getDateFormatList(filterMap);
    }

    // ========== deleteByIds Tests ==========

    @Test
    void shouldDeleteSingleIdSuccessfully() {
        List<Integer> ids = Collections.singletonList(1);
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        verify(dateFormatDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldDeleteMultipleIdsSuccessfully() {
        List<Integer> ids = Arrays.asList(1, 2, 3, 4, 5);
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(dateFormatDao, times(1)).deleteByIds(captor.capture());

        List<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(5);
        assertThat(capturedIds).containsExactly(1, 2, 3, 4, 5);
    }

    @Test
    void shouldHandleEmptyIdsList() {
        List<Integer> ids = Collections.emptyList();
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        verify(dateFormatDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleNullIdsList() {
        doNothing().when(dateFormatDao).deleteByIds(null);

        dateFormatService.deleteByIds(null);

        verify(dateFormatDao, times(1)).deleteByIds(null);
    }

    @Test
    void shouldDeleteLargeNumberOfIds() {
        List<Integer> ids = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            ids.add(i);
        }

        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(dateFormatDao, times(1)).deleteByIds(captor.capture());

        List<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(100);
        assertThat(capturedIds.get(0)).isEqualTo(1);
        assertThat(capturedIds.get(99)).isEqualTo(100);
    }

    @Test
    void shouldDeleteIdsInSequence() {
        List<Integer> ids1 = Collections.singletonList(1);
        List<Integer> ids2 = Collections.singletonList(2);
        List<Integer> ids3 = Collections.singletonList(3);

        doNothing().when(dateFormatDao).deleteByIds(any());

        dateFormatService.deleteByIds(ids1);
        dateFormatService.deleteByIds(ids2);
        dateFormatService.deleteByIds(ids3);

        verify(dateFormatDao, times(3)).deleteByIds(any());
    }

    @Test
    void shouldHandleNegativeIds() {
        List<Integer> ids = Arrays.asList(-1, -2, -3);
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        verify(dateFormatDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleZeroId() {
        List<Integer> ids = Collections.singletonList(0);
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        verify(dateFormatDao, times(1)).deleteByIds(ids);
    }

    @Test
    void shouldHandleMixedPositiveAndNegativeIds() {
        List<Integer> ids = Arrays.asList(-5, 1, -2, 10, 0, 100);
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(dateFormatDao, times(1)).deleteByIds(captor.capture());

        List<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(6);
        assertThat(capturedIds).containsExactly(-5, 1, -2, 10, 0, 100);
    }

    @Test
    void shouldHandleDuplicateIds() {
        List<Integer> ids = Arrays.asList(1, 1, 2, 2, 3, 3);
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(dateFormatDao, times(1)).deleteByIds(captor.capture());

        List<Integer> capturedIds = captor.getValue();
        assertThat(capturedIds).hasSize(6);
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleDateFormatWithNullDescription() {
        DateFormat formatWithoutDesc = new DateFormat();
        formatWithoutDesc.setDateFormatId(3);
        formatWithoutDesc.setDateFormatCode("YYYY-MM-DD");
        formatWithoutDesc.setDateFormatDescription(null);

        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(Collections.singletonList(formatWithoutDesc));

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDateFormatDescription()).isNull();
    }

    @Test
    void shouldHandleDateFormatWithDeletedFlag() {
        DateFormat deletedFormat = new DateFormat();
        deletedFormat.setDateFormatId(4);
        deletedFormat.setDateFormatCode("MM-DD-YYYY");
        deletedFormat.setDeleteFlag(true);

        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        filterMap.put(DateFormatFilterEnum.DELETE_FLAG, true);

        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(Collections.singletonList(deletedFormat));

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDeleteFlag()).isTrue();
    }

    @Test
    void shouldHandleDateFormatWithLongCode() {
        DateFormat formatWithLongCode = new DateFormat();
        formatWithLongCode.setDateFormatId(5);
        formatWithLongCode.setDateFormatCode("DD-MMM-YYYY HH:mm:ss.SSS");

        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(Collections.singletonList(formatWithLongCode));

        List<DateFormat> result = dateFormatService.getDateFormatList(filterMap);

        assertThat(result).isNotNull();
        assertThat(result.get(0).getDateFormatCode()).isEqualTo("DD-MMM-YYYY HH:mm:ss.SSS");
    }

    @Test
    void shouldVerifyMultipleGetCalls() {
        Map<DateFormatFilterEnum, Object> filterMap = new HashMap<>();
        when(dateFormatDao.getDateFormatList(filterMap)).thenReturn(Arrays.asList(testDateFormat));

        dateFormatService.getDateFormatList(filterMap);
        dateFormatService.getDateFormatList(filterMap);
        dateFormatService.getDateFormatList(filterMap);

        verify(dateFormatDao, times(3)).getDateFormatList(filterMap);
    }

    @Test
    void shouldVerifyMultipleDeleteCalls() {
        List<Integer> ids1 = Arrays.asList(1, 2);
        List<Integer> ids2 = Arrays.asList(3, 4);

        doNothing().when(dateFormatDao).deleteByIds(any());

        dateFormatService.deleteByIds(ids1);
        dateFormatService.deleteByIds(ids2);

        verify(dateFormatDao, times(2)).deleteByIds(any());
    }

    @Test
    void shouldHandleMaxIntegerValue() {
        List<Integer> ids = Collections.singletonList(Integer.MAX_VALUE);
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(dateFormatDao, times(1)).deleteByIds(captor.capture());

        assertThat(captor.getValue().get(0)).isEqualTo(Integer.MAX_VALUE);
    }

    @Test
    void shouldHandleMinIntegerValue() {
        List<Integer> ids = Collections.singletonList(Integer.MIN_VALUE);
        doNothing().when(dateFormatDao).deleteByIds(ids);

        dateFormatService.deleteByIds(ids);

        ArgumentCaptor<List<Integer>> captor = ArgumentCaptor.forClass(List.class);
        verify(dateFormatDao, times(1)).deleteByIds(captor.capture());

        assertThat(captor.getValue().get(0)).isEqualTo(Integer.MIN_VALUE);
    }
}
