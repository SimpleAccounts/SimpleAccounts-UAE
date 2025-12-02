package com.simplevat.rest.financialreport;


import lombok.Data;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Data
public class BalanceSheetResponseModel {

    private BigDecimal totalCurrentAssets;

    private BigDecimal totalFixedAssets;

    private BigDecimal totalAssets;

    private BigDecimal totalOtherCurrentAssets;

    private BigDecimal totalBank;

    private BigDecimal totalOtherLiability;

    private BigDecimal totalAccountReceivable;

    private BigDecimal totalAccountPayable;

    private BigDecimal totalOtherCurrentLiability;

    private BigDecimal totalLiability;

    private BigDecimal totalEquities;

    private BigDecimal totalLiabilityEquities;

    private Map<String,BigDecimal> currentAssets  = new HashMap<>();

    private Map<String,BigDecimal> otherCurrentAssets  = new HashMap<>();

     private Map<String,BigDecimal> bank  = new HashMap<>();

    private Map<String,BigDecimal> fixedAssets  = new HashMap<>();

    private Map<String,BigDecimal> otherLiability  = new HashMap<>();

    private Map<String,BigDecimal> otherCurrentLiability  = new HashMap<>();

    private Map<String,BigDecimal> equities  = new HashMap<>();

    private BigDecimal stocks;
}
