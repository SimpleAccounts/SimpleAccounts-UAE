package com.simplevat.service.impl.bankaccount;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.criteria.bankaccount.ChartOfAccountCriteria;
import com.simplevat.criteria.bankaccount.ChartOfAccountFilter;
import com.simplevat.dao.bankaccount.ChartOfAccountDao;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.service.bankaccount.ChartOfAccountService;

@Service("transactionTypeService")
public class ChartOfAccountImpl extends ChartOfAccountService {

	@Autowired
	private ChartOfAccountDao chartOfAccountDao;

	@Override
	public List<ChartOfAccount> getChartOfAccountByCriteria(ChartOfAccountCriteria chartOfAccountCriteria) {
		ChartOfAccountFilter filter = new ChartOfAccountFilter(chartOfAccountCriteria);
		return chartOfAccountDao.filter(filter);
	}

	@Override
	public ChartOfAccount updateOrCreateChartOfAccount(ChartOfAccount transactionType) {
		return chartOfAccountDao.updateOrCreateTransaction(transactionType);
	}

	@Override
	public ChartOfAccount getChartOfAccount(Integer id) {
		return chartOfAccountDao.getChartOfAccount(id);
	}

	@Override
	public List<ChartOfAccount> findAll() {
		return chartOfAccountDao.findAll();
	}

	@Override
	public List<ChartOfAccount> findByText(String transactionTxt) {
		return chartOfAccountDao.findByText(transactionTxt);
	}

	@Override
	public ChartOfAccount getDefaultChartOfAccount() {
		return chartOfAccountDao.getDefaultChartOfAccount();
	}

	@Override
	public ChartOfAccountDao getDao() {
		return this.chartOfAccountDao;
	}

	@Override
	public List<ChartOfAccount> findAllChild() {
		return chartOfAccountDao.findAllChild();
	}
}
