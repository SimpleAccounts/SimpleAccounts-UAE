package com.simpleaccounts.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EarningDetailsModel {
    private Float totalEarningsAmount;
    private Float totalEarningsAmountWeekly;
    private Float totalEarningsAmountMonthly;

    public EarningDetailsModel(Float totalEarningsAmount, Float totalEarningsAmountWeekly, Float totalEarningsAmountMonthly) {
        this.totalEarningsAmount = totalEarningsAmount;
        this.totalEarningsAmountWeekly = totalEarningsAmountWeekly;
        this.totalEarningsAmountMonthly = totalEarningsAmountMonthly;
    }
}
