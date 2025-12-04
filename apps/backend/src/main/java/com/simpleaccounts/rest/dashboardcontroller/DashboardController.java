package com.simpleaccounts.rest.dashboardcontroller;

import com.simpleaccounts.aop.LogExecutionTime;
import com.simpleaccounts.aop.LogRequest;
import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.helper.DashboardRestHelper;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportController;
import com.simpleaccounts.rest.financialreport.FinancialReportRestHelper;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.utils.ChartUtil;
import com.simpleaccounts.utils.DateFormatUtil;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


import java.math.BigDecimal;
import java.util.*;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping("/rest/dashboardReport")
public class DashboardController {
	private final Logger logger = LoggerFactory.getLogger(FinancialReportController.class);

	@Autowired
	private ChartUtil chartUtil;

	@Autowired
	private DateFormatUtil dateFormatUtil;

	@Autowired
	private FinancialReportRestHelper financialReportRestHelper;

	@Autowired
	TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	@Autowired
	TransactionCategoryService transactionCategoryService;

	@Autowired
	private DashboardRestHelper dashboardRestHelper;


	@LogRequest
	@GetMapping(value = "/getVatReport")
	public ResponseEntity<Object> getVatReport(@RequestParam Integer monthNo) {

		try {
			Date startDate = null;
			Date endDate = chartUtil.getEndDate().getTime();
			if (monthNo != null) {
				startDate = chartUtil.getStartDate(Calendar.MONTH, -monthNo).getTime();
			} else {
				startDate = chartUtil.getStartDate(Calendar.YEAR, -1).getTime();
			}
			ReportRequestModel requestModel = new ReportRequestModel();
			requestModel.setStartDate(dateFormatUtil.getDateAsString(startDate, "dd/MM/yyyy"));
			requestModel.setEndDate(dateFormatUtil.getDateAsString(endDate, "dd/MM/yyyy"));
			String chartOfAccountCodes = financialReportRestHelper.getChartOfAccountCategoryCodes("VatReport");
			requestModel.setChartOfAccountCodes(chartOfAccountCodes);
			List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);
			Map<String, BigDecimal> output = new HashMap<>();
			if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
				Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = financialReportRestHelper.processTransactionCategoryClosingBalance(closingBalanceList);
				BigDecimal totalInputVat = BigDecimal.ZERO;
				BigDecimal totalOutputVat = BigDecimal.ZERO;

				for (Map.Entry<Integer, TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
					TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
					String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory().getChartOfAccount().getChartOfAccountCode();
					BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();
					if (closingBalance.longValue() < 0) {
						closingBalance = closingBalance.negate();
					}
					ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
					if (chartOfAccountCategoryCodeEnum == null)
						continue;
					switch (chartOfAccountCategoryCodeEnum) {
						case OTHER_CURRENT_LIABILITIES:
							TransactionCategory transactionCategory = transactionCategoryClosingBalance.getTransactionCategory();
							if (transactionCategory.getTransactionCategoryCode().equalsIgnoreCase
									(TransactionCategoryCodeEnum.OUTPUT_VAT.getCode())) {
								output.put("OutputVat", closingBalance);
								totalOutputVat = totalOutputVat.add(closingBalance);
							}
							break;

						case OTHER_CURRENT_ASSET:
							transactionCategory = transactionCategoryClosingBalance.getTransactionCategory();
							if (transactionCategory.getTransactionCategoryCode().equalsIgnoreCase
									(TransactionCategoryCodeEnum.INPUT_VAT.getCode())) {
								output.put("InputVat", closingBalance);
								totalInputVat = totalInputVat.add(closingBalance);
							}
							break;
						default:
							break;
					}
				}
				BigDecimal difference = totalInputVat.subtract(totalOutputVat);
				output.put("Tax payable", difference);
			}
			return new ResponseEntity<>(output, HttpStatus.OK);
		} catch (Exception e) {
			logger.error(ERROR, e);
		}
		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
	}

	//	@ApiOperation(value = "Get Profit and Loss Report")
