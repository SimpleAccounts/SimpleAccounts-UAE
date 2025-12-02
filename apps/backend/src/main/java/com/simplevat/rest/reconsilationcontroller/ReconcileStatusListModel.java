package com.simplevat.rest.reconsilationcontroller;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ReconcileStatusListModel {
    private Integer reconcileId;
    private String reconciledDate;
    private String reconciledDuration;
    private BigDecimal closingBalance;
}
