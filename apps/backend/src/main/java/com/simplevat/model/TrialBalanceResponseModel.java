package com.simplevat.model;


import lombok.Data;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Data
public class TrialBalanceResponseModel {


    private Map<String,String> transactionCategoryMapper= new HashMap<>();

    private Map<String,BigDecimal> assets  = new HashMap<>();
    private Map<String, BigDecimal> fixedAsset = new HashMap<>();
    private Map<String,BigDecimal> liabilities  = new HashMap<>();
    private Map<String,BigDecimal> equities  = new HashMap<>();
    private Map<String,BigDecimal> income  = new HashMap<>();
    private Map<String,BigDecimal> expense  = new HashMap<>();
    private Map<String, BigDecimal> accountReceivable = new HashMap<>();
    private Map<String, BigDecimal> accountpayable = new HashMap<>();
    private Map<String, BigDecimal> bank = new HashMap<>();
    private BigDecimal totalCreditAmount;
    private BigDecimal totalDebitAmount;
    private BigDecimal stocks;






}
