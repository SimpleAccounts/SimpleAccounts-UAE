package com.simplevat.dao.bankaccount;

import java.util.List;

import com.simplevat.dao.Dao;
import com.simplevat.entity.bankaccount.ChartOfAccount;

public interface ChartOfAccountDao extends Dao<Integer, ChartOfAccount> {

    public ChartOfAccount updateOrCreateTransaction(ChartOfAccount chartOfAccount);

    public ChartOfAccount getChartOfAccount(Integer id);

    public ChartOfAccount getDefaultChartOfAccount();

    public List<ChartOfAccount> findAll();

    public List<ChartOfAccount> findAllChild();

    public List<ChartOfAccount> findByText(String transactionTxt);

}
