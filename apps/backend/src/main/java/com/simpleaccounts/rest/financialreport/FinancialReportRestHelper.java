package com.simpleaccounts.rest.financialreport;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

import com.simpleaccounts.constant.ChartOfAccountCategoryCodeEnum;
import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.DiscountType;
import com.simpleaccounts.entity.CreditNoteLineItem;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.model.TrialBalanceResponseModel;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.repository.CreditNoteLineItemRepository;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.InvoiceService;
import com.simpleaccounts.service.TransactionCategoryClosingBalanceService;
import com.simpleaccounts.utils.DateFormatUtil;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
	@SuppressWarnings({"java:S3973", "java:S131"})
	@RequiredArgsConstructor
public class FinancialReportRestHelper {

	private static final String RETAINED_EARNINGS = "RETAINED_EARNINGS";
	private static final String OTHER_CHARGES = "OTHER_CHARGES";
	private static final String OPENING_BALANCE_EQUITY_OFFSET = "OPENING_BALANCE_EQUITY_OFFSET";
	private static final String RETAINED_EARNINGS_DISPLAY = "Retained Earnings";
	private static final String OTHER_CHARGES_DISPLAY = "Other Charges";
	private static final String OPENING_BALANCE_EQUITY_OFFSET_DISPLAY = "Opening Balance Equity Offset";
	private static final String OPENING_BALANCE_OFFSET_ASSETS = "Opening Balance Offset Assets";
	private static final String OPENING_BALANCE_OFFSET_LIABILITIES = "Opening Balance Offset Liabilities";

	private final TransactionCategoryClosingBalanceService transactionCategoryClosingBalanceService;

	private final InvoiceService invoiceService;

	private final ExpenseService expenseService;

	private final CreditNoteLineItemRepository creditNoteLineItemRepository;

	private final EntityManager entityManager;

	private final VatReportFilingRepository vatReportFilingRepository;

	private final DateFormatUtil dateUtil;

	/**
	 *
	 * @param reportRequestModel
	 * @return
	 */
	public BalanceSheetResponseModel getBalanceSheetReport(FinancialReportRequestModel reportRequestModel) {

		BalanceSheetResponseModel balanceSheetResponseModel= new BalanceSheetResponseModel();
		ReportRequestModel requestModel = new ReportRequestModel();
		requestModel.setEndDate(reportRequestModel.getEndDate());
		String chartOfAccountCodes = getChartOfAccountCategoryCodes("BalanceSheet");
		requestModel.setChartOfAccountCodes(chartOfAccountCodes);
		List<TransactionCategoryClosingBalance> closingBalanceList =
				transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);

		if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
			Map<Integer,TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap =
					processTransactionCategoryClosingBalance(closingBalanceList);
			BigDecimal totalCurrentAssets = BigDecimal.ZERO;
			BigDecimal totalAccumulatedDepriciation = BigDecimal.ZERO;
			BigDecimal totalOtherCurrentAssets = BigDecimal.ZERO;
			BigDecimal totalFixedAssets = BigDecimal.ZERO;
			BigDecimal totalAccountReceivable =BigDecimal.ZERO;
			BigDecimal totalAccountPayable =BigDecimal.ZERO;
			BigDecimal totalOtherCurrentLiability = BigDecimal.ZERO;
			BigDecimal totalOtherLiability = BigDecimal.ZERO;
			BigDecimal totalEquities = BigDecimal.ZERO;
//Profit and Loss
			BigDecimal totalOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalCostOfGoodsSold = BigDecimal.ZERO;
			BigDecimal totalOperatingExpense = BigDecimal.ZERO;

			BigDecimal totalNonOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalNonOperatingExpense = BigDecimal.ZERO;

			BigDecimal equityOffset = BigDecimal.ZERO;
			BigDecimal openingBalanceOffsetAsset = BigDecimal.ZERO;
			BigDecimal openingBalanceOffsetLiabilities = BigDecimal.ZERO;

			BigDecimal totalBank = BigDecimal.ZERO;

			BigDecimal retainedEarnings = BigDecimal.ZERO;
			BigDecimal totalRetainedEarnings = BigDecimal.ZERO;

			LocalDateTime startDate = dateUtil.getDateStrAsLocalDateTime(reportRequestModel.getStartDate(), CommonColumnConstants.DD_MM_YYYY);