//	@GetMapping(value = "/profitandloss")
//	public ResponseEntity<Object> getDashboardProfitAndLoss(@RequestParam Integer monthNo) {
//		try {
//			Date startDate = null;
//			Date endDate = chartUtil.getEndDate().getTime();
//			if (monthNo != null) {
//				startDate = chartUtil.getStartDate(Calendar.MONTH, -monthNo).getTime();
//			} else {
//				startDate = chartUtil.getStartDate(Calendar.YEAR, -1).getTime();
//			}
//			ReportRequestModel requestModel = new ReportRequestModel();
//			requestModel.setStartDate(dateFormatUtil.getDateAsString(startDate, "dd/MM/yyyy"));
//			requestModel.setEndDate(dateFormatUtil.getDateAsString(endDate, "dd/MM/yyyy"));
//			String chartOfAccountCodes = financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss");
//			requestModel.setChartOfAccountCodes(chartOfAccountCodes);
//			List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);
//			Map<String, BigDecimal> profitMap = new HashMap<>();
//			if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
//				Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = financialReportRestHelper.processTransactionCategoryClosingBalance(closingBalanceList);
//				BigDecimal totalOperatingIncome = BigDecimal.ZERO;
//				BigDecimal totalCostOfGoodsSold = BigDecimal.ZERO;
//				BigDecimal totalOperatingExpense = BigDecimal.ZERO;
//
//				BigDecimal totalNonOperatingIncome = BigDecimal.ZERO;
//				BigDecimal totalNonOperatingExpense = BigDecimal.ZERO;
//
//				for (Map.Entry<Integer, TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
//					TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
//					String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory().getChartOfAccount().getChartOfAccountCode();
//					String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
//					BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();
//					ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
//					if (chartOfAccountCategoryCodeEnum == null)
//						continue;
//					if (closingBalance.longValue() < 0) {
//						closingBalance = closingBalance.negate();
//					}
//					switch (chartOfAccountCategoryCodeEnum) {
//						case INCOME:
//							if (transactionCategoryName.equalsIgnoreCase("Sales") ||
//									transactionCategoryName.equalsIgnoreCase("Other Charges")) {
//								totalOperatingIncome = totalOperatingIncome.add(closingBalance);
//							} else {
//								totalNonOperatingIncome = totalNonOperatingIncome.add(closingBalance);
//							}
//							break;
//						case ADMIN_EXPENSE:
//							totalOperatingExpense = totalOperatingExpense.add(closingBalance);
//							break;
//						case OTHER_EXPENSE:
//							totalNonOperatingExpense = totalNonOperatingExpense.add(closingBalance);
//							break;
//						case COST_OF_GOODS_SOLD:
//							totalCostOfGoodsSold = totalCostOfGoodsSold.add(closingBalance);
//							break;
//						default:
//							break;
//					}
//				}
//				BigDecimal totalIncome = totalOperatingIncome.add(totalNonOperatingIncome);
//				BigDecimal totalExpense = totalCostOfGoodsSold.add(totalOperatingExpense).add(totalNonOperatingExpense);
//				BigDecimal netProfitLoss = totalIncome.subtract(totalExpense);
//				profitMap.put("Income", totalIncome);
//				profitMap.put("Expense", totalExpense);
//				profitMap.put("NetProfit", netProfitLoss);
//			}
//			return new ResponseEntity<>(profitMap, HttpStatus.OK);
//		} catch (Exception e) {
//			logger.error(ERROR, e);
//		}
//		return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//	}
	
