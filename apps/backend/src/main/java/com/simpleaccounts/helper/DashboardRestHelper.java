package com.simpleaccounts.helper;

import com.simpleaccounts.rest.dashboardcontroller.DateRequestModel;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DashboardRestHelper {

    private static final int MAX_MONTHS = 12;

    public List<DateRequestModel> getStartDateEndDateForEveryMonth(Integer monthNo) {
        int monthCount = normalizeMonthCount(monthNo);
        LocalDate anchorMonth = LocalDate.now().withDayOfMonth(1);
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        List<DateRequestModel> orderedRanges = new ArrayList<>(monthCount);
        for (int offset = monthCount - 1; offset >= 0; offset--) {
            LocalDate targetMonth = anchorMonth.minusMonths(offset);
            LocalDateTime start = LocalDateTime.of(targetMonth, LocalTime.MIDNIGHT);
            LocalDateTime end = start.plusMonths(1).minusSeconds(1);

            DateRequestModel model = new DateRequestModel();
            model.setStartDate(start.format(dateFormatter));
            model.setEndDate(end.format(dateFormatter));
            orderedRanges.add(model);
        }
        return orderedRanges;
    }

    private int normalizeMonthCount(Integer monthNo) {
        if (monthNo == null) {
            return MAX_MONTHS;
        }
        return Math.min(Math.max(monthNo, 1), MAX_MONTHS);
    }
}

