package com.simpleaccounts.rest.financialreport;

import java.io.Serializable;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.rest.PaginationModel;

import lombok.Data;

@Data
public class AmountDetailRequestModel extends PaginationModel implements Serializable {

	private String startDate;
	private String endDate;
	private Integer placeOfSyply;
	
    public LocalDate getStartDate() {
        SimpleDateFormat dateFormatter = new SimpleDateFormat(CommonColumnConstants.DD_MM_YYYY);
        Date d;
        try {
            d = dateFormatter.parse(startDate);
        } catch (ParseException e) {
            d = new Date();
        }
        LocalDateTime dob = Instant.ofEpochMilli(d.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime();
        return dob.toLocalDate();
    }

    public LocalDate getEndDate() {
        SimpleDateFormat dateFormatter = new SimpleDateFormat(CommonColumnConstants.DD_MM_YYYY);
        Date d;
        try {
            d = dateFormatter.parse(endDate);
        } catch (ParseException e) {
            d = new Date();
        }
        LocalDateTime dob1 = Instant.ofEpochMilli(d.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime();
        return dob1.toLocalDate();
    }

}
