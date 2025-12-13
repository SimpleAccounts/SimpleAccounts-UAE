package com.simpleaccounts.helper;

import java.time.LocalDate;
import java.util.Date;
import org.springframework.stereotype.Component;

@Component
public class DateFormatHelper {
    public LocalDate convertToLocalDateViaSqlDate(Date dateToConvert) {
        return new java.sql.Date(dateToConvert.getTime()).toLocalDate();
    }
}
