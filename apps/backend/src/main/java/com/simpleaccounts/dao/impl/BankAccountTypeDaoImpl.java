package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.BankAccountTypeDao;
import com.simpleaccounts.entity.bankaccount.BankAccountType;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository(value = "bankAccountTypeDao")
public class BankAccountTypeDaoImpl extends AbstractDao<Integer, BankAccountType> implements BankAccountTypeDao {

	@Override
	public List<BankAccountType> getBankAccountTypeList() {
		return this.executeNamedQuery("allBankAccountType");
	}

	@Override
	public BankAccountType getBankAccountType(int id) {
		return this.findByPK(id);
	}

	@Override
	public BankAccountType getDefaultBankAccountType() {
		if (getBankAccountTypeList() != null && !getBankAccountTypeList().isEmpty()) {
			return getBankAccountTypeList().get(0);
		}
		return null;
	}

}
