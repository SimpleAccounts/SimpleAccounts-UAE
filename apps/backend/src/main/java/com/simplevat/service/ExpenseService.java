package com.simplevat.service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.ExpenseFIlterEnum;
import com.simplevat.entity.Expense;
import com.simplevat.model.VatReportResponseModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simplevat.service.report.model.BankAccountTransactionReportModel;

public abstract class ExpenseService extends SimpleVatService<Integer, Expense> {

    public abstract List<Expense> getExpenses(Integer userId, List<Integer> statusList);
    
    public abstract PaginationResponseModel getExpensesList(Map<ExpenseFIlterEnum, Object> filterMap,PaginationModel paginationMdel);
    public abstract Expense updateOrCreateExpense(Expense expense);

    public abstract List<BankAccountTransactionReportModel> getExpensesForReport(Date startDate, Date endDate);

    public abstract void deleteByIds(List<Integer> ids);

	public abstract List<Expense> getUnMappedExpenses(Integer userId , BigDecimal amount);

    public abstract void sumOfTotalExpensesWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);
}
