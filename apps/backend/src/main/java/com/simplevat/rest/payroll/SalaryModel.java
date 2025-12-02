package com.simplevat.rest.payroll;

import com.simplevat.entity.Employee;
import com.simplevat.entity.SalaryTemplate;
import com.simplevat.entity.converter.DateConverter;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SalaryModel {

    private Integer id;

    private Employee employeeId;

    private SalaryTemplate salTempId;

    private Integer createdBy = 0;

    private LocalDateTime createdDate = LocalDateTime.now();

    private Integer noOfDays;

    private BigDecimal totalAmount;


}
