package com.simpleaccounts.service.bankaccount;

import java.util.List;

import com.simpleaccounts.criteria.bankaccount.ChartOfAccountCriteria;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.service.SimpleAccountsService;

public abstract class ChartOfAccountService extends SimpleAccountsService<Integer, ChartOfAccount> {

    public abstract List<ChartOfAccount> getChartOfAccountByCriteria(ChartOfAccountCriteria chartOfAccountCriteria);

    public abstract ChartOfAccount updateOrCreateChartOfAccount(ChartOfAccount chartOfAccount);

    public abstract ChartOfAccount getChartOfAccount(Integer id);

    public abstract ChartOfAccount getDefaultChartOfAccount();

    public abstract List<ChartOfAccount> findAll();
   
    public abstract List<ChartOfAccount> findByText(String transactionTxt);

    public abstract List<ChartOfAccount> findAllChild();

}
