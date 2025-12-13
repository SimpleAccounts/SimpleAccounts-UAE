package com.simpleaccounts.rest.payroll;

import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

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
