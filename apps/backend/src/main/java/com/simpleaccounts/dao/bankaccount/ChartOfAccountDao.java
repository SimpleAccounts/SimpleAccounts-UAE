package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import java.util.List;

public interface ChartOfAccountDao extends Dao<Integer, ChartOfAccount> {

    public ChartOfAccount updateOrCreateTransaction(ChartOfAccount chartOfAccount);

    public ChartOfAccount getChartOfAccount(Integer id);

    public ChartOfAccount getDefaultChartOfAccount();

    public List<ChartOfAccount> findAll();

    public List<ChartOfAccount> findAllChild();

    public List<ChartOfAccount> findByText(String transactionTxt);

}
