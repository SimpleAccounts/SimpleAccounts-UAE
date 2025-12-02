package com.simplevat.rest.financialreport;


import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import lombok.Data;

@Data
public class ProfitAndLossResponseModel {

	private BigDecimal totalOperatingIncome;

	private BigDecimal totalCostOfGoodsSold;

	private BigDecimal grossProfit;

	private BigDecimal totalOperatingExpense;

	private BigDecimal operatingProfit;

	private BigDecimal totalNonOperatingIncome;
	private BigDecimal totalNonOperatingExpense;

	private BigDecimal nonOperatingIncomeExpense;

	private BigDecimal netProfitLoss;

	private Map<String,BigDecimal> operatingIncome  = new HashMap<>();
	private Map<String,BigDecimal> nonOperatingIncome = new HashMap<>();
	private Map<String,BigDecimal> costOfGoodsSold = new HashMap<>();
	private Map<String,BigDecimal> operatingExpense = new HashMap<>();
	private Map<String,BigDecimal> nonOperatingExpense = new HashMap<>();

}
