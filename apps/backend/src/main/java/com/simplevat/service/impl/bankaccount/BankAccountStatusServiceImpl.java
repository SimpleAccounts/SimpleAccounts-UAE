package com.simplevat.service.impl.bankaccount;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.dao.bankaccount.BankAccountStatusDao;
import com.simplevat.entity.bankaccount.BankAccountStatus;
import com.simplevat.service.BankAccountStatusService;

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
