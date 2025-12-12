package com.simpleaccounts.rest.InventoryController;

import lombok.Data;

import java.math.BigDecimal;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
public class TopInventoryRevenueModel {

    private Map<String, BigDecimal> topSellingProductsMonthly;
    private Map<String, BigDecimal> topSellingProductsQuarterly;
    private Map<String, BigDecimal> topSellingProductsSixMonthly;
    private Map<String, BigDecimal> topSellingProductsYearly;
    private Map<String, BigDecimal> lowSellingProductsMonthly;
    private Map<String, BigDecimal> lowSellingProductsQuarterly;
    private Map<String, BigDecimal> lowSellingProductsSixMonthly;
    private Map<String, BigDecimal> lowSellingProductsYearly;
    private Map<String, BigDecimal> totalProfitMonthly;
    private Map<String, BigDecimal> totalProfitQuarterly;
    private Map<String, BigDecimal> totalProfitSixMonthly;
    private Map<String, BigDecimal> totalProfitYearly;

    public TopInventoryRevenueModel() {
        topSellingProductsMonthly = new LinkedHashMap<>();
        topSellingProductsQuarterly= new LinkedHashMap<>();
        topSellingProductsSixMonthly= new LinkedHashMap<>();
        topSellingProductsYearly= new LinkedHashMap<>();
        lowSellingProductsMonthly= new LinkedHashMap<>();
        lowSellingProductsQuarterly= new LinkedHashMap<>();
        lowSellingProductsSixMonthly= new LinkedHashMap<>();
        lowSellingProductsYearly= new LinkedHashMap<>();
        totalProfitMonthly= new LinkedHashMap<>();
        totalProfitQuarterly= new LinkedHashMap<>();
        totalProfitSixMonthly= new LinkedHashMap<>();
        totalProfitYearly= new LinkedHashMap<>();
    }
}
