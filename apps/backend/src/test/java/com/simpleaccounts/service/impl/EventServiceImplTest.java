package com.simpleaccounts.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.simpleaccounts.entity.Event;
import com.simpleaccounts.service.InvoiceService;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EventServiceImplTest {

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private EventServiceImpl eventService;

    private Event testEvent;
    private Date startDate;
    private Date endDate;

    @BeforeEach
    void setUp() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.JANUARY, 1, 0, 0, 0);
        startDate = calendar.getTime();

        calendar.set(2024, Calendar.DECEMBER, 31, 23, 59, 59);
        endDate = calendar.getTime();

        testEvent = new Event();
        testEvent.setTitle("Test Event");
        testEvent.setStartDate(startDate);
        testEvent.setEndDate(endDate);
        testEvent.setAllDay(false);
        testEvent.setEditable(true);
        testEvent.setDescription("Test event description");
        testEvent.setStyleClass("event-style");
    }

    // ========== getEvents(Date, Date) Tests ==========

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithDateRange() {
        List<Event> result = eventService.getEvents(startDate, endDate);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithNullStartDate() {
        List<Event> result = eventService.getEvents(null, endDate);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithNullEndDate() {
        List<Event> result = eventService.getEvents(startDate, null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithBothDatesNull() {
        List<Event> result = eventService.getEvents(null, null);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithSameStartAndEndDate() {
        List<Event> result = eventService.getEvents(startDate, startDate);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithEndDateBeforeStartDate() {
        List<Event> result = eventService.getEvents(endDate, startDate);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithFutureDateRange() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2025, Calendar.JANUARY, 1, 0, 0, 0);
        Date futureStart = calendar.getTime();

        calendar.set(2025, Calendar.DECEMBER, 31, 23, 59, 59);
        Date futureEnd = calendar.getTime();

        List<Event> result = eventService.getEvents(futureStart, futureEnd);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithPastDateRange() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2020, Calendar.JANUARY, 1, 0, 0, 0);
        Date pastStart = calendar.getTime();

        calendar.set(2020, Calendar.DECEMBER, 31, 23, 59, 59);
        Date pastEnd = calendar.getTime();

        List<Event> result = eventService.getEvents(pastStart, pastEnd);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithSingleDayRange() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.JUNE, 15, 0, 0, 0);
        Date dayStart = calendar.getTime();

        calendar.set(2024, Calendar.JUNE, 15, 23, 59, 59);
        Date dayEnd = calendar.getTime();

        List<Event> result = eventService.getEvents(dayStart, dayEnd);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithLongDateRange() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2020, Calendar.JANUARY, 1, 0, 0, 0);
        Date longStart = calendar.getTime();

        calendar.set(2025, Calendar.DECEMBER, 31, 23, 59, 59);
        Date longEnd = calendar.getTime();

        List<Event> result = eventService.getEvents(longStart, longEnd);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    // ========== getEvents() Tests ==========

    @Test
    void shouldReturnEmptyListWhenGetEventsCalledWithoutParameters() {
        List<Event> result = eventService.getEvents();

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnNewListInstanceWhenGetEventsCalled() {
        List<Event> result1 = eventService.getEvents();
        List<Event> result2 = eventService.getEvents();

        assertThat(result1).isNotNull();
        assertThat(result2).isNotNull();
        assertThat(result1).isNotSameAs(result2);
    }

    @Test
    void shouldReturnEmptyListOnMultipleCalls() {
        List<Event> result1 = eventService.getEvents();
        List<Event> result2 = eventService.getEvents();
        List<Event> result3 = eventService.getEvents();

        assertThat(result1).isEmpty();
        assertThat(result2).isEmpty();
        assertThat(result3).isEmpty();
    }

    @Test
    void shouldReturnListThatCanBeModified() {
        List<Event> result = eventService.getEvents();

        result.add(testEvent);

        assertThat(result).hasSize(1);
        assertThat(result).contains(testEvent);
    }

    @Test
    void shouldNotAffectInternalStateWhenModifyingReturnedList() {
        List<Event> result1 = eventService.getEvents();
        result1.add(testEvent);

        List<Event> result2 = eventService.getEvents();

        assertThat(result1).hasSize(1);
        assertThat(result2).isEmpty();
    }

    // ========== Consistency Tests ==========

    @Test
    void shouldReturnConsistentResultsForSameDateRange() {
        List<Event> result1 = eventService.getEvents(startDate, endDate);
        List<Event> result2 = eventService.getEvents(startDate, endDate);

        assertThat(result1).isNotNull();
        assertThat(result2).isNotNull();
        assertThat(result1).isEmpty();
        assertThat(result2).isEmpty();
    }

    @Test
    void shouldReturnEmptyListForCurrentDateRange() {
        Date now = new Date();
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(now);
        calendar.add(Calendar.DAY_OF_MONTH, 7);
        Date weekLater = calendar.getTime();

        List<Event> result = eventService.getEvents(now, weekLater);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleMultipleConsecutiveCalls() {
        for (int i = 0; i < 10; i++) {
            List<Event> result = eventService.getEvents(startDate, endDate);
            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        }
    }

    // ========== Edge Case Tests ==========

    @Test
    void shouldHandleVeryOldDates() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(1900, Calendar.JANUARY, 1, 0, 0, 0);
        Date veryOldStart = calendar.getTime();

        calendar.set(1900, Calendar.DECEMBER, 31, 23, 59, 59);
        Date veryOldEnd = calendar.getTime();

        List<Event> result = eventService.getEvents(veryOldStart, veryOldEnd);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleVeryFutureDates() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2100, Calendar.JANUARY, 1, 0, 0, 0);
        Date veryFutureStart = calendar.getTime();

        calendar.set(2100, Calendar.DECEMBER, 31, 23, 59, 59);
        Date veryFutureEnd = calendar.getTime();

        List<Event> result = eventService.getEvents(veryFutureStart, veryFutureEnd);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenCalledWithLeapYearDates() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.FEBRUARY, 29, 0, 0, 0);
        Date leapStart = calendar.getTime();

        calendar.set(2024, Calendar.FEBRUARY, 29, 23, 59, 59);
        Date leapEnd = calendar.getTime();

        List<Event> result = eventService.getEvents(leapStart, leapEnd);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenCalledWithMonthBoundaryDates() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.JANUARY, 31, 23, 59, 59);
        Date monthEnd = calendar.getTime();

        calendar.set(2024, Calendar.FEBRUARY, 1, 0, 0, 0);
        Date monthStart = calendar.getTime();

        List<Event> result = eventService.getEvents(monthEnd, monthStart);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnEmptyListWhenCalledWithYearBoundaryDates() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2023, Calendar.DECEMBER, 31, 23, 59, 59);
        Date yearEnd = calendar.getTime();

        calendar.set(2024, Calendar.JANUARY, 1, 0, 0, 0);
        Date yearStart = calendar.getTime();

        List<Event> result = eventService.getEvents(yearEnd, yearStart);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleMidnightDates() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.JUNE, 15, 0, 0, 0);
        Date midnight1 = calendar.getTime();

        calendar.set(2024, Calendar.JUNE, 16, 0, 0, 0);
        Date midnight2 = calendar.getTime();

        List<Event> result = eventService.getEvents(midnight1, midnight2);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleMillisecondPrecisionDates() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2024, Calendar.JUNE, 15, 10, 30, 45);
        calendar.set(Calendar.MILLISECOND, 123);
        Date preciseStart = calendar.getTime();

        calendar.set(2024, Calendar.JUNE, 15, 10, 30, 45);
        calendar.set(Calendar.MILLISECOND, 456);
        Date preciseEnd = calendar.getTime();

        List<Event> result = eventService.getEvents(preciseStart, preciseEnd);

        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    void shouldVerifyInvoiceServiceIsInjected() {
        assertThat(invoiceService).isNotNull();
    }

    @Test
    void shouldHandleRapidSuccessiveCalls() {
        List<List<Event>> results = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            results.add(eventService.getEvents());
        }

        assertThat(results).hasSize(100);
        results.forEach(result -> {
            assertThat(result).isNotNull();
            assertThat(result).isEmpty();
        });
    }

    @Test
    void shouldHandleAlternatingCallTypes() {
        List<Event> result1 = eventService.getEvents();
        List<Event> result2 = eventService.getEvents(startDate, endDate);
        List<Event> result3 = eventService.getEvents();
        List<Event> result4 = eventService.getEvents(startDate, endDate);

        assertThat(result1).isEmpty();
        assertThat(result2).isEmpty();
        assertThat(result3).isEmpty();
        assertThat(result4).isEmpty();
    }
}
