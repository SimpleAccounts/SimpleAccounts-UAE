package com.simpleaccounts.service;

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
import com.simpleaccounts.service.report.model.BankAccountTransactionReportModel;

public abstract class ExpenseService extends SimpleAccountsService<Integer, Expense> {

    public abstract List<Expense> getExpenses(Integer userId, List<Integer> statusList);
    
    public abstract PaginationResponseModel getExpensesList(Map<ExpenseFIlterEnum, Object> filterMap,PaginationModel paginationMdel);
    public abstract Expense updateOrCreateExpense(Expense expense);

    public abstract List<BankAccountTransactionReportModel> getExpensesForReport(Date startDate, Date endDate);

    public abstract void deleteByIds(List<Integer> ids);

	public abstract List<Expense> getUnMappedExpenses(Integer userId , BigDecimal amount);

    public abstract void sumOfTotalExpensesWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);
}
