package com.simpleaccounts.rest.dashboardcontroller;

import com.simpleaccounts.aop.LogExecutionTime;
import lombok.RequiredArgsConstructor;
import static com.simpleaccounts.constant.ErrorConstant.ERROR;
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
import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@RestController
@RequestMapping("/rest/dashboardReport")
@RequiredArgsConstructor
public class DashboardController {
	private static final String DATE_FORMAT_DD_MM_YYYY = "dd/MM/yyyy";
	private final Logger logger = LoggerFactory.getLogger(FinancialReportController.class);

	private final ChartUtil chartUtil;

	private final DateFormatUtil dateFormatUtil;

	private final FinancialReportRestHelper financialReportRestHelper;

	private final TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	private final TransactionCategoryService transactionCategoryService;

	private final DashboardRestHelper dashboardRestHelper;

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
			requestModel.setStartDate(dateFormatUtil.getDateAsString(startDate, DATE_FORMAT_DD_MM_YYYY));
			requestModel.setEndDate(dateFormatUtil.getDateAsString(endDate, DATE_FORMAT_DD_MM_YYYY));
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

@LogExecutionTime
@LogRequest
@ApiOperation(value = "Get Profit and Loss Report")
@Cacheable(cacheNames = "dashboardProfitLoss", key = "T(com.simpleaccounts.helper.DashboardCacheKeyUtil).profitLossKey(#monthNo)")
@GetMapping(value = "/profitandloss")
public ResponseEntity<Object> getDashboardProfitAndLoss(@RequestParam(required = false) Integer monthNo) {
	try {
		long methodStart = System.currentTimeMillis();

		// Get date ranges for all months
		long dateRangeStart = System.currentTimeMillis();
		List<DateRequestModel> dateRequestModelList = dashboardRestHelper.getStartDateEndDateForEveryMonth(monthNo);
		logger.info("[PERF] getStartDateEndDateForEveryMonth took {} ms for {} months",
			System.currentTimeMillis() - dateRangeStart, dateRequestModelList.size());

		// Get chart of account codes
		long coaStart = System.currentTimeMillis();
		String chartOfAccountCodes = financialReportRestHelper.getChartOfAccountCategoryCodes("ProfitLoss");
		logger.info("[PERF] getChartOfAccountCategoryCodes took {} ms", System.currentTimeMillis() - coaStart);

		// OPTIMIZATION: Single query for full date range instead of N queries
		String fullStartDate = dateRequestModelList.get(0).getStartDate();
		String fullEndDate = dateRequestModelList.get(dateRequestModelList.size() - 1).getEndDate();

		ReportRequestModel fullRangeRequest = new ReportRequestModel();
		fullRangeRequest.setStartDate(fullStartDate);
		fullRangeRequest.setEndDate(fullEndDate);
		fullRangeRequest.setChartOfAccountCodes(chartOfAccountCodes);

		long dbStart = System.currentTimeMillis();
		List<TransactionCategoryClosingBalance> allClosingBalances =
			transactionCategoryClosingBalanceService.getListByChartOfAccountIds(fullRangeRequest);
		logger.info("[PERF] Single DB query for full range ({} to {}): {} ms, returned {} records",
			fullStartDate, fullEndDate, System.currentTimeMillis() - dbStart,
			allClosingBalances != null ? allClosingBalances.size() : 0);

		// Initialize response structure
		Map<String,Object> resultMap = initializeProfitLossResponse();
		List<BigDecimal> incomeData = extractIncomeSeries(resultMap);
		List<BigDecimal> expenseData = extractExpenseSeries(resultMap);
		List<Object> labels = extractLabels(resultMap);

		BigDecimal aggregateIncome = BigDecimal.ZERO;
		BigDecimal aggregateExpense = BigDecimal.ZERO;

		// Group data by month and calculate totals
		long groupingStart = System.currentTimeMillis();
		Map<YearMonth, List<TransactionCategoryClosingBalance>> groupedByMonth =
			groupClosingBalancesByMonth(allClosingBalances);
		logger.info("[PERF] Grouping by month took {} ms, created {} groups",
			System.currentTimeMillis() - groupingStart, groupedByMonth.size());

		// Process each month's data
		long processingStart = System.currentTimeMillis();
		for (DateRequestModel dateRequestModel : dateRequestModelList) {
			YearMonth yearMonth = parseYearMonth(dateRequestModel.getStartDate());
			List<TransactionCategoryClosingBalance> monthData = groupedByMonth.getOrDefault(yearMonth, Collections.emptyList());

			ProfitLossTotal totals = calculateProfitAndLossTotalsFromList(monthData);
			incomeData.add(totals.getIncome());
			expenseData.add(totals.getExpense());
			labels.add(dateRequestModel.getStartDate());

			aggregateIncome = aggregateIncome.add(totals.getIncome());
			aggregateExpense = aggregateExpense.add(totals.getExpense());
		}
		logger.info("[PERF] Processing {} months took {} ms",
			dateRequestModelList.size(), System.currentTimeMillis() - processingStart);

		resultMap.put("Income", aggregateIncome);
		resultMap.put("Expense", aggregateExpense);
		resultMap.put("NetProfit", aggregateIncome.subtract(aggregateExpense));

		logger.info("[PERF] Total method execution: {} ms (OPTIMIZED - single query)",
			System.currentTimeMillis() - methodStart);
		return new ResponseEntity<>(resultMap, HttpStatus.OK);
	} catch (Exception e) {
		logger.error(ERROR, e);
	}
	return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
}

private Map<YearMonth, List<TransactionCategoryClosingBalance>> groupClosingBalancesByMonth(
		List<TransactionCategoryClosingBalance> balances) {
	if (balances == null || balances.isEmpty()) {
		return Collections.emptyMap();
	}
	return balances.stream()
		.filter(b -> b.getClosingBalanceDate() != null)
		.collect(Collectors.groupingBy(b -> YearMonth.from(b.getClosingBalanceDate())));
}

private YearMonth parseYearMonth(String dateStr) {
	// Parse "dd/MM/yyyy" format to YearMonth
	DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT_DD_MM_YYYY);
	java.time.LocalDate date = java.time.LocalDate.parse(dateStr, formatter);
	return YearMonth.from(date);
}

private ProfitLossTotal calculateProfitAndLossTotalsFromList(List<TransactionCategoryClosingBalance> closingBalanceList) {
	if (closingBalanceList == null || closingBalanceList.isEmpty()) {
		return ProfitLossTotal.empty();
	}

	Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap =
			financialReportRestHelper.processTransactionCategoryClosingBalance(closingBalanceList);

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
			case ACCOUNTS_RECEIVABLE:
			case BANK:
			case CASH:
			case CURRENT_ASSET:
			case FIXED_ASSET:
			case OTHER_CURRENT_ASSET:
			case STOCK:
			case ACCOUNTS_PAYABLE:
			case OTHER_CURRENT_LIABILITIES:
			case OTHER_LIABILITY:
			case EQUITY:
			default:
				// Other chart of account categories not included in profit/loss calculation
				break;
		}
	}
	BigDecimal totalIncome = totalOperatingIncome.add(totalNonOperatingIncome);
	BigDecimal totalExpense = totalCostOfGoodsSold.add(totalOperatingExpense).add(totalNonOperatingExpense);
	return new ProfitLossTotal(totalIncome, totalExpense);
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

