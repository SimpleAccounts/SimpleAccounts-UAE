package com.simplevat.dao.bankaccount;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.BankAccounrFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

public interface BankAccountDao extends Dao<Integer, BankAccount> {

	List<BankAccount> getBankAccounts();

	List<BankAccount> getBankAccountByUser(int userId);

	BankAccount getBankAccountById(int id);

	void deleteByIds(List<Integer> ids);

	PaginationResponseModel getBankAccounts(Map<BankAccounrFilterEnum, Object> filterDataMap,
			PaginationModel paginationModel);

	BigDecimal getAllBankAccountsTotalBalance();
}
