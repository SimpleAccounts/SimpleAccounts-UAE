package com.simplevat.service.bankaccount;

import java.util.List;

import com.simplevat.criteria.bankaccount.ChartOfAccountCriteria;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.service.SimpleVatService;

public abstract class ChartOfAccountService extends SimpleVatService<Integer, ChartOfAccount> {

    public abstract List<ChartOfAccount> getChartOfAccountByCriteria(ChartOfAccountCriteria chartOfAccountCriteria);

    public abstract ChartOfAccount updateOrCreateChartOfAccount(ChartOfAccount chartOfAccount);

    public abstract ChartOfAccount getChartOfAccount(Integer id);

    public abstract ChartOfAccount getDefaultChartOfAccount();

    public abstract List<ChartOfAccount> findAll();
   
    public abstract List<ChartOfAccount> findByText(String transactionTxt);

    public abstract List<ChartOfAccount> findAllChild();

}
