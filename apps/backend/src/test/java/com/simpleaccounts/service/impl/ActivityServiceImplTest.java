package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.entity.Activity;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ActivityServiceImplTest {

    @Mock
    private ActivityDao activityDao;

    @InjectMocks
    private ActivityServiceImpl activityService;

    private Activity testActivity;

    @BeforeEach
    void setUp() {
        testActivity = new Activity();
        testActivity.setActivityCode("TEST001");
        testActivity.setModuleCode("USER");
        testActivity.setField1("Test Field 1");
        testActivity.setField2("Test Field 2");
        testActivity.setField3("User Created");
        testActivity.setLoggingRequired(true);
        testActivity.setCreatedBy(1);
        testActivity.setCreatedDate(LocalDateTime.now());
        testActivity.setLastUpdateDate(LocalDateTime.now());
        testActivity.setDeleteFlag(false);
    }

    // ========== getLatestActivites Tests ==========

    @Test
    void shouldReturnLatestActivitiesWhenActivitiesExist() {
        int maxCount = 10;
        Activity activity2 = new Activity();
        activity2.setActivityCode("TEST002");
        activity2.setModuleCode("INVOICE");
        activity2.setField3("Invoice Created");

        List<Activity> expectedActivities = Arrays.asList(testActivity, activity2);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(expectedActivities);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result).containsExactly(testActivity, activity2);
        assertThat(result.get(0).getActivityCode()).isEqualTo("TEST001");
        assertThat(result.get(1).getActivityCode()).isEqualTo("TEST002");
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldReturnEmptyListWhenNoActivitiesExist() {
        int maxCount = 10;
        when(activityDao.getLatestActivites(maxCount)).thenReturn(Collections.emptyList());

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldReturnActivitiesWhenMaxCountIsOne() {
        int maxCount = 1;
        List<Activity> expectedActivities = Collections.singletonList(testActivity);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(expectedActivities);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(testActivity);
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldReturnActivitiesWhenMaxCountIsZero() {
        int maxCount = 0;
        when(activityDao.getLatestActivites(maxCount)).thenReturn(Collections.emptyList());

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldReturnActivitiesWhenMaxCountIsNegative() {
        int maxCount = -1;
        when(activityDao.getLatestActivites(maxCount)).thenReturn(Collections.emptyList());

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldReturnLargeListOfActivities() {
        int maxCount = 100;
        List<Activity> largeList = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            Activity activity = new Activity();
            activity.setActivityCode("TEST" + i);
            activity.setModuleCode("MODULE" + i);
            activity.setField3("Activity " + i);
            largeList.add(activity);
        }

        when(activityDao.getLatestActivites(maxCount)).thenReturn(largeList);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(100);
        assertThat(result.get(0).getActivityCode()).isEqualTo("TEST0");
        assertThat(result.get(99).getActivityCode()).isEqualTo("TEST99");
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldReturnActivitiesWithDifferentModuleCodes() {
        int maxCount = 5;
        Activity userActivity = createActivity("USER001", "USER", "User Login");
        Activity invoiceActivity = createActivity("INV001", "INVOICE", "Invoice Created");
        Activity paymentActivity = createActivity("PAY001", "PAYMENT", "Payment Received");
        Activity productActivity = createActivity("PROD001", "PRODUCT", "Product Updated");
        Activity journalActivity = createActivity("JRN001", "JOURNAL", "Journal Entry");

        List<Activity> activities = Arrays.asList(
            userActivity, invoiceActivity, paymentActivity, productActivity, journalActivity
        );
        when(activityDao.getLatestActivites(maxCount)).thenReturn(activities);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(5);
        assertThat(result.get(0).getModuleCode()).isEqualTo("USER");
        assertThat(result.get(1).getModuleCode()).isEqualTo("INVOICE");
        assertThat(result.get(2).getModuleCode()).isEqualTo("PAYMENT");
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldHandleActivitiesWithNullFields() {
        int maxCount = 3;
        Activity activityWithNulls = new Activity();
        activityWithNulls.setActivityCode("NULL001");
        activityWithNulls.setField1(null);
        activityWithNulls.setField2(null);
        activityWithNulls.setField3(null);

        List<Activity> activities = Arrays.asList(testActivity, activityWithNulls);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(activities);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(1).getField1()).isNull();
        assertThat(result.get(1).getField2()).isNull();
        assertThat(result.get(1).getField3()).isNull();
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldReturnActivitiesOrderedByDate() {
        int maxCount = 3;
        LocalDateTime now = LocalDateTime.now();

        Activity oldActivity = createActivity("OLD001", "USER", "Old Activity");
        oldActivity.setCreatedDate(now.minusDays(2));

        Activity recentActivity = createActivity("REC001", "USER", "Recent Activity");
        recentActivity.setCreatedDate(now.minusHours(1));

        Activity newestActivity = createActivity("NEW001", "USER", "Newest Activity");
        newestActivity.setCreatedDate(now);

        List<Activity> activities = Arrays.asList(newestActivity, recentActivity, oldActivity);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(activities);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getActivityCode()).isEqualTo("NEW001");
        assertThat(result.get(1).getActivityCode()).isEqualTo("REC001");
        assertThat(result.get(2).getActivityCode()).isEqualTo("OLD001");
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldCallDaoWithCorrectMaxCount() {
        int maxCount = 25;
        List<Activity> activities = Collections.singletonList(testActivity);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(activities);

        activityService.getLatestActivites(maxCount);

        verify(activityDao, times(1)).getLatestActivites(25);
    }

    @Test
    void shouldReturnActivitiesWithDeletedFlags() {
        int maxCount = 2;
        Activity deletedActivity = createActivity("DEL001", "USER", "Deleted Activity");
        deletedActivity.setDeleteFlag(true);

        Activity activeActivity = createActivity("ACT001", "USER", "Active Activity");
        activeActivity.setDeleteFlag(false);

        List<Activity> activities = Arrays.asList(activeActivity, deletedActivity);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(activities);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDeleteFlag()).isFalse();
        assertThat(result.get(1).getDeleteFlag()).isTrue();
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldHandleMultipleCallsToGetLatestActivities() {
        int maxCount = 5;
        List<Activity> activities = Collections.singletonList(testActivity);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(activities);

        activityService.getLatestActivites(maxCount);
        activityService.getLatestActivites(maxCount);
        activityService.getLatestActivites(maxCount);

        verify(activityDao, times(3)).getLatestActivites(maxCount);
    }

    @Test
    void shouldHandleDifferentMaxCountValues() {
        List<Activity> activities5 = Arrays.asList(testActivity);
        List<Activity> activities10 = Arrays.asList(testActivity, createActivity("TEST002", "USER", "Test"));

        when(activityDao.getLatestActivites(5)).thenReturn(activities5);
        when(activityDao.getLatestActivites(10)).thenReturn(activities10);

        List<Activity> result5 = activityService.getLatestActivites(5);
        List<Activity> result10 = activityService.getLatestActivites(10);

        assertThat(result5).hasSize(1);
        assertThat(result10).hasSize(2);
        verify(activityDao, times(1)).getLatestActivites(5);
        verify(activityDao, times(1)).getLatestActivites(10);
    }

    @Test
    void shouldReturnActivitiesWithLoggingRequired() {
        int maxCount = 2;
        Activity requiredActivity = createActivity("REQ001", "USER", "Required Logging");
        requiredActivity.setLoggingRequired(true);

        Activity notRequiredActivity = createActivity("NREQ001", "USER", "Not Required");
        notRequiredActivity.setLoggingRequired(false);

        List<Activity> activities = Arrays.asList(requiredActivity, notRequiredActivity);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(activities);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).isLoggingRequired()).isTrue();
        assertThat(result.get(1).isLoggingRequired()).isFalse();
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    @Test
    void shouldHandleActivitiesWithDifferentCreatedByValues() {
        int maxCount = 3;
        Activity activity1 = createActivity("USR001", "USER", "User 1 Activity");
        activity1.setCreatedBy(1);

        Activity activity2 = createActivity("USR002", "USER", "User 2 Activity");
        activity2.setCreatedBy(2);

        Activity systemActivity = createActivity("SYS001", "SYSTEM", "System Activity");
        systemActivity.setCreatedBy(0);

        List<Activity> activities = Arrays.asList(activity1, activity2, systemActivity);
        when(activityDao.getLatestActivites(maxCount)).thenReturn(activities);

        List<Activity> result = activityService.getLatestActivites(maxCount);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getCreatedBy()).isEqualTo(1);
        assertThat(result.get(1).getCreatedBy()).isEqualTo(2);
        assertThat(result.get(2).getCreatedBy()).isEqualTo(0);
        verify(activityDao, times(1)).getLatestActivites(maxCount);
    }

    // ========== Helper Methods ==========

    private Activity createActivity(String activityCode, String moduleCode, String description) {
        Activity activity = new Activity();
        activity.setActivityCode(activityCode);
        activity.setModuleCode(moduleCode);
        activity.setField3(description);
        activity.setLoggingRequired(true);
        activity.setCreatedBy(1);
        activity.setCreatedDate(LocalDateTime.now());
        activity.setLastUpdateDate(LocalDateTime.now());
        activity.setDeleteFlag(false);
        return activity;
    }
}
