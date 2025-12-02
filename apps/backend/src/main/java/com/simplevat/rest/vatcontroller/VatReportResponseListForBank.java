package com.simplevat.rest.vatcontroller;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class VatReportResponseListForBank {
    private Integer id;
    private String vatNumber;
    private BigDecimal totalAmount;
    private BigDecimal dueAmount;
    private LocalDate taxFiledOn;
}
