package com.simpleaccounts.dao.bankaccount;

import java.util.List;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;

public interface ChartOfAccountDao extends Dao<Integer, ChartOfAccount> {

    public ChartOfAccount updateOrCreateTransaction(ChartOfAccount chartOfAccount);

    public ChartOfAccount getChartOfAccount(Integer id);

    public ChartOfAccount getDefaultChartOfAccount();

    public List<ChartOfAccount> findAll();

    public List<ChartOfAccount> findAllChild();

    public List<ChartOfAccount> findByText(String transactionTxt);

}
