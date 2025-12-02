package com.simplevat.rest.reconsilationcontroller;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class ReconcilationPersistModel implements Serializable {

    private String date;
    private Integer bankId;
    private BigDecimal closingBalance;
}
