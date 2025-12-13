package com.simpleaccounts.rest.InventoryController;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class InventoryRevenueModel {

    private BigDecimal totalRevenueMonthly;
    private BigDecimal totalRevenueQuarterly;
    private BigDecimal totalRevenueSixMonthly;
    private BigDecimal totalRevenueYearly;
    private BigDecimal totalQtySoldMonthly;
    private BigDecimal totalQtySoldQuarterly;
    private BigDecimal totalQtySoldSixMonthly;
    private BigDecimal totalQtySoldYearly;

}
