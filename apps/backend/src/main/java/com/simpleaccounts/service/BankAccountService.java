package com.simpleaccounts.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.entity.bankaccount.BankDetails;
import com.simpleaccounts.model.DashBoardBankDataModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

public abstract class BankAccountService extends SimpleAccountsService<Integer, BankAccount> {

	public abstract List<BankAccount> getBankAccounts();

	public abstract List<BankAccount> getBankAccountByUser(int userId);

	public abstract BankAccount getBankAccountById(int id);

	public abstract void deleteByIds(List<Integer> ids);

	public abstract PaginationResponseModel getBankAccounts(Map<BankAccounrFilterEnum, Object> filterDataMap,
			PaginationModel paginationModel);

	public abstract DashBoardBankDataModel getBankBalanceList(BankAccount bank, Map<Object, Number> inflow,
			Map<Object, Number> outFlow);

	public abstract BigDecimal getAllBankAccountsTotalBalance();

	public abstract List<BankDetails> getBankNameList();
}
