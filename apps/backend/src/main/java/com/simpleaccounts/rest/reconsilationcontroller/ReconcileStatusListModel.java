package com.simpleaccounts.rest.reconsilationcontroller;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReconcileStatusListModel {
    private Integer reconcileId;
    private String reconciledDate;
    private String reconciledDuration;
    private BigDecimal closingBalance;
}
