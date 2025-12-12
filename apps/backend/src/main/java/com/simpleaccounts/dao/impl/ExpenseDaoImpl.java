package com.simpleaccounts.dao.impl;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.Query;
import javax.persistence.TemporalType;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.VatReportFilingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.ExpenseFIlterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ExpenseDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.time.Instant;
import java.time.ZoneId;
import javax.persistence.TypedQuery;

@Repository
@RequiredArgsConstructor
public class ExpenseDaoImpl extends AbstractDao<Integer, Expense> implements ExpenseDao {

	private static final Logger LOGGER = LoggerFactory.getLogger(ExpenseDaoImpl.class);

	private final DatatableSortingFilterConstant dataTableUtil;

	private final VatReportFilingRepository vatReportFilingRepository;

	@Override
	public List<Expense> getAllExpenses(Integer userId, List<Integer> statusList) {

		List<Expense> expenseList = null;
		try {
			TypedQuery<Expense> query = getEntityManager().createNamedQuery("postedExpenses", Expense.class)
					.setParameter("status", statusList).setParameter("userId", userId);
			expenseList = query.getResultList();
		} catch (Exception e) {
			LOGGER.error(e.getMessage());
		}
		return expenseList;
	}

	@Override
	public List<Expense> getExpensesToMatch(Integer userId, List<Integer> statusList, BigDecimal amount) {

		List<Expense> expenseList = null;
		try {
			TypedQuery<Expense> query = getEntityManager().createNamedQuery("getExpensesToMatch", Expense.class)
					.setParameter("status", statusList).setParameter("userId", userId).setParameter("amount",amount);
			expenseList = query.getResultList();
		} catch (Exception e) {
			LOGGER.error(e.getMessage());
		}
		return expenseList;
	}

	@Override
	public List<Object[]> getExpensePerMonth(Date startDate, Date endDate) {
		List<Object[]> expenses = new ArrayList<>(0);
		try {
			StringBuilder queryStringBuilder = new StringBuilder();
			queryStringBuilder.append("select sum(e.expenseAmount) as expenseTotal,")
					.append("CONCAT(MONTH(e.expenseDate),'-' , Year(e.expenseDate)) as month")
					.append("from Expense e where e.deleteFlag = 'false' and e.expenseDate BETWEEN :startDate AND :endDate")
					.append("group by CONCAT(MONTH(e.expenseDate),'-' , Year(e.expenseDate))");

			Query query = getEntityManager().createQuery(queryStringBuilder.toString())
					.setParameter(CommonColumnConstants.START_DATE, startDate, TemporalType.DATE)
					.setParameter(CommonColumnConstants.END_DATE, endDate, TemporalType.DATE);
			expenses = query.getResultList();
		} catch (Exception e) {
			LOGGER.error(e.getMessage());
		}
		return expenses;
	}

	@Override
	public List<Object[]> getExpenses(Date startDate, Date endDate) {
		List<Object[]> expenses = new ArrayList<>(0);
		try {
			StringBuilder queryStringBuilder = new StringBuilder();

			queryStringBuilder.append("select e.expenseAmount as expense, e.expenseDate as date,e.receiptNumber as ref")
					.append("from Expense e where e.deleteFlag = 'false' ")
					.append("and e.expenseDate BETWEEN :startDate AND :endDate order by e.expenseDate asc");

			Query query = getEntityManager().createQuery(queryStringBuilder.toString())
					.setParameter(CommonColumnConstants.START_DATE, startDate, TemporalType.DATE)
					.setParameter(CommonColumnConstants.END_DATE, endDate, TemporalType.DATE);
			expenses = query.getResultList();
		} catch (Exception e) {
			LOGGER.error(e.getMessage());
		}
		return expenses;
	}

	@Override
	public List<Object[]> getVatOutPerMonthWise(Date startDate, Date endDate) {
		List<Object[]> expenses = new ArrayList<>(0);
		try {
			StringBuilder queryStringBuilder = new StringBuilder();

			queryStringBuilder.append(
					"select sum((li.expenseLineItemUnitPrice*li.expenseLineItemQuantity)*li.expenseLineItemVat/100) as vatOutTotal,")
					.append("CONCAT(MONTH(e.expenseDate),'-' , Year(e.expenseDate)) as month")
					.append("from Expense e JOIN e.expenseLineItems li ")
					.append("where e.deleteFlag = 'false' and li.deleteFlag= 'false'")
					.append("and e.expenseDate BETWEEN :startDate AND :endDate ")
					.append("group by CONCAT(MONTH(e.expenseDate),'-' , Year(e.expenseDate))");

			Query query = getEntityManager().createQuery(queryStringBuilder.toString())
					.setParameter(CommonColumnConstants.START_DATE, startDate, TemporalType.DATE)
					.setParameter(CommonColumnConstants.END_DATE, endDate, TemporalType.DATE);
			expenses = query.getResultList();
		} catch (Exception e) {
			LOGGER.error(e.getMessage());
		}
		return expenses;
	}

