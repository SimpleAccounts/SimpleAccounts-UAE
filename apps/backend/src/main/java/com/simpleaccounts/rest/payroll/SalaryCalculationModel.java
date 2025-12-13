package com.simpleaccounts.rest.payroll;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 *
 * @author Suraj
 */
@Getter
@Setter
public class SalaryCalculationModel implements Serializable {

    private BigDecimal daValue;
    private BigDecimal bsValue;
    private BigDecimal hraValue;
    private BigDecimal oaValue;
    private BigDecimal itValue;
    private BigDecimal epfValue;
}
