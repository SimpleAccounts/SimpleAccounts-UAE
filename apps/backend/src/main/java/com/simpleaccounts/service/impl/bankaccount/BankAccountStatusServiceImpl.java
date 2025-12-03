package com.simpleaccounts.service.impl.bankaccount;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.bankaccount.BankAccountStatusDao;
import com.simpleaccounts.entity.bankaccount.BankAccountStatus;
import com.simpleaccounts.service.BankAccountStatusService;

@Service("bankAccountStatusService")
public class BankAccountStatusServiceImpl implements BankAccountStatusService {

	@Autowired
    public BankAccountStatusDao bankAccountStatusDao;
	
	@Override
	public List<BankAccountStatus> getBankAccountStatuses() {
		return bankAccountStatusDao.getBankAccountStatuses();
	}

	@Override
	public BankAccountStatus getBankAccountStatus(Integer id) {
		return bankAccountStatusDao.getBankAccountStatus(id);
	}

	@Override
	public BankAccountStatus getBankAccountStatusByName(String status) {
		return bankAccountStatusDao.getBankAccountStatusByName(status);
	}

}
