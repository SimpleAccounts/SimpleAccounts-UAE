package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.*;
import com.simpleaccounts.constant.dbfilter.DbFilter;

import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.financialreport.CreditDebitAggregator;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRequestModel;

import com.simpleaccounts.rest.taxescontroller.TaxesFilterEnum;
import com.simpleaccounts.rest.taxescontroller.TaxesFilterModel;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.JournalLineItemDao;
import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.utils.DateFormatUtil;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.persistence.ParameterMode;
import javax.persistence.Query;
import javax.persistence.StoredProcedureQuery;
import javax.persistence.TypedQuery;

import org.springframework.transaction.annotation.Transactional;

import static com.simpleaccounts.constant.ErrorConstant.ERROR;

@Repository
public class JournalLineItemDaoImpl extends AbstractDao<Integer, JournalLineItem> implements JournalLineItemDao {

	private static final Logger LOGGER = LoggerFactory.getLogger(JournalLineItemDaoImpl.class);

	@Autowired
	private DateFormatUtil dateUtil;

	@Autowired
	private DatatableSortingFilterConstant datatableUtil;

	@Override
	@Transactional
	public void deleteByJournalId(Integer journalId) {
		Query query = getEntityManager().createQuery("DELETE FROM JournalLineItem e WHERE e.journal.id = :journalId ");
		query.setParameter("journalId", journalId);
		query.executeUpdate();
	}