@LogExecutionTime
@LogRequest
@ApiOperation(value = "Get Profit and Loss Report")
@Cacheable(cacheNames = "dashboardProfitLoss", key = "T(com.simpleaccounts.helper.DashboardCacheKeyUtil).profitLossKey(#monthNo)")
@GetMapping(value = "/profitandloss")
public ResponseEntity<Object> getDashboardProfitAndLoss(@RequestParam(required = false) Integer monthNo) {
	try {
		long methodStart = System.currentTimeMillis();

		long dateRangeStart = System.currentTimeMillis();
		List<DateRequestModel> dateRequestModelList = dashboardRestHelper.getStartDateEndDateForEveryMonth(monthNo);
		logger.info("[PERF] getStartDateEndDateForEveryMonth took {} ms for {} months",
			System.currentTimeMillis() - dateRangeStart, dateRequestModelList.size());

		long coaStart = System.currentTimeMillis();
		String chartOfAccountCodes = financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss");
		logger.info("[PERF] getChartOfAccountCategoryCodes took {} ms", System.currentTimeMillis() - coaStart);

		Map<String,Object> resultMap = initializeProfitLossResponse();
		List<BigDecimal> incomeData = extractIncomeSeries(resultMap);
		List<BigDecimal> expenseData = extractExpenseSeries(resultMap);
		List<Object> labels = extractLabels(resultMap);

		BigDecimal aggregateIncome = BigDecimal.ZERO;
		BigDecimal aggregateExpense = BigDecimal.ZERO;

		long loopStart = System.currentTimeMillis();
		int iteration = 0;
		long totalDbTime = 0;
		for(DateRequestModel dateRequestModel : dateRequestModelList) {
			long iterStart = System.currentTimeMillis();
			ReportRequestModel requestModel = new ReportRequestModel();
			requestModel.setStartDate(dateRequestModel.getStartDate());
			requestModel.setEndDate(dateRequestModel.getEndDate());
			requestModel.setChartOfAccountCodes(chartOfAccountCodes);

			long dbStart = System.currentTimeMillis();
			ProfitLossTotal totals = calculateProfitAndLossTotals(requestModel);
			long dbTime = System.currentTimeMillis() - dbStart;
			totalDbTime += dbTime;

			incomeData.add(totals.getIncome());
			expenseData.add(totals.getExpense());
			labels.add(dateRequestModel.getStartDate());

			aggregateIncome = aggregateIncome.add(totals.getIncome());
			aggregateExpense = aggregateExpense.add(totals.getExpense());

			logger.info("[PERF] Iteration {} ({} to {}): DB query {} ms, total iter {} ms",
				++iteration, dateRequestModel.getStartDate(), dateRequestModel.getEndDate(),
				dbTime, System.currentTimeMillis() - iterStart);
		}
		logger.info("[PERF] Loop completed: {} iterations, total loop time {} ms, total DB time {} ms, avg DB time {} ms",
			iteration, System.currentTimeMillis() - loopStart, totalDbTime, totalDbTime / Math.max(1, iteration));

		resultMap.put("Income", aggregateIncome);
		resultMap.put("Expense", aggregateExpense);
		resultMap.put("NetProfit", aggregateIncome.subtract(aggregateExpense));

		logger.info("[PERF] Total method execution: {} ms", System.currentTimeMillis() - methodStart);
		return new ResponseEntity<>(resultMap, HttpStatus.OK);
	} catch (Exception e) {
		logger.error(ERROR, e);
	}
	return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
}

private Map<String, Object> initializeProfitLossResponse() {
	Map<String,Object> resultMap = new HashMap<>();
	Map<String,Object> labelMap = new HashMap<>();
	List<Object> labels = new ArrayList<>();
	labelMap.put("labels",labels);

	Map<String,Object> incomeMap = new HashMap<>();
	List<BigDecimal> incomeData = new ArrayList<>();
	incomeMap.put("name","Income");
	incomeMap.put("type","column");
	incomeMap.put("incomeData",incomeData);
	resultMap.put("income",incomeMap);

	Map<String,Object> expenseMap = new HashMap<>();
	List<BigDecimal> expenseData = new ArrayList<>();
	expenseMap.put("name","Expenses");
	expenseMap.put("type","Expenses");
	expenseMap.put("expenseData",expenseData);
	resultMap.put("expense",expenseMap);

	resultMap.put("label",labelMap);
	return resultMap;
}

