package com.simpleaccounts.rest.payroll;

import com.simpleaccounts.entity.Employee;
import com.simpleaccounts.entity.SalaryTemplate;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.persistence.*;
import lombok.Data;

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