	@Override
	public List<JournalLineItem> getList(ReportRequestModel reportRequestModel) {
		LocalDate fromDate = null;
		LocalDate toDate = null;

		try {
			//dateUtil.getDateStrAsLocalDateTime(reportRequestModel.getStartDate(), CommonColumnConstants.DD_MM_YYYY);

			DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
					fromDate = LocalDate.parse(reportRequestModel.getStartDate(), formatter);
		} catch (Exception e) {
			LOGGER.error("Exception is ", e);
		}
		try {
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
			toDate = LocalDate.parse(reportRequestModel.getEndDate(), formatter);
		} catch (Exception e) {
			LOGGER.error(ERROR, e);
		}

		String queryStr = "select jn from JournalLineItem jn INNER join Journal j on j.id = jn.journal.id where j.journalDate BETWEEN :startDate and :endDate ";

		if (reportRequestModel.getChartOfAccountId() != null) {
			queryStr += " and jn.transactionCategory.transactionCategoryId = :transactionCategoryId or jn.transactionCategory.parentTransactionCategory = :transactionCategoryId ";
		}
		if (reportRequestModel.getReportBasis() != null && !reportRequestModel.getReportBasis().isEmpty()
				&& reportRequestModel.getReportBasis().equals("CASH")) {
			if (reportRequestModel.getChartOfAccountId() != null) {
				queryStr += " or ";
			} else {
				queryStr += " and ";
			}
			queryStr += " jn.transactionCategory.transactionCategoryId in :transactionCategoryIdList";
		}

		TypedQuery<JournalLineItem> query = getEntityManager().createQuery(queryStr, JournalLineItem.class);
		if (fromDate != null) {
			query.setParameter(CommonColumnConstants.START_DATE, fromDate);
		}
		if (toDate != null) {
			query.setParameter(CommonColumnConstants.END_DATE, toDate);
		}
		if (reportRequestModel.getChartOfAccountId() != null) {
			query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY_ID, reportRequestModel.getChartOfAccountId());
		}
		if (reportRequestModel.getReportBasis() != null && !reportRequestModel.getReportBasis().isEmpty()
				&& reportRequestModel.getReportBasis().equals("CASH")) {
			query.setParameter("transactionCategoryIdList",
					Arrays.asList(TransactionCategoryCodeEnum.ACCOUNT_RECEIVABLE.getCode(),
							TransactionCategoryCodeEnum.ACCOUNT_PAYABLE.getCode()));
		}
		List<JournalLineItem> list = query.getResultList();
		return list != null && !list.isEmpty() ? list : null;
	}

	@Override
	public List<JournalLineItem> getListByTransactionCategory(TransactionCategory transactionCategory) {
		return getEntityManager().createNamedQuery("getListByTransactionCategory")
				.setParameter("transactionCategory", transactionCategory).getResultList();
	}

	@Override
	public PaginationResponseModel getVatTransactionList(Map<TaxesFilterEnum, Object> filterMap, TaxesFilterModel paginationModel, List<TransactionCategory> transactionCategoryList){
			List<DbFilter> dbFilters = new ArrayList<>();
			filterMap.forEach(
					(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
							.condition(productFilter.getCondition()).value(value).build()));
			paginationModel.setSortingCol(
					datatableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.JOURNAL_LINE_ITEM));
		   dbFilters.add(DbFilter.builder().dbCoulmnName("transactionCategory")
				.condition(" IN (:transactionCategory) ").value(transactionCategoryList).build());
			PaginationResponseModel response = new PaginationResponseModel();
			response.setCount(this.getResultCount(dbFilters));
			response.setData(this.executeQuery(dbFilters, paginationModel));
			return response;
	}

	@Override
	public Map<Integer, CreditDebitAggregator> getAggregateTransactionCategoryMap(
			FinancialReportRequestModel financialReportRequestModel, String reportType) {
		LocalDateTime fromDate = null;
		LocalDateTime toDate = null;
		Map<Integer, CreditDebitAggregator> aggregatedTransactionMap = new HashMap<>();
		try {
			fromDate = dateUtil.getDateStrAsLocalDateTime(financialReportRequestModel.getStartDate(), CommonColumnConstants.DD_MM_YYYY);
		} catch (Exception e) {
			LOGGER.error(ERROR, e);
		}
		try {
			toDate = dateUtil.getDateStrAsLocalDateTime(financialReportRequestModel.getEndDate(), CommonColumnConstants.DD_MM_YYYY);
		} catch (Exception e) {
			LOGGER.error(ERROR, e);
		}
		try {
			List<Object[]> resultList =null;
			switch (reportType){

				case "ProfitAndLoss":
					resultList = getProfitLossReport(fromDate, toDate);

					break;

				case "BalanceSheet":
					resultList = getBalanceSheetReport(fromDate, toDate);

					break;

				case "TrialBalance":
					resultList = getTrialBanaceReport(fromDate, toDate);
					break;

				default:
					break;

			}
			if(resultList == null){
				return aggregatedTransactionMap;
			}
			int code = 0;
			for (Object[] object : resultList) {
				String transactionCategoryName = (String) object[0];
				BigDecimal creditAmountBD = (BigDecimal) object[1];
				BigDecimal debitAmountBD = (BigDecimal) object[2];
				String transactionCategoryCode = (String) object[3];
				Double creditAmount = creditAmountBD != null ? creditAmountBD.doubleValue() : (double) 0;
				Double debitAmount = debitAmountBD != null ? debitAmountBD.doubleValue() : (double) 0;
				CreditDebitAggregator creditDebitAggregator = new CreditDebitAggregator(creditAmount, debitAmount,
						transactionCategoryCode, transactionCategoryName);
				aggregatedTransactionMap.put(code++, creditDebitAggregator);
			}
			return aggregatedTransactionMap;
		} catch (Exception e) {
			LOGGER.error(String.format("Error occurred while calling stored procedure profitAndLossStoredProcedure %s",
					e.getStackTrace()));
		}
		return aggregatedTransactionMap;
	}

	private List<Object[]> getBalanceSheetReport(LocalDateTime fromDate, LocalDateTime toDate) {

		StoredProcedureQuery storedProcedureQuery = getEntityManager()
				.createStoredProcedureQuery("balanceSheetStoredProcedure");
		storedProcedureQuery.registerStoredProcedureParameter("currentAssetCode", String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.BANK_CODE, String.class,
				ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.OTHER_CURRENT_ASSET_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.ACCOUNT_RECEIVABLE_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.ACCOUNT_PAYABLE_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.FIXED_ASSET_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter("currentLiabilityCode", String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.OTHER_LIABILITY_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.EQUITY_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.START_DATE, LocalDateTime.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.END_DATE, LocalDateTime.class, ParameterMode.IN);

		storedProcedureQuery.setParameter("currentAssetCode", ChartOfAccountCategoryCodeEnum.CURRENT_ASSET.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.BANK_CODE,
				ChartOfAccountCategoryCodeEnum.BANK.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.OTHER_CURRENT_ASSET_CODE,
				ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.ACCOUNT_RECEIVABLE_CODE,
				ChartOfAccountCategoryCodeEnum.ACCOUNTS_RECEIVABLE.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.ACCOUNT_PAYABLE_CODE,
				ChartOfAccountCategoryCodeEnum.ACCOUNTS_PAYABLE.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.FIXED_ASSET_CODE,
				ChartOfAccountCategoryCodeEnum.FIXED_ASSET.getCode());
		storedProcedureQuery.setParameter("currentLiabilityCode",
				ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_LIABILITIES.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.OTHER_LIABILITY_CODE,
				ChartOfAccountCategoryCodeEnum.OTHER_LIABILITY.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.EQUITY_CODE,
				ChartOfAccountCategoryCodeEnum.EQUITY.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.START_DATE, fromDate);
		storedProcedureQuery.setParameter(CommonColumnConstants.END_DATE, toDate);
		storedProcedureQuery.execute();
		return (List<Object[]>) storedProcedureQuery.getResultList();

	}

	private List<Object[]> getProfitLossReport(LocalDateTime fromDate, LocalDateTime toDate) {
		StoredProcedureQuery storedProcedureQuery = getEntityManager()
				.createStoredProcedureQuery("profitAndLossStoredProcedure");
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.INCOME_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter("costOfGoodsSoldCode", String.class,
				ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.ADMIN_EXPENSE_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.OTHER_EXPENSE_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.START_DATE, LocalDateTime.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.END_DATE, LocalDateTime.class, ParameterMode.IN);

		storedProcedureQuery.setParameter(CommonColumnConstants.INCOME_CODE, ChartOfAccountCategoryCodeEnum.INCOME.getCode());
		storedProcedureQuery.setParameter("costOfGoodsSoldCode",
				ChartOfAccountCategoryCodeEnum.COST_OF_GOODS_SOLD.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.ADMIN_EXPENSE_CODE,
				ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.OTHER_EXPENSE_CODE,
				ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.START_DATE, fromDate);
		storedProcedureQuery.setParameter(CommonColumnConstants.END_DATE, toDate);
		storedProcedureQuery.execute();
		return (List<Object[]>) storedProcedureQuery.getResultList();
	}

	private List<Object[]> getTrialBanaceReport(LocalDateTime fromDate, LocalDateTime toDate) {
		StoredProcedureQuery storedProcedureQuery = getEntityManager()
				.createStoredProcedureQuery("trialBalanceStoredProcedure");
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.BANK_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.OTHER_CURRENT_ASSET_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.ACCOUNT_RECEIVABLE_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.ACCOUNT_PAYABLE_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.FIXED_ASSET_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.OTHER_LIABILITY_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.EQUITY_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.INCOME_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.ADMIN_EXPENSE_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.OTHER_EXPENSE_CODE, String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.START_DATE, LocalDateTime.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.END_DATE, LocalDateTime.class, ParameterMode.IN);
		storedProcedureQuery.setParameter(CommonColumnConstants.BANK_CODE,
				ChartOfAccountCategoryCodeEnum.BANK.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.OTHER_CURRENT_ASSET_CODE,
				ChartOfAccountCategoryCodeEnum.OTHER_CURRENT_ASSET.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.ACCOUNT_RECEIVABLE_CODE,
				ChartOfAccountCategoryCodeEnum.ACCOUNTS_RECEIVABLE.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.ACCOUNT_PAYABLE_CODE,
				ChartOfAccountCategoryCodeEnum.ACCOUNTS_PAYABLE.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.FIXED_ASSET_CODE,
				ChartOfAccountCategoryCodeEnum.FIXED_ASSET.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.OTHER_LIABILITY_CODE,
				ChartOfAccountCategoryCodeEnum.OTHER_LIABILITY.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.EQUITY_CODE,
				ChartOfAccountCategoryCodeEnum.EQUITY.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.INCOME_CODE, ChartOfAccountCategoryCodeEnum.INCOME.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.ADMIN_EXPENSE_CODE,
				ChartOfAccountCategoryCodeEnum.ADMIN_EXPENSE.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.OTHER_EXPENSE_CODE,
				ChartOfAccountCategoryCodeEnum.OTHER_EXPENSE.getCode());
		storedProcedureQuery.setParameter(CommonColumnConstants.START_DATE, fromDate);
		storedProcedureQuery.setParameter(CommonColumnConstants.END_DATE, toDate);
		storedProcedureQuery.execute();
		return (List<Object[]>) storedProcedureQuery.getResultList();
	}

	@Override
	public 	Map<Integer, CreditDebitAggregator> getTaxReport(Date startDate, Date endDate){
		Map<Integer, CreditDebitAggregator> aggregatedTransactionMap = new HashMap<>();
		try
		{
		StoredProcedureQuery storedProcedureQuery = getEntityManager()
				.createStoredProcedureQuery("taxesStoredProcedure");
		storedProcedureQuery.registerStoredProcedureParameter("inputvat", String.class, ParameterMode.IN);
			storedProcedureQuery.registerStoredProcedureParameter("outputvat", String.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.START_DATE,LocalDateTime.class, ParameterMode.IN);
		storedProcedureQuery.registerStoredProcedureParameter(CommonColumnConstants.END_DATE, LocalDateTime.class, ParameterMode.IN);
		storedProcedureQuery
				.setParameter(CommonColumnConstants.START_DATE, (dateUtil.getDateStrAsLocalDateTime(startDate,CommonColumnConstants.DD_MM_YYYY)))
				.setParameter(CommonColumnConstants.END_DATE, (dateUtil.getDateStrAsLocalDateTime(endDate,CommonColumnConstants.DD_MM_YYYY)));
		storedProcedureQuery.setParameter("inputvat",TransactionCategoryCodeEnum.INPUT_VAT.getCode());
		storedProcedureQuery.setParameter("outputvat",TransactionCategoryCodeEnum.OUTPUT_VAT.getCode());
           storedProcedureQuery.execute();
		List<Object[]> resultList = storedProcedureQuery.getResultList();

		if(resultList == null){
			return aggregatedTransactionMap;
		}
		int code = 0;
		for (Object[] object : resultList) {
			String transactionCategoryName = (String) object[0];
			BigDecimal creditAmountBD = (BigDecimal) object[1];
			BigDecimal debitAmountBD = (BigDecimal) object[2];
			String transactionCategoryCode = (String) object[3];
			Double creditAmount = creditAmountBD != null ? creditAmountBD.doubleValue() : (double) 0;
			Double debitAmount = debitAmountBD != null ? debitAmountBD.doubleValue() : (double) 0;
			CreditDebitAggregator creditDebitAggregator = new CreditDebitAggregator(creditAmount, debitAmount,
					transactionCategoryCode, transactionCategoryName);
			aggregatedTransactionMap.put(code++, creditDebitAggregator);
		}
		return aggregatedTransactionMap;
	} catch (Exception e) {
		LOGGER.error(String.format("Error occurred while calling stored procedure profitAndLossStoredProcedure %s",
				e.getStackTrace()));
	}
		return aggregatedTransactionMap;
	}
    @Override
	public List<Object[]> totalInputVatAmountAndOutputVatAmount(VatReportFilingRequestModel vatReportFilingRequestModel){

		LocalDateTime startDate = dateUtil.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getStartDate(),
				CommonColumnConstants.DD_MM_YYYY);
		LocalDateTime endDate =dateUtil.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getEndDate(),
				CommonColumnConstants.DD_MM_YYYY);

		Query query = getEntityManager().createNamedQuery("totalInputVatAmountAndOutputVatAmount");
		query.setParameter(CommonColumnConstants.START_DATE, startDate);
		query.setParameter(CommonColumnConstants.END_DATE,endDate);

		return query.getResultList();

	}

	@Override
	public BigDecimal totalInputVatAmount(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId){
		LocalDate startDate=null;
		LocalDateTime endDate=null;
		if (vatReportFiling.getStartDate()==null && vatReportFiling.getEndDate()==null){
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
			if (vatReportFilingRequestModel.getEndDate() != null && !vatReportFilingRequestModel.getEndDate().isEmpty()) {
				endDate = dateUtil.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getEndDate(),CommonColumnConstants.DD_MM_YYYY);
			}
			if (vatReportFilingRequestModel.getStartDate() != null && !vatReportFilingRequestModel.getStartDate().isEmpty()) {
				startDate = LocalDate.parse(vatReportFilingRequestModel.getStartDate(), formatter);
			}
		} else {
			startDate = vatReportFiling.getStartDate();
			endDate = vatReportFiling.getEndDate().atStartOfDay();
		}
		Query query = getEntityManager().createNamedQuery("totalInputVatAmountValue");
		query.setParameter(CommonColumnConstants.START_DATE, startDate);
		query.setParameter(CommonColumnConstants.END_DATE,endDate.toLocalDate());
		query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY_ID,transactionCategoryId);
		BigDecimal invoiceAmount= (BigDecimal) query.getSingleResult();

		Query expenseQuery = getEntityManager().createNamedQuery("totalInputVatAmountValueOfExpense");
		expenseQuery.setParameter(CommonColumnConstants.START_DATE, startDate);
		expenseQuery.setParameter(CommonColumnConstants.END_DATE,endDate.toLocalDate());
		expenseQuery.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY_ID,transactionCategoryId);
        BigDecimal expenseAmount= (BigDecimal) expenseQuery.getSingleResult();

		Query debitNoteQuery = getEntityManager().createNamedQuery("totalInputVatAmountValueDebitNote");
		debitNoteQuery.setParameter(CommonColumnConstants.START_DATE, startDate);
		debitNoteQuery.setParameter(CommonColumnConstants.END_DATE,endDate.toLocalDate());
		debitNoteQuery.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY_ID,transactionCategoryId);
		BigDecimal debitNoteAmount= (BigDecimal) debitNoteQuery.getSingleResult();

		BigDecimal vatAmount =  BigDecimal.ZERO;
		if(invoiceAmount!=null){
			vatAmount =  vatAmount.add(invoiceAmount);
		}
		if(expenseAmount!=null){
			vatAmount = vatAmount.add(expenseAmount);
		}
		if(debitNoteAmount!=null){
			vatAmount = vatAmount.add(debitNoteAmount);
		}
		return vatAmount;

	}
	@Override
	public BigDecimal totalOutputVatAmount(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel,Integer transactionCategoryId){
		LocalDate startDate=null;
		LocalDateTime endDate=null;
		if (vatReportFiling.getStartDate()==null && vatReportFiling.getEndDate()==null){
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
			if (vatReportFilingRequestModel.getStartDate() != null && !vatReportFilingRequestModel.getStartDate().isEmpty()) {
				startDate = LocalDate.parse(vatReportFilingRequestModel.getStartDate(), formatter);
			}
			if (vatReportFilingRequestModel.getEndDate() != null && !vatReportFilingRequestModel.getEndDate().isEmpty()) {
				endDate = dateUtil.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getEndDate(),CommonColumnConstants.DD_MM_YYYY);
			}
		} else {
			startDate = vatReportFiling.getStartDate();
			endDate = vatReportFiling.getEndDate().atStartOfDay();
		}
		Query query = getEntityManager().createNamedQuery("totalOutputVatAmountValue");
		query.setParameter(CommonColumnConstants.START_DATE, startDate);
		query.setParameter(CommonColumnConstants.END_DATE,endDate.toLocalDate());
		query.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY_ID,transactionCategoryId);

		return (BigDecimal) query.getSingleResult();

	}
	@Override
	public List<Object> getIdsAndTypeInTotalInputVat(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId){
		LocalDate startDate=null;
		LocalDateTime endDate=null;
		if (vatReportFiling.getStartDate()==null && vatReportFiling.getEndDate()==null){
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
			if (vatReportFilingRequestModel.getStartDate() != null && !vatReportFilingRequestModel.getStartDate().isEmpty()) {
				startDate = LocalDate.parse(vatReportFilingRequestModel.getStartDate(), formatter);
			}
			if (vatReportFilingRequestModel.getEndDate() != null && !vatReportFilingRequestModel.getEndDate().isEmpty()) {
				endDate = dateUtil.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getEndDate(),CommonColumnConstants.DD_MM_YYYY);
			}
		} else {
			startDate = vatReportFiling.getStartDate();
			endDate = vatReportFiling.getEndDate().atStartOfDay();
		}
		Query queryInvoice = getEntityManager().createNamedQuery("IdsAndTypeInTotalInputVat");
		queryInvoice.setParameter(CommonColumnConstants.START_DATE, startDate);
		queryInvoice.setParameter(CommonColumnConstants.END_DATE,endDate.toLocalDate());
		queryInvoice.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY_ID,transactionCategoryId);

		Query queryExpense = getEntityManager().createNamedQuery("IdsForTotalInputVatExpense");
		queryExpense.setParameter(CommonColumnConstants.START_DATE, startDate);
		queryExpense.setParameter(CommonColumnConstants.END_DATE,endDate.toLocalDate());
		queryExpense.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY_ID,transactionCategoryId);

		List<Object> unionList= (List<Object>) Stream.concat(queryInvoice.getResultList().stream(),queryExpense.getResultList().stream()).collect(Collectors.toList());

		return unionList;

	}
	@Override
	public List<Object> getIdsAndTypeInTotalOutputVat(VatReportFiling vatReportFiling,VatReportFilingRequestModel vatReportFilingRequestModel, Integer transactionCategoryId){
		LocalDate startDate=null;
		LocalDateTime endDate=null;
		if (vatReportFiling.getStartDate()==null && vatReportFiling.getEndDate()==null){
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern(CommonColumnConstants.DD_MM_YYYY);
			if (vatReportFilingRequestModel.getStartDate() != null && !vatReportFilingRequestModel.getStartDate().isEmpty()) {
				startDate = LocalDate.parse(vatReportFilingRequestModel.getStartDate(), formatter);
			}
			if (vatReportFilingRequestModel.getEndDate() != null && !vatReportFilingRequestModel.getEndDate().isEmpty()) {
				endDate = dateUtil.getDateStrAsLocalDateTime(vatReportFilingRequestModel.getEndDate(),CommonColumnConstants.DD_MM_YYYY);
			}
		} else {
			startDate = vatReportFiling.getStartDate();
			endDate = vatReportFiling.getEndDate().atStartOfDay();
		}
		Query query1 = getEntityManager().createNamedQuery("IdsAndTypeInTotalOutputVat");
		query1.setParameter(CommonColumnConstants.START_DATE, startDate);
		query1.setParameter(CommonColumnConstants.END_DATE,endDate.toLocalDate());
		query1.setParameter(CommonColumnConstants.TRANSACTION_CATEGORY_ID,transactionCategoryId);

		return query1.getResultList();

	}

}

