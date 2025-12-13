package com.simpleaccounts.rest.reconsilationcontroller;

import java.io.Serializable;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class ReconcilationPersistModel implements Serializable {

    private String date;
    private Integer bankId;
    private BigDecimal closingBalance;
}
