package com.simpleaccounts.dao;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.ExpenseFIlterEnum;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;

public interface ExpenseDao extends Dao<Integer, Expense> {

	public List<Expense> getAllExpenses(Integer userId, List<Integer> statusList);
	public List<Expense> getExpensesToMatch(Integer userId, List<Integer> statusList, BigDecimal amount);
	public List<Object[]> getExpensePerMonth(Date startDate, Date endDate);

	public List<Object[]> getExpenses(Date startDate, Date endDate);

	public List<Object[]> getVatOutPerMonthWise(Date startDate, Date endDate);

	public List<Expense> getExpenseForReports(Date startDate, Date endDate);

	public void deleteByIds(List<Integer> ids);

	public PaginationResponseModel getExpenseList(Map<ExpenseFIlterEnum, Object> filterMap, PaginationModel paginationModel);

    void sumOfTotalExpensesWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);
}
