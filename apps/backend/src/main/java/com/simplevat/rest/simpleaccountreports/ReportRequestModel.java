package com.simplevat.rest.simpleaccountreports;

import com.simplevat.constant.CommonColumnConstants;
import lombok.Data;


import java.io.Serializable;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;


@Data
public class ReportRequestModel implements Serializable {

    private String startDate;
    private String endDate;


    public LocalDateTime getStartDate() {
        SimpleDateFormat dateFormatter = new SimpleDateFormat(CommonColumnConstants.DD_MM_YYYY);
        Date d;
        try {
            d = dateFormatter.parse(startDate);
        } catch (ParseException e) {
            d = new Date();
        }
        LocalDateTime dob = Instant.ofEpochMilli(d.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime();
        return dob;
    }

    public LocalDateTime getEndDate() {
        SimpleDateFormat dateFormatter = new SimpleDateFormat(CommonColumnConstants.DD_MM_YYYY);
        Date d;
        try {
            d = dateFormatter.parse(endDate);
        } catch (ParseException e) {
            d = new Date();
        }
        LocalDateTime dob1 = Instant.ofEpochMilli(d.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime();
        return dob1;
    }

}