@SuppressWarnings("unchecked")
private List<BigDecimal> extractIncomeSeries(Map<String, Object> response) {
	Map<String,Object> income = (Map<String, Object>) response.get("income");
	return (List<BigDecimal>) income.get("incomeData");
}

@SuppressWarnings("unchecked")
private List<BigDecimal> extractExpenseSeries(Map<String, Object> response) {
	Map<String,Object> expense = (Map<String, Object>) response.get("expense");
	return (List<BigDecimal>) expense.get("expenseData");
}

@SuppressWarnings("unchecked")
private List<Object> extractLabels(Map<String, Object> response) {
	Map<String,Object> label = (Map<String, Object>) response.get("label");
	return (List<Object>) label.get("labels");
}

private ProfitLossTotal calculateProfitAndLossTotals(ReportRequestModel requestModel) {
	long queryStart = System.currentTimeMillis();
	List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);
	logger.info("[PERF] DB getListByChartOfAccountIds: {} ms, returned {} records",
		System.currentTimeMillis() - queryStart,
		closingBalanceList != null ? closingBalanceList.size() : 0);

	if (closingBalanceList == null || closingBalanceList.isEmpty()) {
		return ProfitLossTotal.empty();
	}

	long processStart = System.currentTimeMillis();
	Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap =
			financialReportRestHelper.processTransactionCategoryClosingBalance(closingBalanceList);
	logger.info("[PERF] processTransactionCategoryClosingBalance: {} ms, processed into {} entries",
		System.currentTimeMillis() - processStart, transactionCategoryClosingBalanceMap.size());
	BigDecimal totalOperatingIncome = BigDecimal.ZERO;
	BigDecimal totalCostOfGoodsSold = BigDecimal.ZERO;
	BigDecimal totalOperatingExpense = BigDecimal.ZERO;

	BigDecimal totalNonOperatingIncome = BigDecimal.ZERO;
	BigDecimal totalNonOperatingExpense = BigDecimal.ZERO;

	for (Map.Entry<Integer, TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
		TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
		String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory().getChartOfAccount().getChartOfAccountCode();
		String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
		BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();
		ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
		if (chartOfAccountCategoryCodeEnum == null) {
			continue;
		}
		if (closingBalance.longValue() < 0) {
			closingBalance = closingBalance.negate();
		}
		switch (chartOfAccountCategoryCodeEnum) {
			case INCOME:
				if (transactionCategoryName.equalsIgnoreCase("Sales") ||
						transactionCategoryName.equalsIgnoreCase("Other Charges")) {
					totalOperatingIncome = totalOperatingIncome.add(closingBalance);
				} else {
					totalNonOperatingIncome = totalNonOperatingIncome.add(closingBalance);
				}
				break;
			case ADMIN_EXPENSE:
				totalOperatingExpense = totalOperatingExpense.add(closingBalance);
				break;
			case OTHER_EXPENSE:
				totalNonOperatingExpense = totalNonOperatingExpense.add(closingBalance);
				break;
			case COST_OF_GOODS_SOLD:
				totalCostOfGoodsSold = totalCostOfGoodsSold.add(closingBalance);
				break;
			default:
				break;
		}
	}
	BigDecimal totalIncome = totalOperatingIncome.add(totalNonOperatingIncome);
	BigDecimal totalExpense = totalCostOfGoodsSold.add(totalOperatingExpense).add(totalNonOperatingExpense);
	return new ProfitLossTotal(totalIncome, totalExpense);
}

private static final class ProfitLossTotal {
	private final BigDecimal income;
	private final BigDecimal expense;

	private ProfitLossTotal(BigDecimal income, BigDecimal expense) {
		this.income = income;
		this.expense = expense;
	}

	public static ProfitLossTotal empty() {
		return new ProfitLossTotal(BigDecimal.ZERO, BigDecimal.ZERO);
	}

	public BigDecimal getIncome() {
		return income;
	}

	public BigDecimal getExpense() {
		return expense;
	}
}
}



