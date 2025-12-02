package com.simplevat.helper;


import com.google.common.collect.Lists;
import com.simplevat.rest.dashboardcontroller.DateRequestModel;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class DashboardRestHelper {
    List<DateRequestModel> reversedDateRequestModelArrayList;

    public List<DateRequestModel> getStartDateEndDateForEveryMonth(Integer monthNo) {
        LocalDate startDate = LocalDate.now();
        //LocalDate startDate = LocalDate.now().withDayOfMonth(1);
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        List<DateRequestModel> dateRequestModelArrayList = new ArrayList<>();
        for (int i = 0; i <= 11; i++) {
            DateRequestModel dateRequestModel = new DateRequestModel();
            LocalDateTime start = LocalDateTime.of(startDate.minusMonths(i), LocalTime.MIDNIGHT);
            dateRequestModel.setStartDate(start.format(dateFormatter));
            LocalDateTime end = start.plusMonths(1).minusSeconds(1);
            dateRequestModel.setEndDate(end.format(dateFormatter));
            dateRequestModelArrayList.add(dateRequestModel);
             reversedDateRequestModelArrayList = reverseList(dateRequestModelArrayList);
          //  Collections.reverse(dateRequestModelArrayList);
            if (monthNo==12){
                monthNo=1;
            }
            else
                monthNo++;
        }

        return reversedDateRequestModelArrayList;
    }
    public static<T> List<T> reverseList(List<T> list) {
        List<T> reverse = new ArrayList<>(list.size());
        for (int i = list.size() - 1; i >= 0; i--) {
            reverse.add(list.get(i));
        }
        return reverse;
    }
}

