package com.simpleaccounts.dao.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.utils.ChartUtil;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.TemporalType;
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
@DisplayName("ActivityDaoImpl Unit Tests")
class ActivityDaoImplTest {

  @Mock private EntityManager entityManager;

  @Mock private ChartUtil chartUtil;

  @Mock private TypedQuery<Activity> typedQuery;

  @InjectMocks private ActivityDaoImpl activityDao;

  private Date testDate;
  private Date startDate;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(activityDao, "entityManager", entityManager);
    testDate = new Date();
    startDate = new Date(testDate.getTime() - (30L * 24 * 60 * 60 * 1000)); // 30 days ago
  }

  @Test
  @DisplayName("Should return latest activities when results exist")
  void getLatestActivitiesReturnsActivitiesWhenResultsExist() {
    // Arrange
    int maxCount = 10;
    List<Activity> expectedActivities = createActivityList(5);

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedActivities);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).isNotNull().hasSize(5).isEqualTo(expectedActivities);
    verify(chartUtil).modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1));
    verify(typedQuery).setMaxResults(maxCount);
  }

  @Test
  @DisplayName("Should return empty list when query returns null")
  void getLatestActivitiesReturnsEmptyListWhenQueryReturnsNull() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(null);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).isNotNull().isEmpty();
  }

  @Test
  @DisplayName("Should return empty list when query returns empty list")
  void getLatestActivitiesReturnsEmptyListWhenQueryReturnsEmptyList() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).isNotNull().isEmpty();
  }

  @Test
  @DisplayName("Should respect max activity count parameter")
  void getLatestActivitiesRespectsMaxActivityCount() {
    // Arrange
    int maxCount = 5;
    List<Activity> expectedActivities = createActivityList(5);

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedActivities);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).hasSize(5);
    verify(typedQuery).setMaxResults(5);
  }

  @Test
  @DisplayName("Should handle max count of 1")
  void getLatestActivitiesHandlesMaxCountOfOne() {
    // Arrange
    int maxCount = 1;
    List<Activity> expectedActivities = createActivityList(1);

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedActivities);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).hasSize(1);
    verify(typedQuery).setMaxResults(1);
  }

  @Test
  @DisplayName("Should handle max count of zero")
  void getLatestActivitiesHandlesMaxCountOfZero() {
    // Arrange
    int maxCount = 0;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).isEmpty();
    verify(typedQuery).setMaxResults(0);
  }

  @Test
  @DisplayName("Should use ChartUtil to calculate start date")
  void getLatestActivitiesUsesChartUtilForStartDate() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    activityDao.getLatestActivites(maxCount);

    // Assert
    verify(chartUtil).modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1));
  }

  @Test
  @DisplayName("Should set start date parameter with DATE temporal type")
  void getLatestActivitiesSetsStartDateParameterWithDateTemporalType() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    activityDao.getLatestActivites(maxCount);

    // Assert
    verify(typedQuery).setParameter("startDate", startDate, TemporalType.DATE);
  }

  @Test
  @DisplayName("Should use allActivity named query")
  void getLatestActivitiesUsesAllActivityNamedQuery() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    activityDao.getLatestActivites(maxCount);

    // Assert
    verify(entityManager).createNamedQuery("allActivity", Activity.class);
  }

  @Test
  @DisplayName("Should handle large max count value")
  void getLatestActivitiesHandlesLargeMaxCount() {
    // Arrange
    int maxCount = 1000;
    List<Activity> expectedActivities = createActivityList(100);

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedActivities);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).hasSize(100);
    verify(typedQuery).setMaxResults(1000);
  }

  @Test
  @DisplayName("Should return activities within date range")
  void getLatestActivitiesReturnsActivitiesWithinDateRange() {
    // Arrange
    int maxCount = 10;
    List<Activity> activities = createActivityList(3);

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(activities);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).isNotEmpty().hasSize(3);
  }

  @Test
  @DisplayName("Should call all query methods in correct order")
  void getLatestActivitiesCallsQueryMethodsInCorrectOrder() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    activityDao.getLatestActivites(maxCount);

    // Assert
    verify(entityManager).createNamedQuery("allActivity", Activity.class);
    verify(typedQuery).setParameter("startDate", startDate, TemporalType.DATE);
    verify(typedQuery).setMaxResults(maxCount);
    verify(typedQuery).getResultList();
  }

  @Test
  @DisplayName("Should handle negative max count gracefully")
  void getLatestActivitiesHandlesNegativeMaxCount() {
    // Arrange
    int maxCount = -1;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).isEmpty();
    verify(typedQuery).setMaxResults(-1);
  }

  @Test
  @DisplayName("Should return exact number of activities when available")
  void getLatestActivitiesReturnsExactNumberWhenAvailable() {
    // Arrange
    int maxCount = 7;
    List<Activity> expectedActivities = createActivityList(7);

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedActivities);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).hasSize(7);
  }

  @Test
  @DisplayName("Should calculate start date as one month before current date")
  void getLatestActivitiesCalculatesStartDateAsOneMonthBefore() {
    // Arrange
    int maxCount = 10;
    Date expectedStartDate = new Date();

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1)))
        .thenReturn(expectedStartDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", expectedStartDate, TemporalType.DATE))
        .thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    activityDao.getLatestActivites(maxCount);

    // Assert
    verify(chartUtil).modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1));
    verify(typedQuery).setParameter("startDate", expectedStartDate, TemporalType.DATE);
  }

  @Test
  @DisplayName("Should not return null when query succeeds")
  void getLatestActivitiesNeverReturnsNull() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(null);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should return immutable reference to result list")
  void getLatestActivitiesReturnsListReference() {
    // Arrange
    int maxCount = 10;
    List<Activity> expectedActivities = createActivityList(3);

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(expectedActivities);

    // Act
    List<Activity> result = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result).isNotNull().isSameAs(expectedActivities);
  }

  @Test
  @DisplayName("Should create entity manager query exactly once")
  void getLatestActivitiesCreatesQueryOnce() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    activityDao.getLatestActivites(maxCount);

    // Assert
    verify(entityManager, times(1)).createNamedQuery("allActivity", Activity.class);
  }

  @Test
  @DisplayName("Should call getResultList exactly once")
  void getLatestActivitiesCallsGetResultListOnce() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(new ArrayList<>());

    // Act
    activityDao.getLatestActivites(maxCount);

    // Assert
    verify(typedQuery, times(1)).getResultList();
  }

  @Test
  @DisplayName("Should return new empty list when null result")
  void getLatestActivitiesReturnsNewEmptyListWhenNull() {
    // Arrange
    int maxCount = 10;

    when(chartUtil.modifyDate(any(Date.class), eq(Calendar.MONTH), eq(-1))).thenReturn(startDate);
    when(entityManager.createNamedQuery("allActivity", Activity.class)).thenReturn(typedQuery);
    when(typedQuery.setParameter("startDate", startDate, TemporalType.DATE)).thenReturn(typedQuery);
    when(typedQuery.setMaxResults(maxCount)).thenReturn(typedQuery);
    when(typedQuery.getResultList()).thenReturn(null);

    // Act
    List<Activity> result1 = activityDao.getLatestActivites(maxCount);
    List<Activity> result2 = activityDao.getLatestActivites(maxCount);

    // Assert
    assertThat(result1).isNotNull();
    assertThat(result2).isNotNull();
    assertThat(result1).isNotSameAs(result2);
  }

  private List<Activity> createActivityList(int count) {
    List<Activity> activities = new ArrayList<>();
    for (int i = 0; i < count; i++) {
      Activity activity = new Activity();
      activity.setActivityId(i + 1);
      activity.setActivityCode("ACT" + (i + 1));
      activities.add(activity);
    }
    return activities;
  }
}
