package com.simplevat.helper;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Date;

@Component
public class DateFormatHelper {
    public LocalDate convertToLocalDateViaSqlDate(Date dateToConvert) {
        return new java.sql.Date(dateToConvert.getTime()).toLocalDate();
    }
}