			for (Map.Entry<Integer,TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
				TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
				String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory()
						.getChartOfAccount().getChartOfAccountCode();
				String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
				BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();

				switch (transactionCategoryName) {
					case OPENING_BALANCE_OFFSET_ASSETS:

						if (closingBalance.longValue() < 0)
							openingBalanceOffsetAsset = openingBalanceOffsetAsset.add(closingBalance.negate());
						else
							openingBalanceOffsetAsset = openingBalanceOffsetAsset.add(closingBalance);
						continue;
					case OPENING_BALANCE_OFFSET_LIABILITIES:
						if (closingBalance.longValue() < 0)
							openingBalanceOffsetLiabilities = openingBalanceOffsetLiabilities.add(closingBalance.negate());
						else
							openingBalanceOffsetLiabilities = openingBalanceOffsetLiabilities.add(closingBalance);
						continue;
					default:
				}

				boolean isNegative = false;
				if (closingBalance.longValue() < 0 && !transactionCategoryName.equalsIgnoreCase("RETAINED_EARNINGS") &&
						!transactionCategoryName.equalsIgnoreCase("Commission Paid") &&
						!transactionCategoryName.equalsIgnoreCase("Cost of Goods Sold") &&
						!transactionCategoryName.equalsIgnoreCase("Equipment Hire") &&
						!transactionCategoryName.equalsIgnoreCase("Materials") &&
						!transactionCategoryName.equalsIgnoreCase("Subcontractor Costs")) {
					closingBalance = closingBalance.negate();
					isNegative=true;
				}
				if (closingBalance.longValue() == 0)
					continue;
				ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum =
						ChartOfAccountCategoryCodeEnum.getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
				if (chartOfAccountCategoryCodeEnum == null)
					continue;

				LocalDateTime closingBalanceDate = transactionCategoryClosingBalance.getClosingBalanceDate();
				if (startDate != null && closingBalanceDate.isBefore(startDate)) {

					BigDecimal retainedEarningsIncome = BigDecimal.ZERO;
					BigDecimal retainedEarningsExpense = BigDecimal.ZERO;

					if (chartOfAccountCategoryCodeEnum.equals(ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD)) {
						retainedEarningsExpense = retainedEarningsExpense.add(closingBalance);
						closingBalance = BigDecimal.ZERO;
					}
					else if (chartOfAccountCategoryCodeEnum.equals(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE) ||
							chartOfAccountCategoryCodeEnum.equals(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE)) {
						if (isNegative)
							retainedEarningsExpense = retainedEarningsExpense.subtract(closingBalance);
						else
							retainedEarningsExpense = retainedEarningsExpense.add(closingBalance);
						closingBalance = BigDecimal.ZERO;
					} else if (chartOfAccountCategoryCodeEnum.equals(ChartOfAccountCategoryCodeEnum.INCOME)) {
						if (!isNegative)
							closingBalance = closingBalance.negate();
						retainedEarningsIncome = retainedEarningsIncome.add(closingBalance);
						closingBalance = BigDecimal.ZERO;
					}
					retainedEarnings = retainedEarningsIncome.subtract(retainedEarningsExpense);
					totalEquities = totalEquities.add(retainedEarnings);
					totalRetainedEarnings = totalRetainedEarnings.add(retainedEarnings);
				}

				switch (chartOfAccountCategoryCodeEnum) {
					case CASH:
					case CURRENT_ASSET:
					case STOCK:
						if (isNegative)
							closingBalance = closingBalance.negate();
						balanceSheetResponseModel.getCurrentAssets().put(transactionCategoryName,closingBalance);
						totalCurrentAssets = totalCurrentAssets.add(closingBalance);
						break;

					case BANK:
						if (isNegative)
							closingBalance = closingBalance.negate();
						balanceSheetResponseModel.getBank().put(transactionCategoryName,closingBalance);
						totalBank = totalBank.add(closingBalance);
						break;

					case ACCOUNTS_RECEIVABLE:
						if (isNegative)
							closingBalance = closingBalance.negate();
						totalAccountReceivable = totalAccountReceivable.add(closingBalance);
						break;

					case FIXED_ASSET:
						if (isNegative)
							closingBalance = closingBalance.negate();
						balanceSheetResponseModel.getFixedAssets().put(transactionCategoryName,closingBalance);
						if (transactionCategoryName.contains("Depreciation")) {
							totalAccumulatedDepriciation= totalAccumulatedDepriciation.add(closingBalance);
						}
						totalFixedAssets = totalFixedAssets.add(closingBalance);
						break;

					case OTHER_CURRENT_ASSET:
						if (isNegative)
							closingBalance = closingBalance.negate();
						balanceSheetResponseModel.getOtherCurrentAssets().put(transactionCategoryName,closingBalance);
						totalOtherCurrentAssets = totalOtherCurrentAssets.add(closingBalance);
						break;

					case OTHER_LIABILITY:
						if (!isNegative)
							closingBalance = closingBalance.negate();
						balanceSheetResponseModel.getOtherLiability().put(transactionCategoryName,closingBalance);
						totalOtherLiability = totalOtherLiability.add(closingBalance);
						break;

					case ACCOUNTS_PAYABLE:
						if (!isNegative)
							closingBalance = closingBalance.negate();
						totalAccountPayable = totalAccountPayable.add(closingBalance);
						break;

					case OTHER_CURRENT_LIABILITIES:
						if (!isNegative)
							closingBalance = closingBalance.negate();
						balanceSheetResponseModel.getOtherCurrentLiability().put(transactionCategoryName,closingBalance);
						totalOtherCurrentLiability = totalOtherCurrentLiability.add(closingBalance);
						break;

					case EQUITY:
						if (!isNegative && transactionCategoryName.equalsIgnoreCase("RETAINED_EARNINGS"))
							closingBalance = closingBalance.negate();
						balanceSheetResponseModel.getEquities().put(transactionCategoryName,closingBalance);
						totalEquities = totalEquities.add(closingBalance);
						break;

					case INCOME:
						if (!isNegative)
							closingBalance = closingBalance.negate();
						if (transactionCategoryName.equalsIgnoreCase("Sales") ||
								transactionCategoryName.equalsIgnoreCase("OTHER_CHARGES")) {
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						} else {
							totalNonOperatingIncome = totalNonOperatingIncome.add(closingBalance);
						}
						break;

					case ADMIN_EXPENSE:
						if (isNegative)
							totalOperatingExpense = totalOperatingExpense.subtract(closingBalance);
						else
							totalOperatingExpense = totalOperatingExpense.add(closingBalance);
						break;

					case OTHER_EXPENSE:
						if (isNegative)
							totalNonOperatingExpense = totalNonOperatingExpense.subtract(closingBalance);
						else
							totalNonOperatingExpense = totalNonOperatingExpense.add(closingBalance);
						break;

					case COST_OF_GOODS_SOLD:
						totalCostOfGoodsSold = totalCostOfGoodsSold.add(closingBalance);
						break;

					default:
						break;
				}
			}

			if (transactionCategoryClosingBalanceMap.containsKey(65)) {
				BigDecimal existingRetainedEarnings = balanceSheetResponseModel.getEquities()
						.getOrDefault("RETAINED_EARNINGS", BigDecimal.ZERO);
				balanceSheetResponseModel.getEquities().put("RETAINED_EARNINGS", existingRetainedEarnings.add(totalRetainedEarnings));
			} else {
				balanceSheetResponseModel.getEquities().put("RETAINED_EARNINGS", totalRetainedEarnings);
			}

