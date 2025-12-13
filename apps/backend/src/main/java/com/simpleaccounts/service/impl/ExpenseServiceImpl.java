package com.simpleaccounts.service.impl;

import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.simpleaccounts.constant.CommonStatusEnum;
import com.simpleaccounts.constant.dbfilter.ExpenseFIlterEnum;
import com.simpleaccounts.dao.CompanyDao;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ExpenseDao;
import com.simpleaccounts.dao.ProjectDao;
import com.simpleaccounts.entity.Expense;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.service.ExpenseService;
import com.simpleaccounts.service.TransactionExpensesService;
import com.simpleaccounts.service.report.model.BankAccountTransactionReportModel;
import com.simpleaccounts.utils.ChartUtil;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service("expenseService")
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
@RequiredArgsConstructor
public class ExpenseServiceImpl extends ExpenseService {

	public final ExpenseDao expenseDao;

	public final ProjectDao projectDao;

	public final CompanyDao companyDao;

	private final ChartUtil util;

	private final TransactionExpensesService transactionExpensesService;

	@Override
	public List<Expense> getExpenses(Integer userId, List<Integer> statusList) {
		return expenseDao.getAllExpenses(userId, statusList);
	}

	public List<Expense> getExpensesToMatch(Integer userId, List<Integer> statusList, BigDecimal amount) {
		return expenseDao.getExpensesToMatch(userId, statusList,amount);
	}

	@Override
	public Expense updateOrCreateExpense(Expense expense) {
		return this.update(expense, expense.getExpenseId());
	}

	@Override
	public Dao<Integer, Expense> getDao() {
		return expenseDao;
	}

	@Override
	public List<BankAccountTransactionReportModel> getExpensesForReport(Date startDate, Date endDate) {

		List<Object[]> rows = expenseDao.getExpenses(startDate, endDate);
		List<BankAccountTransactionReportModel> list = util.convertToTransactionReportModel(rows);
		if (list == null) {
			return Collections.emptyList();
		}
		for (BankAccountTransactionReportModel model : list) {
			if (model != null) {
				model.setCredit(false);
			}
		}
		return list;

	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		expenseDao.deleteByIds(ids);
	}

	@Override
	public PaginationResponseModel getExpensesList(Map<ExpenseFIlterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		return expenseDao.getExpenseList(filterMap, paginationModel);
	}

	@Override
	public List<Expense> getUnMappedExpenses(Integer userId,BigDecimal amount) {
		return expenseDao.getExpensesToMatch(userId, Arrays.asList(CommonStatusEnum.POST.getValue()),amount);
	}
	@Override
	public  void sumOfTotalExpensesWithVat(ReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel){
		expenseDao.sumOfTotalExpensesWithVat( reportRequestModel,vatReportResponseModel);
	}
}
