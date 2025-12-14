package com.simpleaccounts.service.impl.bankaccount;

import com.simpleaccounts.criteria.bankaccount.ChartOfAccountCriteria;
import com.simpleaccounts.criteria.bankaccount.ChartOfAccountFilter;
import com.simpleaccounts.dao.bankaccount.ChartOfAccountDao;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("transactionTypeService")
@RequiredArgsConstructor
public class ChartOfAccountImpl extends ChartOfAccountService {

	private final ChartOfAccountDao chartOfAccountDao;

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