			equityOffset = openingBalanceOffsetLiabilities.subtract(openingBalanceOffsetAsset);
			if (equityOffset.longValue()<0) {
				equityOffset = equityOffset.negate();
				balanceSheetResponseModel.getCurrentAssets().put("OPENING_BALANCE_EQUITY_OFFSET", equityOffset);
				totalCurrentAssets = totalCurrentAssets.add(equityOffset);
			}
			else if (equityOffset.longValue()!=0) {
				balanceSheetResponseModel.getEquities().put("OPENING_BALANCE_EQUITY_OFFSET", equityOffset);
				totalEquities = totalEquities.add(equityOffset);
			}
			balanceSheetResponseModel.setTotalBank(totalBank);
			totalCurrentAssets = totalCurrentAssets.add(totalAccountReceivable).add(totalOtherCurrentAssets).add(totalBank);
			balanceSheetResponseModel.setTotalCurrentAssets(totalCurrentAssets);
			balanceSheetResponseModel.setTotalAccountReceivable(totalAccountReceivable);
			balanceSheetResponseModel.setTotalOtherCurrentAssets(totalOtherCurrentAssets);
			totalFixedAssets=totalFixedAssets.subtract(totalAccumulatedDepriciation);
			balanceSheetResponseModel.setTotalFixedAssets(totalFixedAssets);
			BigDecimal totalAssets = totalCurrentAssets.add(totalFixedAssets);
			balanceSheetResponseModel.setTotalAssets(totalAssets);
			BigDecimal totalIncome = totalOperatingIncome.add(totalNonOperatingIncome);
			BigDecimal totalExpense = totalCostOfGoodsSold.add(totalOperatingExpense).add(totalNonOperatingExpense);
			BigDecimal netProfitLoss = totalIncome.subtract(totalExpense);
			balanceSheetResponseModel.getEquities().put("Earnings",netProfitLoss);
			totalEquities = totalEquities.add(netProfitLoss);
			balanceSheetResponseModel.setTotalOtherLiability(totalOtherLiability);
			balanceSheetResponseModel.setTotalOtherCurrentLiability(totalOtherCurrentLiability);
			BigDecimal totalLiabilities = totalOtherLiability.add(totalOtherCurrentLiability).add(totalAccountPayable);
			balanceSheetResponseModel.setTotalLiability(totalLiabilities);
			balanceSheetResponseModel.setTotalAccountPayable(totalAccountPayable);
			balanceSheetResponseModel.setTotalEquities(totalEquities);
			BigDecimal totalLiabilityEquities =totalLiabilities.add(totalEquities);
			balanceSheetResponseModel.setTotalLiabilityEquities(totalLiabilityEquities);
		}
		return balanceSheetResponseModel;
	}

	public ProfitAndLossResponseModel getProfitAndLossReport(FinancialReportRequestModel reportRequestModel) {

		ProfitAndLossResponseModel responseModel = new ProfitAndLossResponseModel();
		ReportRequestModel requestModel = new ReportRequestModel();
		requestModel.setStartDate(reportRequestModel.getStartDate());
		requestModel.setEndDate(reportRequestModel.getEndDate());
		String chartOfAccountCodes = getChartOfAccountCategoryCodes("ProfitLoss");
		requestModel.setChartOfAccountCodes(chartOfAccountCodes);
		List<TransactionCategoryClosingBalance> closingBalanceList =
				transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);

		if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
			Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap =
					processTransactionCategoryClosingBalance(closingBalanceList);
			BigDecimal totalOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalCostOfGoodsSold = BigDecimal.ZERO;
			BigDecimal totalOperatingExpense = BigDecimal.ZERO;

			BigDecimal totalNonOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalNonOperatingExpense = BigDecimal.ZERO;

			for (Map.Entry<Integer, TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
				TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
				String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory()
						.getChartOfAccount().getChartOfAccountCode();
				String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
				BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();
				ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.
						getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
				if (chartOfAccountCategoryCodeEnum == null)
					continue;
				boolean isNegative = false;
				if (closingBalance.longValue() < 0) {
					closingBalance = closingBalance.negate();
					isNegative=true;
				}
				switch (chartOfAccountCategoryCodeEnum) {
					case INCOME:
						if (transactionCategoryName.equalsIgnoreCase("Sales") ||
								transactionCategoryName.equalsIgnoreCase("OTHER_CHARGES") ||
								transactionCategoryName.equalsIgnoreCase("Interest Income")) {
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						} else {
							responseModel.getNonOperatingIncome().put(transactionCategoryName, closingBalance);
							totalNonOperatingIncome = totalNonOperatingIncome.add(closingBalance);
						}
						break;
					case ADMIN_EXPENSE:
						responseModel.getOperatingExpense().put(transactionCategoryName, closingBalance);
						if (isNegative)
							totalOperatingExpense = totalOperatingExpense.subtract(closingBalance);
						else
							totalOperatingExpense = totalOperatingExpense.add(closingBalance);
						break;

					case OTHER_EXPENSE:
						responseModel.getNonOperatingExpense().put(transactionCategoryName, closingBalance);
						responseModel.getOperatingExpense().put(transactionCategoryName, closingBalance);
						if (isNegative)
							totalNonOperatingExpense = totalNonOperatingExpense.subtract(closingBalance);
						else
							totalNonOperatingExpense = totalNonOperatingExpense.add(closingBalance);
						break;

					case COST_OF_GOODS_SOLD:
						responseModel.getCostOfGoodsSold().put(transactionCategoryName, closingBalance);
						totalCostOfGoodsSold = totalCostOfGoodsSold.add(closingBalance);
						break;
					default:
						break;
				}
			}
			responseModel.setTotalOperatingIncome(totalOperatingIncome.subtract(totalNonOperatingIncome));
			responseModel.setTotalCostOfGoodsSold(totalCostOfGoodsSold);

			BigDecimal grossProfit = totalOperatingIncome.subtract(totalNonOperatingIncome).subtract(totalCostOfGoodsSold);
			responseModel.setGrossProfit(grossProfit);

			responseModel.setTotalOperatingExpense(totalOperatingExpense.add(totalNonOperatingExpense));

			BigDecimal operatingProfit = grossProfit.subtract(totalOperatingExpense);
			responseModel.setOperatingProfit(operatingProfit);

			responseModel.setTotalNonOperatingIncome(totalNonOperatingIncome);
			responseModel.setTotalNonOperatingExpense(totalNonOperatingExpense);
			BigDecimal totalNonOperatingIncomeLoss = BigDecimal.ZERO;
			if (totalNonOperatingExpense.longValue() < 0) {
				totalNonOperatingIncomeLoss = totalNonOperatingIncome.add(totalNonOperatingExpense);
			} else
				totalNonOperatingIncomeLoss = totalNonOperatingIncome.subtract(totalNonOperatingExpense);
			responseModel.setNonOperatingIncomeExpense(totalNonOperatingIncomeLoss);

			BigDecimal netProfitLoss = totalOperatingIncome.subtract(totalNonOperatingIncome).subtract(totalCostOfGoodsSold)
					.subtract(totalOperatingExpense.add(totalNonOperatingExpense));
			responseModel.setNetProfitLoss(netProfitLoss);
		}
		return responseModel;
	}

	public String getChartOfAccountCategoryCodes(String chartOfAccountType) {
		StringBuilder builder = new StringBuilder();
		switch (chartOfAccountType) {
			case "ProfitLoss":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.INCOME.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode()).append("'");
				break;
			case "BalanceSheet":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_RECEIVABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.BANK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CASH.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.FIXED_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.STOCK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_PAYABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_LIABILITY.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.EQUITY.getCode()).append("',");
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.INCOME.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode()).append("'");
				break;
			case "TrailBalance":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.INCOME.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_RECEIVABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.BANK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CASH.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.FIXED_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.STOCK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_PAYABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_LIABILITY.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.EQUITY.getCode()).append("'");
				break;
			case "VatReport":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES.getCode()).append("'");
				break;
			case "VatExpenseReport":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode()).append("'");
				break;
			case "CashFlow":
				builder.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_RECEIVABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CASH.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.FIXED_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.STOCK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ACCOUNTS_PAYABLE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_LIABILITY.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.EQUITY.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.INCOME.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.STOCK.getCode()).append("',")
						.append("'").append(ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode()).append("'");
				break;
			default:
				break;
		}
		return builder.toString();
	}

	public TrialBalanceResponseModel getTrialBalanceReport(FinancialReportRequestModel reportRequestModel) {
		TrialBalanceResponseModel trialBalanceResponseModel = new TrialBalanceResponseModel();
		ReportRequestModel requestModel = new ReportRequestModel();
		requestModel.setEndDate(reportRequestModel.getEndDate());
		String chartOfAccountCodes = getChartOfAccountCategoryCodes("TrailBalance");
		requestModel.setChartOfAccountCodes(chartOfAccountCodes);
		List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService
				.getListByChartOfAccountIds(requestModel);

		if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
			Map<Integer,TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap =
					processTransactionCategoryClosingBalance(closingBalanceList);
			BigDecimal totalDebitAmount = BigDecimal.ZERO;
			BigDecimal totalCreditAmount = BigDecimal.ZERO;
			BigDecimal totalStocks = BigDecimal.ZERO;

			for (Map.Entry<Integer,TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
				TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
				String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory()
						.getChartOfAccount().getChartOfAccountCode();
				String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
				BigDecimal closingBalance = transactionCategoryClosingBalance.getClosingBalance();

				String type = "Debit";
				boolean transactionTypeDebitFlag = true;
				if (closingBalance.longValue() < 0) {
					transactionTypeDebitFlag = false;
					closingBalance = closingBalance.negate();
					type = "Credit";
				}
				ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.
						getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
				if (chartOfAccountCategoryCodeEnum == null)
					continue;
				switch (chartOfAccountCategoryCodeEnum)
				{
					case ACCOUNTS_RECEIVABLE:
						trialBalanceResponseModel.getAccountReceivable().put(transactionCategoryName,
								closingBalance);
						trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, type);
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						else
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						break;
					case BANK:
					case CASH:
						trialBalanceResponseModel.getBank().put(transactionCategoryName,
								closingBalance);
						trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, type);
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						else
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						break;
					case CURRENT_ASSET:
					case STOCK:
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(totalStocks);
						else
							totalCreditAmount = totalCreditAmount.add(totalStocks);
						break;
					case OTHER_CURRENT_ASSET:
						trialBalanceResponseModel.getAssets().put(transactionCategoryName,
								closingBalance);
						trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, type);
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						else
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						break;
					case FIXED_ASSET:
						trialBalanceResponseModel.getFixedAsset().put(transactionCategoryName,
								closingBalance);
						trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, type);
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						else
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						break;

					case ACCOUNTS_PAYABLE:
						trialBalanceResponseModel.getAccountpayable().put(transactionCategoryName,
								closingBalance);
						trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, type);
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						else
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						break;
					case OTHER_LIABILITY:
					case OTHER_CURRENT_LIABILITIES:
						trialBalanceResponseModel.getLiabilities().put(transactionCategoryName,
								closingBalance);
						trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, type);
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						else
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						break;
					case EQUITY:
						trialBalanceResponseModel.getEquities().put(transactionCategoryName,closingBalance);

						if (transactionTypeDebitFlag&&transactionCategoryName.equalsIgnoreCase("OPENING_BALANCE_EQUITY_OFFSET")||
								transactionTypeDebitFlag&&transactionCategoryName.contains("Owners Drawing")||
								transactionTypeDebitFlag&&transactionCategoryName.contains("Dividend")||
								transactionTypeDebitFlag&&transactionCategoryName.contains("Share Premium")||
								transactionTypeDebitFlag&&transactionCategoryName.contains("Owners Equity")||
								transactionTypeDebitFlag&&transactionCategoryName.contains("Owners Capital")||
								transactionTypeDebitFlag&&transactionCategoryName.contains("RETAINED_EARNINGS")||
								transactionTypeDebitFlag&&transactionCategoryName.contains("Owners Current Account"))
						{
							totalDebitAmount = totalDebitAmount.add(closingBalance);
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Debit");
						} else {
							totalCreditAmount = totalCreditAmount.add(closingBalance);
							trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, "Credit");
						}
						break;
					case INCOME:
						trialBalanceResponseModel.getIncome().put(transactionCategoryName,
								closingBalance);
						trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, type);
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						else
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						break;
					case ADMIN_EXPENSE:
					case OTHER_EXPENSE:
					case COST_OF_GOODS_SOLD:
						trialBalanceResponseModel.getExpense().put(transactionCategoryName,closingBalance);
						trialBalanceResponseModel.getTransactionCategoryMapper().put(transactionCategoryName, type);
						if (transactionTypeDebitFlag)
							totalDebitAmount = totalDebitAmount.add(closingBalance);
						else
							totalCreditAmount = totalCreditAmount.add(closingBalance);
						break;
					default:
						break;
				}
			}
			trialBalanceResponseModel.setTotalCreditAmount(totalCreditAmount);
			trialBalanceResponseModel.setTotalDebitAmount(totalDebitAmount);

		}
		return trialBalanceResponseModel;
	}

	public Map<Integer, TransactionCategoryClosingBalance> processTransactionCategoryClosingBalance
			(List<TransactionCategoryClosingBalance> closingBalanceList) {

		Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = new HashMap<>();
		for (TransactionCategoryClosingBalance transactionCategoryClosingBalance :closingBalanceList) {
			TransactionCategoryClosingBalance tempTransactionCategoryClosingBalance =
					transactionCategoryClosingBalanceMap.get(transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryId());

			if (tempTransactionCategoryClosingBalance == null) {
				tempTransactionCategoryClosingBalance = new TransactionCategoryClosingBalance();
				tempTransactionCategoryClosingBalance.setOpeningBalance(transactionCategoryClosingBalance.getOpeningBalance());
				tempTransactionCategoryClosingBalance.setClosingBalance(transactionCategoryClosingBalance.getClosingBalance());
				tempTransactionCategoryClosingBalance.setClosingBalanceDate(transactionCategoryClosingBalance.getClosingBalanceDate());
				tempTransactionCategoryClosingBalance.setTransactionCategory(transactionCategoryClosingBalance.getTransactionCategory());
				transactionCategoryClosingBalanceMap.put(transactionCategoryClosingBalance.getTransactionCategory()
						.getTransactionCategoryId(),tempTransactionCategoryClosingBalance);
			}
			else
				tempTransactionCategoryClosingBalance.setOpeningBalance(transactionCategoryClosingBalance.getOpeningBalance());
			tempTransactionCategoryClosingBalance.setCreatedDate(Date.from(transactionCategoryClosingBalance
					.getClosingBalanceDate().atZone(ZoneId.systemDefault()).toInstant()));
		}
		return transactionCategoryClosingBalanceMap;
	}

	public  VatReportResponseModel getVatReturnReport(FinancialReportRequestModel financialReportRequestModel){
		VatReportResponseModel vatReportResponseModel = new VatReportResponseModel();
		initDefaultValue(vatReportResponseModel);
		ReportRequestModel reportRequestModel = new ReportRequestModel();
		// Check the end date getting call
		reportRequestModel.setStartDate(financialReportRequestModel.getStartDate());
		reportRequestModel.setEndDate(financialReportRequestModel.getEndDate());
		invoiceService.getSumOfTotalAmountWithVat(reportRequestModel,vatReportResponseModel);
		invoiceService.sumOfTotalAmountWithoutVat(reportRequestModel,vatReportResponseModel);
		expenseService.sumOfTotalExpensesWithVat(reportRequestModel,vatReportResponseModel);
		sumOfTotalStandardRated(reportRequestModel,vatReportResponseModel);
		invoiceService.getSumOfTotalAmountWithVatForRCM(reportRequestModel,vatReportResponseModel);
		invoiceService.sumOfTotalAmountWithoutVatForRCM(reportRequestModel,vatReportResponseModel);
		transactionCategoryClosingBalanceService.sumOfTotalAmountExce(financialReportRequestModel,vatReportResponseModel);
		List<VatReportModel> list = transactionCategoryClosingBalanceService.getListByPlaceOfSupply(financialReportRequestModel);
         if(list==null)
         	return vatReportResponseModel;
		 for(VatReportModel vatReportModel : list)
		 {
			 vatReportResponseModel.setTotalAmount(vatReportResponseModel.getTotalAmount().add(vatReportModel.getTotalAmount()));
			 vatReportResponseModel.setTotalVatAmount(vatReportResponseModel.getTotalVatAmount().add(vatReportModel.getTotalVatAmount()));
		 	switch (vatReportModel.getPlaceOfSupplyId()){
		 		//For AbuDhabi
				case 1:
					vatReportResponseModel.setTotalVatForAbuDhabi(vatReportModel.getTotalVatAmount());
					vatReportResponseModel.setTotalAmountForAbuDhabi(vatReportModel.getTotalAmount().subtract(vatReportModel.getTotalVatAmount()));
					vatReportResponseModel.setNameForAbuDhabi(vatReportModel.getPlaceOfSupplyName());
					break;
				// Dubai
				case 2:

					vatReportResponseModel.setTotalAmountForDubai(vatReportModel.getTotalAmount().subtract(vatReportModel.getTotalVatAmount()));
					vatReportResponseModel.setTotalVatForDubai(vatReportModel.getTotalVatAmount());
					vatReportResponseModel.setNameForDubai(vatReportModel.getPlaceOfSupplyName());
					break;
				// Sharjah
				case 3:
					vatReportResponseModel.setTotalAmountForSharjah(vatReportModel.getTotalAmount().subtract(vatReportModel.getTotalVatAmount()));
					vatReportResponseModel.setTotalVatForSharjah(vatReportModel.getTotalVatAmount());
					vatReportResponseModel.setNameForSharjah(vatReportModel.getPlaceOfSupplyName());
					break;
				case 4:
				// Ajman
					vatReportResponseModel.setTotalAmountForAjman(vatReportModel.getTotalAmount().subtract(vatReportModel.getTotalVatAmount()));
					vatReportResponseModel.setTotalVatForAjman(vatReportModel.getTotalVatAmount());
					vatReportResponseModel.setNameForAjman(vatReportModel.getPlaceOfSupplyName());
					break;
				case 5:
				// Umm Al Quwain
					vatReportResponseModel.setTotalAmountForUmmAlQuwain(vatReportModel.getTotalAmount().subtract(vatReportModel.getTotalVatAmount()));
					vatReportResponseModel.setTotalVatForUmmAlQuwain(vatReportModel.getTotalVatAmount());
					vatReportResponseModel.setNameForUmmAlQuwain(vatReportModel.getPlaceOfSupplyName());
					break;
				case 6:
				//  Ras Al Khalmah
					vatReportResponseModel.setTotalAmountForRasAlKhalmah(vatReportModel.getTotalAmount().subtract(vatReportModel.getTotalVatAmount()));
					vatReportResponseModel.setTotalVatForRasAlKhalmah(vatReportModel.getTotalVatAmount());
					vatReportResponseModel.setNameForRasAlKhalmah(vatReportModel.getPlaceOfSupplyName());
					break;
				case 7:
				//  Fujairah
					vatReportResponseModel.setTotalAmountForFujairah(vatReportModel.getTotalAmount().subtract(vatReportModel.getTotalVatAmount()));
					vatReportResponseModel.setTotalVatForFujairah(vatReportModel.getTotalVatAmount());
					vatReportResponseModel.setNameForFujairah(vatReportModel.getPlaceOfSupplyName());
					break;
				default:
					// Unknown place of supply ID - no action needed
					break;
		 	}

		 }

		 vatReportResponseModel.setTotalVatAmount(vatReportResponseModel.getTotalVatAmount().add(vatReportResponseModel.getReverseChargeProvisionsVatAmount()!=null ? vatReportResponseModel.getReverseChargeProvisionsVatAmount():BigDecimal.ZERO));
		 //Total value of due tax for the period
		vatReportResponseModel.setZeroRatedSupplies(vatReportResponseModel.getZeroRatedSupplies());
		if (vatReportResponseModel.getZeroRatedSupplies()!=null)
		vatReportResponseModel.setTotalAmount(vatReportResponseModel.getTotalAmount().add(vatReportResponseModel.getZeroRatedSupplies()));
		vatReportResponseModel.setExemptSupplies(vatReportResponseModel.getExemptSupplies());
		if (vatReportResponseModel.getExemptSupplies()!=null)
		vatReportResponseModel.setTotalAmount(vatReportResponseModel.getTotalAmount().add(vatReportResponseModel.getExemptSupplies()));
		vatReportResponseModel.setTotalValueOfDueTaxForThePeriod(vatReportResponseModel.getTotalVatAmount());

		BigDecimal supplierVatTotal = BigDecimal.ZERO;
		BigDecimal debitNoteSalesVat = BigDecimal.ZERO;
		if(vatReportResponseModel.getDebitNoteSalesVat()!=null){
			debitNoteSalesVat = vatReportResponseModel.getDebitNoteSalesVat();
		}
		if (vatReportResponseModel.getTotalVatAmountForExpense()!=null && vatReportResponseModel.getTotalVatAmountForSupplierInvoice()!=null) {
			 supplierVatTotal = vatReportResponseModel.getTotalVatAmountForExpense()
					.add(vatReportResponseModel.getTotalVatAmountForSupplierInvoice());
			vatReportResponseModel.setStandardRatedExpensesVatAmount(supplierVatTotal.subtract(debitNoteSalesVat));
		}
		BigDecimal debitNoteSales = BigDecimal.ZERO;
		if(vatReportResponseModel.getDebitNoteSales()!=null){
			debitNoteSales = vatReportResponseModel.getDebitNoteSales();
		}
		if(vatReportResponseModel.getTotalAmountWithVatForSupplierInvoice()!=null && vatReportResponseModel.getTotalAmountForExpense()!=null) {
			vatReportResponseModel.setStandardRatedExpensesTotalAmount((vatReportResponseModel.getTotalAmountWithVatForSupplierInvoice()
					.add(vatReportResponseModel.getTotalAmountForExpense().subtract(debitNoteSales))));
		}
			vatReportResponseModel.setTotalAmountVatOnExpensesAndAllOtherInputs(vatReportResponseModel.getStandardRatedExpensesTotalAmount());
		// Supplies subject to the reverse charge provisions
		if(vatReportResponseModel.getReverseChargeProvisionsVatAmount()!= null){
			vatReportResponseModel.setReverseChargeProvisionsVatAmount(vatReportResponseModel.getReverseChargeProvisionsVatAmount());
			vatReportResponseModel.setTotalAmount(vatReportResponseModel.getTotalAmount().add(vatReportResponseModel.getReverseChargeProvisionsVatAmount()!=null ? vatReportResponseModel.getReverseChargeProvisionsVatAmount():BigDecimal.ZERO));

		}
		if(vatReportResponseModel.getReverseChargeProvisionsTotalAmount()!=null){
			vatReportResponseModel.setReverseChargeProvisionsTotalAmount(vatReportResponseModel.getReverseChargeProvisionsTotalAmount().subtract(vatReportResponseModel.getReverseChargeProvisionsVatAmount()!=null ? vatReportResponseModel.getReverseChargeProvisionsVatAmount():BigDecimal.ZERO));
			vatReportResponseModel.setTotalAmount(vatReportResponseModel.getTotalAmount().add(vatReportResponseModel.getReverseChargeProvisionsTotalAmount()!=null ? vatReportResponseModel.getReverseChargeProvisionsTotalAmount():BigDecimal.ZERO));
			vatReportResponseModel.setTotalAmountVatOnExpensesAndAllOtherInputs((vatReportResponseModel.getTotalAmountVatOnExpensesAndAllOtherInputs().add(vatReportResponseModel.getReverseChargeProvisionsTotalAmount())));

		}

		    if (vatReportResponseModel.getTotalVatAmountForExpense()!=null && vatReportResponseModel.getTotalVatAmountForSupplierInvoice()!=null) {
				vatReportResponseModel.setTotalValueOfRecoverableTaxForThePeriod(vatReportResponseModel.getTotalVatAmountForExpense()
						.add(vatReportResponseModel.getTotalVatAmountForSupplierInvoice().add(vatReportResponseModel.getReverseChargeProvisionsVatAmount()!=null ? vatReportResponseModel.getReverseChargeProvisionsVatAmount():BigDecimal.ZERO)).subtract(debitNoteSalesVat));
			}
		    //Net VAT payable (or reclaimable) for the period
		    if (vatReportResponseModel.getStandardRatedExpensesVatAmount()!=null && vatReportResponseModel.getTotalValueOfRecoverableTaxForThePeriod()!=null) {
				vatReportResponseModel.setNetVatPayableOrReclaimableForThePeriod(vatReportResponseModel.
						getTotalValueOfDueTaxForThePeriod().subtract(vatReportResponseModel.
						getTotalValueOfRecoverableTaxForThePeriod()));
			}
			vatReportResponseModel.setTotalAmount(vatReportResponseModel.getTotalAmount().subtract(vatReportResponseModel.getTotalVatAmount()));

		return vatReportResponseModel;
	}

	private void initDefaultValue(VatReportResponseModel vatReportResponseModel) {
		vatReportResponseModel.setTotalAmountForUmmAlQuwain(BigDecimal.ZERO);
		vatReportResponseModel.setTotalVatForUmmAlQuwain(BigDecimal.ZERO);
		vatReportResponseModel.setTotalAmountForAbuDhabi(BigDecimal.ZERO);
		vatReportResponseModel.setTotalVatForAbuDhabi(BigDecimal.ZERO);
		vatReportResponseModel.setTotalAmountForAjman(BigDecimal.ZERO);
		vatReportResponseModel.setTotalVatForAjman(BigDecimal.ZERO);
		vatReportResponseModel.setTotalAmountForFujairah(BigDecimal.ZERO);
		vatReportResponseModel.setTotalVatForFujairah(BigDecimal.ZERO);
		vatReportResponseModel.setTotalAmountForRasAlKhalmah(BigDecimal.ZERO);
		vatReportResponseModel.setTotalVatForRasAlKhalmah(BigDecimal.ZERO);
		vatReportResponseModel.setTotalAmountForSharjah(BigDecimal.ZERO);
		vatReportResponseModel.setTotalVatForSharjah(BigDecimal.ZERO);
		vatReportResponseModel.setTotalAmountForDubai(BigDecimal.ZERO);
		vatReportResponseModel.setTotalVatForDubai(BigDecimal.ZERO);
		vatReportResponseModel.setTotalVatAmount(BigDecimal.ZERO);
		vatReportResponseModel.setTotalAmount(BigDecimal.ZERO);
		vatReportResponseModel.setTotalAmountVatOnExpensesAndAllOtherInputs(BigDecimal.ZERO);
	}

	public CashFlowResponseModel getCashFlowReport(FinancialReportRequestModel reportRequestModel) {

		CashFlowResponseModel responseModel = new CashFlowResponseModel();
		ReportRequestModel requestModel = new ReportRequestModel();
		requestModel.setStartDate(reportRequestModel.getStartDate());
		requestModel.setEndDate(reportRequestModel.getEndDate());
		String chartOfAccountCodes = getChartOfAccountCategoryCodes("CashFlow");
		requestModel.setChartOfAccountCodes(chartOfAccountCodes);
		List<TransactionCategoryClosingBalance> closingBalanceList = transactionCategoryClosingBalanceService.getListByChartOfAccountIds(requestModel);

		String startDateText = reportRequestModel.getStartDate();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		LocalDate startDate = LocalDate.parse(startDateText, formatter);
// Calculate the previous month and year
		LocalDate previousMonthYear = startDate.minusMonths(1);

		int previousYear = previousMonthYear.getYear();
		String previousMonth = String.valueOf(previousMonthYear.getMonthValue());
		String lastMonth = previousYear + "-" + previousMonth;

		if (closingBalanceList != null && !closingBalanceList.isEmpty()) {
			Map<Integer, TransactionCategoryClosingBalance> transactionCategoryClosingBalanceMap = processTransactionCategoryClosingBalance(closingBalanceList);
			BigDecimal totalOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalCostOfGoodsSold = BigDecimal.ZERO;
			BigDecimal totalOperatingExpense = BigDecimal.ZERO;
			BigDecimal totalInvestingActivities = BigDecimal.ZERO;
			BigDecimal totalFinancingActivities = BigDecimal.ZERO;
			BigDecimal totalNonOperatingIncome = BigDecimal.ZERO;
			BigDecimal totalNonOperatingExpense = BigDecimal.ZERO;
			BigDecimal netIncome = BigDecimal.ZERO;
			BigDecimal closingBalance = BigDecimal.ZERO;
			BigDecimal totalClosingBalance = BigDecimal.ZERO;
			BigDecimal startingBalance = BigDecimal.ZERO;
			BigDecimal grossCashInflow = BigDecimal.ZERO;
			BigDecimal grossCashOutflow = BigDecimal.ZERO;
			BigDecimal netCashChange = BigDecimal.ZERO;
			BigDecimal endingBalance = BigDecimal.ZERO;
			totalClosingBalance = transactionCategoryClosingBalanceService.sumOfTotalAmountClosingBalance(reportRequestModel,lastMonth);

			for (Map.Entry<Integer, TransactionCategoryClosingBalance> entry : transactionCategoryClosingBalanceMap.entrySet()) {
				TransactionCategoryClosingBalance transactionCategoryClosingBalance = entry.getValue();
				String transactionCategoryCode = transactionCategoryClosingBalance.getTransactionCategory().getChartOfAccount().getChartOfAccountCode();
				String transactionCategoryName = transactionCategoryClosingBalance.getTransactionCategory().getTransactionCategoryName();
				 closingBalance = transactionCategoryClosingBalance.getClosingBalance();

				LocalDateTime balanceDate = transactionCategoryClosingBalance.getClosingBalanceDate();

//
//				//block to get sum of previous month closing balances

				ChartOfAccountCategoryCodeEnum chartOfAccountCategoryCodeEnum = ChartOfAccountCategoryCodeEnum.
						getChartOfAccountCategoryCodeEnum(transactionCategoryCode);
				if (chartOfAccountCategoryCodeEnum == null)
					continue;
				boolean isNegative = false;
				if (closingBalance.longValue() < 0) {

					isNegative=true;
				}
				switch (chartOfAccountCategoryCodeEnum) {
					case INCOME:
						if (transactionCategoryName.equalsIgnoreCase("Sales Discount") ||
							transactionCategoryName.equalsIgnoreCase("OTHER_CHARGES") ||
									transactionCategoryName.equalsIgnoreCase("Interest Income")

							){
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance).negate();
						} else {
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						}

						if(isNegative) {
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						} else {
							grossCashInflow = grossCashInflow.add(closingBalance);
						}
						break;
					case ACCOUNTS_PAYABLE:
						responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
						totalOperatingIncome = totalOperatingIncome.add(closingBalance);

							grossCashOutflow = grossCashOutflow.add(closingBalance);

						break;
					case ACCOUNTS_RECEIVABLE:
						responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
						totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					case STOCK:
						if (transactionCategoryName.equalsIgnoreCase("Stock")){
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						} else {
							responseModel.getNonOperatingIncome().put(transactionCategoryName, closingBalance);
							totalNonOperatingIncome = totalNonOperatingIncome.add(closingBalance);
						}
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					case OTHER_CURRENT_LIABILITIES:
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					case OTHER_CURRENT_ASSET:
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					case OTHER_LIABILITY:
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					case CURRENT_ASSET:
							responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
							totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					case FIXED_ASSET:
						responseModel.getInvestingActivities().put(transactionCategoryName, closingBalance);
						totalInvestingActivities = totalInvestingActivities.add(closingBalance);
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					case EQUITY:
						responseModel.getFinancingActivities().put(transactionCategoryName, closingBalance);
						totalFinancingActivities = totalFinancingActivities.add(closingBalance);
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					case ADMIN_EXPENSE:
						responseModel.getOperatingExpense().put(transactionCategoryName, closingBalance);
						if(isNegative)
							totalOperatingExpense = totalOperatingExpense.subtract(closingBalance);
						else
							totalOperatingExpense = totalOperatingExpense.add(closingBalance);

						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;

					case OTHER_EXPENSE:
						responseModel.getNonOperatingExpense().put(transactionCategoryName, closingBalance);
						responseModel.getOperatingExpense().put(transactionCategoryName, closingBalance);
						if(isNegative) {
							totalNonOperatingExpense = totalNonOperatingExpense.subtract(closingBalance);
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						}else{
							totalNonOperatingExpense = totalNonOperatingExpense.add(closingBalance);
							grossCashInflow = grossCashInflow.add(closingBalance);
						}

						break;

					case COST_OF_GOODS_SOLD:
						responseModel.getCostOfGoodsSold().put(transactionCategoryName, closingBalance);
						responseModel.getOperatingIncome().put(transactionCategoryName, closingBalance);
						totalOperatingIncome = totalOperatingIncome.add(closingBalance);
						totalCostOfGoodsSold = totalCostOfGoodsSold.add(closingBalance);
						if(isNegative)
							grossCashOutflow = grossCashOutflow.add(closingBalance);
						else
							grossCashInflow = grossCashInflow.add(closingBalance);
						break;
					default:
						break;
				}
			}
			responseModel.setTotalOperatingIncome(totalOperatingIncome.subtract(totalNonOperatingIncome));
			responseModel.setTotalInvestingActivities(totalInvestingActivities);
			responseModel.setTotalFinancingActivities(totalFinancingActivities);
			responseModel.setTotalCostOfGoodsSold(totalCostOfGoodsSold);

			BigDecimal grossProfit = totalOperatingIncome.subtract(totalNonOperatingIncome).subtract(totalCostOfGoodsSold);
			responseModel.setGrossProfit(grossProfit);

			responseModel.setTotalOperatingExpense(totalOperatingExpense.add(totalNonOperatingExpense));

			BigDecimal operatingProfit = grossProfit.subtract(totalOperatingExpense);
			if(operatingProfit!=null) {
				responseModel.setOperatingProfit(operatingProfit);
			}
			else{
				responseModel.setOperatingProfit(BigDecimal.ZERO);
			}

			responseModel.setTotalNonOperatingIncome(totalNonOperatingIncome);
			responseModel.setTotalNonOperatingExpense(totalNonOperatingExpense);
			BigDecimal totalNonOperatingIncomeLoss = BigDecimal.ZERO;
			if(totalNonOperatingExpense.longValue()<0)
			{
				totalNonOperatingIncomeLoss = totalNonOperatingIncome.add(totalNonOperatingExpense);
			}
			else
				totalNonOperatingIncomeLoss = totalNonOperatingIncome.subtract(totalNonOperatingExpense);
			responseModel.setNonOperatingIncomeExpense(totalNonOperatingIncomeLoss);

			BigDecimal netProfitLoss = totalOperatingIncome.subtract(totalNonOperatingIncome).subtract(totalCostOfGoodsSold)
					.subtract(totalOperatingExpense.add(totalNonOperatingExpense));
			responseModel.setNetProfitLoss(netProfitLoss);

			responseModel.setGrossCashInflow(grossCashInflow);

			//block for Gross Cash out Flow
			responseModel.setGrossCashOutflow(grossCashOutflow);

			//below calculation for net Income
			netIncome = netIncome.add(totalOperatingIncome).subtract(totalCostOfGoodsSold).subtract(totalOperatingExpense).subtract(totalNonOperatingExpense);
			responseModel.setNetIncome(netIncome);

			//block for netCash change
			netCashChange = grossCashInflow.subtract(grossCashOutflow);
			responseModel.setNetCashChange(netCashChange);

			if (totalClosingBalance == null) {
				totalClosingBalance = BigDecimal.ZERO;
			}

			responseModel.setStartingBalance(totalClosingBalance);
			endingBalance = totalClosingBalance.add(netCashChange);
			responseModel.setEndingBalance(endingBalance);
		}
		return responseModel;
	}
	public void sumOfTotalStandardRated(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel) {
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		LocalDate startDate = LocalDate.parse(reportRequestModel.getStartDate(), formatter);
		LocalDate endDate = LocalDate.parse(reportRequestModel.getEndDate(), formatter);
        VatReportFiling vatReportFiling = vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(startDate, endDate);
		List<CreditNoteLineItem> creditNoteLineItems = creditNoteLineItemRepository.findAllByDates(startDate,endDate);
		BigDecimal dnDiscountVat1 = BigDecimal.ZERO;
		BigDecimal dnDiscountVat2 = BigDecimal.ZERO;
		BigDecimal dnDiscountVat3 = BigDecimal.ZERO;
		BigDecimal dnDiscountVat4 = BigDecimal.ZERO;

		if(creditNoteLineItems!=null && creditNoteLineItems.size()>0){
			for(CreditNoteLineItem lineItem : creditNoteLineItems) {
				if (lineItem.getCreditNote().getType().equals(13)) {
					//Calculating discount for different vat categories
					if (lineItem.getDiscountType().equals(DiscountType.FIXED) && lineItem.getVatCategory().getId().equals(1)) {
						dnDiscountVat1 = dnDiscountVat1.add(lineItem.getDiscount().multiply(lineItem.getCreditNote().getExchangeRate()));
					}
					if (lineItem.getDiscountType().equals(DiscountType.FIXED) && lineItem.getVatCategory().getId().equals(2)) {
						dnDiscountVat2 = dnDiscountVat2.add(lineItem.getDiscount().multiply(lineItem.getCreditNote().getExchangeRate()));
					}
					if (lineItem.getDiscountType().equals(DiscountType.FIXED) && lineItem.getVatCategory().getId().equals(3)) {
						dnDiscountVat3 = dnDiscountVat3.add(lineItem.getDiscount().multiply(lineItem.getCreditNote().getExchangeRate()));
					}
					if (lineItem.getDiscountType().equals(DiscountType.FIXED) && lineItem.getVatCategory().getId().equals(4)) {
						dnDiscountVat4 = dnDiscountVat4.add(lineItem.getDiscount().multiply(lineItem.getCreditNote().getExchangeRate()));
					}
					if (lineItem.getDiscountType().equals(DiscountType.PERCENTAGE) && lineItem.getVatCategory().getId().equals(1)) {
						dnDiscountVat1 = dnDiscountVat1.add(lineItem.getUnitPrice().multiply(BigDecimal.valueOf(lineItem.getQuantity())).multiply(lineItem.getDiscount().divide(BigDecimal.valueOf(100.00))));
					}
					if (lineItem.getDiscountType().equals(DiscountType.PERCENTAGE) && lineItem.getVatCategory().getId().equals(2)) {
						dnDiscountVat2 = dnDiscountVat2.add(lineItem.getUnitPrice().multiply(BigDecimal.valueOf(lineItem.getQuantity())).multiply(lineItem.getDiscount().divide(BigDecimal.valueOf(100.00))));
					}
					if (lineItem.getDiscountType().equals(DiscountType.PERCENTAGE) && lineItem.getVatCategory().getId().equals(3)) {
						dnDiscountVat3 = dnDiscountVat3.add(lineItem.getUnitPrice().multiply(BigDecimal.valueOf(lineItem.getQuantity())).multiply(lineItem.getDiscount().divide(BigDecimal.valueOf(100.00))));
					}
					if (lineItem.getDiscountType().equals(DiscountType.PERCENTAGE) && lineItem.getVatCategory().getId().equals(4)) {
						dnDiscountVat4 = dnDiscountVat4.add(lineItem.getUnitPrice().multiply(BigDecimal.valueOf(lineItem.getQuantity())).multiply(lineItem.getDiscount().divide(BigDecimal.valueOf(100.00))));
					}
				}
			}

		}
		ZoneOffset offset = ZoneOffset.UTC;
		OffsetDateTime stDate = startDate.atStartOfDay().atOffset(offset);
		OffsetDateTime edDate = endDate.atStartOfDay().atOffset(offset);

		TypedQuery<BigDecimal> debitNote = entityManager.createQuery( "SELECT SUM(il.exciseAmount+il.vatAmount+il.quantity*il.unitPrice*i.exchangeRate) AS TOTAL_AMOUNT " +
				" FROM CreditNote i,CreditNoteLineItem  il WHERE i.status not in(2) AND i.type=13 and i.creditNoteId = il.creditNote.creditNoteId and il.vatCategory.id in (1) AND i.deleteFlag = false AND i.creditNoteDate between :startDate and :endDate",BigDecimal.class);
		debitNote.setParameter("startDate",stDate);
		debitNote.setParameter("endDate",edDate);
		BigDecimal debitNoteSales = BigDecimal.ZERO;
		debitNoteSales	= debitNote.getSingleResult();
		if(dnDiscountVat1!=null && debitNoteSales!=null ){
			debitNoteSales = debitNoteSales.subtract(dnDiscountVat1);
		}
		if(debitNoteSales!=null){
			vatReportResponseModel.setDebitNoteSales(debitNoteSales);
		}

		TypedQuery<BigDecimal> debitNoteVat = entityManager.createQuery( "SELECT SUM(il.vatAmount*i.exchangeRate) AS TOTAL_AMOUNT " +
				" FROM CreditNote i,CreditNoteLineItem  il WHERE i.status not in(2) AND i.type=13 and i.creditNoteId = il.creditNote.creditNoteId and il.vatCategory.id in (1) AND i.deleteFlag = false AND i.creditNoteDate between :startDate and :endDate",BigDecimal.class);
		debitNoteVat.setParameter("startDate",stDate);
		debitNoteVat.setParameter("endDate",edDate);
		BigDecimal debitNoteSalesVat = BigDecimal.ZERO;
		debitNoteSalesVat	= debitNoteVat.getSingleResult();
		if(debitNoteSalesVat!=null){
			vatReportResponseModel.setDebitNoteSalesVat(debitNoteSalesVat);
		}

	}
}
