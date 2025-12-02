package com.simplevat.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.BankAccounrFilterEnum;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.entity.bankaccount.BankDetails;
import com.simplevat.model.DashBoardBankDataModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public abstract class BankAccountService extends SimpleVatService<Integer, BankAccount> {

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
