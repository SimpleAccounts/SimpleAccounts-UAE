package com.simpleaccounts.rest.vatcontroller;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class VatReportResponseListForBank implements Serializable {
	private static final long serialVersionUID = 1L;
    private Integer id;
    private String vatNumber;
    private BigDecimal totalAmount;
    private BigDecimal dueAmount;
    private LocalDate taxFiledOn;
}
