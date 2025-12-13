package com.simpleaccounts.dao.bankaccount;

import com.simpleaccounts.constant.dbfilter.BankAccounrFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.bankaccount.BankAccount;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface BankAccountDao extends Dao<Integer, BankAccount> {

	List<BankAccount> getBankAccounts();

	List<BankAccount> getBankAccountByUser(int userId);

	BankAccount getBankAccountById(int id);

	void deleteByIds(List<Integer> ids);

	PaginationResponseModel getBankAccounts(Map<BankAccounrFilterEnum, Object> filterDataMap,
			PaginationModel paginationModel);

	BigDecimal getAllBankAccountsTotalBalance();
}