	@Override
	public List<Expense> getExpenseForReports(Date startDate, Date endDate) {

		TypedQuery<Expense> query = getEntityManager().createQuery(
				"SELECT i FROM Expense i WHERE i.deleteFlag = false AND i.expenseDate BETWEEN :startDate AND :endDate ORDER BY i.expenseDate ASC",
				Expense.class);
		query.setParameter(CommonColumnConstants.START_DATE,
				Instant.ofEpochMilli(startDate.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime());
		query.setParameter(CommonColumnConstants.END_DATE,
				Instant.ofEpochMilli(endDate.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime());
		List<Expense> expenseList = query.getResultList();
		if (expenseList != null && !expenseList.isEmpty()) {
			return expenseList;
		}
		return new ArrayList<>();
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Expense expense = findByPK(id);
				expense.setDeleteFlag(Boolean.TRUE);
				update(expense);
			}
		}
	}

	@Override
	public PaginationResponseModel getExpenseList(Map<ExpenseFIlterEnum, Object> filterMap,
			PaginationModel paginationModel) {

		List<DbFilter> dbFilters = new ArrayList();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(
				dataTableUtil.getColName((paginationModel.getSortingCol()), DatatableSortingFilterConstant.EXPENSE));
		PaginationResponseModel request = new PaginationResponseModel();
		request.setData(this.executeQuery(dbFilters, paginationModel));
		request.setCount(this.getResultCount(dbFilters));
		return request;
	}
	@Override
	public void sumOfTotalExpensesWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		LocalDate startDate = LocalDate.parse(reportRequestModel.getStartDate(),formatter);
		LocalDate endDate = LocalDate.parse(reportRequestModel.getEndDate(),formatter);
		Boolean editFlag = determineEditFlag(startDate, endDate);
		String queryStr = "SELECT SUM(e.expenseAmount*e.exchangeRate) AS TOTAL_AMOUNT, SUM(e.expenseVatAmount*e.exchangeRate) AS TOTAL_VAT_AMOUNT FROM Expense e " +
				"WHERE e.vatCategory.id in (1) and e.deleteFlag=false AND e.isReverseChargeEnabled=false AND e.editFlag=:editFlag AND e.status not in(1) AND e.vatClaimable=true AND e.expenseDate between :startDate AND :endDate";
		List<Object> list = getEntityManager().createQuery(queryStr).setParameter("startDate",startDate).setParameter("endDate",endDate).setParameter("editFlag",editFlag).getResultList();
		if(list!=null&& !list.isEmpty()) {
			List<VatReportModel> vatReportModelList = getVatModalFromDB(list);
			for(VatReportModel vatReportModel:vatReportModelList){
				populateVatReportResponse(vatReportModel, vatReportResponseModel);
			}
		}
	}

	private Boolean determineEditFlag(LocalDate startDate, LocalDate endDate) {
		VatReportFiling vatReportFiling = vatReportFilingRepository.getVatReportFilingByStartDateAndEndDate(startDate, endDate);
		if (vatReportFiling == null) {
			return Boolean.TRUE;
		}
		return vatReportFiling.getStatus().equals(CommonStatusEnum.UN_FILED.getValue());
	}

	private void populateVatReportResponse(VatReportModel vatReportModel, VatReportResponseModel vatReportResponseModel) {
		BigDecimal totalAmount = vatReportModel.getTotalAmountForExpense() != null
				? vatReportModel.getTotalAmountForExpense() : BigDecimal.ZERO;
		BigDecimal totalVatAmount = vatReportModel.getTotalVatAmountForExpense() != null
				? vatReportModel.getTotalVatAmountForExpense() : BigDecimal.ZERO;
		vatReportResponseModel.setTotalAmountForExpense(totalAmount);
		vatReportResponseModel.setTotalVatAmountForExpense(totalVatAmount);
	}
	private List<VatReportModel> getVatModalFromDB(List<Object> list) {
		List<VatReportModel> vatReportModelList = new ArrayList<>();
		for (Object object : list)
		{
			Object[] row = (Object[]) object;
			VatReportModel vatReportModel = new VatReportModel();
			vatReportModel.setTotalAmountForExpense((BigDecimal) row[0]);
			vatReportModel.setTotalVatAmountForExpense((BigDecimal) row[1]);
			vatReportModelList.add(vatReportModel);
		}
		return vatReportModelList;
	}

}
